import { CHORD_INTERVALS, CHORD_SYMBOLS, CHORD_NAMES } from './music-constants';
import type { Chord } from './chord-theory';

export type ScaleType = 
  | 'major' 
  | 'naturalMinor' 
  | 'harmonicMinor' 
  | 'melodicMinor'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian'
  | 'dorianB2'
  | 'lydianAugmented'
  | 'lydianDominant'
  | 'mixolydianB6'
  | 'locrianNat2'
  | 'alteredScale';

export interface ScaleDefinition {
  name: string;
  shortName: string;
  intervals: number[];
  parentScale?: ScaleType;
  mode?: number;
}

export interface DiatonicChord extends Chord {
  scaleDegree: number;
  romanNumeral: string;
  function: 'tonic' | 'subdominant' | 'dominant' | 'other';
}

export interface HarmonizedScale {
  key: string;
  scaleType: ScaleType;
  scaleName: string;
  notes: string[];
  triads: DiatonicChord[];
  seventhChords: DiatonicChord[];
  suspendedChords: DiatonicChord[];
}

const LETTER_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'E#': 5, 'Fb': 4, 'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'B#': 0, 'Cb': 11
};

const SEMITONE_TO_NOTES: Record<number, string[]> = {
  0: ['C', 'B#'], 1: ['C#', 'Db'], 2: ['D'], 3: ['D#', 'Eb'],
  4: ['E', 'Fb'], 5: ['F', 'E#'], 6: ['F#', 'Gb'], 7: ['G'],
  8: ['G#', 'Ab'], 9: ['A'], 10: ['A#', 'Bb'], 11: ['B', 'Cb']
};

function normalizeKeyForScale(key: string, scaleType: ScaleType): string {
  if (scaleType === 'major' || scaleType === 'lydian' || scaleType === 'mixolydian' || scaleType === 'phrygian' || scaleType === 'locrian') {
    if (key === 'C#') return 'Db';
    if (key === 'G#') return 'Ab';
    if (key === 'D#') return 'Eb';
    if (key === 'A#') return 'Bb';
    if (key === 'Cb') return 'B';
    if (key === 'Fb') return 'E';
    if (key === 'F#') return 'Gb';
  }
  if (scaleType === 'naturalMinor' || scaleType === 'harmonicMinor' || scaleType === 'melodicMinor' || scaleType === 'dorian') {
    if (key === 'A#') return 'Bb';
    if (key === 'D#') return 'Eb';
    if (key === 'G#') return 'Ab';
  }
  return key;
}

export function getNormalizedKey(key: string, scaleType: ScaleType): string {
  return normalizeKeyForScale(key, scaleType);
}

function isSharpKey(key: string): boolean {
  const sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
  return sharpKeys.includes(key);
}

function preferredAccidental(key: string, semitone: number, letterRequired: string): string {
  const options = SEMITONE_TO_NOTES[semitone];
  if (!options || options.length === 1) {
    return options?.[0] || letterRequired;
  }
  
  const withCorrectLetter = options.find(n => n.charAt(0) === letterRequired);
  if (withCorrectLetter && !['E#', 'Fb', 'B#', 'Cb'].includes(withCorrectLetter)) {
    return withCorrectLetter;
  }
  
  const useSharp = isSharpKey(key);
  const sharp = options.find(n => n.includes('#') && !['E#', 'B#'].includes(n));
  const flat = options.find(n => n.includes('b') && !['Fb', 'Cb'].includes(n));
  const natural = options.find(n => n.length === 1);
  
  if (natural) return natural;
  if (useSharp && sharp) return sharp;
  if (!useSharp && flat) return flat;
  return sharp || flat || options[0];
}

export const SCALE_DEFINITIONS: Record<ScaleType, ScaleDefinition> = {
  major: { name: 'Major (Ionian)', shortName: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  naturalMinor: { name: 'Natural Minor (Aeolian)', shortName: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
  harmonicMinor: { name: 'Harmonic Minor', shortName: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
  melodicMinor: { name: 'Melodic Minor', shortName: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11] },
  dorian: { name: 'Dorian', shortName: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10], parentScale: 'major', mode: 2 },
  phrygian: { name: 'Phrygian', shortName: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10], parentScale: 'major', mode: 3 },
  lydian: { name: 'Lydian', shortName: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11], parentScale: 'major', mode: 4 },
  mixolydian: { name: 'Mixolydian', shortName: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], parentScale: 'major', mode: 5 },
  locrian: { name: 'Locrian', shortName: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10], parentScale: 'major', mode: 7 },
  dorianB2: { name: 'Dorian ♭2', shortName: 'Dorian ♭2', intervals: [0, 1, 3, 5, 7, 9, 10], parentScale: 'melodicMinor', mode: 2 },
  lydianAugmented: { name: 'Lydian Augmented', shortName: 'Lydian Aug', intervals: [0, 2, 4, 6, 8, 9, 11], parentScale: 'melodicMinor', mode: 3 },
  lydianDominant: { name: 'Lydian Dominant', shortName: 'Lydian Dom', intervals: [0, 2, 4, 6, 7, 9, 10], parentScale: 'melodicMinor', mode: 4 },
  mixolydianB6: { name: 'Mixolydian ♭6', shortName: 'Mixo ♭6', intervals: [0, 2, 4, 5, 7, 8, 10], parentScale: 'melodicMinor', mode: 5 },
  locrianNat2: { name: 'Locrian ♮2', shortName: 'Locrian ♮2', intervals: [0, 2, 3, 5, 6, 8, 10], parentScale: 'melodicMinor', mode: 6 },
  alteredScale: { name: 'Altered Scale', shortName: 'Altered', intervals: [0, 1, 3, 4, 6, 8, 10], parentScale: 'melodicMinor', mode: 7 },
};

