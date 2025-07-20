import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPracticeSessionSchema, insertUserPreferencesSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Practice session routes
  app.post("/api/practice-sessions", async (req, res) => {
    try {
      const sessionData = insertPracticeSessionSchema.parse(req.body);
      const session = await storage.createPracticeSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create practice session" });
      }
    }
  });

  app.get("/api/practice-sessions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
      }

      const sessions = await storage.getPracticeSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch practice sessions" });
    }
  });

  app.get("/api/practice-time/today/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
      }

      const totalTime = await storage.getTodayPracticeTimeByUser(userId);
      res.json({ totalTime });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's practice time" });
    }
  });

  // User preferences routes
  app.get("/api/user-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
      }

      const preferences = await storage.getUserPreferences(userId);
      if (!preferences) {
        res.status(404).json({ message: "User preferences not found" });
        return;
      }

      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.post("/api/user-preferences", async (req, res) => {
    try {
      const preferencesData = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.createUserPreferences(preferencesData);
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid preferences data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user preferences" });
      }
    }
  });

  app.patch("/api/user-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
      }

      const updateData = insertUserPreferencesSchema.partial().parse(req.body);
      const preferences = await storage.updateUserPreferences(userId, updateData);
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid preferences data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user preferences" });
      }
    }
  });

  // Music theory helper endpoints
  app.get("/api/notes/random", async (req, res) => {
    try {
      const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const randomNotes = [];
      
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * chromaticNotes.length);
        randomNotes.push(chromaticNotes[randomIndex]);
      }
      
      res.json({ notes: randomNotes });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate random notes" });
    }
  });

  app.get("/api/chords/:rootNote", async (req, res) => {
    try {
      const rootNote = req.params.rootNote;
      const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      if (!chromaticNotes.includes(rootNote)) {
        res.status(400).json({ message: "Invalid root note" });
        return;
      }

      const chordIntervals = {
        'major': [0, 4, 7],
        'minor': [0, 3, 7],
        'diminished': [0, 3, 6],
        'augmented': [0, 4, 8],
        'major7': [0, 4, 7, 11],
        'minor7': [0, 3, 7, 10],
        'dominant7': [0, 4, 7, 10],
        'sus2': [0, 2, 7],
        'sus4': [0, 5, 7]
      };

      const chordNames = {
        'major': 'Major',
        'minor': 'Minor',
        'diminished': 'Diminished',
        'augmented': 'Augmented',
        'major7': 'Major 7th',
        'minor7': 'Minor 7th',
        'dominant7': '7th',
        'sus2': 'sus2',
        'sus4': 'sus4'
      };

      const rootIndex = chromaticNotes.indexOf(rootNote);
      const chords = Object.entries(chordIntervals).map(([type, intervals]) => {
        const notes = intervals.map(interval => {
          const noteIndex = (rootIndex + interval) % chromaticNotes.length;
          return chromaticNotes[noteIndex];
        });

        return {
          name: `${rootNote} ${chordNames[type as keyof typeof chordNames]}`,
          notes,
          type,
          rootNote
        };
      });

      res.json({ chords });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate chords" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
