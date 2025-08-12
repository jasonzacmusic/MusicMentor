// Default note naming preferences: Bb, Ab, Eb for black keys (others can be random)
export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// Note naming for Major chords: use flats (Db, Eb, Ab, Bb) except F#
export const MAJOR_CHORD_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// Note naming for Minor chords: use sharps (C#, F#, G#) and some flats (Eb, Bb)
export const MINOR_CHORD_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];

export const NOTE_FREQUENCIES: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'Db': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'Eb': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'Gb': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'Ab': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'Bb': 466.16,
  'B': 493.88
};

export const CHORD_INTERVALS: Record<string, number[]> = {
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

export const CHORD_NAMES: Record<string, string> = {
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

export const INTERVALS: Record<string, { semitones: number; name: string }> = {
  'unison': { semitones: 0, name: 'Perfect Unison' },
  'minor2': { semitones: 1, name: 'Minor 2nd' },
  'major2': { semitones: 2, name: 'Major 2nd' },
  'minor3': { semitones: 3, name: 'Minor 3rd' },
  'major3': { semitones: 4, name: 'Major 3rd' },
  'perfect4': { semitones: 5, name: 'Perfect 4th' },
  'tritone': { semitones: 6, name: 'Tritone' },
  'perfect5': { semitones: 7, name: 'Perfect 5th' },
  'minor6': { semitones: 8, name: 'Minor 6th' },
  'major6': { semitones: 9, name: 'Major 6th' },
  'minor7': { semitones: 10, name: 'Minor 7th' },
  'major7': { semitones: 11, name: 'Major 7th' },
  'octave': { semitones: 12, name: 'Perfect Octave' }
};