const FORBIDDEN_NOTES = ['E#', 'Fb', 'B#', 'Cb'];

function getLetterIndex(note: string): number {
  const letter = note.charAt(0).toUpperCase();
  return LETTER_ORDER.indexOf(letter);
}

function getSemitone(note: string): number {
  return NOTE_TO_SEMITONE[note] ?? 0;
}

function getSpelledNote(targetSemitone: number, targetLetter: string): string {
  const baseSemitone = NOTE_TO_SEMITONE[targetLetter];
  if (baseSemitone === undefined) return targetLetter;
  
  let diff = (targetSemitone - baseSemitone + 12) % 12;
  if (diff > 6) diff -= 12;
  
  if (diff === 0) return targetLetter;
  if (diff === 1) return targetLetter + '#';
  if (diff === -1 || diff === 11) return targetLetter + 'b';
  if (diff === 2) return targetLetter + '##';
  if (diff === -2 || diff === 10) return targetLetter + 'bb';
  
  return targetLetter;
}

function sanitizeNote(note: string, key: string): string {
  if (FORBIDDEN_NOTES.includes(note)) {
    const semitone = getSemitone(note);
    return preferredAccidental(key, semitone, note.charAt(0));
  }
  if (note.includes('##') || note.includes('bb')) {
    const semitone = getSemitone(note);
    return preferredAccidental(key, semitone, note.charAt(0));
  }
  return note;
}

export function buildScale(key: string, scaleType: ScaleType): string[] {
  const definition = SCALE_DEFINITIONS[scaleType];
  if (!definition) return [];
  
  const normalizedKey = normalizeKeyForScale(key, scaleType);
  const keyLetterIndex = getLetterIndex(normalizedKey);
  const keySemitone = getSemitone(normalizedKey);
  
  const scaleNotes: string[] = [];
  
  for (let degree = 0; degree < 7; degree++) {
    const interval = definition.intervals[degree];
    const targetSemitone = (keySemitone + interval) % 12;
    const targetLetterIndex = (keyLetterIndex + degree) % 7;
    const targetLetter = LETTER_ORDER[targetLetterIndex];
    
    let note = getSpelledNote(targetSemitone, targetLetter);
    note = sanitizeNote(note, normalizedKey);
    scaleNotes.push(note);
  }
  
  return scaleNotes;
}

function getTriadQuality(intervals: number[]): { type: string; quality: string } {
  const third = intervals[1] - intervals[0];
  const fifth = intervals[2] - intervals[0];
  
  if (third === 4 && fifth === 7) return { type: 'major', quality: 'major' };
  if (third === 3 && fifth === 7) return { type: 'minor', quality: 'minor' };
  if (third === 3 && fifth === 6) return { type: 'diminished', quality: 'diminished' };
  if (third === 4 && fifth === 8) return { type: 'augmented', quality: 'augmented' };
  
  return { type: 'major', quality: 'major' };
}

function getSeventhQuality(intervals: number[]): { type: string; quality: string } {
  const third = intervals[1] - intervals[0];
  const fifth = intervals[2] - intervals[0];
  const seventh = intervals[3] - intervals[0];
  
  if (third === 4 && fifth === 7 && seventh === 11) return { type: 'major7', quality: 'major7' };
  if (third === 3 && fifth === 7 && seventh === 10) return { type: 'minor7', quality: 'minor7' };
  if (third === 4 && fifth === 7 && seventh === 10) return { type: 'dominant7', quality: 'dominant7' };
  if (third === 3 && fifth === 6 && seventh === 10) return { type: 'minor7b5', quality: 'half-diminished' };
  if (third === 3 && fifth === 6 && seventh === 9) return { type: 'diminished7', quality: 'diminished7' };
  if (third === 3 && fifth === 7 && seventh === 11) return { type: 'minorMajor7', quality: 'minorMajor7' };
  if (third === 4 && fifth === 8 && seventh === 11) return { type: 'augMaj7', quality: 'augmented-major7' };
  
  return { type: 'major7', quality: 'major7' };
}

