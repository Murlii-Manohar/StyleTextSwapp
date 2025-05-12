import { 
  users, type User, type InsertUser, 
  transformations, type Transformation, type InsertTransformation,
  guestSessions, type GuestSession, type InsertGuestSession
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGuestId(guestId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transformation operations
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  getTransformationsByUserId(userId: number): Promise<Transformation[]>;
  getTransformationsByGuestId(guestId: string): Promise<Transformation[]>;
  
  // Guest session operations
  getGuestSession(guestId: string): Promise<GuestSession | undefined>;
  createGuestSession(guestSession: InsertGuestSession): Promise<GuestSession>;
  incrementGuestUsage(guestId: string): Promise<GuestSession>;
  
  // Session store
  sessionStore: any; // Using any for now to avoid type issues
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to match IStorage type

  constructor() {
    this.sessionStore = pool 
      ? new PostgresSessionStore({ 
          pool, 
          createTableIfMissing: true 
        })
      : new MemoryStore({
          checkPeriod: 86400000, // 24 hours
        });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByGuestId(guestId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.guestId, guestId),
          eq(users.isGuest, true)
        )
      );
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createTransformation(insertTransformation: InsertTransformation): Promise<Transformation> {
    const [transformation] = await db
      .insert(transformations)
      .values(insertTransformation)
      .returning();
    return transformation;
  }

  async getTransformationsByUserId(userId: number): Promise<Transformation[]> {
    return await db
      .select()
      .from(transformations)
      .where(eq(transformations.userId, userId));
  }

  async getTransformationsByGuestId(guestId: string): Promise<Transformation[]> {
    return await db
      .select()
      .from(transformations)
      .where(eq(transformations.guestId, guestId));
  }

  async getGuestSession(guestId: string): Promise<GuestSession | undefined> {
    const [guestSession] = await db
      .select()
      .from(guestSessions)
      .where(eq(guestSessions.guestId, guestId));
    return guestSession;
  }

  async createGuestSession(insertGuestSession: InsertGuestSession): Promise<GuestSession> {
    const [guestSession] = await db
      .insert(guestSessions)
      .values(insertGuestSession)
      .returning();
    return guestSession;
  }

  async incrementGuestUsage(guestId: string): Promise<GuestSession> {
    const guestSession = await this.getGuestSession(guestId);
    if (!guestSession) {
      throw new Error("Guest session not found");
    }

    // Safe increment with null check
    const currentUsage = guestSession.usageCount || 0;
    const newUsage = currentUsage + 1;
    
    const [updatedSession] = await db
      .update(guestSessions)
      .set({ usageCount: newUsage })
      .where(eq(guestSessions.guestId, guestId))
      .returning();
    
    return updatedSession;
  }
}

// MemStorage implementation for local development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transformations: Map<number, Transformation>;
  private guestSessions: Map<string, GuestSession>;
  sessionStore: any; // Use any type to match IStorage interface
  currentUserId: number;
  currentTransformationId: number;
  currentGuestSessionId: number;

  constructor() {
    this.users = new Map();
    this.transformations = new Map();
    this.guestSessions = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    this.currentUserId = 1;
    this.currentTransformationId = 1;
    this.currentGuestSessionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByGuestId(guestId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.guestId === guestId && user.isGuest === true,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    // Ensure proper typing for User object
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password,
      guestId: insertUser.guestId ?? null,
      isGuest: insertUser.isGuest ?? false
    };
    this.users.set(id, user);
    return user;
  }

  async createTransformation(insertTransformation: InsertTransformation): Promise<Transformation> {
    const id = this.currentTransformationId++;
    // Ensure proper typing for Transformation object
    const transformation: Transformation = { 
      id,
      userId: insertTransformation.userId ?? null,
      guestId: insertTransformation.guestId ?? null,
      originalText: insertTransformation.originalText,
      transformedText: insertTransformation.transformedText,
      fromStyle: insertTransformation.fromStyle,
      toStyle: insertTransformation.toStyle,
      createdAt: insertTransformation.createdAt
    };
    this.transformations.set(id, transformation);
    return transformation;
  }

  async getTransformationsByUserId(userId: number): Promise<Transformation[]> {
    return Array.from(this.transformations.values()).filter(
      (transformation) => transformation.userId === userId,
    );
  }

  async getTransformationsByGuestId(guestId: string): Promise<Transformation[]> {
    return Array.from(this.transformations.values()).filter(
      (transformation) => transformation.guestId === guestId,
    );
  }

  async getGuestSession(guestId: string): Promise<GuestSession | undefined> {
    return this.guestSessions.get(guestId);
  }

  async createGuestSession(insertGuestSession: InsertGuestSession): Promise<GuestSession> {
    const id = this.currentGuestSessionId++;
    // Ensure proper typing for GuestSession object
    const guestSession: GuestSession = { 
      id,
      guestId: insertGuestSession.guestId,
      usageCount: insertGuestSession.usageCount ?? 0,
      maxUsage: insertGuestSession.maxUsage ?? 10,
      createdAt: insertGuestSession.createdAt
    };
    this.guestSessions.set(guestSession.guestId, guestSession);
    return guestSession;
  }

  async incrementGuestUsage(guestId: string): Promise<GuestSession> {
    const guestSession = await this.getGuestSession(guestId);
    if (!guestSession) {
      throw new Error("Guest session not found");
    }
    
    const updatedSession: GuestSession = { 
      ...guestSession, 
      usageCount: (guestSession.usageCount ?? 0) + 1 
    };
    
    this.guestSessions.set(guestId, updatedSession);
    return updatedSession;
  }
}

// Use the appropriate storage based on environment
// If DATABASE_URL is set, use database storage, otherwise use in-memory storage
const useMemoryStorage = !process.env.DATABASE_URL || process.env.USE_MEMORY_STORAGE === 'true';

// Set storage based on environment configuration
export const storage = useMemoryStorage 
  ? new MemStorage() 
  : new DatabaseStorage();
