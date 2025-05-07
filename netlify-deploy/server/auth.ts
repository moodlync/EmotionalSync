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
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "moodsync_secret_key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Block test account in production mode
          if (username === 'test' && process.env.NODE_ENV === 'production') {
            console.warn('Attempt to access test account in production mode blocked');
            return done(null, false);
          }
          // Allow Sagar user in all environments
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration request received:", { 
        username: req.body.username,
        email: req.body.email,
        hasPassword: !!req.body.password,
        hasReferralCode: !!req.body.referralCode
      });
      
      // Validate required fields are present
      if (!req.body.username) {
        return res.status(400).json({ error: "Username is required" });
      }
      
      if (!req.body.password) {
        return res.status(400).json({ error: "Password is required" });
      }
      
      // Validation for email if provided
      if (req.body.email && !req.body.email.includes('@')) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      // Check for duplicate username
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check for duplicate email
      if (req.body.email) {
        const existingEmail = await storage.findUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      
      // Check referral code validity if provided
      if (req.body.referralCode) {
        try {
          const referral = await storage.getReferralByCode(req.body.referralCode);
          if (!referral) {
            return res.status(400).json({ error: "Invalid referral code" });
          }
          
          // Check if the referral has expired
          if (referral.status === 'expired' || new Date(referral.expiresAt) < new Date()) {
            return res.status(400).json({ error: "Referral code has expired" });
          }
        } catch (refError) {
          console.error("Error checking referral code:", refError);
          // Instead of failing, we'll allow registration to proceed without a valid referral
          // But we'll set the referralCode to null to indicate it wasn't valid
          req.body.referralCode = null;
        }
      }
      
      // Capture IP address to prevent duplicate accounts
      let ipAddress: string | null = null;
      if (req.ip) {
        ipAddress = req.ip;
      } else if (req.headers['x-forwarded-for']) {
        const forwarded = req.headers['x-forwarded-for'];
        ipAddress = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      } else if (req.socket.remoteAddress) {
        ipAddress = req.socket.remoteAddress;
      }
      
      // Check if IP already exists in the system to prevent duplicate accounts
      if (ipAddress) {
        const existingIP = await storage.findUserByIpAddress(ipAddress);
        if (existingIP) {
          // We can decide if we want to block entirely or just warn
          console.warn(`Registration attempt with duplicate IP: ${ipAddress}`);
          // For this implementation, we'll still allow registration but log the attempt
        }
      }

      try {
        // Create the user with hashed password and IP address
        const user = await storage.createUser({
          ...req.body,
          password: await hashPassword(req.body.password),
          ipAddress: ipAddress as string,
        });

        console.log("User created successfully:", { id: user.id, username: user.username });

        req.login(user, (err) => {
          if (err) {
            console.error("Login error after registration:", err);
            return next(err);
          }
          
          console.log("User logged in after registration:", { id: user.id, username: user.username });
          res.status(201).json(user);
        });
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.status(500).json({ 
          error: "Failed to create user account", 
          details: createError instanceof Error ? createError.message : String(createError)
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        return res.status(500).json({ error: err.message });
      }
      next(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication failed' });
      }
      
      // Reward user with tokens for daily login
      // In a real app, you would check if they've already received the daily login bonus today
      // For now, we'll give them tokens every time they log in
      const tokensEarned = 10; // 10 tokens for logging in
      const rewardActivity = await storage.createRewardActivity(
        req.user.id,
        'daily_login',
        tokensEarned,
        'Daily login reward'
      );
      
      // Get the updated token balance to send to client
      const tokenBalance = await storage.getUserTokens(req.user.id);
      
      res.status(200).json({
        user: req.user,
        tokens: {
          balance: tokenBalance,
          earned: tokensEarned
        }
      });
    } catch (error) {
      console.error('Error processing login rewards:', error);
      // Even if there's an error with rewards, the user should still be logged in
      if (req.user) {
        res.status(200).json(req.user);
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
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
      const users = await storage.searchUsers(query);
      
      // Filter out the current user and only return necessary user information
      const safeUserData = users
        .filter(user => req.user && user.id !== req.user.id) // Don't include current user
        .map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePicture: user.profilePicture
        }));
      
      return res.status(200).json(safeUserData);
    } catch (error) {
      console.error('Error searching users:', error);
      return res.status(500).json({ 
        error: 'Failed to search users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
