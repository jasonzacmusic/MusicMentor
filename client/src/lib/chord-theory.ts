import { CHROMATIC_NOTES, MAJOR_CHORD_NOTES, MINOR_CHORD_NOTES, CHORD_INTERVALS, CHORD_NAMES, CHORD_CATEGORIES } from './music-constants';

export interface Chord {
  name: string;
  notes: string[];
  type: string;
  rootNote: string;
  octaves?: number[];
  inversion?: number;
  category?: 'triad' | 'seventh' | 'extension';
  parentType?: string;
  noteRole?: string;
  roleIndex?: number;
}

export interface ChordTreeNode {
  chord: Chord;
  isCenter: boolean;
  branches?: ChordTreeNode[];
  angleOffset?: number;
  distance?: number;
}

export interface ChordMembership {
  chord: Chord;
  role: string;
  roleIndex: number;
  chordType: string;
  category: 'triad' | 'seventh' | 'extension';
}

const NOTE_ROLE_NAMES: Record<string, Record<number, string>> = {
  'major': { 0: 'Root', 1: 'M3', 2: 'P5' },
  'minor': { 0: 'Root', 1: 'm3', 2: 'P5' },
  'diminished': { 0: 'Root', 1: 'm3', 2: 'b5' },
  'augmented': { 0: 'Root', 1: 'M3', 2: '#5' },
  'sus2': { 0: 'Root', 1: 'M2', 2: 'P5' },
  'sus4': { 0: 'Root', 1: 'P4', 2: 'P5' },
  'major7': { 0: 'Root', 1: 'M3', 2: 'P5', 3: 'M7' },
  'minor7': { 0: 'Root', 1: 'm3', 2: 'P5', 3: 'b7' },
  'dominant7': { 0: 'Root', 1: 'M3', 2: 'P5', 3: 'b7' },
  'diminished7': { 0: 'Root', 1: 'm3', 2: 'b5', 3: 'bb7' },
  '7sus4': { 0: 'Root', 1: 'P4', 2: 'P5', 3: 'b7' },
  'minorMajor7': { 0: 'Root', 1: 'm3', 2: 'P5', 3: 'M7' },
  'minor7b5': { 0: 'Root', 1: 'm3', 2: 'b5', 3: 'b7' },
  'add9': { 0: 'Root', 1: 'M2', 2: 'M3', 3: 'P5' },
  'minorAdd9': { 0: 'Root', 1: 'M2', 2: 'm3', 3: 'P5' }
};

function normalizeToPitchClass(note: string): number {
  const normalizations: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  const normalized = normalizations[note] || note;
  const pitchClasses: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  return pitchClasses[normalized] ?? 0;
}

function getChordCategory(chordType: string): 'triad' | 'seventh' | 'extension' {
  if (CHORD_CATEGORIES.triads.includes(chordType)) return 'triad';
  if (CHORD_CATEGORIES.sevenths.includes(chordType)) return 'seventh';
  return 'extension';
}

export function getAllChordsContainingNote(targetNote: string, chordTypes?: string[]): ChordMembership[] {
  const targetPitchClass = normalizeToPitchClass(targetNote);
  const results: ChordMembership[] = [];
  
  const typesToCheck = chordTypes || Object.keys(CHORD_INTERVALS);
  
  for (const chordType of typesToCheck) {
    const intervals = CHORD_INTERVALS[chordType];
    if (!intervals) continue;
    
    for (let rootIndex = 0; rootIndex < 12; rootIndex++) {
      const chordPitchClasses = intervals.map(interval => (rootIndex + interval) % 12);
      
      // Find ALL positions where the target note appears (not just first)
      const matchingPositions: number[] = [];
      chordPitchClasses.forEach((pc, idx) => {
        if (pc === targetPitchClass) matchingPositions.push(idx);
      });
      
      if (matchingPositions.length === 0) continue;
      
      const rootNote = CHROMATIC_NOTES[rootIndex];
      const category = getChordCategory(chordType);
      
      // Create entries for each position where the note appears
      for (const notePosition of matchingPositions) {
        const role = NOTE_ROLE_NAMES[chordType]?.[notePosition] || `Position ${notePosition + 1}`;
        
        try {
          const chord = getChordFromNote(rootNote, chordType, 0);
          chord.noteRole = role;
          chord.roleIndex = notePosition;
          
          results.push({
            chord,
            role,
            roleIndex: notePosition,
            chordType,
            category
          });
        } catch (e) {
          // Skip invalid combinations
        }
      }
    }
  }
  
  return results;
}

