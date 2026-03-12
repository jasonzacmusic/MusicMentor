import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage for Vercel serverless (stateless between invocations)
// For production, connect to a database like Neon PostgreSQL
const practiceSessions: any[] = [];
const userPreferences: Map<number, any> = new Map();

const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const chordIntervals: Record<string, number[]> = {
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

const chordNames: Record<string, string> = {
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

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const path = url.replace(/^\/api/, '');

  try {
    // GET /api/notes/random
    if (req.method === 'GET' && path === '/notes/random') {
      const randomNotes = [];
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * chromaticNotes.length);
        randomNotes.push(chromaticNotes[randomIndex]);
      }
      return res.status(200).json({ notes: randomNotes });
    }

    // GET /api/chords/:rootNote
    if (req.method === 'GET' && path.startsWith('/chords/')) {
      const rootNote = path.replace('/chords/', '').split('?')[0];

      if (!chromaticNotes.includes(rootNote)) {
        return res.status(400).json({ message: 'Invalid root note' });
      }

      const rootIndex = chromaticNotes.indexOf(rootNote);
      const chords = Object.entries(chordIntervals).map(([type, intervals]) => {
        const notes = intervals.map(interval => {
          const noteIndex = (rootIndex + interval) % chromaticNotes.length;
          return chromaticNotes[noteIndex];
        });

        return {
          name: `${rootNote} ${chordNames[type]}`,
          notes,
          type,
          rootNote
        };
      });

      return res.status(200).json({ chords });
    }

    // Practice sessions
    if (req.method === 'POST' && path === '/practice-sessions') {
      const session = {
        id: Date.now(),
        ...req.body,
        sessionDate: new Date()
      };
      practiceSessions.push(session);
      return res.status(200).json(session);
    }

    if (req.method === 'GET' && path.startsWith('/practice-sessions/')) {
      const userId = parseInt(path.replace('/practice-sessions/', ''));
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      const sessions = practiceSessions.filter(s => s.userId === userId);
      return res.status(200).json(sessions);
    }

    if (req.method === 'GET' && path.startsWith('/practice-time/today/')) {
      const userId = parseInt(path.replace('/practice-time/today/', ''));
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      const today = new Date().toDateString();
      const todaySessions = practiceSessions.filter(
        s => s.userId === userId && new Date(s.sessionDate).toDateString() === today
      );
      const totalTime = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      return res.status(200).json({ totalTime });
    }

    // User preferences
    if (req.method === 'GET' && path.startsWith('/user-preferences/')) {
      const userId = parseInt(path.replace('/user-preferences/', ''));
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      const preferences = userPreferences.get(userId);
      if (!preferences) {
        return res.status(404).json({ message: 'User preferences not found' });
      }
      return res.status(200).json(preferences);
    }

    if (req.method === 'POST' && path === '/user-preferences') {
      const preferences = {
        id: Date.now(),
        ...req.body
      };
      if (req.body.userId) {
        userPreferences.set(req.body.userId, preferences);
      }
      return res.status(200).json(preferences);
    }

    if (req.method === 'PATCH' && path.startsWith('/user-preferences/')) {
      const userId = parseInt(path.replace('/user-preferences/', ''));
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      const existing = userPreferences.get(userId) || { id: Date.now(), userId };
      const updated = { ...existing, ...req.body };
      userPreferences.set(userId, updated);
      return res.status(200).json(updated);
    }

    // Health check
    if (req.method === 'GET' && (path === '/health' || path === '')) {
      return res.status(200).json({
        status: 'ok',
        app: 'Chord Trees API',
        timestamp: new Date().toISOString()
      });
    }

    // Not found
    return res.status(404).json({ message: 'API endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
