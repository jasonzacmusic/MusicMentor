import { users, practiceSession, userPreferences, type User, type InsertUser, type PracticeSession, type InsertPracticeSession, type UserPreferences, type InsertUserPreferences } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPracticeSession(session: InsertPracticeSession): Promise<PracticeSession>;
  getPracticeSessionsByUser(userId: number): Promise<PracticeSession[]>;
  getTodayPracticeTimeByUser(userId: number): Promise<number>;
  
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private practiceSessions: Map<number, PracticeSession>;
  private userPreferences: Map<number, UserPreferences>;
  private currentUserId: number;
  private currentSessionId: number;
  private currentPreferencesId: number;

  constructor() {
    this.users = new Map();
    this.practiceSessions = new Map();
    this.userPreferences = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    this.currentPreferencesId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPracticeSession(insertSession: InsertPracticeSession): Promise<PracticeSession> {
    const id = this.currentSessionId++;
    const session: PracticeSession = { 
      ...insertSession, 
      id,
      sessionDate: new Date(),
      userId: insertSession.userId ?? null,
    };
    this.practiceSessions.set(id, session);
    return session;
  }

  async getPracticeSessionsByUser(userId: number): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async getTodayPracticeTimeByUser(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = Array.from(this.practiceSessions.values()).filter(
      (session) => session.userId === userId && session.sessionDate >= today
    );

    return todaySessions.reduce((total, session) => total + session.duration, 0);
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (prefs) => prefs.userId === userId
    );
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.currentPreferencesId++;
    const preferences: UserPreferences = { 
      ...insertPreferences, 
      id,
      userId: insertPreferences.userId ?? null,
      favoriteKey: insertPreferences.favoriteKey ?? null,
      defaultTempo: insertPreferences.defaultTempo ?? null,
      practiceGoal: insertPreferences.practiceGoal ?? null,
    };
    this.userPreferences.set(id, preferences);
    return preferences;
  }

  async updateUserPreferences(userId: number, updateData: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    if (!existing) {
      throw new Error('User preferences not found');
    }

    const updated: UserPreferences = { ...existing, ...updateData };
    this.userPreferences.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
