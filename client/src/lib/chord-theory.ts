import { CHROMATIC_NOTES, MAJOR_CHORD_NOTES, MINOR_CHORD_NOTES, CHORD_INTERVALS, CHORD_NAMES } from './music-constants';

export interface Chord {
  name: string;
  notes: string[];
  type: string;
  rootNote: string;
}

// Helper function to get proper note name based on chord type
function getProperNoteName(chromaticIndex: number, chordType: 'major' | 'minor'): string {
  if (chordType === 'major') {
    return MAJOR_CHORD_NOTES[chromaticIndex];
  } else {
    return MINOR_CHORD_NOTES[chromaticIndex];
  }
}

export function generateRandomNotes(): string[] {
  // Note 1: Any of the 12 chromatic notes
  const note1Index = Math.floor(Math.random() * CHROMATIC_NOTES.length);
  const note1 = CHROMATIC_NOTES[note1Index];
  
  // Note 2: Major 3rd up (4 semitones)
  const note2Index = (note1Index + 4) % CHROMATIC_NOTES.length;
  const note2 = CHROMATIC_NOTES[note2Index];
  
  // Note 3: Minor 3rd down from Note 1 (3 semitones down)
  const note3Index = (note1Index - 3 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const note3 = CHROMATIC_NOTES[note3Index];
  
  return [note1, note2, note3];
}

export function getChordFromNote(rootNote: string, chordType: string): Chord {
  const rootIndex = CHROMATIC_NOTES.indexOf(rootNote);
  const intervals = CHORD_INTERVALS[chordType];
  
  if (rootIndex === -1 || !intervals) {
    throw new Error(`Invalid root note or chord type: ${rootNote}, ${chordType}`);
  }

  // Use proper note naming based on chord type
  const chordTypeForNaming = (chordType === 'major' || chordType === 'major7' || chordType === 'dominant7' || chordType === 'augmented' || chordType === 'sus2' || chordType === 'sus4') ? 'major' : 'minor';
  
  const properRootNote = getProperNoteName(rootIndex, chordTypeForNaming);
  
  const notes = intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % CHROMATIC_NOTES.length;
    return getProperNoteName(noteIndex, chordTypeForNaming);
  });

  return {
    name: `${properRootNote} ${CHORD_NAMES[chordType]}`,
    notes,
    type: chordType,
    rootNote: properRootNote
  };
}

export function getBeginnerChordsForNote(rootNote: string): Chord[] {
  const rootIndex = CHROMATIC_NOTES.indexOf(rootNote);
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }
  
  // Beginner chord tree with 6 harmonizing options based on interval relationships
  const chords: Chord[] = [];
  
  // 1. Root Major (Unison)
  chords.push(getChordFromNote(rootNote, 'major'));
  
  // 2. Root Minor (Unison)
  chords.push(getChordFromNote(rootNote, 'minor'));
  
  // 3. Perfect 4th Major (root note is the perfect 5th of this chord)
  const p4Index = (rootIndex - 7 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const p4Note = CHROMATIC_NOTES[p4Index];
  const p4MajorChord = getChordFromNote(p4Note, 'major');
  chords.push({
    ...p4MajorChord,
    name: `${p4MajorChord.rootNote} Major (${rootNote} is the P5)`
  });
  
  // 4. Perfect 4th Minor (root note is the perfect 5th of this chord)
  const p4MinorChord = getChordFromNote(p4Note, 'minor');
  chords.push({
    ...p4MinorChord,
    name: `${p4MinorChord.rootNote} Minor (${rootNote} is the P5)`
  });
  
  // 5. Major 6th Major (root note is the major 3rd of this chord)
  const m6Index = (rootIndex - 4 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const m6Note = CHROMATIC_NOTES[m6Index];
  const m6MajorChord = getChordFromNote(m6Note, 'major');
  chords.push({
    ...m6MajorChord,
    name: `${m6MajorChord.rootNote} Major (${rootNote} is the M3)`
  });
  
  // 6. Minor 6th Minor (root note is the minor 3rd of this chord)
  const m6MinorIndex = (rootIndex - 3 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const m6MinorNote = CHROMATIC_NOTES[m6MinorIndex];
  const m6MinorChord = getChordFromNote(m6MinorNote, 'minor');
  chords.push({
    ...m6MinorChord,
    name: `${m6MinorChord.rootNote} Minor (${rootNote} is the m3)`
  });
  
  return chords;
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