export function getChordsContainingNoteGrouped(targetNote: string): {
  triads: ChordMembership[];
  sevenths: ChordMembership[];
  extensions: ChordMembership[];
} {
  const allChords = getAllChordsContainingNote(targetNote);
  
  return {
    triads: allChords.filter(c => c.category === 'triad'),
    sevenths: allChords.filter(c => c.category === 'seventh'),
    extensions: allChords.filter(c => c.category === 'extension')
  };
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

  const majorTypes = ['major', 'major7', 'dominant7', 'augmented', 'sus2', 'sus4', '7sus4', 'add9'];
  const chordTypeForNaming = majorTypes.includes(chordType) ? 'major' : 'minor';
  
  const properRootNote = getProperNoteName(rootIndex, chordTypeForNaming);
  
  const notes = intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % CHROMATIC_NOTES.length;
    return getProperNoteName(noteIndex, chordTypeForNaming);
  });

  const isSeventhChord = intervals.length === 4;
  const category: 'triad' | 'seventh' | 'extension' = 
    isSeventhChord ? (chordType.includes('add') ? 'extension' : 'seventh') : 'triad';
  
  const { invertedNotes, octaves } = isSeventhChord 
    ? applySeventhInversion(notes, inversion)
    : applyInversion(notes.slice(0, 3), inversion);
  
  const inversionSuffix = inversion > 0 ? ` (${getInversionName(inversion)})` : '';

  return {
    name: `${properRootNote} ${CHORD_NAMES[chordType]}${inversionSuffix}`,
    notes: invertedNotes,
    octaves,
    inversion,
    type: chordType,
    rootNote: properRootNote,
    category
  };
}

function applySeventhInversion(notes: string[], inversion: number): { invertedNotes: string[], octaves: number[] } {
  if (notes.length < 4) {
    return applyInversion(notes, inversion);
  }
  
  const [root, third, fifth, seventh] = notes;
  const positions = notes.map(getChromaticPosition);
  
  let orderedNotes: string[];
  switch (inversion) {
    case 1:
      orderedNotes = [third, fifth, seventh, root];
      break;
    case 2:
      orderedNotes = [fifth, seventh, root, third];
      break;
    case 3:
      orderedNotes = [seventh, root, third, fifth];
      break;
    default:
      orderedNotes = [root, third, fifth, seventh];
  }
  
  const octaves = [0, 0, 0, 0];
  for (let i = 1; i < 4; i++) {
    const prevPos = getChromaticPosition(orderedNotes[i - 1]);
    const currPos = getChromaticPosition(orderedNotes[i]);
    if (currPos <= prevPos) {
      octaves[i] = octaves[i - 1] + 1;
    } else {
      octaves[i] = octaves[i - 1];
    }
  }
  
  return { invertedNotes: orderedNotes, octaves };
}

// Get chromatic position for a note (0-11)
function getChromaticPosition(note: string): number {
  const normalizations: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  const normalized = normalizations[note] || note;
  const positions: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  return positions[normalized] ?? 0;
}

