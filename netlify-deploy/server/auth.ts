import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
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

export function setupAuth(app: Express) {
  // Simple session configuration that doesn't rely on storage
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "moodsync_secret_key",
    resave: true,             // Save session on every request
    saveUninitialized: true,  // Create session for unauthenticated users
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: false,          // Allow non-secure cookies for development
      httpOnly: true,         // Prevent client-side JS from reading the cookie
    }
  };

  // Enable sessions
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Authentication attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
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

  // Configure user serialization/deserialization
  passport.serializeUser((user, done) => {
    console.log(`Serializing user: ${user.id}`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`Deserializing user: ${id}`);
      const user = await storage.getUser(id);
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

  // Enhanced registration endpoint with better validation and error handling
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration request received:", { 
        username: req.body.username,
        email: req.body.email,
        hasPassword: !!req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        fullBody: Object.keys(req.body)
      });
      
      // Basic validation
      if (!req.body.username) {
        return res.status(400).json({ error: "Username is required" });
      }
      
      if (!req.body.password) {
        return res.status(400).json({ error: "Password is required" });
      }
      
      if (!req.body.email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Username validation - only check for duplicates
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Create and store the user with all possible fields from the request
      try {
        // Convert null values to empty strings for text fields if needed
        const userData = {
          username: req.body.username,
          password: await hashPassword(req.body.password),
          email: req.body.email || "",
          firstName: req.body.firstName || "",
          lastName: req.body.lastName || "",
          middleName: req.body.middleName || "",
          gender: req.body.gender || "prefer_not_to_say",
          state: req.body.state || "",
          country: req.body.country || "",
          ipAddress: req.ip || ""
        };
        
        console.log("Creating user with data:", {
          ...userData,
          password: "[REDACTED]"
        });
        
        const user = await storage.createUser(userData);

        console.log("User created successfully:", { id: user.id, username: user.username });

        // Log the user in after registration
        req.login(user, (err) => {
          if (err) {
            console.error("Login error after registration:", err);
            return res.status(500).json({ error: "Login error after registration", details: err instanceof Error ? err.message : "Unknown error" });
          }
          
          console.log("User logged in after registration:", { id: user.id, username: user.username });
          res.status(201).json(user);
        });
      } catch (createError: unknown) {
        console.error("User creation error:", createError);
        return res.status(500).json({ 
          error: "Failed to create user account", 
          details: createError instanceof Error ? createError.message : "Unknown error"
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ 
        error: "Failed to register user", 
        details: err instanceof Error ? err.message : "Unknown error" 
      });
    }
  });

  // Enhanced login endpoint with better error handling
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for username:", req.body.username);
    
    passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: 'Login error', details: err.message });
      }
      
      if (!user) {
        console.log("Authentication failed for username:", req.body.username);
        return res.status(401).json({ 
          error: 'Invalid username or password',
          details: info?.message || 'Login failed'
        });
      }
      
      console.log("User authenticated successfully:", user.username);
      
      // Log the user in
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return res.status(500).json({ 
            error: 'Failed to create login session',
            details: loginErr.message
          });
        }
        
        console.log("Login successful for user:", user.username);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Simple logout endpoint
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

  // Simple user profile endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthorized access to /api/user");
      return res.sendStatus(401);
    }
    console.log("Returning user profile for:", req.user.username);
    res.json(req.user);
  });
  
  // Add a simple health check endpoint
  app.get("/api/healthcheck", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  
  // Search for users by query (username, email, firstname, lastname)
  app.get("/api/users/search", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        error: 'Invalid query',
        message: 'Search query must be at least 2 characters long' 
      });
    }
    
    try {
      // Check if searchUsers exists in the storage implementation
      if (typeof (storage as any).searchUsers === 'function') {
        const users = await (storage as any).searchUsers(query);
        
        // Filter out the current user and only return necessary user information
        const safeUserData = users
          .filter((user: SelectUser) => req.user && user.id !== req.user.id) // Don't include current user
          .map((user: SelectUser) => ({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePicture: user.profilePicture
          }));
        
        return res.status(200).json(safeUserData);
      } else {
        // Fallback for implementations without searchUsers
        console.log("searchUsers not implemented in current storage, returning empty array");
        return res.status(200).json([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      return res.status(500).json({ 
        error: 'Failed to search users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
