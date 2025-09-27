import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session table for connect-pg-simple
export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull()
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  age: (schema) => schema.min(10, "Age must be at least 10 years").max(99, "Age must be less than 100 years"),
  gender: (schema) => schema.refine(val => ['male', 'female', 'other'].includes(val.toLowerCase()), "Gender must be either 'male', 'female', or 'other'")
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Countries table
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull()
});

export const countriesRelations = relations(countries, ({ many }) => ({
  states: many(states)
}));

// States table
export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  countryId: integer("country_id").references(() => countries.id).notNull()
});

export const statesRelations = relations(states, ({ one, many }) => ({
  country: one(countries, { fields: [states.countryId], references: [countries.id] }),
  villages: many(villages)
}));

// Villages table
export const villages = pgTable("villages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stateId: integer("state_id").references(() => states.id).notNull(),
  population: integer("population").notNull(),
  waterBodies: integer("water_bodies").notNull(),
  greenCover: integer("green_cover").notNull(),
  development: integer("development").notNull(),
  description: text("description").notNull()
});

export const villagesRelations = relations(villages, ({ one, many }) => ({
  state: one(states, { fields: [villages.stateId], references: [states.id] }),
  scores: many(scores)
}));

// Development sectors table
export const sectors = pgTable("sectors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  imageUrl: text("image_url").notNull()
});

// User scores table
export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  villageId: integer("village_id").references(() => villages.id).notNull(),
  developmentScore: integer("development_score").notNull(),
  budgetEfficiency: integer("budget_efficiency").notNull(),
  environmentalImpact: text("environmental_impact").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const scoresRelations = relations(scores, ({ one }) => ({
  user: one(users, { fields: [scores.userId], references: [users.id] }),
  village: one(villages, { fields: [scores.villageId], references: [villages.id] })
}));
