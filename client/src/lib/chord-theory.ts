import { CHROMATIC_NOTES, CHORD_INTERVALS, CHORD_NAMES } from './music-constants';

export interface Chord {
  name: string;
  notes: string[];
  type: string;
  rootNote: string;
}

export function generateRandomNotes(): string[] {
  const notes: string[] = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * CHROMATIC_NOTES.length);
    notes.push(CHROMATIC_NOTES[randomIndex]);
  }
  return notes;
}

export function getChordFromNote(rootNote: string, chordType: string): Chord {
  const rootIndex = CHROMATIC_NOTES.indexOf(rootNote);
  const intervals = CHORD_INTERVALS[chordType];
  
  if (rootIndex === -1 || !intervals) {
    throw new Error(`Invalid root note or chord type: ${rootNote}, ${chordType}`);
  }

  const notes = intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % CHROMATIC_NOTES.length;
    return CHROMATIC_NOTES[noteIndex];
  });

  return {
    name: `${rootNote} ${CHORD_NAMES[chordType]}`,
    notes,
    type: chordType,
    rootNote
  };
}

export function getChordsForNote(rootNote: string): Chord[] {
  return Object.keys(CHORD_INTERVALS).map(chordType => 
    getChordFromNote(rootNote, chordType)
  );
}

export function formatChordNotes(notes: string[]): string {
  return notes.join(' - ');
}

export function getNoteFromSemitones(rootNote: string, semitones: number): string {
  const rootIndex = CHROMATIC_NOTES.indexOf(rootNote);
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }
  
  const targetIndex = (rootIndex + semitones) % CHROMATIC_NOTES.length;
  return CHROMATIC_NOTES[targetIndex];
}
