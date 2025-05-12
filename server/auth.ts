import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface User extends SelectUser {}
    interface Session {
      guestId?: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
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
    secret: process.env.SESSION_SECRET || "textstyler-secret-key",
    resave: false,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const userInput = req.body;
      
      const validationResult = insertUserSchema.safeParse(userInput);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: validationResult.error.errors 
        });
      }
      
      const existingUser = await storage.getUserByUsername(userInput.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(userInput.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userInput,
        password: hashedPassword,
        guestId: null,
        isGuest: false,
      });
      
      // Login the user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        
        return res.json(userWithoutPassword);
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Don't send password to client
    const { password, ...userWithoutPassword } = req.user;
    
    res.json(userWithoutPassword);
  });

  // Initialize guest session if not exists
  app.get("/api/guest/init", async (req, res, next) => {
    try {
      let guestId = req.session.guestId;
      
      // Check if guestId exists in session but not in database
      if (guestId) {
        const existingSession = await storage.getGuestSession(guestId);
        if (!existingSession) {
          // Invalid guestId in session, we'll create a new one
          guestId = undefined;
        }
      }
      
      if (!guestId) {
        guestId = uuidv4();
        req.session.guestId = guestId;
        
        // Create new guest session
        await storage.createGuestSession({
          guestId,
          usageCount: 0,
          maxUsage: 10,
          createdAt: new Date().toISOString()
        });
        
        // Create guest user for reference
        await storage.createUser({
          username: `guest-${guestId}`,
          password: await hashPassword(uuidv4()),
          guestId,
          isGuest: true
        });
      }
      
      const guestSession = await storage.getGuestSession(guestId);
      
      if (!guestSession) {
        return res.status(404).json({ message: "Guest session not found" });
      }
      
      // Safe null handling with nullish coalescing
      const usageCount = guestSession.usageCount ?? 0;
      const maxUsage = guestSession.maxUsage ?? 10;
      
      res.json({
        guestId,
        usageCount,
        maxUsage,
        remainingUses: maxUsage - usageCount
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/guest/usage", async (req, res, next) => {
    try {
      const guestId = req.session.guestId;
      
      if (!guestId) {
        return res.status(400).json({ message: "No guest session found" });
      }
      
      const guestSession = await storage.getGuestSession(guestId);
      
      if (!guestSession) {
        return res.status(404).json({ message: "Guest session not found" });
      }
      
      // Safe null handling with nullish coalescing
      const usageCount = guestSession.usageCount ?? 0;
      const maxUsage = guestSession.maxUsage ?? 10;
      
      res.json({
        guestId,
        usageCount,
        maxUsage,
        remainingUses: maxUsage - usageCount
      });
    } catch (error) {
      next(error);
    }
  });
}