function getRomanNumeral(degree: number, quality: string, root: string, key: string): string {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  let baseNumeral = numerals[degree];

  // Calculate Nashville notation accidental by comparing to major scale
  // Build the major scale for the key to get the expected note at this degree
  const majorScale = buildScale(key, 'major');
  const expectedNote = majorScale[degree];
  const expectedSemitone = getSemitone(expectedNote);
  const actualSemitone = getSemitone(root);

  // Calculate the difference to determine accidental
  let accidental = '';
  const diff = (actualSemitone - expectedSemitone + 12) % 12;
  if (diff === 11) {
    accidental = 'b'; // One semitone lower
  } else if (diff === 1) {
    accidental = '#'; // One semitone higher
  } else if (diff === 10) {
    accidental = 'bb'; // Two semitones lower
  } else if (diff === 2) {
    accidental = '##'; // Two semitones higher
  }

  // Determine case based on chord quality
  // Nashville: Major and Augmented = uppercase, Minor and Diminished = lowercase
  let numeral = '';
  if (quality === 'major' || quality === 'augmented') {
    numeral = accidental + baseNumeral; // Uppercase
  } else if (quality === 'minor' || quality === 'diminished') {
    numeral = accidental + baseNumeral.toLowerCase(); // Lowercase
  } else {
    // Default based on quality
    numeral = accidental + baseNumeral;
  }

  // Add quality symbols
  if (quality === 'diminished') {
    numeral = numeral + '°';
  } else if (quality === 'augmented') {
    numeral = numeral + '+';
  } else if (quality === 'sus2') {
    numeral = numeral + 'sus2';
  } else if (quality === 'sus4') {
    numeral = numeral + 'sus4';
  } else if (quality === '7sus4') {
    numeral = numeral + '7sus4';
  } else if (quality === 'major7') {
    numeral = numeral + 'Δ7';
  } else if (quality === 'minor7') {
    numeral = numeral + '7';
  } else if (quality === 'dominant7') {
    numeral = numeral + '7';
  } else if (quality === 'half-diminished' || quality === 'minor7b5') {
    numeral = numeral + 'ø7';
  } else if (quality === 'diminished7') {
    numeral = numeral + '°7';
  } else if (quality === 'minorMajor7') {
    numeral = numeral + 'Δ7';
  } else if (quality === 'augmented-major7') {
    numeral = numeral + 'Δ7';
  }

  return numeral;
}

function getChordFunction(degree: number, quality: string): 'tonic' | 'subdominant' | 'dominant' | 'other' {
  if (degree === 0 || degree === 2 || degree === 5) return 'tonic';
  if (degree === 3 || degree === 1) return 'subdominant';
  if (degree === 4 || degree === 6) return 'dominant';
  return 'other';
}

function buildChordNotes(root: string, intervals: number[], scaleNotes: string[], key: string): string[] {
  const rootSemitone = getSemitone(root);
  const notes: string[] = [root];
  
  for (let i = 1; i < intervals.length; i++) {
    const targetSemitone = (rootSemitone + intervals[i]) % 12;
    
    let foundNote = scaleNotes.find(n => getSemitone(n) === targetSemitone);
    
    if (!foundNote) {
      // Use key-aware accidental preference (flat keys → flats, sharp keys → sharps)
      foundNote = preferredAccidental(key, targetSemitone, '');
    }

    notes.push(sanitizeNote(foundNote, key));
  }
  
  return notes;
}

export function harmonizeTriads(key: string, scaleType: ScaleType): DiatonicChord[] {
  const scaleNotes = buildScale(key, scaleType);
  const definition = SCALE_DEFINITIONS[scaleType];
  if (!definition || scaleNotes.length === 0) return [];
  
  const triads: DiatonicChord[] = [];
  
  for (let degree = 0; degree < 7; degree++) {
    const root = scaleNotes[degree];
    const thirdDegree = (degree + 2) % 7;
    const fifthDegree = (degree + 4) % 7;
    
    const rootSemitone = getSemitone(root);
    const thirdSemitone = getSemitone(scaleNotes[thirdDegree]);
    const fifthSemitone = getSemitone(scaleNotes[fifthDegree]);
    
    const intervals = [
      0,
      (thirdSemitone - rootSemitone + 12) % 12,
      (fifthSemitone - rootSemitone + 12) % 12
    ];
    
    const { type, quality } = getTriadQuality(intervals);
    const chordIntervals = CHORD_INTERVALS[type] || [0, 4, 7];
    const notes = buildChordNotes(root, chordIntervals, scaleNotes, key);
    
    triads.push({
      name: `${root} ${CHORD_NAMES[type] || type}`,
      notes,
      type,
      rootNote: root,
      scaleDegree: degree + 1,
      romanNumeral: getRomanNumeral(degree, quality, root, key),
      function: getChordFunction(degree, quality),
      category: 'triad'
    });
  }
  
  return triads;
}

