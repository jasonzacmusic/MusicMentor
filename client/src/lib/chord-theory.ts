import { CHROMATIC_NOTES, MAJOR_CHORD_NOTES, MINOR_CHORD_NOTES, CHORD_INTERVALS, CHORD_NAMES } from './music-constants';

export interface Chord {
  name: string;
  notes: string[];
  type: string;
  rootNote: string;
  octaves?: number[]; // Octave positions for each note (0 = middle octave, -1 = lower, +1 = higher)
  inversion?: number; // 0 = root position, 1 = first inversion, 2 = second inversion
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

export function getChordFromNote(rootNote: string, chordType: string, inversion: number = 0): Chord {
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

  // Apply inversion and calculate octave positions (limit to triads - 3 notes max)
  const triadNotes = notes.slice(0, 3); // Ensure we only use 3 notes for triads
  const { invertedNotes, octaves } = applyInversion(triadNotes, inversion);
  
  const inversionSuffix = inversion > 0 ? ` (${getInversionName(inversion)})` : '';

  return {
    name: `${properRootNote} ${CHORD_NAMES[chordType]}${inversionSuffix}`,
    notes: invertedNotes,
    octaves,
    inversion,
    type: chordType,
    rootNote: properRootNote
  };
}

// Apply chord inversion for exactly 3 notes within tight octave range
function applyInversion(notes: string[], inversion: number): { invertedNotes: string[], octaves: number[] } {
  // Always work with exactly 3 notes (triad: root, 3rd, 5th)
  const triadNotes = notes.slice(0, 3);
  
  if (inversion === 0) {
    // Root position: root, 3rd, 5th - all in close voicing
    return {
      invertedNotes: [...triadNotes],
      octaves: [0, 0, 0] // All notes within same octave range
    };
  }
  
  if (inversion === 1) {
    // First inversion: 3rd, 5th, root - tight voicing
    return {
      invertedNotes: [triadNotes[1], triadNotes[2], triadNotes[0]],
      octaves: [0, 0, 1] // Root moves up one octave to stay in range
    };
  }
  
  if (inversion === 2) {
    // Second inversion: 5th, root, 3rd - tight voicing
    return {
      invertedNotes: [triadNotes[2], triadNotes[0], triadNotes[1]],
      octaves: [-1, 0, 0] // 5th moves down to bass, others stay in middle
    };
  }
  
  // Default - root position with tight voicing
  return {
    invertedNotes: triadNotes,
    octaves: [0, 0, 0]
  };
}

function getInversionName(inversion: number): string {
  const inversionNames = ['Root', '1st Inv', '2nd Inv', '3rd Inv'];
  return inversionNames[inversion] || `${inversion}th Inv`;
}

export function getBeginnerChordsForNote(rootNote: string): Chord[] {
  const rootIndex = CHROMATIC_NOTES.indexOf(rootNote);
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }
  
  // Enhanced beginner chord tree with proper inversions and voice leading
  const chords: Chord[] = [];
  
  // 1. Root Major (Root position)
  chords.push(getChordFromNote(rootNote, 'major', 0));
  
  // 2. Root Minor (Root position) 
  chords.push(getChordFromNote(rootNote, 'minor', 0));
  
  // 3. Perfect 4th Major with first inversion for better voice leading
  const p4Index = (rootIndex - 7 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const p4Note = CHROMATIC_NOTES[p4Index];
  const p4MajorChord = getChordFromNote(p4Note, 'major', 1); // Use first inversion
  chords.push({
    ...p4MajorChord,
    name: `${p4MajorChord.rootNote} Major (${rootNote} is the P5)`
  });
  
  // 4. Perfect 4th Minor with first inversion
  const p4MinorChord = getChordFromNote(p4Note, 'minor', 1);
  chords.push({
    ...p4MinorChord,
    name: `${p4MinorChord.rootNote} Minor (${rootNote} is the P5)`
  });
  
  // 5. Major 6th Major with second inversion for smooth voice leading
  const m6Index = (rootIndex - 4 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const m6Note = CHROMATIC_NOTES[m6Index];
  const m6MajorChord = getChordFromNote(m6Note, 'major', 2); // Use second inversion
  chords.push({
    ...m6MajorChord,
    name: `${m6MajorChord.rootNote} Major (${rootNote} is the M3)`
  });
  
  // 6. Minor 6th Minor with second inversion
  const m6MinorIndex = (rootIndex - 3 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const m6MinorNote = CHROMATIC_NOTES[m6MinorIndex];
  const m6MinorChord = getChordFromNote(m6MinorNote, 'minor', 2);
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

// Apply voice leading rules to create smooth chord progressions
export function applyVoiceLeading(chords: Chord[], baseNotes: string[]): Chord[] {
  if (chords.length === 0) return chords;
  
  const voiceLedChords = [...chords];
  
  // Analyze the base notes to determine optimal inversions
  for (let i = 0; i < voiceLedChords.length; i++) {
    const chord = voiceLedChords[i];
    const baseNote = baseNotes[i];
    
    if (chord && baseNote) {
      // Find which note in the chord matches the base note
      const baseNoteIndex = chord.notes.findIndex(note => 
        CHROMATIC_NOTES.indexOf(note) === CHROMATIC_NOTES.indexOf(baseNote)
      );
      
      if (baseNoteIndex !== -1) {
        // Use the inversion that puts the base note in the bass
        const optimalInversion = baseNoteIndex;
        const reVoicedChord = getChordFromNote(chord.rootNote, chord.type, optimalInversion);
        voiceLedChords[i] = {
          ...reVoicedChord,
          name: chord.name // Keep original name but apply voice leading
        };
      }
    }
  }
  
  return voiceLedChords;
}
