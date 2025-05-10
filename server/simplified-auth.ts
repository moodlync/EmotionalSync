import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { simpleStorage } from "./simplified-storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupSimplifiedAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "moodsync_secret_key",
    resave: true,
    saveUninitialized: true,
    store: simpleStorage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: false,
      httpOnly: true,
    }
  };

  // Set up middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Authentication attempt for username: ${username}`);
        
        const user = await simpleStorage.getUserByUsername(username);
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false);
        }
        
        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          console.log(`Invalid password for user: ${username}`);
          return done(null, false);
        }
        
        console.log(`Authentication successful for user: ${username}`);
        return done(null, user);
      } catch (err) {
        console.error(`Authentication error: ${err}`);
        return done(err);
      }
    }),
  );

  // Set up serialization
  passport.serializeUser((user, done) => {
    console.log(`Serializing user: ${user.id}`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`Deserializing user: ${id}`);
      const user = await simpleStorage.getUser(id);
      if (!user) {
        console.log(`User not found during deserialization: ${id}`);
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      console.error(`Deserialization error: ${err}`);
      done(err);
    }
  });

  // ROUTES
  
  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration request received:", { 
        username: req.body.username,
        hasPassword: !!req.body.password,
        email: req.body.email || null
      });
      
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Check for existing user
      const existingUser = await simpleStorage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Create user
      const user = await simpleStorage.createUser({
        username: req.body.username,
        password: await hashPassword(req.body.password),
        email: req.body.email || null,
        firstName: req.body.firstName || null,
        lastName: req.body.lastName || null,
        ipAddress: req.ip || null
      });

      console.log("User created successfully:", { id: user.id, username: user.username });

      // Log in after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return next(err);
        }
        
        console.log("User logged in after registration:", { id: user.id, username: user.username });
        res.status(201).json(user);
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for username:", req.body.username);
    
    passport.authenticate("local", (err, user) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: 'Login error' });
      }
      
      if (!user) {
        console.log("Authentication failed for username:", req.body.username);
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      console.log("User authenticated successfully:", user.username);
      
      // Log the user in
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return res.status(500).json({ error: 'Failed to create login session' });
        }
        
        // Save session explicitly
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ error: 'Failed to save session' });
          }
          
          console.log("Login successful for user:", user.username);
          return res.status(200).json(user);
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    if (req.isAuthenticated()) {
      console.log("Logging out user:", req.user.username);
    }
    
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }
      console.log("Logout successful");
      res.sendStatus(200);
    });
  });

  // User profile endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthorized access to /api/user");
      return res.sendStatus(401);
    }
    console.log("Returning user profile for:", req.user.username);
    res.json(req.user);
  });
  
  // Health check endpoint
  app.get("/api/healthcheck", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      auth: "simplified"
    });
  });
  
  // Test endpoint
  app.get("/api/test-register", async (req, res) => {
    try {
      const users = [];
      let count = 0;
      for (let id = 1; id < 100; id++) {
        const user = await simpleStorage.getUser(id);
        if (user) {
          users.push({
            id: user.id,
            username: user.username,
            email: user.email
          });
          count++;
        }
        if (count >= 5) break;
      }
      
      res.json({
        message: "Test endpoint is working",
        users: users
      });
    } catch (err) {
      console.error("Test endpoint error:", err);
      res.status(500).json({ error: "Test endpoint error" });
    }
  });
}