export function harmonizeSevenths(key: string, scaleType: ScaleType): DiatonicChord[] {
  const scaleNotes = buildScale(key, scaleType);
  const definition = SCALE_DEFINITIONS[scaleType];
  if (!definition || scaleNotes.length === 0) return [];
  
  const sevenths: DiatonicChord[] = [];
  
  for (let degree = 0; degree < 7; degree++) {
    const root = scaleNotes[degree];
    const thirdDegree = (degree + 2) % 7;
    const fifthDegree = (degree + 4) % 7;
    const seventhDegree = (degree + 6) % 7;
    
    const rootSemitone = getSemitone(root);
    const thirdSemitone = getSemitone(scaleNotes[thirdDegree]);
    const fifthSemitone = getSemitone(scaleNotes[fifthDegree]);
    const seventhSemitone = getSemitone(scaleNotes[seventhDegree]);
    
    const intervals = [
      0,
      (thirdSemitone - rootSemitone + 12) % 12,
      (fifthSemitone - rootSemitone + 12) % 12,
      (seventhSemitone - rootSemitone + 12) % 12
    ];
    
    const { type, quality } = getSeventhQuality(intervals);
    const chordIntervals = CHORD_INTERVALS[type] || [0, 4, 7, 11];
    const notes = buildChordNotes(root, chordIntervals, scaleNotes, key);
    
    sevenths.push({
      name: `${root} ${CHORD_NAMES[type] || type}`,
      notes,
      type,
      rootNote: root,
      scaleDegree: degree + 1,
      romanNumeral: getRomanNumeral(degree, quality, root, key),
      function: getChordFunction(degree, quality),
      category: 'seventh'
    });
  }
  
  return sevenths;
}

export function findDiatonicSuspended(key: string, scaleType: ScaleType): DiatonicChord[] {
  const scaleNotes = buildScale(key, scaleType);
  const definition = SCALE_DEFINITIONS[scaleType];
  if (!definition || scaleNotes.length === 0) return [];
  
  const suspended: DiatonicChord[] = [];
  
  for (let degree = 0; degree < 7; degree++) {
    const root = scaleNotes[degree];
    const secondDegree = (degree + 1) % 7;
    const fourthDegree = (degree + 3) % 7;
    const fifthDegree = (degree + 4) % 7;
    const seventhDegree = (degree + 6) % 7;
    
    const rootSemitone = getSemitone(root);
    const secondSemitone = getSemitone(scaleNotes[secondDegree]);
    const fourthSemitone = getSemitone(scaleNotes[fourthDegree]);
    const fifthSemitone = getSemitone(scaleNotes[fifthDegree]);
    const seventhSemitone = getSemitone(scaleNotes[seventhDegree]);
    
    const secondInterval = (secondSemitone - rootSemitone + 12) % 12;
    const fourthInterval = (fourthSemitone - rootSemitone + 12) % 12;
    const fifthInterval = (fifthSemitone - rootSemitone + 12) % 12;
    const seventhInterval = (seventhSemitone - rootSemitone + 12) % 12;
    
    if (fifthInterval === 7) {
      if (fourthInterval === 5) {
        suspended.push({
          name: `${root}sus4`,
          notes: [root, scaleNotes[fourthDegree], scaleNotes[fifthDegree]],
          type: 'sus4',
          rootNote: root,
          scaleDegree: degree + 1,
          romanNumeral: getRomanNumeral(degree, 'sus4', root, key),
          function: getChordFunction(degree, 'major'),
          category: 'triad'
        });

        if (seventhInterval === 10) {
          suspended.push({
            name: `${root}7sus4`,
            notes: [root, scaleNotes[fourthDegree], scaleNotes[fifthDegree], scaleNotes[seventhDegree]],
            type: '7sus4',
            rootNote: root,
            scaleDegree: degree + 1,
            romanNumeral: getRomanNumeral(degree, '7sus4', root, key),
            function: getChordFunction(degree, 'major'),
            category: 'seventh'
          });
        }
      }

      if (secondInterval === 2) {
        suspended.push({
          name: `${root}sus2`,
          notes: [root, scaleNotes[secondDegree], scaleNotes[fifthDegree]],
          type: 'sus2',
          rootNote: root,
          scaleDegree: degree + 1,
          romanNumeral: getRomanNumeral(degree, 'sus2', root, key),
          function: getChordFunction(degree, 'major'),
          category: 'triad'
        });
      }
    }
  }
  
  return suspended;
}

export function harmonizeScale(key: string, scaleType: ScaleType): HarmonizedScale {
  const scaleNotes = buildScale(key, scaleType);
  const definition = SCALE_DEFINITIONS[scaleType];
  
  return {
    key,
    scaleType,
    scaleName: definition?.name || scaleType,
    notes: scaleNotes,
    triads: harmonizeTriads(key, scaleType),
    seventhChords: harmonizeSevenths(key, scaleType),
    suspendedChords: findDiatonicSuspended(key, scaleType)
  };
}

export function formatJazzSymbol(root: string, chordType: string): string {
  const symbol = CHORD_SYMBOLS[chordType] ?? '';
  return `${root}${symbol}`;
}

export const AVAILABLE_KEYS = [
  { value: 'C', label: 'C' },
  { value: 'C#', label: 'C♯ / D♭' },
  { value: 'D', label: 'D' },
  { value: 'Eb', label: 'E♭ / D♯' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'F#', label: 'F♯ / G♭' },
  { value: 'G', label: 'G' },
  { value: 'Ab', label: 'A♭ / G♯' },
  { value: 'A', label: 'A' },
  { value: 'Bb', label: 'B♭ / A♯' },
  { value: 'B', label: 'B' },
];

export const AVAILABLE_SCALES: { value: ScaleType; label: string; category: string }[] = [
  { value: 'major', label: 'Major', category: 'Parent Scales' },
  { value: 'naturalMinor', label: 'Natural Minor', category: 'Parent Scales' },
  { value: 'harmonicMinor', label: 'Harmonic Minor', category: 'Parent Scales' },
  { value: 'melodicMinor', label: 'Melodic Minor', category: 'Parent Scales' },
];

