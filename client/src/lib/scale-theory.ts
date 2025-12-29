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

function sanitizeNote(note: string): string {
  if (note === 'E#') return 'F';
  if (note === 'Fb') return 'E';
  if (note === 'B#') return 'C';
  if (note === 'Cb') return 'B';
  if (note.includes('##') || note.includes('bb')) {
    const semitone = getSemitone(note);
    const options = SEMITONE_TO_NOTES[semitone];
    return options?.find(n => !FORBIDDEN_NOTES.includes(n)) || options?.[0] || note;
  }
  return note;
}

export function buildScale(key: string, scaleType: ScaleType): string[] {
  const definition = SCALE_DEFINITIONS[scaleType];
  if (!definition) return [];
  
  const keyLetter = key.charAt(0).toUpperCase();
  const keyLetterIndex = getLetterIndex(key);
  const keySemitone = getSemitone(key);
  
  const scaleNotes: string[] = [];
  
  for (let degree = 0; degree < 7; degree++) {
    const interval = definition.intervals[degree];
    const targetSemitone = (keySemitone + interval) % 12;
    const targetLetterIndex = (keyLetterIndex + degree) % 7;
    const targetLetter = LETTER_ORDER[targetLetterIndex];
    
    let note = getSpelledNote(targetSemitone, targetLetter);
    note = sanitizeNote(note);
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

function getRomanNumeral(degree: number, quality: string, is7th: boolean = false): string {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  let numeral = numerals[degree];
  
  if (quality === 'minor' || quality === 'minor7' || quality === 'minorMajor7' || quality === 'half-diminished') {
    numeral = numeral.toLowerCase();
  }
  if (quality === 'diminished' || quality === 'diminished7') {
    numeral = numeral.toLowerCase() + '°';
  }
  if (quality === 'half-diminished') {
    numeral = numeral + 'ø';
  }
  if (quality === 'augmented' || quality === 'augmented-major7') {
    numeral = numeral + '+';
  }
  
  if (is7th && !quality.includes('diminished')) {
    if (quality === 'major7') numeral += 'Δ7';
    else if (quality === 'minor7') numeral += '7';
    else if (quality === 'dominant7') numeral += '7';
    else if (quality === 'half-diminished') numeral += '7';
    else if (quality === 'minorMajor7') numeral += 'Δ7';
    else if (quality === 'augmented-major7') numeral += 'Δ7';
  }
  if (quality === 'diminished7') numeral += '7';
  
  return numeral;
}

function getChordFunction(degree: number, quality: string): 'tonic' | 'subdominant' | 'dominant' | 'other' {
  if (degree === 0 || degree === 2 || degree === 5) return 'tonic';
  if (degree === 3 || degree === 1) return 'subdominant';
  if (degree === 4 || degree === 6) return 'dominant';
  return 'other';
}

function buildChordNotes(root: string, intervals: number[], scaleNotes: string[]): string[] {
  const rootSemitone = getSemitone(root);
  const notes: string[] = [root];
  
  for (let i = 1; i < intervals.length; i++) {
    const targetSemitone = (rootSemitone + intervals[i]) % 12;
    
    let foundNote = scaleNotes.find(n => getSemitone(n) === targetSemitone);
    
    if (!foundNote) {
      const options = SEMITONE_TO_NOTES[targetSemitone];
      foundNote = options?.find(n => !FORBIDDEN_NOTES.includes(n)) || options?.[0] || '';
    }
    
    notes.push(sanitizeNote(foundNote));
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
    const notes = buildChordNotes(root, chordIntervals, scaleNotes);
    
    triads.push({
      name: `${root} ${CHORD_NAMES[type] || type}`,
      notes,
      type,
      rootNote: root,
      scaleDegree: degree + 1,
      romanNumeral: getRomanNumeral(degree, quality),
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
    const notes = buildChordNotes(root, chordIntervals, scaleNotes);
    
    sevenths.push({
      name: `${root} ${CHORD_NAMES[type] || type}`,
      notes,
      type,
      rootNote: root,
      scaleDegree: degree + 1,
      romanNumeral: getRomanNumeral(degree, quality, true),
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
          romanNumeral: `${getRomanNumeral(degree, 'major')}sus4`,
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
            romanNumeral: `${getRomanNumeral(degree, 'major')}7sus4`,
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
          romanNumeral: `${getRomanNumeral(degree, 'major')}sus2`,
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
  { value: 'major', label: 'Major (Ionian)', category: 'Major Modes' },
  { value: 'dorian', label: 'Dorian', category: 'Major Modes' },
  { value: 'phrygian', label: 'Phrygian', category: 'Major Modes' },
  { value: 'lydian', label: 'Lydian', category: 'Major Modes' },
  { value: 'mixolydian', label: 'Mixolydian', category: 'Major Modes' },
  { value: 'naturalMinor', label: 'Natural Minor (Aeolian)', category: 'Major Modes' },
  { value: 'locrian', label: 'Locrian', category: 'Major Modes' },
  { value: 'harmonicMinor', label: 'Harmonic Minor', category: 'Minor Scales' },
  { value: 'melodicMinor', label: 'Melodic Minor', category: 'Minor Scales' },
  { value: 'dorianB2', label: 'Dorian ♭2', category: 'Melodic Minor Modes' },
  { value: 'lydianAugmented', label: 'Lydian Augmented', category: 'Melodic Minor Modes' },
  { value: 'lydianDominant', label: 'Lydian Dominant', category: 'Melodic Minor Modes' },
  { value: 'mixolydianB6', label: 'Mixolydian ♭6', category: 'Melodic Minor Modes' },
  { value: 'locrianNat2', label: 'Locrian ♮2', category: 'Melodic Minor Modes' },
  { value: 'alteredScale', label: 'Altered Scale', category: 'Melodic Minor Modes' },
];
