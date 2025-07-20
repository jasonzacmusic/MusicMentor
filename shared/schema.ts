import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const practiceSession = pgTable("practice_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  duration: integer("duration").notNull(), // in minutes
  notesPlayed: text("notes_played").array().notNull(),
  chordsPlayed: text("chords_played").array().notNull(),
  sessionDate: timestamp("session_date").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  defaultTempo: integer("default_tempo").default(120),
  favoriteKey: text("favorite_key").default("C"),
  practiceGoal: integer("practice_goal").default(30), // minutes per day
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPracticeSessionSchema = createInsertSchema(practiceSession).pick({
  userId: true,
  duration: true,
  notesPlayed: true,
  chordsPlayed: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  defaultTempo: true,
  favoriteKey: true,
  practiceGoal: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPracticeSession = z.infer<typeof insertPracticeSessionSchema>;
export type PracticeSession = typeof practiceSession.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
