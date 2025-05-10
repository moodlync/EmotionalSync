import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { emailService } from "./services/email-service";

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
    resave: true, // Changed to true to save session on every request
    saveUninitialized: true, // Changed to true to create session for unauthenticated users
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === 'production', // Only use secure in production
      httpOnly: true, // Prevent client-side JS from reading the cookie
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
        firstName: req.body.firstName,
        lastName: req.body.lastName
      });
      
      // Validate required fields are present
      if (!req.body.username) {
        return res.status(400).json({ error: "Username is required" });
      }
      
      if (!req.body.password) {
        return res.status(400).json({ error: "Password is required" });
      }
      
      // Password validation - must be at least 8 characters
      if (req.body.password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      
      // Username validation - only letters, numbers, underscores, hyphens
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(req.body.username)) {
        return res.status(400).json({ error: "Username can only contain letters, numbers, underscores and hyphens" });
      }
      
      // Validation for email if provided
      if (req.body.email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(req.body.email)) {
          return res.status(400).json({ error: "Invalid email format" });
        }
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
        // Create a cleaned request body with only the fields we want to allow
        // This prevents any unexpected fields from client being saved
        const filteredUserData = {
          username: req.body.username,
          password: await hashPassword(req.body.password),
          email: req.body.email,
          firstName: req.body.firstName || "",
          lastName: req.body.lastName || "",
          middleName: req.body.middleName || "",
          gender: req.body.gender || "prefer_not_to_say",
          state: req.body.state || "",
          country: req.body.country || "",
          ipAddress: ipAddress as string,
          isEmailVerified: false
        };
        
        console.log("Creating user with filtered data:", {
          ...filteredUserData,
          password: "(HASHED)"
        });
      
        // Create the user with the filtered data
        const user = await storage.createUser(filteredUserData);

        console.log("User created successfully:", { id: user.id, username: user.username });

        // Only create verification token if user has an email
        if (user.email) {
          try {
            // Create a verification token for the user
            const verificationToken = await storage.createEmailVerificationToken(user.id, user.email);
            
            // Send verification email
            await emailService.sendVerificationEmail(user, verificationToken.token);
            
            console.log(`Verification email sent to ${user.email} for user ${user.username}`);
          } catch (verificationError) {
            console.error("Error sending verification email:", verificationError);
            // We'll continue with login even if verification email fails
          }
        } else {
          console.log(`User ${user.username} registered without email, no verification required`);
        }

        req.login(user, (err) => {
          if (err) {
            console.error("Login error after registration:", err);
            return next(err);
          }
          
          console.log("User logged in after registration:", { id: user.id, username: user.username });
          
          // Return a response indicating whether email verification is needed
          if (user.email) {
            res.status(201).json({
              ...user,
              emailVerificationSent: true,
              message: "Please check your email to verify your account."
            });
          } else {
            res.status(201).json(user);
          }
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

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for username:", req.body.username);
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: 'Internal server error during authentication' });
      }
      
      if (!user) {
        console.log("Authentication failed for username:", req.body.username);
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: 'Invalid username or password'
        });
      }
      
      console.log("User authenticated successfully:", user.username);
      
      // Log the user in
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return res.status(500).json({ error: 'Failed to create login session' });
        }
        
        // Save the session explicitly to ensure it's stored before response
        req.session.save(async (saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ error: 'Failed to save session' });
          }
          
          console.log("Session saved successfully for user:", user.username);
          
          try {
            // Reward user with tokens for daily login
            // In a real app, you would check if they've already received the daily login bonus today
            // For now, we'll give them tokens every time they log in
            const tokensEarned = 10; // 10 tokens for logging in
            const rewardActivity = await storage.createRewardActivity(
              user.id,
              'daily_login',
              tokensEarned,
              'Daily login reward'
            );
            
            // Get the updated token balance to send to client
            const tokenBalance = await storage.getUserTokens(user.id);
            
            console.log(`Login successful: User ${user.username} earned ${tokensEarned} tokens. Balance: ${tokenBalance}`);
            
            return res.status(200).json({
              user: user,
              tokens: {
                balance: tokenBalance,
                earned: tokensEarned
              }
            });
          } catch (error) {
            console.error('Error processing login rewards:', error);
            // Even if there's an error with rewards, the user should still be logged in
            return res.status(200).json(user);
          }
        });
      });
    })(req, res, next);
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
  
  // Email verification endpoint
  app.get("/api/verify-email", async (req, res) => {
    const token = req.query.token as string;
    
    if (!token) {
      return res.status(400).json({ error: "Missing verification token" });
    }
    
    try {
      // Get the token from storage
      const verificationToken = await storage.getEmailVerificationToken(token);
      
      if (!verificationToken) {
        return res.status(404).json({ error: "Invalid verification token" });
      }
      
      // Check if token is expired
      if (new Date() > new Date(verificationToken.expiresAt)) {
        return res.status(400).json({ 
          error: "Verification token has expired",
          message: "Please request a new verification email"
        });
      }
      
      // Check if token is already used
      if (verificationToken.usedAt) {
        return res.status(400).json({ 
          error: "Verification token has already been used",
          message: "Your email is already verified"
        });
      }
      
      // Mark the token as used
      await storage.markEmailVerificationTokenAsUsed(token);
      
      // Mark the user as verified
      const user = await storage.markUserAsVerified(verificationToken.userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // If user is not logged in, redirect to login page
      if (!req.isAuthenticated()) {
        return res.redirect('/auth?verified=true');
      }
      
      // If user is logged in and it's the same user, redirect to profile
      if (req.user.id === verificationToken.userId) {
        return res.redirect('/profile?verified=true');
      }
      
      // If user is logged in but it's a different user, redirect to login page
      return res.redirect('/auth?verified=true&logout=true');
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ 
        error: "Failed to verify email",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Frontend-friendly email verification endpoint
  app.get("/verify-email", (req, res) => {
    // Redirect to the API endpoint with the same token
    const token = req.query.token;
    res.redirect(`/api/verify-email?token=${token}`);
  });
  
  // Resend verification email endpoint
  app.post("/api/resend-verification", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = req.user;
    
    // Check if user already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ 
        error: "Email already verified",
        message: "Your email is already verified" 
      });
    }
    
    // Check if user has an email
    if (!user.email) {
      return res.status(400).json({ 
        error: "No email address",
        message: "You don't have an email address to verify" 
      });
    }
    
    try {
      // Delete any existing tokens for this user
      await storage.deleteEmailVerificationTokensByUserId(user.id);
      
      // Create a new verification token
      const verificationToken = await storage.createEmailVerificationToken(user.id, user.email);
      
      // Send verification email
      await emailService.sendVerificationEmail(user, verificationToken.token);
      
      console.log(`Resent verification email to ${user.email} for user ${user.username}`);
      
      return res.status(200).json({ 
        success: true,
        message: "Verification email has been sent. Please check your inbox." 
      });
    } catch (error) {
      console.error("Error resending verification email:", error);
      return res.status(500).json({ 
        error: "Failed to resend verification email",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
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
