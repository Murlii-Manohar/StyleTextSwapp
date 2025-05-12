import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  guestId: text("guest_id"),
  isGuest: boolean("is_guest").default(false),
});

export const transformations = pgTable("transformations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  guestId: text("guest_id"),
  originalText: text("original_text").notNull(),
  transformedText: text("transformed_text").notNull(),
  fromStyle: text("from_style").notNull(),
  toStyle: text("to_style").notNull(),
  createdAt: text("created_at").notNull(),
});

export const guestSessions = pgTable("guest_sessions", {
  id: serial("id").primaryKey(),
  guestId: text("guest_id").notNull().unique(),
  usageCount: integer("usage_count").default(0),
  maxUsage: integer("max_usage").default(10),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  guestId: true,
  isGuest: true,
});

export const insertTransformationSchema = createInsertSchema(transformations).pick({
  userId: true,
  guestId: true,
  originalText: true,
  transformedText: true,
  fromStyle: true,
  toStyle: true,
  createdAt: true,
});

export const insertGuestSessionSchema = createInsertSchema(guestSessions).pick({
  guestId: true,
  usageCount: true,
  maxUsage: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransformation = z.infer<typeof insertTransformationSchema>;
export type Transformation = typeof transformations.$inferSelect;

export type InsertGuestSession = z.infer<typeof insertGuestSessionSchema>;
export type GuestSession = typeof guestSessions.$inferSelect;
