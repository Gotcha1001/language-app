import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull().unique(), // Clerk user ID
  native_language: text("native_language").notNull().default("en"), // Fixed to English
  target_language: text("target_language").notNull().default("es"), // Default to Spanish
});

export const Languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
});

export const Levels = pgTable("levels", {
  id: serial("id").primaryKey(),
  language_id: integer("language_id").references(() => Languages.id),
  level_name: text("level_name").notNull(),
  level_order: integer("level_order").notNull(),
});

export const Lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  level_id: integer("level_id").references(() => Levels.id),
  lesson_name: text("lesson_name").notNull(),
  context: text("context").notNull(),
});

export const Words = pgTable("words", {
  id: serial("id").primaryKey(),
  lesson_id: integer("lesson_id").references(() => Lessons.id),
  word: text("word").notNull(),
  translation: text("translation").notNull(),
  pronunciation: text("pronunciation").notNull(),
  native_language: text("native_language").notNull().default("en"),
});

export const UserProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").references(() => Users.user_id),
  lesson_id: integer("lesson_id").references(() => Lessons.id),
  completed: boolean("completed").notNull().default(false),
  completed_at: timestamp("completed_at"),
});

// Initialize database connection for server-side use
const sql = neon(process.env.DRIZZLE_DATABASE_URL);
export const db = drizzle(sql, {
  schema: { Users, Languages, Levels, Lessons, Words, UserProgress },
});