// Apply chord inversion for exactly 3 notes with proper pitch ordering
function applyInversion(notes: string[], inversion: number): { invertedNotes: string[], octaves: number[] } {
  const triadNotes = notes.slice(0, 3);
  if (triadNotes.length < 3) {
    return { invertedNotes: triadNotes, octaves: triadNotes.map(() => 0) };
  }

  const [root, third, fifth] = triadNotes;
  const rootPos = getChromaticPosition(root);
  const thirdPos = getChromaticPosition(third);
  const fifthPos = getChromaticPosition(fifth);

  if (inversion === 0) {
    // Root position: root is bass, then 3rd, then 5th (ascending pitch)
    // Adjust octaves so notes ascend: root < 3rd < 5th
    const octaves = [0, 0, 0];
    if (thirdPos <= rootPos) octaves[1] = 1;
    if (fifthPos <= rootPos || (octaves[1] === 1 && fifthPos <= thirdPos)) octaves[2] = 1;
    return { invertedNotes: [root, third, fifth], octaves };
  }

  if (inversion === 1) {
    // First inversion: 3rd is bass, then 5th, then root (ascending pitch)
    const octaves = [0, 0, 0];
    if (fifthPos <= thirdPos) octaves[1] = 1;
    if (rootPos <= thirdPos || (octaves[1] === 1 && rootPos <= fifthPos)) octaves[2] = 1;
    return { invertedNotes: [third, fifth, root], octaves };
  }

  if (inversion === 2) {
    // Second inversion: 5th is bass, then root, then 3rd (ascending pitch)
    const octaves = [0, 0, 0];
    if (rootPos <= fifthPos) octaves[1] = 1;
    if (thirdPos <= fifthPos || (octaves[1] === 1 && thirdPos <= rootPos)) octaves[2] = 1;
    return { invertedNotes: [fifth, root, third], octaves };
  }

  return { invertedNotes: triadNotes, octaves: [0, 0, 0] };
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
  const rootMajor = getChordFromNote(rootNote, 'major', 0);
  chords.push({
    ...rootMajor,
    name: rootNote
  });
  
  // 2. Root Minor (Root position) 
  const rootMinor = getChordFromNote(rootNote, 'minor', 0);
  chords.push({
    ...rootMinor,
    name: `${rootNote}m`
  });
  
  // 3. Perfect 4th Major with first inversion for better voice leading
  const p4Index = (rootIndex - 7 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const p4Note = CHROMATIC_NOTES[p4Index];
  const p4MajorChord = getChordFromNote(p4Note, 'major', 1); // Use first inversion
  chords.push({
    ...p4MajorChord,
    name: `${p4MajorChord.rootNote} (p5)`
  });
  
  // 4. Perfect 4th Minor with first inversion
  const p4MinorChord = getChordFromNote(p4Note, 'minor', 1);
  chords.push({
    ...p4MinorChord,
    name: `${p4MinorChord.rootNote}m (p5)`
  });
  
  // 5. Major 6th Major with second inversion for smooth voice leading
  const m6Index = (rootIndex - 4 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const m6Note = CHROMATIC_NOTES[m6Index];
  const m6MajorChord = getChordFromNote(m6Note, 'major', 2); // Use second inversion
  chords.push({
    ...m6MajorChord,
    name: `${m6MajorChord.rootNote} (M3)`
  });
  
  // 6. Minor 6th Minor with second inversion
  const m6MinorIndex = (rootIndex - 3 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
  const m6MinorNote = CHROMATIC_NOTES[m6MinorIndex];
  const m6MinorChord = getChordFromNote(m6MinorNote, 'minor', 2);
  chords.push({
    ...m6MinorChord,
    name: `${m6MinorChord.rootNote}m (m3)`
  });
  
  return chords;
}

// Define skill levels and their available chord types
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'diatonic';



// Main function to get exactly 6 chords by skill level with proper voice leading
export function getChordsForNoteBySkill(rootNote: string, skillLevel: SkillLevel = 'beginner'): Chord[] {
  const rootIndex = CHROMATIC_NOTES.indexOf(rootNote);
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }
  
  const chords: Chord[] = [];
  
  if (skillLevel === 'beginner') {
    // Beginner: 6 chords with majors and minors, using voice leading from original system
    
    // 1. Root Major (Root position)
    const rootMajor = getChordFromNote(rootNote, 'major', 0);
    chords.push({
      ...rootMajor,
      name: rootNote
    });
    
    // 2. Root Minor (Root position) 
    const rootMinor = getChordFromNote(rootNote, 'minor', 0);
    chords.push({
      ...rootMinor,
      name: `${rootNote}m`
    });
    
    // 3. Perfect 4th Major with first inversion for better voice leading
    const p4Index = (rootIndex - 7 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
    const p4Note = CHROMATIC_NOTES[p4Index];
    const p4MajorChord = getChordFromNote(p4Note, 'major', 1); // Use first inversion
    chords.push({
      ...p4MajorChord,
      name: `${p4MajorChord.rootNote} (p5)`
    });
    
    // 4. Perfect 4th Minor with first inversion
    const p4MinorChord = getChordFromNote(p4Note, 'minor', 1);
    chords.push({
      ...p4MinorChord,
      name: `${p4MinorChord.rootNote}m (p5)`
    });
    
    // 5. Major 6th Major with second inversion for smooth voice leading
    const m6Index = (rootIndex - 4 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
    const m6Note = CHROMATIC_NOTES[m6Index];
    const m6MajorChord = getChordFromNote(m6Note, 'major', 2); // Use second inversion
    chords.push({
      ...m6MajorChord,
      name: `${m6MajorChord.rootNote} (M3)`
    });
    
    // 6. Minor 6th Minor with second inversion
    const m6MinorIndex = (rootIndex - 3 + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length;
    const m6MinorNote = CHROMATIC_NOTES[m6MinorIndex];
    const m6MinorChord = getChordFromNote(m6MinorNote, 'minor', 2);
    chords.push({
      ...m6MinorChord,
      name: `${m6MinorChord.rootNote}m (m3)`
    });
    
  } else if (skillLevel === 'intermediate') {
    // Intermediate: Find ALL chords that contain this note in any position
    // This includes chords where the note is root, 3rd, 5th, 7th, etc.
    const allMemberships = getAllChordsContainingNote(rootNote);
    
    for (const membership of allMemberships) {
      chords.push({
        ...membership.chord,
        noteRole: membership.role,
        roleIndex: membership.roleIndex,
        category: membership.category
      });
    }
    
  } else { // advanced
    // Advanced: 6 chords using same structure as beginner but with complex harmonies
    
    // 1. Root major7 (instead of major)
    const rootMaj7 = getChordFromNote(rootNote, 'major7', 0);
    chords.push({
      ...rootMaj7,
      name: `${rootNote}maj7`
    });
    
    // 2. Root minor7 (instead of minor)
    const rootMin7 = getChordFromNote(rootNote, 'minor7', 0);
    chords.push({
      ...rootMin7,
      name: `${rootNote}m7`
    });
    
    // 3. Root diminished (instead of related major)
    const rootDim = getChordFromNote(rootNote, 'diminished', 0);
    chords.push({
      ...rootDim,
      name: `${rootNote}°`
    });
    
    // 4. Root augmented (instead of related minor)
    const rootAug = getChordFromNote(rootNote, 'augmented', 0);
    chords.push({
      ...rootAug,
      name: `${rootNote}+`
    });
    
    // 5. Perfect 4th minor7 with voice leading (instead of M3 major)
    const p4Index = (rootIndex + 5) % CHROMATIC_NOTES.length;
    const p4Note = CHROMATIC_NOTES[p4Index];
    const p4Min7 = getChordFromNote(p4Note, 'minor7', 1);
    chords.push({
      ...p4Min7,
      name: `${p4Note}m7 (IV)`
    });
    
    // 6. Perfect 5th major7 with voice leading (instead of m3 minor)
    const p5Index = (rootIndex + 7) % CHROMATIC_NOTES.length;
    const p5Note = CHROMATIC_NOTES[p5Index];
    const p5Maj7 = getChordFromNote(p5Note, 'major7', 1);
    chords.push({
      ...p5Maj7,
      name: `${p5Note}maj7 (V)`
    });
  }
  
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