/**
 * Mode names for each parent scale
 */
export const MODE_NAMES: Record<ScaleType, string[]> = {
  major: ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'],
  naturalMinor: ['Aeolian', 'Locrian', 'Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian'],
  harmonicMinor: ['Harmonic Minor', 'Locrian ♮6', 'Ionian ♯5', 'Dorian ♯4', 'Phrygian Dominant', 'Lydian ♯2', 'Altered Dominant bb7'],
  melodicMinor: ['Melodic Minor', 'Dorian ♭2', 'Lydian Augmented', 'Lydian Dominant', 'Mixolydian ♭6', 'Locrian ♮2', 'Altered'],
  // For completeness, add the other scale types (though they won't be selectable as parent scales)
  dorian: ['Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian', 'Ionian'],
  phrygian: ['Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian', 'Ionian', 'Dorian'],
  lydian: ['Lydian', 'Mixolydian', 'Aeolian', 'Locrian', 'Ionian', 'Dorian', 'Phrygian'],
  mixolydian: ['Mixolydian', 'Aeolian', 'Locrian', 'Ionian', 'Dorian', 'Phrygian', 'Lydian'],
  locrian: ['Locrian', 'Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian'],
  dorianB2: ['Dorian ♭2', 'Lydian Augmented', 'Lydian Dominant', 'Mixolydian ♭6', 'Locrian ♮2', 'Altered', 'Melodic Minor'],
  lydianAugmented: ['Lydian Augmented', 'Lydian Dominant', 'Mixolydian ♭6', 'Locrian ♮2', 'Altered', 'Melodic Minor', 'Dorian ♭2'],
  lydianDominant: ['Lydian Dominant', 'Mixolydian ♭6', 'Locrian ♮2', 'Altered', 'Melodic Minor', 'Dorian ♭2', 'Lydian Augmented'],
  mixolydianB6: ['Mixolydian ♭6', 'Locrian ♮2', 'Altered', 'Melodic Minor', 'Dorian ♭2', 'Lydian Augmented', 'Lydian Dominant'],
  locrianNat2: ['Locrian ♮2', 'Altered', 'Melodic Minor', 'Dorian ♭2', 'Lydian Augmented', 'Lydian Dominant', 'Mixolydian ♭6'],
  alteredScale: ['Altered', 'Melodic Minor', 'Dorian ♭2', 'Lydian Augmented', 'Lydian Dominant', 'Mixolydian ♭6', 'Locrian ♮2'],
};

/**
 * Get all diatonic chord types that contain the target note in a given key and scale
 * Returns array of chord type strings (e.g., ['major', 'minor', 'dominant7'])
 */
export function getDiatonicChordTypesForNote(targetNote: string, key: string, scaleType: ScaleType): string[] {
  const harmonized = harmonizeScale(key, scaleType);
  const allDiatonicChords = [
    ...harmonized.triads,
    ...harmonized.seventhChords,
    ...harmonized.suspendedChords
  ];

  // Normalize the target note for comparison
  const normalizeNote = (note: string): number => {
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    return noteMap[note] ?? 0;
  };

  const targetPitchClass = normalizeNote(targetNote);
  const chordTypes = new Set<string>();

  for (const diatonicChord of allDiatonicChords) {
    // Check if any note in the chord matches the target note (pitch class)
    const containsNote = diatonicChord.notes.some(note =>
      normalizeNote(note) === targetPitchClass
    );

    if (containsNote) {
      chordTypes.add(diatonicChord.type);
    }
  }

  return Array.from(chordTypes);
}

/**
 * Get all diatonic chords (with full info) that contain the target note
 * Returns separate arrays for triads and seventh chords
 */
export interface DiatonicChordsForNote {
  triads: DiatonicChord[];
  seventhChords: DiatonicChord[];
  targetNote: string;
}

export function getDiatonicChordsContainingNote(
  targetNote: string,
  key: string,
  scaleType: ScaleType,
  mode: number = 1
): DiatonicChordsForNote {
  const harmonized = harmonizeScaleWithMode(key, scaleType, mode);

  const normalizeNote = (note: string): number => {
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'Fb': 4, 'E#': 5, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11, 'B#': 0
    };
    return noteMap[note] ?? 0;
  };

  const targetPitchClass = normalizeNote(targetNote);

  const triads = harmonized.triads.filter(chord =>
    chord.notes.some(note => normalizeNote(note) === targetPitchClass)
  );

  const seventhChords = harmonized.seventhChords.filter(chord =>
    chord.notes.some(note => normalizeNote(note) === targetPitchClass)
  );

  return { triads, seventhChords, targetNote };
}

/**
 * Harmonize a scale with a specific mode rotation
 * @param key The root key
 * @param scaleType The base scale type
 * @param mode The mode (1-7), where 1 is the base scale
 */
