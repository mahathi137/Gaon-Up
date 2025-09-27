import { db } from "@db";
import { eq } from "drizzle-orm";
import { users, villages, countries, states, sectors, scores } from "@shared/schema";
import type { InsertUser, User } from "@shared/schema";
import session from "express-session";
import { pool } from "@db";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  
  getCountries(): Promise<any[]>;
  getStatesByCountryId(countryId: number): Promise<any[]>;
  getVillagesByStateId(stateId: number): Promise<any[]>;
  getVillageById(id: number): Promise<any>;
  
  getSectors(): Promise<any[]>;
  
  getUserScores(userId: number): Promise<any[]>;
  getAllScores(): Promise<any[]>;
  createScore(data: any): Promise<any>;
  
  sessionStore: session.SessionStore;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: "session", // Default table name for session store
      createTableIfMissing: true
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(data: InsertUser): Promise<User> {
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }
  
  async getCountries(): Promise<any[]> {
    return await db.select().from(countries);
  }
  
  async getStatesByCountryId(countryId: number): Promise<any[]> {
    return await db.select().from(states).where(eq(states.countryId, countryId));
  }
  
  async getVillagesByStateId(stateId: number): Promise<any[]> {
    return await db.select().from(villages).where(eq(villages.stateId, stateId));
  }
  
  async getVillageById(id: number): Promise<any> {
    const result = await db.select().from(villages).where(eq(villages.id, id));
    return result[0];
  }
  
  async getSectors(): Promise<any[]> {
    return await db.select().from(sectors);
  }
  
  async getUserScores(userId: number): Promise<any[]> {
    return await db.select()
      .from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(scores.createdAt);
  }
  
  async getAllScores(): Promise<any[]> {
    return await db.select({
      id: scores.id,
      userId: scores.userId,
      villageId: scores.villageId,
      developmentScore: scores.developmentScore,
      budgetEfficiency: scores.budgetEfficiency,
      environmentalImpact: scores.environmentalImpact,
      createdAt: scores.createdAt,
      username: users.username,
      villageName: villages.name
    })
    .from(scores)
    .innerJoin(users, eq(scores.userId, users.id))
    .innerJoin(villages, eq(scores.villageId, villages.id))
    .orderBy(scores.developmentScore);
  }
  
  async createScore(data: any): Promise<any> {
    const result = await db.insert(scores).values(data).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
