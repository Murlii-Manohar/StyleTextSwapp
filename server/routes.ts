import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { transformTextStyle, validateApiKey } from "./gemini";
import { z } from "zod";

// Add guestId to session type
declare module 'express-session' {
  interface Session {
    guestId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Check if API key is valid at startup
  try {
    const isApiKeyValid = await validateApiKey();
    if (!isApiKeyValid) {
      console.warn("Gemini API key is invalid or not set. Style transformations will not work.");
    }
  } catch (error) {
    console.error("Error validating API key:", error);
  }

  // Transform text endpoint
  const transformTextSchema = z.object({
    originalText: z.string().min(1, "Original text is required"),
    fromStyle: z.string().optional(),
    toStyle: z.string().min(1, "Target style is required"),
    preservationPercentage: z.number().min(0).max(100).default(50), // Add style preservation percentage
  });

  app.post("/api/transform", async (req, res, next) => {
    try {
      const validationResult = transformTextSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input data",
          errors: validationResult.error.errors
        });
      }
      
      const { originalText, fromStyle, toStyle, preservationPercentage } = validationResult.data;
      
      // Check if user is authenticated or has a guest session
      const isAuthenticated = req.isAuthenticated();
      const guestId = req.session.guestId;
      
      if (!isAuthenticated && !guestId) {
        return res.status(401).json({ message: "User must be authenticated or have a guest session" });
      }
      
      // If guest user, check and update usage
      if (!isAuthenticated && guestId) {
        const guestSession = await storage.getGuestSession(guestId);
        
        if (!guestSession) {
          return res.status(404).json({ message: "Guest session not found" });
        }
        
        // Safely handle null values with nullish coalescing
        const usageCount = guestSession.usageCount ?? 0;
        const maxUsage = guestSession.maxUsage ?? 10;
        
        if (usageCount >= maxUsage) {
          return res.status(403).json({ 
            message: "Guest usage limit reached. Please sign up for unlimited transformations.",
            remainingUses: 0
          });
        }
        
        // Increment usage count
        await storage.incrementGuestUsage(guestId);
      }
      
      // Use Gemini for text transformation
      let transformedText: string;
      try {
        transformedText = await transformTextStyle({
          originalText,
          fromStyle,
          toStyle,
          preservationPercentage,
        });
      } catch (error: any) {
        console.error("Gemini API error:", error);
        return res.status(500).json({
          message: "Error transforming text. Please try again later.",
          error: error.message || String(error)
        });
      }
      
      // Record the transformation
      if (isAuthenticated) {
        await storage.createTransformation({
          userId: req.user?.id,
          guestId: null,
          originalText,
          transformedText,
          fromStyle: fromStyle || "default",
          toStyle,
          createdAt: new Date().toISOString(),
        });
      } else if (guestId) {
        await storage.createTransformation({
          userId: null,
          guestId,
          originalText,
          transformedText,
          fromStyle: fromStyle || "default",
          toStyle,
          createdAt: new Date().toISOString(),
        });
      }
      
      // Get updated guest usage if applicable
      let guestUsage = null;
      if (!isAuthenticated && guestId) {
        const guestSession = await storage.getGuestSession(guestId);
        guestUsage = {
          usageCount: guestSession?.usageCount || 0,
          maxUsage: guestSession?.maxUsage || 10,
          remainingUses: (guestSession?.maxUsage || 10) - (guestSession?.usageCount || 0)
        };
      }
      
      res.json({
        transformedText,
        guestUsage
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Get transformation history (for authenticated users)
  app.get("/api/transformations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "User must be authenticated" });
      }
      
      const transformations = await storage.getTransformationsByUserId(req.user?.id);
      
      res.json(transformations);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