export function harmonizeScaleWithMode(key: string, scaleType: ScaleType, mode: number = 1): HarmonizedScale {
  if (mode < 1 || mode > 7) mode = 1;

  // Get the base scale notes
  const baseScale = buildScale(key, scaleType);

  // Rotate the scale based on mode (mode 1 = no rotation, mode 2 = start from 2nd note, etc.)
  const modeIndex = mode - 1;
  const rotatedNotes = [...baseScale.slice(modeIndex), ...baseScale.slice(0, modeIndex)];

  // The new key is the first note of the rotated scale
  const newKey = rotatedNotes[0];

  // Build a new scale from this key with the rotated intervals
  const definition = SCALE_DEFINITIONS[scaleType];
  const baseIntervals = definition?.intervals || [0, 2, 4, 5, 7, 9, 11];

  // Rotate intervals
  const rotatedIntervals = baseIntervals.map(interval => (interval - baseIntervals[modeIndex] + 12) % 12);
  const sortedIntervals = [...rotatedIntervals].sort((a, b) => a - b);

  // Get the mode name from MODE_NAMES
  const modeName = MODE_NAMES[scaleType]?.[modeIndex] || `Mode ${mode}`;

  // Harmonize using the rotated notes
  return {
    key: newKey,
    scaleType,
    scaleName: modeName,
    notes: rotatedNotes,
    triads: harmonizeTriadsFromNotes(rotatedNotes, newKey),
    seventhChords: harmonizeSeventhsFromNotes(rotatedNotes, newKey),
    suspendedChords: findSuspendedFromNotes(rotatedNotes, newKey)
  };
}

// Helper to harmonize triads from given notes
function harmonizeTriadsFromNotes(scaleNotes: string[], key: string): DiatonicChord[] {
  const triads: DiatonicChord[] = [];

  for (let degree = 0; degree < 7; degree++) {
    const root = scaleNotes[degree];
    const thirdDegree = (degree + 2) % 7;
    const fifthDegree = (degree + 4) % 7;

    const rootSemitone = getSemitone(root);
    const thirdSemitone = getSemitone(scaleNotes[thirdDegree]);
    const fifthSemitone = getSemitone(scaleNotes[fifthDegree]);

    const intervals = [
      0,
      (thirdSemitone - rootSemitone + 12) % 12,
      (fifthSemitone - rootSemitone + 12) % 12
    ];

    const { type, quality } = getTriadQuality(intervals);
    const chordIntervals = CHORD_INTERVALS[type] || [0, 4, 7];
    const notes = buildChordNotes(root, chordIntervals, scaleNotes, key);

    triads.push({
      name: `${root} ${CHORD_NAMES[type] || type}`,
      notes,
      type,
      rootNote: root,
      scaleDegree: degree + 1,
      romanNumeral: getRomanNumeral(degree, quality, root, key),
      function: getChordFunction(degree, quality),
      category: 'triad'
    });
  }

  return triads;
}

// Helper to harmonize sevenths from given notes
function harmonizeSeventhsFromNotes(scaleNotes: string[], key: string): DiatonicChord[] {
  const sevenths: DiatonicChord[] = [];

  for (let degree = 0; degree < 7; degree++) {
    const root = scaleNotes[degree];
    const thirdDegree = (degree + 2) % 7;
    const fifthDegree = (degree + 4) % 7;
    const seventhDegree = (degree + 6) % 7;

    const rootSemitone = getSemitone(root);
    const thirdSemitone = getSemitone(scaleNotes[thirdDegree]);
    const fifthSemitone = getSemitone(scaleNotes[fifthDegree]);
    const seventhSemitone = getSemitone(scaleNotes[seventhDegree]);

    const intervals = [
      0,
      (thirdSemitone - rootSemitone + 12) % 12,
      (fifthSemitone - rootSemitone + 12) % 12,
      (seventhSemitone - rootSemitone + 12) % 12
    ];

    const { type, quality } = getSeventhQuality(intervals);
    const chordIntervals = CHORD_INTERVALS[type] || [0, 4, 7, 11];
    const notes = buildChordNotes(root, chordIntervals, scaleNotes, key);

    sevenths.push({
      name: `${root} ${CHORD_NAMES[type] || type}`,
      notes,
      type,
      rootNote: root,
      scaleDegree: degree + 1,
      romanNumeral: getRomanNumeral(degree, quality, root, key),
      function: getChordFunction(degree, quality),
      category: 'seventh'
    });
  }

  return sevenths;
}

// ============================================================
// EXTENDED / CHROMATIC HARMONY
// ============================================================

export interface ChromaticChord extends Chord {
  /** Human-readable label shown on the chip, e.g. "V/V", "bVII", "°7/ii" */
  label: string;
  /** 0-indexed diatonic degree this chord is tonicising / approaching */
  targetDegree: number;
  /** Roman numeral string of the target diatonic chord */
  targetRomanNumeral: string;
  /** Which category of extended harmony this belongs to */
  harmonyType: 'secondary-dominant' | 'borrowed' | 'secondary-diminished' | 'tritone-sub';
}

export interface ExtendedHarmony {
  secondaryDominants: ChromaticChord[];
  borrowedChords: ChromaticChord[];
  secondaryDiminished: ChromaticChord[];
  tritoneSubstitutions: ChromaticChord[];
}

/** Build a chord from a root semitone + interval array, using key-aware accidentals */
function buildChromaticChord(
  rootSemitone: number,
  intervals: number[],
  key: string
): { rootNote: string; notes: string[] } {
  const rootNote = preferredAccidental(key, rootSemitone, '');
  const notes: string[] = [rootNote];
  for (let i = 1; i < intervals.length; i++) {
    const targetSemitone = (rootSemitone + intervals[i]) % 12;
    notes.push(preferredAccidental(key, targetSemitone, ''));
  }
  return { rootNote, notes };
}

/**
 * Compute all extended harmony for a key/scale/mode combination:
 * secondary dominants, borrowed chords, secondary diminished, tritone substitutions.
 */
export function getExtendedHarmony(
  key: string,
  scaleType: ScaleType,
  mode: number = 1
): ExtendedHarmony {
  const harmonized = harmonizeScaleWithMode(key, scaleType, mode);
  const triads = harmonized.triads;
  const modeKey = harmonized.key;

  const secondaryDominants: ChromaticChord[] = [];
  const secondaryDiminished: ChromaticChord[] = [];
  const tritoneSubstitutions: ChromaticChord[] = [];
  const borrowedChords: ChromaticChord[] = [];

  const tonicSemitone = getSemitone(modeKey);

  // ====== SECONDARY DOMINANTS ======
  // V7 of each diatonic chord (except I and diminished chords)
  for (let i = 1; i < triads.length; i++) {
    const target = triads[i];
    if (target.type === 'diminished') continue;

    const targetSemitone = getSemitone(target.rootNote);
    const secDomSemitone = (targetSemitone + 7) % 12; // P5 above = dominant root

    const dom7Intervals = CHORD_INTERVALS['dominant7'];
    const { rootNote, notes } = buildChromaticChord(secDomSemitone, dom7Intervals, modeKey);
    const symbol = CHORD_SYMBOLS['dominant7'] ?? '7';
    const targetRoman = target.romanNumeral || '';
    const label = `V/${targetRoman}`;

    secondaryDominants.push({
      name: `${rootNote}${symbol}`,
      notes,
      type: 'dominant7',
      rootNote,
      category: 'seventh',
      label,
      targetDegree: i,
      targetRomanNumeral: targetRoman,
      harmonyType: 'secondary-dominant',
    });
  }

  // ====== SECONDARY DIMINISHED ======
  // dim7 a half-step below each diatonic chord (except I)
  for (let i = 1; i < triads.length; i++) {
    const target = triads[i];
    const targetSemitone = getSemitone(target.rootNote);
    const dimSemitone = (targetSemitone + 11) % 12; // half-step below

    const dim7Intervals = CHORD_INTERVALS['diminished7'];
    const { rootNote, notes } = buildChromaticChord(dimSemitone, dim7Intervals, modeKey);
    const symbol = CHORD_SYMBOLS['diminished7'] ?? '°7';
    const targetRoman = target.romanNumeral || '';
    const label = `°7/${targetRoman}`;

    secondaryDiminished.push({
      name: `${rootNote}${symbol}`,
      notes,
      type: 'diminished7',
      rootNote,
      category: 'seventh',
      label,
      targetDegree: i,
      targetRomanNumeral: targetRoman,
      harmonyType: 'secondary-diminished',
    });
  }

  // ====== TRITONE SUBSTITUTIONS ======
  // A dom7 a tritone away from each secondary dominant
  for (const secDom of secondaryDominants) {
    const rootSemitone = getSemitone(secDom.rootNote);
    const tritoneRootSemitone = (rootSemitone + 6) % 12;

    const dom7Intervals = CHORD_INTERVALS['dominant7'];
    const { rootNote, notes } = buildChromaticChord(tritoneRootSemitone, dom7Intervals, modeKey);
    const symbol = CHORD_SYMBOLS['dominant7'] ?? '7';
    const label = `Sub(${secDom.label})`;

    tritoneSubstitutions.push({
      name: `${rootNote}${symbol}`,
      notes,
      type: 'dominant7',
      rootNote,
      category: 'seventh',
      label,
      targetDegree: secDom.targetDegree,
      targetRomanNumeral: secDom.targetRomanNumeral,
      harmonyType: 'tritone-sub',
    });
  }

  // ====== BORROWED CHORDS ======
  const isMajorFlavored = ['major', 'lydian', 'mixolydian'].includes(scaleType);

  if (isMajorFlavored) {
    // Borrow from parallel natural minor: bVII, bVI, bIII, iv
    const toBorrow = [
      { label: 'bVII', rootOffset: 10, type: 'major',  deg: 6 },
      { label: 'bVI',  rootOffset:  8, type: 'major',  deg: 5 },
      { label: 'bIII', rootOffset:  3, type: 'major',  deg: 2 },
      { label: 'iv',   rootOffset:  5, type: 'minor',  deg: 3 },
    ];
    for (const b of toBorrow) {
      const rootSemitone = (tonicSemitone + b.rootOffset) % 12;
      const intervals = CHORD_INTERVALS[b.type];
      const { rootNote, notes } = buildChromaticChord(rootSemitone, intervals, modeKey);
      const symbol = CHORD_SYMBOLS[b.type] ?? '';
      borrowedChords.push({
        name: `${rootNote}${symbol}`,
        notes,
        type: b.type,
        rootNote,
        category: 'triad',
        label: b.label,
        targetDegree: b.deg,
        targetRomanNumeral: b.label,
        harmonyType: 'borrowed',
      });
    }
  } else {
    // Minor-flavored: borrow from parallel major: IV, VI, VII
    const toBorrow = [
      { label: 'IV',  rootOffset: 5,  type: 'major', deg: 3 },
      { label: 'VI',  rootOffset: 9,  type: 'major', deg: 5 },
      { label: 'VII', rootOffset: 11, type: 'major', deg: 6 },
    ];
    for (const b of toBorrow) {
      const rootSemitone = (tonicSemitone + b.rootOffset) % 12;
      const intervals = CHORD_INTERVALS[b.type];
      const { rootNote, notes } = buildChromaticChord(rootSemitone, intervals, modeKey);
      const symbol = CHORD_SYMBOLS[b.type] ?? '';
      borrowedChords.push({
        name: `${rootNote}${symbol}`,
        notes,
        type: b.type,
        rootNote,
        category: 'triad',
        label: b.label,
        targetDegree: b.deg,
        targetRomanNumeral: b.label,
        harmonyType: 'borrowed',
      });
    }
  }

  return { secondaryDominants, borrowedChords, secondaryDiminished, tritoneSubstitutions };
}

/**
 * Filter extended harmony chords to only those containing the target note.
 * Used by chord-skill-selector in diatonic mode.
 */
export function getExtendedHarmonyForNote(
  targetNote: string,
  key: string,
  scaleType: ScaleType,
  mode: number = 1
): ExtendedHarmony {
  const extended = getExtendedHarmony(key, scaleType, mode);

  const noteToSemitone = (note: string): number => {
    const map: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'Fb': 4, 'E#': 5, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11, 'B#': 0
    };
    return map[note] ?? 0;
  };

  const targetSemitone = noteToSemitone(targetNote);
  const filterByNote = (chords: ChromaticChord[]): ChromaticChord[] =>
    chords.filter(c => c.notes.some(n => noteToSemitone(n) === targetSemitone));

  return {
    secondaryDominants: filterByNote(extended.secondaryDominants),
    borrowedChords: filterByNote(extended.borrowedChords),
    secondaryDiminished: filterByNote(extended.secondaryDiminished),
    tritoneSubstitutions: filterByNote(extended.tritoneSubstitutions),
  };
}

// Helper to find suspended chords from given notes
function findSuspendedFromNotes(scaleNotes: string[], key: string): DiatonicChord[] {
  const suspended: DiatonicChord[] = [];

  for (let degree = 0; degree < 7; degree++) {
    const root = scaleNotes[degree];
    const secondDegree = (degree + 1) % 7;
    const fourthDegree = (degree + 3) % 7;
    const fifthDegree = (degree + 4) % 7;
    const seventhDegree = (degree + 6) % 7;

    const rootSemitone = getSemitone(root);
    const secondSemitone = getSemitone(scaleNotes[secondDegree]);
    const fourthSemitone = getSemitone(scaleNotes[fourthDegree]);
    const fifthSemitone = getSemitone(scaleNotes[fifthDegree]);
    const seventhSemitone = getSemitone(scaleNotes[seventhDegree]);

    const secondInterval = (secondSemitone - rootSemitone + 12) % 12;
    const fourthInterval = (fourthSemitone - rootSemitone + 12) % 12;
    const fifthInterval = (fifthSemitone - rootSemitone + 12) % 12;
    const seventhInterval = (seventhSemitone - rootSemitone + 12) % 12;

    if (fifthInterval === 7) {
      if (fourthInterval === 5) {
        suspended.push({
          name: `${root}sus4`,
          notes: [root, scaleNotes[fourthDegree], scaleNotes[fifthDegree]],
          type: 'sus4',
          rootNote: root,
          scaleDegree: degree + 1,
          romanNumeral: getRomanNumeral(degree, 'sus4', root, key),
          function: getChordFunction(degree, 'major'),
          category: 'triad'
        });

        if (seventhInterval === 10) {
          suspended.push({
            name: `${root}7sus4`,
            notes: [root, scaleNotes[fourthDegree], scaleNotes[fifthDegree], scaleNotes[seventhDegree]],
            type: '7sus4',
            rootNote: root,
            scaleDegree: degree + 1,
            romanNumeral: getRomanNumeral(degree, '7sus4', root, key),
            function: getChordFunction(degree, 'major'),
            category: 'seventh'
          });
        }
      }

      if (secondInterval === 2) {
        suspended.push({
          name: `${root}sus2`,
          notes: [root, scaleNotes[secondDegree], scaleNotes[fifthDegree]],
          type: 'sus2',
          rootNote: root,
          scaleDegree: degree + 1,
          romanNumeral: getRomanNumeral(degree, 'sus2', root, key),
          function: getChordFunction(degree, 'major'),
          category: 'triad'
        });
      }
    }
  }

  return suspended;
}
