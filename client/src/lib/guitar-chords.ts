export type ChordShapeType = 'open' | 'barre' | 'alternative';

export interface GuitarChordShape {
  name: string;
  type: ChordShapeType;
  frets: (number | null)[];
  fingers: (number | null)[];
  barres?: { fret: number; fromString: number; toString: number }[];
  baseFret: number;
  notes?: string[];
}

export interface GuitarChordData {
  root: string;
  quality: string;
  shapes: GuitarChordShape[];
}

const createShape = (
  name: string,
  type: ChordShapeType,
  frets: (number | null)[],
  fingers: (number | null)[],
  baseFret: number = 1,
  barres?: { fret: number; fromString: number; toString: number }[]
): GuitarChordShape => ({
  name,
  type,
  frets,
  fingers,
  baseFret,
  barres
});

export const GUITAR_CHORD_LIBRARY: Record<string, GuitarChordData> = {
  'C_major': {
    root: 'C',
    quality: 'major',
    shapes: [
      createShape('C Open', 'open', [null, 3, 2, 0, 1, 0], [null, 3, 2, null, 1, null]),
      createShape('C Barre (A shape)', 'barre', [null, 3, 5, 5, 5, 3], [null, 1, 2, 3, 4, 1], 1, [{ fret: 3, fromString: 1, toString: 5 }]),
      createShape('C Barre (E shape)', 'alternative', [8, 10, 10, 9, 8, 8], [1, 3, 4, 2, 1, 1], 1, [{ fret: 8, fromString: 0, toString: 5 }])
    ]
  },
  'C#_major': {
    root: 'C#',
    quality: 'major',
    shapes: [
      createShape('C# Barre (A shape)', 'open', [null, 4, 6, 6, 6, 4], [null, 1, 2, 3, 4, 1], 1, [{ fret: 4, fromString: 1, toString: 5 }]),
      createShape('C# Barre (E shape)', 'barre', [9, 11, 11, 10, 9, 9], [1, 3, 4, 2, 1, 1], 1, [{ fret: 9, fromString: 0, toString: 5 }]),
      createShape('C# Power', 'alternative', [null, null, 6, 6, 4, null], [null, null, 3, 4, 1, null], 4)
    ]
  },
  'Db_major': {
    root: 'Db',
    quality: 'major',
    shapes: [
      createShape('Db Barre (A shape)', 'open', [null, 4, 6, 6, 6, 4], [null, 1, 2, 3, 4, 1], 1, [{ fret: 4, fromString: 1, toString: 5 }]),
      createShape('Db Barre (E shape)', 'barre', [9, 11, 11, 10, 9, 9], [1, 3, 4, 2, 1, 1], 1, [{ fret: 9, fromString: 0, toString: 5 }]),
      createShape('Db Power', 'alternative', [null, null, 6, 6, 4, null], [null, null, 3, 4, 1, null], 4)
    ]
  },
  'D_major': {
    root: 'D',
    quality: 'major',
    shapes: [
      createShape('D Open', 'open', [null, null, 0, 2, 3, 2], [null, null, null, 1, 3, 2]),
      createShape('D Barre (A shape)', 'barre', [null, 5, 7, 7, 7, 5], [null, 1, 2, 3, 4, 1], 1, [{ fret: 5, fromString: 1, toString: 5 }]),
      createShape('D Barre (E shape)', 'alternative', [10, 12, 12, 11, 10, 10], [1, 3, 4, 2, 1, 1], 1, [{ fret: 10, fromString: 0, toString: 5 }])
    ]
  },
  'D#_major': {
    root: 'D#',
    quality: 'major',
    shapes: [
      createShape('D# Barre (A shape)', 'open', [null, 6, 8, 8, 8, 6], [null, 1, 2, 3, 4, 1], 1, [{ fret: 6, fromString: 1, toString: 5 }]),
      createShape('D# Barre (E shape)', 'barre', [11, 13, 13, 12, 11, 11], [1, 3, 4, 2, 1, 1], 1, [{ fret: 11, fromString: 0, toString: 5 }]),
      createShape('D# Power', 'alternative', [null, null, 8, 8, 6, null], [null, null, 3, 4, 1, null], 6)
    ]
  },
  'Eb_major': {
    root: 'Eb',
    quality: 'major',
    shapes: [
      createShape('Eb Barre (A shape)', 'open', [null, 6, 8, 8, 8, 6], [null, 1, 2, 3, 4, 1], 1, [{ fret: 6, fromString: 1, toString: 5 }]),
      createShape('Eb Barre (E shape)', 'barre', [11, 13, 13, 12, 11, 11], [1, 3, 4, 2, 1, 1], 1, [{ fret: 11, fromString: 0, toString: 5 }]),
      createShape('Eb Power', 'alternative', [null, null, 8, 8, 6, null], [null, null, 3, 4, 1, null], 6)
    ]
  },
  'E_major': {
    root: 'E',
    quality: 'major',
    shapes: [
      createShape('E Open', 'open', [0, 2, 2, 1, 0, 0], [null, 2, 3, 1, null, null]),
      createShape('E Barre (A shape)', 'barre', [null, 7, 9, 9, 9, 7], [null, 1, 2, 3, 4, 1], 1, [{ fret: 7, fromString: 1, toString: 5 }]),
      createShape('E Power', 'alternative', [0, 2, 2, null, null, null], [null, 2, 3, null, null, null])
    ]
  },
  'F_major': {
    root: 'F',
    quality: 'major',
    shapes: [
      createShape('F Barre (E shape)', 'open', [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], 1, [{ fret: 1, fromString: 0, toString: 5 }]),
      createShape('F Barre (A shape)', 'barre', [null, 8, 10, 10, 10, 8], [null, 1, 2, 3, 4, 1], 1, [{ fret: 8, fromString: 1, toString: 5 }]),
      createShape('F Mini Barre', 'alternative', [null, null, 3, 2, 1, 1], [null, null, 3, 2, 1, 1], 1)
    ]
  },
  'F#_major': {
    root: 'F#',
    quality: 'major',
    shapes: [
      createShape('F# Barre (E shape)', 'open', [2, 4, 4, 3, 2, 2], [1, 3, 4, 2, 1, 1], 1, [{ fret: 2, fromString: 0, toString: 5 }]),
      createShape('F# Barre (A shape)', 'barre', [null, 9, 11, 11, 11, 9], [null, 1, 2, 3, 4, 1], 1, [{ fret: 9, fromString: 1, toString: 5 }]),
      createShape('F# Power', 'alternative', [2, 4, 4, null, null, null], [1, 3, 4, null, null, null], 1)
    ]
  },
  'Gb_major': {
    root: 'Gb',
    quality: 'major',
    shapes: [
      createShape('Gb Barre (E shape)', 'open', [2, 4, 4, 3, 2, 2], [1, 3, 4, 2, 1, 1], 1, [{ fret: 2, fromString: 0, toString: 5 }]),
      createShape('Gb Barre (A shape)', 'barre', [null, 9, 11, 11, 11, 9], [null, 1, 2, 3, 4, 1], 1, [{ fret: 9, fromString: 1, toString: 5 }]),
      createShape('Gb Power', 'alternative', [2, 4, 4, null, null, null], [1, 3, 4, null, null, null], 1)
    ]
  },
  'G_major': {
    root: 'G',
    quality: 'major',
    shapes: [
      createShape('G Open', 'open', [3, 2, 0, 0, 0, 3], [2, 1, null, null, null, 3]),
      createShape('G Barre (E shape)', 'barre', [3, 5, 5, 4, 3, 3], [1, 3, 4, 2, 1, 1], 1, [{ fret: 3, fromString: 0, toString: 5 }]),
      createShape('G Barre (A shape)', 'alternative', [null, 10, 12, 12, 12, 10], [null, 1, 2, 3, 4, 1], 1, [{ fret: 10, fromString: 1, toString: 5 }])
    ]
  },
  'G#_major': {
    root: 'G#',
    quality: 'major',
    shapes: [
      createShape('G# Barre (E shape)', 'open', [4, 6, 6, 5, 4, 4], [1, 3, 4, 2, 1, 1], 1, [{ fret: 4, fromString: 0, toString: 5 }]),
      createShape('G# Barre (A shape)', 'barre', [null, 11, 13, 13, 13, 11], [null, 1, 2, 3, 4, 1], 1, [{ fret: 11, fromString: 1, toString: 5 }]),
      createShape('G# Power', 'alternative', [4, 6, 6, null, null, null], [1, 3, 4, null, null, null], 1)
    ]
  },
  'Ab_major': {
    root: 'Ab',
    quality: 'major',
    shapes: [
      createShape('Ab Barre (E shape)', 'open', [4, 6, 6, 5, 4, 4], [1, 3, 4, 2, 1, 1], 1, [{ fret: 4, fromString: 0, toString: 5 }]),
      createShape('Ab Barre (A shape)', 'barre', [null, 11, 13, 13, 13, 11], [null, 1, 2, 3, 4, 1], 1, [{ fret: 11, fromString: 1, toString: 5 }]),
      createShape('Ab Power', 'alternative', [4, 6, 6, null, null, null], [1, 3, 4, null, null, null], 1)
    ]
  },
  'A_major': {
    root: 'A',
    quality: 'major',
    shapes: [
      createShape('A Open', 'open', [null, 0, 2, 2, 2, 0], [null, null, 1, 2, 3, null]),
      createShape('A Barre (E shape)', 'barre', [5, 7, 7, 6, 5, 5], [1, 3, 4, 2, 1, 1], 1, [{ fret: 5, fromString: 0, toString: 5 }]),
      createShape('A Power', 'alternative', [null, 0, 2, 2, null, null], [null, null, 2, 3, null, null])
    ]
  },
  'A#_major': {
    root: 'A#',
    quality: 'major',
    shapes: [
      createShape('A# Barre (A shape)', 'open', [null, 1, 3, 3, 3, 1], [null, 1, 2, 3, 4, 1], 1, [{ fret: 1, fromString: 1, toString: 5 }]),
      createShape('A# Barre (E shape)', 'barre', [6, 8, 8, 7, 6, 6], [1, 3, 4, 2, 1, 1], 1, [{ fret: 6, fromString: 0, toString: 5 }]),
      createShape('A# Power', 'alternative', [null, 1, 3, 3, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'Bb_major': {
    root: 'Bb',
    quality: 'major',
    shapes: [
      createShape('Bb Barre (A shape)', 'open', [null, 1, 3, 3, 3, 1], [null, 1, 2, 3, 4, 1], 1, [{ fret: 1, fromString: 1, toString: 5 }]),
      createShape('Bb Barre (E shape)', 'barre', [6, 8, 8, 7, 6, 6], [1, 3, 4, 2, 1, 1], 1, [{ fret: 6, fromString: 0, toString: 5 }]),
      createShape('Bb Power', 'alternative', [null, 1, 3, 3, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'B_major': {
    root: 'B',
    quality: 'major',
    shapes: [
      createShape('B Barre (A shape)', 'open', [null, 2, 4, 4, 4, 2], [null, 1, 2, 3, 4, 1], 1, [{ fret: 2, fromString: 1, toString: 5 }]),
      createShape('B Barre (E shape)', 'barre', [7, 9, 9, 8, 7, 7], [1, 3, 4, 2, 1, 1], 1, [{ fret: 7, fromString: 0, toString: 5 }]),
      createShape('B Power', 'alternative', [null, 2, 4, 4, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'C_minor': {
    root: 'C',
    quality: 'minor',
    shapes: [
      createShape('Cm Barre (Am shape)', 'open', [null, 3, 5, 5, 4, 3], [null, 1, 3, 4, 2, 1], 1, [{ fret: 3, fromString: 1, toString: 5 }]),
      createShape('Cm Barre (Em shape)', 'barre', [8, 10, 10, 8, 8, 8], [1, 3, 4, 1, 1, 1], 1, [{ fret: 8, fromString: 0, toString: 5 }]),
      createShape('Cm Power', 'alternative', [null, 3, 5, 5, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'C#_minor': {
    root: 'C#',
    quality: 'minor',
    shapes: [
      createShape('C#m Barre (Am shape)', 'open', [null, 4, 6, 6, 5, 4], [null, 1, 3, 4, 2, 1], 1, [{ fret: 4, fromString: 1, toString: 5 }]),
      createShape('C#m Barre (Em shape)', 'barre', [9, 11, 11, 9, 9, 9], [1, 3, 4, 1, 1, 1], 1, [{ fret: 9, fromString: 0, toString: 5 }]),
      createShape('C#m Power', 'alternative', [null, 4, 6, 6, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'Db_minor': {
    root: 'Db',
    quality: 'minor',
    shapes: [
      createShape('Dbm Barre (Am shape)', 'open', [null, 4, 6, 6, 5, 4], [null, 1, 3, 4, 2, 1], 1, [{ fret: 4, fromString: 1, toString: 5 }]),
      createShape('Dbm Barre (Em shape)', 'barre', [9, 11, 11, 9, 9, 9], [1, 3, 4, 1, 1, 1], 1, [{ fret: 9, fromString: 0, toString: 5 }]),
      createShape('Dbm Power', 'alternative', [null, 4, 6, 6, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'D_minor': {
    root: 'D',
    quality: 'minor',
    shapes: [
      createShape('Dm Open', 'open', [null, null, 0, 2, 3, 1], [null, null, null, 2, 3, 1]),
      createShape('Dm Barre (Am shape)', 'barre', [null, 5, 7, 7, 6, 5], [null, 1, 3, 4, 2, 1], 1, [{ fret: 5, fromString: 1, toString: 5 }]),
      createShape('Dm Barre (Em shape)', 'alternative', [10, 12, 12, 10, 10, 10], [1, 3, 4, 1, 1, 1], 1, [{ fret: 10, fromString: 0, toString: 5 }])
    ]
  },
  'D#_minor': {
    root: 'D#',
    quality: 'minor',
    shapes: [
      createShape('D#m Barre (Am shape)', 'open', [null, 6, 8, 8, 7, 6], [null, 1, 3, 4, 2, 1], 1, [{ fret: 6, fromString: 1, toString: 5 }]),
      createShape('D#m Barre (Em shape)', 'barre', [11, 13, 13, 11, 11, 11], [1, 3, 4, 1, 1, 1], 1, [{ fret: 11, fromString: 0, toString: 5 }]),
      createShape('D#m Power', 'alternative', [null, 6, 8, 8, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'Eb_minor': {
    root: 'Eb',
    quality: 'minor',
    shapes: [
      createShape('Ebm Barre (Am shape)', 'open', [null, 6, 8, 8, 7, 6], [null, 1, 3, 4, 2, 1], 1, [{ fret: 6, fromString: 1, toString: 5 }]),
      createShape('Ebm Barre (Em shape)', 'barre', [11, 13, 13, 11, 11, 11], [1, 3, 4, 1, 1, 1], 1, [{ fret: 11, fromString: 0, toString: 5 }]),
      createShape('Ebm Power', 'alternative', [null, 6, 8, 8, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'E_minor': {
    root: 'E',
    quality: 'minor',
    shapes: [
      createShape('Em Open', 'open', [0, 2, 2, 0, 0, 0], [null, 2, 3, null, null, null]),
      createShape('Em Barre (Am shape)', 'barre', [null, 7, 9, 9, 8, 7], [null, 1, 3, 4, 2, 1], 1, [{ fret: 7, fromString: 1, toString: 5 }]),
      createShape('Em Power', 'alternative', [0, 2, 2, null, null, null], [null, 2, 3, null, null, null])
    ]
  },
  'F_minor': {
    root: 'F',
    quality: 'minor',
    shapes: [
      createShape('Fm Barre (Em shape)', 'open', [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], 1, [{ fret: 1, fromString: 0, toString: 5 }]),
      createShape('Fm Barre (Am shape)', 'barre', [null, 8, 10, 10, 9, 8], [null, 1, 3, 4, 2, 1], 1, [{ fret: 8, fromString: 1, toString: 5 }]),
      createShape('Fm Power', 'alternative', [1, 3, 3, null, null, null], [1, 3, 4, null, null, null])
    ]
  },
  'F#_minor': {
    root: 'F#',
    quality: 'minor',
    shapes: [
      createShape('F#m Barre (Em shape)', 'open', [2, 4, 4, 2, 2, 2], [1, 3, 4, 1, 1, 1], 1, [{ fret: 2, fromString: 0, toString: 5 }]),
      createShape('F#m Barre (Am shape)', 'barre', [null, 9, 11, 11, 10, 9], [null, 1, 3, 4, 2, 1], 1, [{ fret: 9, fromString: 1, toString: 5 }]),
      createShape('F#m Power', 'alternative', [2, 4, 4, null, null, null], [1, 3, 4, null, null, null])
    ]
  },
  'Gb_minor': {
    root: 'Gb',
    quality: 'minor',
    shapes: [
      createShape('Gbm Barre (Em shape)', 'open', [2, 4, 4, 2, 2, 2], [1, 3, 4, 1, 1, 1], 1, [{ fret: 2, fromString: 0, toString: 5 }]),
      createShape('Gbm Barre (Am shape)', 'barre', [null, 9, 11, 11, 10, 9], [null, 1, 3, 4, 2, 1], 1, [{ fret: 9, fromString: 1, toString: 5 }]),
      createShape('Gbm Power', 'alternative', [2, 4, 4, null, null, null], [1, 3, 4, null, null, null])
    ]
  },
  'G_minor': {
    root: 'G',
    quality: 'minor',
    shapes: [
      createShape('Gm Barre (Em shape)', 'open', [3, 5, 5, 3, 3, 3], [1, 3, 4, 1, 1, 1], 1, [{ fret: 3, fromString: 0, toString: 5 }]),
      createShape('Gm Barre (Am shape)', 'barre', [null, 10, 12, 12, 11, 10], [null, 1, 3, 4, 2, 1], 1, [{ fret: 10, fromString: 1, toString: 5 }]),
      createShape('Gm Power', 'alternative', [3, 5, 5, null, null, null], [1, 3, 4, null, null, null])
    ]
  },
  'G#_minor': {
    root: 'G#',
    quality: 'minor',
    shapes: [
      createShape('G#m Barre (Em shape)', 'open', [4, 6, 6, 4, 4, 4], [1, 3, 4, 1, 1, 1], 1, [{ fret: 4, fromString: 0, toString: 5 }]),
      createShape('G#m Barre (Am shape)', 'barre', [null, 11, 13, 13, 12, 11], [null, 1, 3, 4, 2, 1], 1, [{ fret: 11, fromString: 1, toString: 5 }]),
      createShape('G#m Power', 'alternative', [4, 6, 6, null, null, null], [1, 3, 4, null, null, null])
    ]
  },
  'Ab_minor': {
    root: 'Ab',
    quality: 'minor',
    shapes: [
      createShape('Abm Barre (Em shape)', 'open', [4, 6, 6, 4, 4, 4], [1, 3, 4, 1, 1, 1], 1, [{ fret: 4, fromString: 0, toString: 5 }]),
      createShape('Abm Barre (Am shape)', 'barre', [null, 11, 13, 13, 12, 11], [null, 1, 3, 4, 2, 1], 1, [{ fret: 11, fromString: 1, toString: 5 }]),
      createShape('Abm Power', 'alternative', [4, 6, 6, null, null, null], [1, 3, 4, null, null, null])
    ]
  },
  'A_minor': {
    root: 'A',
    quality: 'minor',
    shapes: [
      createShape('Am Open', 'open', [null, 0, 2, 2, 1, 0], [null, null, 2, 3, 1, null]),
      createShape('Am Barre (Em shape)', 'barre', [5, 7, 7, 5, 5, 5], [1, 3, 4, 1, 1, 1], 1, [{ fret: 5, fromString: 0, toString: 5 }]),
      createShape('Am Power', 'alternative', [null, 0, 2, 2, null, null], [null, null, 2, 3, null, null])
    ]
  },
  'A#_minor': {
    root: 'A#',
    quality: 'minor',
    shapes: [
      createShape('A#m Barre (Am shape)', 'open', [null, 1, 3, 3, 2, 1], [null, 1, 3, 4, 2, 1], 1, [{ fret: 1, fromString: 1, toString: 5 }]),
      createShape('A#m Barre (Em shape)', 'barre', [6, 8, 8, 6, 6, 6], [1, 3, 4, 1, 1, 1], 1, [{ fret: 6, fromString: 0, toString: 5 }]),
      createShape('A#m Power', 'alternative', [null, 1, 3, 3, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'Bb_minor': {
    root: 'Bb',
    quality: 'minor',
    shapes: [
      createShape('Bbm Barre (Am shape)', 'open', [null, 1, 3, 3, 2, 1], [null, 1, 3, 4, 2, 1], 1, [{ fret: 1, fromString: 1, toString: 5 }]),
      createShape('Bbm Barre (Em shape)', 'barre', [6, 8, 8, 6, 6, 6], [1, 3, 4, 1, 1, 1], 1, [{ fret: 6, fromString: 0, toString: 5 }]),
      createShape('Bbm Power', 'alternative', [null, 1, 3, 3, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'B_minor': {
    root: 'B',
    quality: 'minor',
    shapes: [
      createShape('Bm Barre (Am shape)', 'open', [null, 2, 4, 4, 3, 2], [null, 1, 3, 4, 2, 1], 1, [{ fret: 2, fromString: 1, toString: 5 }]),
      createShape('Bm Barre (Em shape)', 'barre', [7, 9, 9, 7, 7, 7], [1, 3, 4, 1, 1, 1], 1, [{ fret: 7, fromString: 0, toString: 5 }]),
      createShape('Bm Power', 'alternative', [null, 2, 4, 4, null, null], [null, 1, 3, 4, null, null])
    ]
  },
  'C_diminished': {
    root: 'C',
    quality: 'diminished',
    shapes: [
      createShape('Cdim', 'open', [null, 3, 4, 2, 4, 2], [null, 2, 3, 1, 4, 1], 2),
      createShape('Cdim Barre', 'barre', [8, null, 10, 8, 10, null], [1, null, 3, 1, 4, null], 8),
      createShape('Cdim Alt', 'alternative', [null, null, 1, 2, 1, 2], [null, null, 1, 3, 2, 4])
    ]
  },
  'D_diminished': {
    root: 'D',
    quality: 'diminished',
    shapes: [
      createShape('Ddim', 'open', [null, null, 0, 1, 0, 1], [null, null, null, 2, null, 3]),
      createShape('Ddim Barre', 'barre', [10, null, 12, 10, 12, null], [1, null, 3, 1, 4, null], 10),
      createShape('Ddim Alt', 'alternative', [null, 5, 6, 4, 6, 4], [null, 2, 3, 1, 4, 1], 4)
    ]
  },
  'E_diminished': {
    root: 'E',
    quality: 'diminished',
    shapes: [
      createShape('Edim', 'open', [0, 1, 2, 0, 2, 0], [null, 1, 2, null, 3, null]),
      createShape('Edim Barre', 'barre', [null, 7, 8, 6, 8, null], [null, 2, 3, 1, 4, null], 6),
      createShape('Edim Alt', 'alternative', [12, null, 14, 12, 14, null], [1, null, 3, 1, 4, null], 12)
    ]
  },
  'F_diminished': {
    root: 'F',
    quality: 'diminished',
    shapes: [
      createShape('Fdim', 'open', [1, 2, 3, 1, 3, 1], [1, 2, 3, 1, 4, 1], 1),
      createShape('Fdim Barre', 'barre', [null, 8, 9, 7, 9, null], [null, 2, 3, 1, 4, null], 7),
      createShape('Fdim Alt', 'alternative', [null, null, 3, 4, 3, 4], [null, null, 1, 3, 2, 4])
    ]
  },
  'G_diminished': {
    root: 'G',
    quality: 'diminished',
    shapes: [
      createShape('Gdim', 'open', [3, 4, 5, 3, 5, 3], [1, 2, 3, 1, 4, 1], 3),
      createShape('Gdim Barre', 'barre', [null, 10, 11, 9, 11, null], [null, 2, 3, 1, 4, null], 9),
      createShape('Gdim Alt', 'alternative', [null, null, 5, 6, 5, 6], [null, null, 1, 3, 2, 4])
    ]
  },
  'A_diminished': {
    root: 'A',
    quality: 'diminished',
    shapes: [
      createShape('Adim', 'open', [null, 0, 1, 2, 1, null], [null, null, 1, 3, 2, null]),
      createShape('Adim Barre', 'barre', [5, 6, 7, 5, 7, 5], [1, 2, 3, 1, 4, 1], 5),
      createShape('Adim Alt', 'alternative', [null, null, 7, 8, 7, 8], [null, null, 1, 3, 2, 4])
    ]
  },
  'B_diminished': {
    root: 'B',
    quality: 'diminished',
    shapes: [
      createShape('Bdim', 'open', [null, 2, 3, 4, 3, null], [null, 1, 2, 4, 3, null]),
      createShape('Bdim Barre', 'barre', [7, 8, 9, 7, 9, 7], [1, 2, 3, 1, 4, 1], 7),
      createShape('Bdim Alt', 'alternative', [null, null, 9, 10, 9, 10], [null, null, 1, 3, 2, 4])
    ]
  },
  'C_augmented': {
    root: 'C',
    quality: 'augmented',
    shapes: [
      createShape('Caug', 'open', [null, 3, 2, 1, 1, 0], [null, 4, 3, 1, 2, null]),
      createShape('Caug Barre', 'barre', [null, null, 2, 1, 1, 0], [null, null, 3, 1, 2, null]),
      createShape('Caug Alt', 'alternative', [8, null, 10, 9, 9, null], [1, null, 4, 2, 3, null], 8)
    ]
  },
  'D_augmented': {
    root: 'D',
    quality: 'augmented',
    shapes: [
      createShape('Daug', 'open', [null, null, 0, 3, 3, 2], [null, null, null, 3, 4, 1]),
      createShape('Daug Barre', 'barre', [null, 5, 4, 3, 3, 2], [null, 4, 3, 1, 2, 1], 2),
      createShape('Daug Alt', 'alternative', [10, null, 12, 11, 11, null], [1, null, 4, 2, 3, null], 10)
    ]
  },
  'E_augmented': {
    root: 'E',
    quality: 'augmented',
    shapes: [
      createShape('Eaug', 'open', [0, 3, 2, 1, 1, 0], [null, 4, 3, 1, 2, null]),
      createShape('Eaug Barre', 'barre', [null, null, 2, 1, 1, 0], [null, null, 3, 1, 2, null]),
      createShape('Eaug Alt', 'alternative', [null, 7, 6, 5, 5, null], [null, 4, 3, 1, 2, null], 5)
    ]
  },
  'F_augmented': {
    root: 'F',
    quality: 'augmented',
    shapes: [
      createShape('Faug', 'open', [1, null, 3, 2, 2, 1], [1, null, 4, 2, 3, 1], 1),
      createShape('Faug Barre', 'barre', [null, null, 3, 2, 2, 1], [null, null, 4, 2, 3, 1]),
      createShape('Faug Alt', 'alternative', [null, 8, 7, 6, 6, null], [null, 4, 3, 1, 2, null], 6)
    ]
  },
  'G_augmented': {
    root: 'G',
    quality: 'augmented',
    shapes: [
      createShape('Gaug', 'open', [3, 2, 1, 0, 0, 3], [3, 2, 1, null, null, 4]),
      createShape('Gaug Barre', 'barre', [3, null, 5, 4, 4, 3], [1, null, 4, 2, 3, 1], 3),
      createShape('Gaug Alt', 'alternative', [null, 10, 9, 8, 8, null], [null, 4, 3, 1, 2, null], 8)
    ]
  },
  'A_augmented': {
    root: 'A',
    quality: 'augmented',
    shapes: [
      createShape('Aaug', 'open', [null, 0, 3, 2, 2, 1], [null, null, 4, 2, 3, 1]),
      createShape('Aaug Barre', 'barre', [5, null, 7, 6, 6, 5], [1, null, 4, 2, 3, 1], 5),
      createShape('Aaug Alt', 'alternative', [null, null, 3, 2, 2, 1], [null, null, 4, 2, 3, 1])
    ]
  },
  'B_augmented': {
    root: 'B',
    quality: 'augmented',
    shapes: [
      createShape('Baug', 'open', [null, 2, 1, 0, 0, 3], [null, 3, 2, null, null, 4]),
      createShape('Baug Barre', 'barre', [7, null, 9, 8, 8, 7], [1, null, 4, 2, 3, 1], 7),
      createShape('Baug Alt', 'alternative', [null, 2, 5, 4, 4, 3], [null, 1, 4, 2, 3, 1], 2)
    ]
  },
  'C_major7': {
    root: 'C',
    quality: 'major7',
    shapes: [
      createShape('Cmaj7 Open', 'open', [null, 3, 2, 0, 0, 0], [null, 3, 2, null, null, null]),
      createShape('Cmaj7 Barre', 'barre', [8, 10, 9, 9, 8, null], [1, 4, 2, 3, 1, null], 8),
      createShape('Cmaj7 Alt', 'alternative', [null, null, 5, 4, 5, 3], [null, null, 3, 2, 4, 1], 3)
    ]
  },
  'D_major7': {
    root: 'D',
    quality: 'major7',
    shapes: [
      createShape('Dmaj7 Open', 'open', [null, null, 0, 2, 2, 2], [null, null, null, 1, 2, 3]),
      createShape('Dmaj7 Barre', 'barre', [10, 12, 11, 11, 10, null], [1, 4, 2, 3, 1, null], 10),
      createShape('Dmaj7 Alt', 'alternative', [null, 5, 7, 6, 7, 5], [null, 1, 3, 2, 4, 1], 5)
    ]
  },
  'E_major7': {
    root: 'E',
    quality: 'major7',
    shapes: [
      createShape('Emaj7 Open', 'open', [0, 2, 1, 1, 0, 0], [null, 3, 1, 2, null, null]),
      createShape('Emaj7 Barre', 'barre', [null, 7, 9, 8, 9, 7], [null, 1, 3, 2, 4, 1], 7),
      createShape('Emaj7 Alt', 'alternative', [0, 2, 1, 1, 4, 4], [null, 2, 1, 1, 3, 4], 1)
    ]
  },
  'F_major7': {
    root: 'F',
    quality: 'major7',
    shapes: [
      createShape('Fmaj7 Open', 'open', [null, null, 3, 2, 1, 0], [null, null, 3, 2, 1, null]),
      createShape('Fmaj7 Barre', 'barre', [1, 3, 2, 2, 1, null], [1, 4, 2, 3, 1, null], 1),
      createShape('Fmaj7 Alt', 'alternative', [null, 8, 10, 9, 10, 8], [null, 1, 3, 2, 4, 1], 8)
    ]
  },
  'G_major7': {
    root: 'G',
    quality: 'major7',
    shapes: [
      createShape('Gmaj7 Open', 'open', [3, 2, 0, 0, 0, 2], [3, 2, null, null, null, 1]),
      createShape('Gmaj7 Barre', 'barre', [3, 5, 4, 4, 3, null], [1, 4, 2, 3, 1, null], 3),
      createShape('Gmaj7 Alt', 'alternative', [null, 10, 12, 11, 12, 10], [null, 1, 3, 2, 4, 1], 10)
    ]
  },
  'A_major7': {
    root: 'A',
    quality: 'major7',
    shapes: [
      createShape('Amaj7 Open', 'open', [null, 0, 2, 1, 2, 0], [null, null, 2, 1, 3, null]),
      createShape('Amaj7 Barre', 'barre', [5, 7, 6, 6, 5, null], [1, 4, 2, 3, 1, null], 5),
      createShape('Amaj7 Alt', 'alternative', [null, null, 7, 6, 5, 4], [null, null, 4, 3, 2, 1], 4)
    ]
  },
  'B_major7': {
    root: 'B',
    quality: 'major7',
    shapes: [
      createShape('Bmaj7 Open', 'open', [null, 2, 4, 3, 4, 2], [null, 1, 3, 2, 4, 1], 2),
      createShape('Bmaj7 Barre', 'barre', [7, 9, 8, 8, 7, null], [1, 4, 2, 3, 1, null], 7),
      createShape('Bmaj7 Alt', 'alternative', [null, 2, 1, 3, 0, 2], [null, 2, 1, 4, null, 3])
    ]
  },
  'C_minor7': {
    root: 'C',
    quality: 'minor7',
    shapes: [
      createShape('Cm7 Barre', 'open', [null, 3, 5, 3, 4, 3], [null, 1, 3, 1, 2, 1], 3, [{ fret: 3, fromString: 1, toString: 5 }]),
      createShape('Cm7 Barre (Em7 shape)', 'barre', [8, 10, 8, 8, 8, 8], [1, 3, 1, 1, 1, 1], 8, [{ fret: 8, fromString: 0, toString: 5 }]),
      createShape('Cm7 Alt', 'alternative', [null, null, 1, 3, 1, 3], [null, null, 1, 2, 1, 3])
    ]
  },
  'D_minor7': {
    root: 'D',
    quality: 'minor7',
    shapes: [
      createShape('Dm7 Open', 'open', [null, null, 0, 2, 1, 1], [null, null, null, 2, 1, 1]),
      createShape('Dm7 Barre', 'barre', [null, 5, 7, 5, 6, 5], [null, 1, 3, 1, 2, 1], 5, [{ fret: 5, fromString: 1, toString: 5 }]),
      createShape('Dm7 Alt', 'alternative', [10, 12, 10, 10, 10, 10], [1, 3, 1, 1, 1, 1], 10)
    ]
  },
  'E_minor7': {
    root: 'E',
    quality: 'minor7',
    shapes: [
      createShape('Em7 Open', 'open', [0, 2, 0, 0, 0, 0], [null, 1, null, null, null, null]),
      createShape('Em7 Barre', 'barre', [null, 7, 9, 7, 8, 7], [null, 1, 3, 1, 2, 1], 7, [{ fret: 7, fromString: 1, toString: 5 }]),
      createShape('Em7 Alt', 'alternative', [0, 2, 2, 0, 3, 0], [null, 1, 2, null, 3, null])
    ]
  },
  'F_minor7': {
    root: 'F',
    quality: 'minor7',
    shapes: [
      createShape('Fm7 Barre (Em7 shape)', 'open', [1, 3, 1, 1, 1, 1], [1, 3, 1, 1, 1, 1], 1, [{ fret: 1, fromString: 0, toString: 5 }]),
      createShape('Fm7 Barre (Am7 shape)', 'barre', [null, 8, 10, 8, 9, 8], [null, 1, 3, 1, 2, 1], 8, [{ fret: 8, fromString: 1, toString: 5 }]),
      createShape('Fm7 Alt', 'alternative', [null, null, 3, 1, 4, 1], [null, null, 3, 1, 4, 1])
    ]
  },
  'G_minor7': {
    root: 'G',
    quality: 'minor7',
    shapes: [
      createShape('Gm7 Barre (Em7 shape)', 'open', [3, 5, 3, 3, 3, 3], [1, 3, 1, 1, 1, 1], 3, [{ fret: 3, fromString: 0, toString: 5 }]),
      createShape('Gm7 Barre (Am7 shape)', 'barre', [null, 10, 12, 10, 11, 10], [null, 1, 3, 1, 2, 1], 10, [{ fret: 10, fromString: 1, toString: 5 }]),
      createShape('Gm7 Alt', 'alternative', [null, null, 5, 3, 6, 3], [null, null, 2, 1, 4, 1])
    ]
  },
  'A_minor7': {
    root: 'A',
    quality: 'minor7',
    shapes: [
      createShape('Am7 Open', 'open', [null, 0, 2, 0, 1, 0], [null, null, 2, null, 1, null]),
      createShape('Am7 Barre (Em7 shape)', 'barre', [5, 7, 5, 5, 5, 5], [1, 3, 1, 1, 1, 1], 5, [{ fret: 5, fromString: 0, toString: 5 }]),
      createShape('Am7 Alt', 'alternative', [null, 0, 2, 2, 1, 3], [null, null, 2, 3, 1, 4])
    ]
  },
  'B_minor7': {
    root: 'B',
    quality: 'minor7',
    shapes: [
      createShape('Bm7 Barre (Am7 shape)', 'open', [null, 2, 4, 2, 3, 2], [null, 1, 3, 1, 2, 1], 2, [{ fret: 2, fromString: 1, toString: 5 }]),
      createShape('Bm7 Barre (Em7 shape)', 'barre', [7, 9, 7, 7, 7, 7], [1, 3, 1, 1, 1, 1], 7, [{ fret: 7, fromString: 0, toString: 5 }]),
      createShape('Bm7 Alt', 'alternative', [null, 2, 0, 2, 0, 2], [null, 1, null, 2, null, 3])
    ]
  },
  'C_dominant7': {
    root: 'C',
    quality: 'dominant7',
    shapes: [
      createShape('C7 Open', 'open', [null, 3, 2, 3, 1, 0], [null, 3, 2, 4, 1, null]),
      createShape('C7 Barre (A7 shape)', 'barre', [null, 3, 5, 3, 5, 3], [null, 1, 2, 1, 3, 1], 3, [{ fret: 3, fromString: 1, toString: 5 }]),
      createShape('C7 Barre (E7 shape)', 'alternative', [8, 10, 8, 9, 8, 8], [1, 3, 1, 2, 1, 1], 8, [{ fret: 8, fromString: 0, toString: 5 }])
    ]
  },
  'D_dominant7': {
    root: 'D',
    quality: 'dominant7',
    shapes: [
      createShape('D7 Open', 'open', [null, null, 0, 2, 1, 2], [null, null, null, 2, 1, 3]),
      createShape('D7 Barre (A7 shape)', 'barre', [null, 5, 7, 5, 7, 5], [null, 1, 2, 1, 3, 1], 5, [{ fret: 5, fromString: 1, toString: 5 }]),
      createShape('D7 Barre (E7 shape)', 'alternative', [10, 12, 10, 11, 10, 10], [1, 3, 1, 2, 1, 1], 10, [{ fret: 10, fromString: 0, toString: 5 }])
    ]
  },
  'E_dominant7': {
    root: 'E',
    quality: 'dominant7',
    shapes: [
      createShape('E7 Open', 'open', [0, 2, 0, 1, 0, 0], [null, 2, null, 1, null, null]),
      createShape('E7 Barre (A7 shape)', 'barre', [null, 7, 9, 7, 9, 7], [null, 1, 2, 1, 3, 1], 7, [{ fret: 7, fromString: 1, toString: 5 }]),
      createShape('E7 Alt', 'alternative', [0, 2, 2, 1, 3, 0], [null, 2, 3, 1, 4, null])
    ]
  },
  'F_dominant7': {
    root: 'F',
    quality: 'dominant7',
    shapes: [
      createShape('F7 Barre (E7 shape)', 'open', [1, 3, 1, 2, 1, 1], [1, 3, 1, 2, 1, 1], 1, [{ fret: 1, fromString: 0, toString: 5 }]),
      createShape('F7 Barre (A7 shape)', 'barre', [null, 8, 10, 8, 10, 8], [null, 1, 2, 1, 3, 1], 8, [{ fret: 8, fromString: 1, toString: 5 }]),
      createShape('F7 Alt', 'alternative', [null, null, 1, 2, 1, 2], [null, null, 1, 2, 1, 3])
    ]
  },
  'G_dominant7': {
    root: 'G',
    quality: 'dominant7',
    shapes: [
      createShape('G7 Open', 'open', [3, 2, 0, 0, 0, 1], [3, 2, null, null, null, 1]),
      createShape('G7 Barre (E7 shape)', 'barre', [3, 5, 3, 4, 3, 3], [1, 3, 1, 2, 1, 1], 3, [{ fret: 3, fromString: 0, toString: 5 }]),
      createShape('G7 Barre (A7 shape)', 'alternative', [null, 10, 12, 10, 12, 10], [null, 1, 2, 1, 3, 1], 10, [{ fret: 10, fromString: 1, toString: 5 }])
    ]
  },
  'A_dominant7': {
    root: 'A',
    quality: 'dominant7',
    shapes: [
      createShape('A7 Open', 'open', [null, 0, 2, 0, 2, 0], [null, null, 1, null, 2, null]),
      createShape('A7 Barre (E7 shape)', 'barre', [5, 7, 5, 6, 5, 5], [1, 3, 1, 2, 1, 1], 5, [{ fret: 5, fromString: 0, toString: 5 }]),
      createShape('A7 Alt', 'alternative', [null, 0, 2, 2, 2, 3], [null, null, 1, 1, 1, 2])
    ]
  },
  'B_dominant7': {
    root: 'B',
    quality: 'dominant7',
    shapes: [
      createShape('B7 Open', 'open', [null, 2, 1, 2, 0, 2], [null, 2, 1, 3, null, 4]),
      createShape('B7 Barre (A7 shape)', 'barre', [null, 2, 4, 2, 4, 2], [null, 1, 2, 1, 3, 1], 2, [{ fret: 2, fromString: 1, toString: 5 }]),
      createShape('B7 Barre (E7 shape)', 'alternative', [7, 9, 7, 8, 7, 7], [1, 3, 1, 2, 1, 1], 7, [{ fret: 7, fromString: 0, toString: 5 }])
    ]
  },
  'C_sus2': {
    root: 'C',
    quality: 'sus2',
    shapes: [
      createShape('Csus2 Open', 'open', [null, 3, 0, 0, 3, 3], [null, 1, null, null, 3, 4]),
      createShape('Csus2 Barre', 'barre', [null, 3, 5, 5, 3, 3], [null, 1, 3, 4, 1, 1], 3),
      createShape('Csus2 Alt', 'alternative', [8, 10, 10, 10, 8, 8], [1, 2, 3, 4, 1, 1], 8)
    ]
  },
  'D_sus2': {
    root: 'D',
    quality: 'sus2',
    shapes: [
      createShape('Dsus2 Open', 'open', [null, null, 0, 2, 3, 0], [null, null, null, 1, 2, null]),
      createShape('Dsus2 Barre', 'barre', [null, 5, 7, 7, 5, 5], [null, 1, 3, 4, 1, 1], 5),
      createShape('Dsus2 Alt', 'alternative', [10, 12, 12, 12, 10, 10], [1, 2, 3, 4, 1, 1], 10)
    ]
  },
  'E_sus2': {
    root: 'E',
    quality: 'sus2',
    shapes: [
      createShape('Esus2 Open', 'open', [0, 2, 4, 4, 0, 0], [null, 1, 3, 4, null, null]),
      createShape('Esus2 Barre', 'barre', [null, 7, 9, 9, 7, 7], [null, 1, 3, 4, 1, 1], 7),
      createShape('Esus2 Alt', 'alternative', [0, 2, 2, 4, 0, 0], [null, 1, 2, 4, null, null])
    ]
  },
  'F_sus2': {
    root: 'F',
    quality: 'sus2',
    shapes: [
      createShape('Fsus2 Barre', 'open', [1, 3, 3, 3, 1, 1], [1, 2, 3, 4, 1, 1], 1),
      createShape('Fsus2 Barre Alt', 'barre', [null, 8, 10, 10, 8, 8], [null, 1, 3, 4, 1, 1], 8),
      createShape('Fsus2 Alt', 'alternative', [null, null, 3, 0, 1, 1], [null, null, 3, null, 1, 1])
    ]
  },
  'G_sus2': {
    root: 'G',
    quality: 'sus2',
    shapes: [
      createShape('Gsus2 Open', 'open', [3, 0, 0, 0, 3, 3], [1, null, null, null, 3, 4]),
      createShape('Gsus2 Barre', 'barre', [3, 5, 5, 5, 3, 3], [1, 2, 3, 4, 1, 1], 3),
      createShape('Gsus2 Alt', 'alternative', [null, 10, 12, 12, 10, 10], [null, 1, 3, 4, 1, 1], 10)
    ]
  },
  'A_sus2': {
    root: 'A',
    quality: 'sus2',
    shapes: [
      createShape('Asus2 Open', 'open', [null, 0, 2, 2, 0, 0], [null, null, 1, 2, null, null]),
      createShape('Asus2 Barre', 'barre', [5, 7, 7, 7, 5, 5], [1, 2, 3, 4, 1, 1], 5),
      createShape('Asus2 Alt', 'alternative', [null, 0, 2, 4, 0, 0], [null, null, 1, 3, null, null])
    ]
  },
  'B_sus2': {
    root: 'B',
    quality: 'sus2',
    shapes: [
      createShape('Bsus2 Barre (Asus2 shape)', 'open', [null, 2, 4, 4, 2, 2], [null, 1, 3, 4, 1, 1], 2),
      createShape('Bsus2 Barre (Esus2 shape)', 'barre', [7, 9, 9, 9, 7, 7], [1, 2, 3, 4, 1, 1], 7),
      createShape('Bsus2 Alt', 'alternative', [null, 2, 4, 4, 2, null], [null, 1, 3, 4, 1, null], 2)
    ]
  },
  'C_sus4': {
    root: 'C',
    quality: 'sus4',
    shapes: [
      createShape('Csus4 Open', 'open', [null, 3, 3, 0, 1, 1], [null, 3, 4, null, 1, 1]),
      createShape('Csus4 Barre', 'barre', [null, 3, 5, 5, 6, 3], [null, 1, 2, 3, 4, 1], 3),
      createShape('Csus4 Alt', 'alternative', [8, 10, 10, 10, 8, 8], [1, 2, 3, 4, 1, 1], 8)
    ]
  },
  'D_sus4': {
    root: 'D',
    quality: 'sus4',
    shapes: [
      createShape('Dsus4 Open', 'open', [null, null, 0, 2, 3, 3], [null, null, null, 1, 2, 3]),
      createShape('Dsus4 Barre', 'barre', [null, 5, 7, 7, 8, 5], [null, 1, 2, 3, 4, 1], 5),
      createShape('Dsus4 Alt', 'alternative', [10, 12, 12, 12, 10, 10], [1, 2, 3, 4, 1, 1], 10)
    ]
  },
  'E_sus4': {
    root: 'E',
    quality: 'sus4',
    shapes: [
      createShape('Esus4 Open', 'open', [0, 2, 2, 2, 0, 0], [null, 1, 2, 3, null, null]),
      createShape('Esus4 Barre', 'barre', [null, 7, 9, 9, 10, 7], [null, 1, 2, 3, 4, 1], 7),
      createShape('Esus4 Alt', 'alternative', [0, 0, 2, 2, 0, 0], [null, null, 1, 2, null, null])
    ]
  },
  'F_sus4': {
    root: 'F',
    quality: 'sus4',
    shapes: [
      createShape('Fsus4 Barre', 'open', [1, 3, 3, 3, 1, 1], [1, 2, 3, 4, 1, 1], 1),
      createShape('Fsus4 Barre Alt', 'barre', [null, 8, 10, 10, 11, 8], [null, 1, 2, 3, 4, 1], 8),
      createShape('Fsus4 Alt', 'alternative', [null, null, 3, 3, 1, 1], [null, null, 3, 4, 1, 1])
    ]
  },
  'G_sus4': {
    root: 'G',
    quality: 'sus4',
    shapes: [
      createShape('Gsus4 Open', 'open', [3, 3, 0, 0, 1, 3], [2, 3, null, null, 1, 4]),
      createShape('Gsus4 Barre', 'barre', [3, 5, 5, 5, 3, 3], [1, 2, 3, 4, 1, 1], 3),
      createShape('Gsus4 Alt', 'alternative', [null, 10, 12, 12, 13, 10], [null, 1, 2, 3, 4, 1], 10)
    ]
  },
  'A_sus4': {
    root: 'A',
    quality: 'sus4',
    shapes: [
      createShape('Asus4 Open', 'open', [null, 0, 2, 2, 3, 0], [null, null, 1, 2, 3, null]),
      createShape('Asus4 Barre', 'barre', [5, 7, 7, 7, 5, 5], [1, 2, 3, 4, 1, 1], 5),
      createShape('Asus4 Alt', 'alternative', [null, 0, 0, 2, 3, 0], [null, null, null, 1, 2, null])
    ]
  },
  'B_sus4': {
    root: 'B',
    quality: 'sus4',
    shapes: [
      createShape('Bsus4 Barre (Asus4 shape)', 'open', [null, 2, 4, 4, 5, 2], [null, 1, 2, 3, 4, 1], 2),
      createShape('Bsus4 Barre (Esus4 shape)', 'barre', [7, 9, 9, 9, 7, 7], [1, 2, 3, 4, 1, 1], 7),
      createShape('Bsus4 Alt', 'alternative', [null, 2, 4, 4, 0, 0], [null, 1, 3, 4, null, null])
    ]
  },
  'C_diminished7': { root: 'C', quality: 'diminished7', shapes: [
    createShape('Cdim7', 'open', [null, 3, 4, 2, 4, 2], [null, 2, 3, 1, 4, 1]),
    createShape('Cdim7 Barre', 'barre', [8, 9, 8, 9, 8, null], [1, 3, 1, 4, 2, null]),
    createShape('Cdim7 Alt', 'alternative', [null, null, 1, 2, 1, 2], [null, null, 1, 3, 2, 4])
  ]},
  'C_7sus4': { root: 'C', quality: '7sus4', shapes: [
    createShape('C7sus4', 'open', [null, 3, 3, 3, 1, 1], [null, 2, 3, 4, 1, 1]),
    createShape('C7sus4 Barre', 'barre', [8, 8, 10, 8, 8, 8], [1, 1, 3, 1, 1, 1], 1, [{ fret: 8, fromString: 0, toString: 5 }]),
    createShape('C7sus4 Alt', 'alternative', [null, 3, 5, 3, 6, 3], [null, 1, 2, 1, 4, 1])
  ]},
  'C_minorMajor7': { root: 'C', quality: 'minorMajor7', shapes: [
    createShape('Cm(maj7)', 'open', [null, 3, 4, 4, 4, 3], [null, 1, 2, 3, 4, 1]),
    createShape('Cm(maj7) Barre', 'barre', [8, 10, 9, 8, 8, 8], [1, 4, 2, 1, 1, 1], 1, [{ fret: 8, fromString: 0, toString: 5 }]),
    createShape('Cm(maj7) Alt', 'alternative', [null, null, 1, 0, 0, 3], [null, null, 1, null, null, 4])
  ]},
  'C_minor7b5': { root: 'C', quality: 'minor7b5', shapes: [
    createShape('Cm7b5', 'open', [null, 3, 4, 3, 4, null], [null, 1, 3, 2, 4, null]),
    createShape('Cm7b5 Barre', 'barre', [8, 9, 8, 8, null, null], [1, 3, 1, 2, null, null]),
    createShape('Cm7b5 Alt', 'alternative', [null, null, 4, 4, 4, 4], [null, null, 1, 1, 1, 1])
  ]},
  'C_add9': { root: 'C', quality: 'add9', shapes: [
    createShape('Cadd9', 'open', [null, 3, 2, 0, 3, 0], [null, 2, 1, null, 3, null]),
    createShape('Cadd9 Barre', 'barre', [null, 3, 5, 5, 3, 5], [null, 1, 2, 3, 1, 4]),
    createShape('Cadd9 Alt', 'alternative', [8, 10, 10, 9, 10, 8], [1, 2, 3, 1, 4, 1])
  ]},
  'C_minorAdd9': { root: 'C', quality: 'minorAdd9', shapes: [
    createShape('Cm(add9)', 'open', [null, 3, 1, 0, 3, 3], [null, 2, 1, null, 3, 4]),
    createShape('Cm(add9) Barre', 'barre', [8, 10, 8, 8, 8, 10], [1, 3, 1, 1, 1, 4]),
    createShape('Cm(add9) Alt', 'alternative', [null, null, 4, 5, 4, 5], [null, null, 1, 3, 2, 4])
  ]},
  'D_diminished7': { root: 'D', quality: 'diminished7', shapes: [
    createShape('Ddim7', 'open', [null, null, 0, 1, 0, 1], [null, null, null, 1, null, 2]),
    createShape('Ddim7 Barre', 'barre', [null, 5, 6, 4, 6, 4], [null, 2, 3, 1, 4, 1]),
    createShape('Ddim7 Alt', 'alternative', [10, 11, 10, 11, 10, null], [1, 3, 1, 4, 2, null])
  ]},
  'D_7sus4': { root: 'D', quality: '7sus4', shapes: [
    createShape('D7sus4', 'open', [null, null, 0, 2, 1, 3], [null, null, null, 2, 1, 3]),
    createShape('D7sus4 Barre', 'barre', [10, 10, 12, 10, 10, 10], [1, 1, 3, 1, 1, 1], 1, [{ fret: 10, fromString: 0, toString: 5 }]),
    createShape('D7sus4 Alt', 'alternative', [null, 5, 5, 5, 3, 3], [null, 2, 3, 4, 1, 1])
  ]},
  'D_minorMajor7': { root: 'D', quality: 'minorMajor7', shapes: [
    createShape('Dm(maj7)', 'open', [null, null, 0, 2, 2, 1], [null, null, null, 2, 3, 1]),
    createShape('Dm(maj7) Barre', 'barre', [10, 12, 11, 10, 10, 10], [1, 4, 2, 1, 1, 1], 1, [{ fret: 10, fromString: 0, toString: 5 }]),
    createShape('Dm(maj7) Alt', 'alternative', [null, 5, 6, 6, 6, 5], [null, 1, 2, 3, 4, 1])
  ]},
  'D_minor7b5': { root: 'D', quality: 'minor7b5', shapes: [
    createShape('Dm7b5', 'open', [null, null, 0, 1, 1, 1], [null, null, null, 1, 1, 1]),
    createShape('Dm7b5 Barre', 'barre', [null, 5, 6, 5, 6, null], [null, 1, 3, 2, 4, null]),
    createShape('Dm7b5 Alt', 'alternative', [10, 11, 10, 10, null, null], [1, 3, 1, 2, null, null])
  ]},
  'D_add9': { root: 'D', quality: 'add9', shapes: [
    createShape('Dadd9', 'open', [null, null, 0, 2, 3, 0], [null, null, null, 1, 2, null]),
    createShape('Dadd9 Barre', 'barre', [null, 5, 4, 2, 5, 2], [null, 3, 2, 1, 4, 1]),
    createShape('Dadd9 Alt', 'alternative', [10, 12, 12, 11, 12, 10], [1, 2, 3, 1, 4, 1])
  ]},
  'D_minorAdd9': { root: 'D', quality: 'minorAdd9', shapes: [
    createShape('Dm(add9)', 'open', [null, null, 0, 2, 1, 0], [null, null, null, 2, 1, null]),
    createShape('Dm(add9) Barre', 'barre', [10, 12, 10, 10, 10, 12], [1, 3, 1, 1, 1, 4]),
    createShape('Dm(add9) Alt', 'alternative', [null, 5, 3, 2, 5, 5], [null, 3, 2, 1, 4, 4])
  ]},
  'E_diminished7': { root: 'E', quality: 'diminished7', shapes: [
    createShape('Edim7', 'open', [0, 1, 2, 0, 2, 0], [null, 1, 3, null, 4, null]),
    createShape('Edim7 Barre', 'barre', [null, 7, 8, 6, 8, 6], [null, 2, 3, 1, 4, 1]),
    createShape('Edim7 Alt', 'alternative', [null, null, 2, 3, 2, 3], [null, null, 1, 3, 2, 4])
  ]},
  'E_7sus4': { root: 'E', quality: '7sus4', shapes: [
    createShape('E7sus4', 'open', [0, 2, 0, 2, 0, 0], [null, 1, null, 2, null, null]),
    createShape('E7sus4 Barre', 'barre', [0, 2, 2, 2, 0, 0], [null, 2, 3, 4, null, null]),
    createShape('E7sus4 Alt', 'alternative', [null, 7, 7, 7, 5, 5], [null, 2, 3, 4, 1, 1])
  ]},
  'E_minorMajor7': { root: 'E', quality: 'minorMajor7', shapes: [
    createShape('Em(maj7)', 'open', [0, 2, 1, 0, 0, 0], [null, 2, 1, null, null, null]),
    createShape('Em(maj7) Barre', 'barre', [null, 7, 8, 8, 8, 7], [null, 1, 2, 3, 4, 1]),
    createShape('Em(maj7) Alt', 'alternative', [0, 2, 2, 0, 3, 0], [null, 1, 2, null, 4, null])
  ]},
  'E_minor7b5': { root: 'E', quality: 'minor7b5', shapes: [
    createShape('Em7b5', 'open', [0, 1, 0, 0, 2, 0], [null, 1, null, null, 2, null]),
    createShape('Em7b5 Barre', 'barre', [null, 7, 8, 7, 8, null], [null, 1, 3, 2, 4, null]),
    createShape('Em7b5 Alt', 'alternative', [null, null, 2, 3, 2, 3], [null, null, 1, 3, 2, 4])
  ]},
  'E_add9': { root: 'E', quality: 'add9', shapes: [
    createShape('Eadd9', 'open', [0, 2, 2, 1, 0, 2], [null, 2, 3, 1, null, 4]),
    createShape('Eadd9 Barre', 'barre', [null, 7, 6, 4, 7, 4], [null, 3, 2, 1, 4, 1]),
    createShape('Eadd9 Alt', 'alternative', [0, 2, 4, 1, 0, 0], [null, 1, 4, 2, null, null])
  ]},
  'E_minorAdd9': { root: 'E', quality: 'minorAdd9', shapes: [
    createShape('Em(add9)', 'open', [0, 2, 2, 0, 0, 2], [null, 2, 3, null, null, 4]),
    createShape('Em(add9) Barre', 'barre', [null, 7, 5, 4, 7, 7], [null, 3, 2, 1, 4, 4]),
    createShape('Em(add9) Alt', 'alternative', [0, 2, 0, 0, 0, 2], [null, 1, null, null, null, 2])
  ]},
  'G_diminished7': { root: 'G', quality: 'diminished7', shapes: [
    createShape('Gdim7', 'open', [3, 4, 2, 3, 2, null], [2, 4, 1, 3, 1, null]),
    createShape('Gdim7 Barre', 'barre', [null, null, 5, 6, 5, 6], [null, null, 1, 3, 2, 4]),
    createShape('Gdim7 Alt', 'alternative', [3, 4, 5, 3, 5, 3], [1, 2, 3, 1, 4, 1])
  ]},
  'G_7sus4': { root: 'G', quality: '7sus4', shapes: [
    createShape('G7sus4', 'open', [3, 3, 0, 0, 1, 1], [3, 4, null, null, 1, 2]),
    createShape('G7sus4 Barre', 'barre', [3, 3, 5, 3, 3, 3], [1, 1, 3, 1, 1, 1], 1, [{ fret: 3, fromString: 0, toString: 5 }]),
    createShape('G7sus4 Alt', 'alternative', [3, 5, 3, 5, 3, 3], [1, 3, 1, 4, 1, 1])
  ]},
  'G_minorMajor7': { root: 'G', quality: 'minorMajor7', shapes: [
    createShape('Gm(maj7)', 'open', [3, 5, 4, 3, 3, 3], [1, 4, 2, 1, 1, 1], 1, [{ fret: 3, fromString: 0, toString: 5 }]),
    createShape('Gm(maj7) Barre', 'barre', [null, null, 5, 4, 3, 6], [null, null, 2, 1, 1, 4]),
    createShape('Gm(maj7) Alt', 'alternative', [null, 10, 11, 11, 11, 10], [null, 1, 2, 3, 4, 1])
  ]},
  'G_minor7b5': { root: 'G', quality: 'minor7b5', shapes: [
    createShape('Gm7b5', 'open', [3, 4, 3, 3, null, null], [1, 3, 1, 2, null, null]),
    createShape('Gm7b5 Barre', 'barre', [null, null, 5, 6, 5, 6], [null, null, 1, 3, 2, 4]),
    createShape('Gm7b5 Alt', 'alternative', [null, 10, 11, 10, 11, null], [null, 1, 3, 2, 4, null])
  ]},
  'G_add9': { root: 'G', quality: 'add9', shapes: [
    createShape('Gadd9', 'open', [3, 2, 0, 0, 0, 3], [2, 1, null, null, null, 3]),
    createShape('Gadd9 Barre', 'barre', [3, 5, 5, 4, 5, 3], [1, 2, 3, 1, 4, 1]),
    createShape('Gadd9 Alt', 'alternative', [3, 0, 0, 0, 0, 3], [1, null, null, null, null, 2])
  ]},
  'G_minorAdd9': { root: 'G', quality: 'minorAdd9', shapes: [
    createShape('Gm(add9)', 'open', [3, 5, 3, 3, 3, 5], [1, 3, 1, 1, 1, 4]),
    createShape('Gm(add9) Barre', 'barre', [null, 10, 8, 7, 10, 10], [null, 3, 2, 1, 4, 4]),
    createShape('Gm(add9) Alt', 'alternative', [3, 1, 0, 3, 3, 3], [2, 1, null, 3, 3, 3])
  ]},
  'A_diminished7': { root: 'A', quality: 'diminished7', shapes: [
    createShape('Adim7', 'open', [null, 0, 1, 2, 1, 2], [null, null, 1, 3, 2, 4]),
    createShape('Adim7 Barre', 'barre', [5, 6, 4, 5, 4, null], [2, 4, 1, 3, 1, null]),
    createShape('Adim7 Alt', 'alternative', [null, null, 7, 8, 7, 8], [null, null, 1, 3, 2, 4])
  ]},
  'A_7sus4': { root: 'A', quality: '7sus4', shapes: [
    createShape('A7sus4', 'open', [null, 0, 2, 0, 3, 0], [null, null, 1, null, 3, null]),
    createShape('A7sus4 Barre', 'barre', [5, 5, 7, 5, 5, 5], [1, 1, 3, 1, 1, 1], 1, [{ fret: 5, fromString: 0, toString: 5 }]),
    createShape('A7sus4 Alt', 'alternative', [null, 0, 0, 0, 3, 0], [null, null, null, null, 3, null])
  ]},
  'A_minorMajor7': { root: 'A', quality: 'minorMajor7', shapes: [
    createShape('Am(maj7)', 'open', [null, 0, 2, 1, 1, 0], [null, null, 3, 1, 2, null]),
    createShape('Am(maj7) Barre', 'barre', [5, 7, 6, 5, 5, 5], [1, 4, 2, 1, 1, 1], 1, [{ fret: 5, fromString: 0, toString: 5 }]),
    createShape('Am(maj7) Alt', 'alternative', [null, 0, 2, 1, 1, 4], [null, null, 2, 1, 1, 4])
  ]},
  'A_minor7b5': { root: 'A', quality: 'minor7b5', shapes: [
    createShape('Am7b5', 'open', [null, 0, 1, 0, 1, 0], [null, null, 1, null, 2, null]),
    createShape('Am7b5 Barre', 'barre', [5, 6, 5, 5, null, null], [1, 3, 1, 2, null, null]),
    createShape('Am7b5 Alt', 'alternative', [null, null, 7, 8, 7, 8], [null, null, 1, 3, 2, 4])
  ]},
  'A_add9': { root: 'A', quality: 'add9', shapes: [
    createShape('Aadd9', 'open', [null, 0, 2, 2, 0, 0], [null, null, 1, 2, null, null]),
    createShape('Aadd9 Barre', 'barre', [5, 7, 7, 6, 7, 5], [1, 2, 3, 1, 4, 1]),
    createShape('Aadd9 Alt', 'alternative', [null, 0, 4, 2, 0, 0], [null, null, 4, 2, null, null])
  ]},
  'A_minorAdd9': { root: 'A', quality: 'minorAdd9', shapes: [
    createShape('Am(add9)', 'open', [null, 0, 2, 2, 0, 0], [null, null, 2, 3, null, null]),
    createShape('Am(add9) Barre', 'barre', [5, 7, 5, 5, 5, 7], [1, 3, 1, 1, 1, 4]),
    createShape('Am(add9) Alt', 'alternative', [null, 0, 2, 0, 0, 0], [null, null, 2, null, null, null])
  ]},
  'F_diminished7': { root: 'F', quality: 'diminished7', shapes: [
    createShape('Fdim7', 'open', [1, 2, 0, 1, 0, 1], [2, 4, null, 3, null, 1]),
    createShape('Fdim7 Barre', 'barre', [null, null, 3, 4, 3, 4], [null, null, 1, 3, 2, 4]),
    createShape('Fdim7 Alt', 'alternative', [1, 2, 3, 1, 3, 1], [1, 2, 3, 1, 4, 1])
  ]},
  'F_7sus4': { root: 'F', quality: '7sus4', shapes: [
    createShape('F7sus4', 'open', [1, 1, 3, 1, 1, 1], [1, 1, 3, 1, 1, 1], 1, [{ fret: 1, fromString: 0, toString: 5 }]),
    createShape('F7sus4 Barre', 'barre', [null, 8, 8, 8, 6, 6], [null, 2, 3, 4, 1, 1]),
    createShape('F7sus4 Alt', 'alternative', [1, 3, 1, 3, 1, 1], [1, 3, 1, 4, 1, 1])
  ]},
  'F_minorMajor7': { root: 'F', quality: 'minorMajor7', shapes: [
    createShape('Fm(maj7)', 'open', [1, 3, 2, 1, 1, 1], [1, 4, 2, 1, 1, 1], 1, [{ fret: 1, fromString: 0, toString: 5 }]),
    createShape('Fm(maj7) Barre', 'barre', [null, 8, 9, 9, 9, 8], [null, 1, 2, 3, 4, 1]),
    createShape('Fm(maj7) Alt', 'alternative', [null, null, 3, 2, 1, 4], [null, null, 2, 1, 1, 4])
  ]},
  'F_minor7b5': { root: 'F', quality: 'minor7b5', shapes: [
    createShape('Fm7b5', 'open', [1, 2, 1, 1, null, null], [1, 3, 1, 2, null, null]),
    createShape('Fm7b5 Barre', 'barre', [null, null, 3, 4, 3, 4], [null, null, 1, 3, 2, 4]),
    createShape('Fm7b5 Alt', 'alternative', [null, 8, 9, 8, 9, null], [null, 1, 3, 2, 4, null])
  ]},
  'F_add9': { root: 'F', quality: 'add9', shapes: [
    createShape('Fadd9', 'open', [1, 0, 3, 2, 1, 1], [1, null, 4, 2, 1, 1]),
    createShape('Fadd9 Barre', 'barre', [null, 8, 7, 5, 8, 5], [null, 3, 2, 1, 4, 1]),
    createShape('Fadd9 Alt', 'alternative', [1, 3, 3, 2, 3, 1], [1, 2, 3, 1, 4, 1])
  ]},
  'F_minorAdd9': { root: 'F', quality: 'minorAdd9', shapes: [
    createShape('Fm(add9)', 'open', [1, 3, 1, 1, 1, 3], [1, 3, 1, 1, 1, 4]),
    createShape('Fm(add9) Barre', 'barre', [null, 8, 6, 5, 8, 8], [null, 3, 2, 1, 4, 4]),
    createShape('Fm(add9) Alt', 'alternative', [null, null, 3, 1, 1, 3], [null, null, 3, 1, 1, 4])
  ]},
  'B_diminished7': { root: 'B', quality: 'diminished7', shapes: [
    createShape('Bdim7', 'open', [null, 2, 0, 1, 0, 1], [null, 2, null, 1, null, 1]),
    createShape('Bdim7 Barre', 'barre', [7, 8, 6, 7, 6, null], [2, 4, 1, 3, 1, null]),
    createShape('Bdim7 Alt', 'alternative', [null, null, 0, 1, 0, 1], [null, null, null, 2, null, 1])
  ]},
  'B_7sus4': { root: 'B', quality: '7sus4', shapes: [
    createShape('B7sus4', 'open', [null, 2, 4, 2, 5, 2], [null, 1, 3, 1, 4, 1]),
    createShape('B7sus4 Barre', 'barre', [7, 7, 9, 7, 7, 7], [1, 1, 3, 1, 1, 1], 1, [{ fret: 7, fromString: 0, toString: 5 }]),
    createShape('B7sus4 Alt', 'alternative', [null, 2, 2, 2, 0, 0], [null, 2, 3, 4, null, null])
  ]},
  'B_minorMajor7': { root: 'B', quality: 'minorMajor7', shapes: [
    createShape('Bm(maj7)', 'open', [null, 2, 4, 3, 3, 2], [null, 1, 4, 2, 3, 1]),
    createShape('Bm(maj7) Barre', 'barre', [7, 9, 8, 7, 7, 7], [1, 4, 2, 1, 1, 1], 1, [{ fret: 7, fromString: 0, toString: 5 }]),
    createShape('Bm(maj7) Alt', 'alternative', [null, null, 4, 3, 3, 6], [null, null, 2, 1, 1, 4])
  ]},
  'B_minor7b5': { root: 'B', quality: 'minor7b5', shapes: [
    createShape('Bm7b5', 'open', [null, 2, 3, 2, 3, null], [null, 1, 3, 2, 4, null]),
    createShape('Bm7b5 Barre', 'barre', [7, 8, 7, 7, null, null], [1, 3, 1, 2, null, null]),
    createShape('Bm7b5 Alt', 'alternative', [null, null, 0, 2, 0, 1], [null, null, null, 2, null, 1])
  ]},
  'B_add9': { root: 'B', quality: 'add9', shapes: [
    createShape('Badd9', 'open', [null, 2, 4, 4, 2, 4], [null, 1, 2, 3, 1, 4]),
    createShape('Badd9 Barre', 'barre', [7, 9, 9, 8, 9, 7], [1, 2, 3, 1, 4, 1]),
    createShape('Badd9 Alt', 'alternative', [null, 2, 1, 4, 2, 2], [null, 2, 1, 4, 3, 3])
  ]},
  'B_minorAdd9': { root: 'B', quality: 'minorAdd9', shapes: [
    createShape('Bm(add9)', 'open', [null, 2, 4, 4, 2, 4], [null, 1, 2, 3, 1, 4]),
    createShape('Bm(add9) Barre', 'barre', [7, 9, 7, 7, 7, 9], [1, 3, 1, 1, 1, 4]),
    createShape('Bm(add9) Alt', 'alternative', [null, 2, 0, 2, 2, 2], [null, 1, null, 2, 3, 4])
  ]},
  'Bb_diminished7': { root: 'Bb', quality: 'diminished7', shapes: [
    createShape('Bbdim7', 'open', [null, 1, 2, 0, 2, 0], [null, 1, 3, null, 4, null]),
    createShape('Bbdim7 Barre', 'barre', [6, 7, 5, 6, 5, null], [2, 4, 1, 3, 1, null]),
    createShape('Bbdim7 Alt', 'alternative', [null, null, 2, 3, 2, 3], [null, null, 1, 3, 2, 4])
  ]},
  'Bb_7sus4': { root: 'Bb', quality: '7sus4', shapes: [
    createShape('Bb7sus4', 'open', [null, 1, 3, 1, 4, 1], [null, 1, 3, 1, 4, 1]),
    createShape('Bb7sus4 Barre', 'barre', [6, 6, 8, 6, 6, 6], [1, 1, 3, 1, 1, 1], 1, [{ fret: 6, fromString: 0, toString: 5 }]),
    createShape('Bb7sus4 Alt', 'alternative', [null, 1, 1, 1, 4, 4], [null, 1, 1, 1, 4, 4])
  ]},
  'Bb_minorMajor7': { root: 'Bb', quality: 'minorMajor7', shapes: [
    createShape('Bbm(maj7)', 'open', [null, 1, 3, 2, 2, 1], [null, 1, 4, 2, 3, 1]),
    createShape('Bbm(maj7) Barre', 'barre', [6, 8, 7, 6, 6, 6], [1, 4, 2, 1, 1, 1], 1, [{ fret: 6, fromString: 0, toString: 5 }]),
    createShape('Bbm(maj7) Alt', 'alternative', [null, null, 3, 2, 2, 5], [null, null, 2, 1, 1, 4])
  ]},
  'Bb_minor7b5': { root: 'Bb', quality: 'minor7b5', shapes: [
    createShape('Bbm7b5', 'open', [null, 1, 2, 1, 2, null], [null, 1, 3, 2, 4, null]),
    createShape('Bbm7b5 Barre', 'barre', [6, 7, 6, 6, null, null], [1, 3, 1, 2, null, null]),
    createShape('Bbm7b5 Alt', 'alternative', [null, null, 8, 9, 8, 9], [null, null, 1, 3, 2, 4])
  ]},
  'Bb_add9': { root: 'Bb', quality: 'add9', shapes: [
    createShape('Bbadd9', 'open', [null, 1, 0, 3, 1, 1], [null, 1, null, 4, 2, 2]),
    createShape('Bbadd9 Barre', 'barre', [6, 8, 8, 7, 8, 6], [1, 2, 3, 1, 4, 1]),
    createShape('Bbadd9 Alt', 'alternative', [null, 1, 3, 3, 1, 3], [null, 1, 2, 3, 1, 4])
  ]},
  'Bb_minorAdd9': { root: 'Bb', quality: 'minorAdd9', shapes: [
    createShape('Bbm(add9)', 'open', [null, 1, 3, 3, 1, 3], [null, 1, 2, 3, 1, 4]),
    createShape('Bbm(add9) Barre', 'barre', [6, 8, 6, 6, 6, 8], [1, 3, 1, 1, 1, 4]),
    createShape('Bbm(add9) Alt', 'alternative', [null, 1, 1, 3, 1, 1], [null, 1, 1, 4, 1, 1])
  ]},

  // F#/Gb new chord types
  'F#_diminished7': { root: 'F#', quality: 'diminished7', shapes: [
    createShape('F#dim7', 'open', [2, 3, 1, 2, 1, 2], [2, 4, 1, 3, 1, 2]),
    createShape('F#dim7 Barre', 'barre', [null, null, 4, 5, 4, 5], [null, null, 1, 3, 2, 4]),
    createShape('F#dim7 Alt', 'alternative', [2, 3, 4, 2, 4, 2], [1, 2, 3, 1, 4, 1])
  ]},
  'F#_7sus4': { root: 'F#', quality: '7sus4', shapes: [
    createShape('F#7sus4', 'open', [2, 2, 4, 2, 2, 2], [1, 1, 3, 1, 1, 1], 1, [{ fret: 2, fromString: 0, toString: 5 }]),
    createShape('F#7sus4 Barre', 'barre', [null, 9, 9, 9, 7, 7], [null, 2, 3, 4, 1, 1]),
    createShape('F#7sus4 Alt', 'alternative', [2, 4, 2, 4, 2, 2], [1, 3, 1, 4, 1, 1])
  ]},
  'F#_minorMajor7': { root: 'F#', quality: 'minorMajor7', shapes: [
    createShape('F#m(maj7)', 'open', [2, 4, 3, 2, 2, 2], [1, 4, 2, 1, 1, 1], 1, [{ fret: 2, fromString: 0, toString: 5 }]),
    createShape('F#m(maj7) Barre', 'barre', [null, 9, 10, 10, 10, 9], [null, 1, 2, 3, 4, 1]),
    createShape('F#m(maj7) Alt', 'alternative', [null, null, 4, 3, 2, 5], [null, null, 2, 1, 1, 4])
  ]},
  'F#_minor7b5': { root: 'F#', quality: 'minor7b5', shapes: [
    createShape('F#m7b5', 'open', [2, 3, 2, 2, null, null], [1, 3, 1, 2, null, null]),
    createShape('F#m7b5 Barre', 'barre', [null, null, 4, 5, 4, 5], [null, null, 1, 3, 2, 4]),
    createShape('F#m7b5 Alt', 'alternative', [null, 9, 10, 9, 10, null], [null, 1, 3, 2, 4, null])
  ]},
  'F#_add9': { root: 'F#', quality: 'add9', shapes: [
    createShape('F#add9', 'open', [2, 1, 4, 3, 2, 2], [2, 1, 4, 3, 2, 2]),
    createShape('F#add9 Barre', 'barre', [null, 9, 8, 6, 9, 6], [null, 3, 2, 1, 4, 1]),
    createShape('F#add9 Alt', 'alternative', [2, 4, 4, 3, 4, 2], [1, 2, 3, 1, 4, 1])
  ]},
  'F#_minorAdd9': { root: 'F#', quality: 'minorAdd9', shapes: [
    createShape('F#m(add9)', 'open', [2, 4, 2, 2, 2, 4], [1, 3, 1, 1, 1, 4]),
    createShape('F#m(add9) Barre', 'barre', [null, 9, 7, 6, 9, 9], [null, 3, 2, 1, 4, 4]),
    createShape('F#m(add9) Alt', 'alternative', [null, null, 4, 2, 2, 4], [null, null, 3, 1, 1, 4])
  ]},

  // Ab/G# new chord types (using Ab naming but also accessible via G#)
  'Ab_diminished7': { root: 'Ab', quality: 'diminished7', shapes: [
    createShape('Abdim7', 'open', [4, 5, 3, 4, 3, null], [2, 4, 1, 3, 1, null]),
    createShape('Abdim7 Barre', 'barre', [null, null, 6, 7, 6, 7], [null, null, 1, 3, 2, 4]),
    createShape('Abdim7 Alt', 'alternative', [4, 5, 6, 4, 6, 4], [1, 2, 3, 1, 4, 1])
  ]},
  'Ab_7sus4': { root: 'Ab', quality: '7sus4', shapes: [
    createShape('Ab7sus4', 'open', [4, 4, 6, 4, 4, 4], [1, 1, 3, 1, 1, 1], 1, [{ fret: 4, fromString: 0, toString: 5 }]),
    createShape('Ab7sus4 Barre', 'barre', [null, 11, 11, 11, 9, 9], [null, 2, 3, 4, 1, 1]),
    createShape('Ab7sus4 Alt', 'alternative', [4, 6, 4, 6, 4, 4], [1, 3, 1, 4, 1, 1])
  ]},
  'Ab_minorMajor7': { root: 'Ab', quality: 'minorMajor7', shapes: [
    createShape('Abm(maj7)', 'open', [4, 6, 5, 4, 4, 4], [1, 4, 2, 1, 1, 1], 1, [{ fret: 4, fromString: 0, toString: 5 }]),
    createShape('Abm(maj7) Barre', 'barre', [null, 11, 12, 12, 12, 11], [null, 1, 2, 3, 4, 1]),
    createShape('Abm(maj7) Alt', 'alternative', [null, null, 6, 5, 4, 7], [null, null, 2, 1, 1, 4])
  ]},
  'Ab_minor7b5': { root: 'Ab', quality: 'minor7b5', shapes: [
    createShape('Abm7b5', 'open', [4, 5, 4, 4, null, null], [1, 3, 1, 2, null, null]),
    createShape('Abm7b5 Barre', 'barre', [null, null, 6, 7, 6, 7], [null, null, 1, 3, 2, 4]),
    createShape('Abm7b5 Alt', 'alternative', [null, 11, 12, 11, 12, null], [null, 1, 3, 2, 4, null])
  ]},
  'Ab_add9': { root: 'Ab', quality: 'add9', shapes: [
    createShape('Abadd9', 'open', [4, 3, 6, 5, 4, 4], [2, 1, 4, 3, 2, 2]),
    createShape('Abadd9 Barre', 'barre', [4, 6, 6, 5, 6, 4], [1, 2, 3, 1, 4, 1]),
    createShape('Abadd9 Alt', 'alternative', [null, 11, 10, 8, 11, 8], [null, 3, 2, 1, 4, 1])
  ]},
  'Ab_minorAdd9': { root: 'Ab', quality: 'minorAdd9', shapes: [
    createShape('Abm(add9)', 'open', [4, 6, 4, 4, 4, 6], [1, 3, 1, 1, 1, 4]),
    createShape('Abm(add9) Barre', 'barre', [null, 11, 9, 8, 11, 11], [null, 3, 2, 1, 4, 4]),
    createShape('Abm(add9) Alt', 'alternative', [null, null, 6, 4, 4, 6], [null, null, 3, 1, 1, 4])
  ]},

  // C#/Db new chord types
  'C#_diminished7': { root: 'C#', quality: 'diminished7', shapes: [
    createShape('C#dim7', 'open', [null, 4, 5, 3, 5, 3], [null, 2, 3, 1, 4, 1]),
    createShape('C#dim7 Barre', 'barre', [9, 10, 9, 10, 9, null], [1, 3, 1, 4, 2, null]),
    createShape('C#dim7 Alt', 'alternative', [null, null, 2, 3, 2, 3], [null, null, 1, 3, 2, 4])
  ]},
  'C#_7sus4': { root: 'C#', quality: '7sus4', shapes: [
    createShape('C#7sus4', 'open', [null, 4, 4, 4, 2, 2], [null, 2, 3, 4, 1, 1]),
    createShape('C#7sus4 Barre', 'barre', [9, 9, 11, 9, 9, 9], [1, 1, 3, 1, 1, 1], 1, [{ fret: 9, fromString: 0, toString: 5 }]),
    createShape('C#7sus4 Alt', 'alternative', [null, 4, 6, 4, 7, 4], [null, 1, 2, 1, 4, 1])
  ]},
  'C#_minorMajor7': { root: 'C#', quality: 'minorMajor7', shapes: [
    createShape('C#m(maj7)', 'open', [null, 4, 5, 5, 5, 4], [null, 1, 2, 3, 4, 1]),
    createShape('C#m(maj7) Barre', 'barre', [9, 11, 10, 9, 9, 9], [1, 4, 2, 1, 1, 1], 1, [{ fret: 9, fromString: 0, toString: 5 }]),
    createShape('C#m(maj7) Alt', 'alternative', [null, null, 2, 1, 1, 4], [null, null, 2, 1, 1, 4])
  ]},
  'C#_minor7b5': { root: 'C#', quality: 'minor7b5', shapes: [
    createShape('C#m7b5', 'open', [null, 4, 5, 4, 5, null], [null, 1, 3, 2, 4, null]),
    createShape('C#m7b5 Barre', 'barre', [9, 10, 9, 9, null, null], [1, 3, 1, 2, null, null]),
    createShape('C#m7b5 Alt', 'alternative', [null, null, 5, 5, 5, 5], [null, null, 1, 1, 1, 1])
  ]},
  'C#_add9': { root: 'C#', quality: 'add9', shapes: [
    createShape('C#add9', 'open', [null, 4, 3, 1, 4, 1], [null, 3, 2, 1, 4, 1]),
    createShape('C#add9 Barre', 'barre', [null, 4, 6, 6, 4, 6], [null, 1, 2, 3, 1, 4]),
    createShape('C#add9 Alt', 'alternative', [9, 11, 11, 10, 11, 9], [1, 2, 3, 1, 4, 1])
  ]},
  'C#_minorAdd9': { root: 'C#', quality: 'minorAdd9', shapes: [
    createShape('C#m(add9)', 'open', [null, 4, 2, 1, 4, 4], [null, 3, 2, 1, 4, 4]),
    createShape('C#m(add9) Barre', 'barre', [9, 11, 9, 9, 9, 11], [1, 3, 1, 1, 1, 4]),
    createShape('C#m(add9) Alt', 'alternative', [null, null, 5, 6, 5, 6], [null, null, 1, 3, 2, 4])
  ]},

  // Eb/D# new chord types
  'Eb_diminished7': { root: 'Eb', quality: 'diminished7', shapes: [
    createShape('Ebdim7', 'open', [null, null, 1, 2, 1, 2], [null, null, 1, 3, 2, 4]),
    createShape('Ebdim7 Barre', 'barre', [null, 6, 7, 5, 7, 5], [null, 2, 3, 1, 4, 1]),
    createShape('Ebdim7 Alt', 'alternative', [11, 12, 11, 12, 11, null], [1, 3, 1, 4, 2, null])
  ]},
  'Eb_7sus4': { root: 'Eb', quality: '7sus4', shapes: [
    createShape('Eb7sus4', 'open', [null, 6, 6, 6, 4, 4], [null, 2, 3, 4, 1, 1]),
    createShape('Eb7sus4 Barre', 'barre', [11, 11, 13, 11, 11, 11], [1, 1, 3, 1, 1, 1], 1, [{ fret: 11, fromString: 0, toString: 5 }]),
    createShape('Eb7sus4 Alt', 'alternative', [null, null, 1, 1, 2, 2], [null, null, 1, 1, 2, 2])
  ]},
  'Eb_minorMajor7': { root: 'Eb', quality: 'minorMajor7', shapes: [
    createShape('Ebm(maj7)', 'open', [null, 6, 7, 7, 7, 6], [null, 1, 2, 3, 4, 1]),
    createShape('Ebm(maj7) Barre', 'barre', [11, 13, 12, 11, 11, 11], [1, 4, 2, 1, 1, 1], 1, [{ fret: 11, fromString: 0, toString: 5 }]),
    createShape('Ebm(maj7) Alt', 'alternative', [null, null, 4, 3, 3, 6], [null, null, 2, 1, 1, 4])
  ]},
  'Eb_minor7b5': { root: 'Eb', quality: 'minor7b5', shapes: [
    createShape('Ebm7b5', 'open', [null, null, 1, 2, 2, 2], [null, null, 1, 2, 3, 4]),
    createShape('Ebm7b5 Barre', 'barre', [null, 6, 7, 6, 7, null], [null, 1, 3, 2, 4, null]),
    createShape('Ebm7b5 Alt', 'alternative', [11, 12, 11, 11, null, null], [1, 3, 1, 2, null, null])
  ]},
  'Eb_add9': { root: 'Eb', quality: 'add9', shapes: [
    createShape('Ebadd9', 'open', [null, null, 1, 3, 1, 1], [null, null, 1, 4, 1, 1]),
    createShape('Ebadd9 Barre', 'barre', [null, 6, 8, 8, 6, 8], [null, 1, 2, 3, 1, 4]),
    createShape('Ebadd9 Alt', 'alternative', [11, 13, 13, 12, 13, 11], [1, 2, 3, 1, 4, 1])
  ]},
  'Eb_minorAdd9': { root: 'Eb', quality: 'minorAdd9', shapes: [
    createShape('Ebm(add9)', 'open', [null, null, 1, 3, 2, 1], [null, null, 1, 4, 2, 1]),
    createShape('Ebm(add9) Barre', 'barre', [11, 13, 11, 11, 11, 13], [1, 3, 1, 1, 1, 4]),
    createShape('Ebm(add9) Alt', 'alternative', [null, 6, 4, 3, 6, 6], [null, 3, 2, 1, 4, 4])
  ]}
};

const normalizeNote = (note: string): string => {
  // Only normalize notes that don't have direct entries in the library
  const normalizations: Record<string, string> = {
    'Db': 'C#', 'Gb': 'F#', 'D#': 'Eb', 'G#': 'Ab', 'A#': 'Bb'
  };
  return normalizations[note] || note;
};

const qualityAliases: Record<string, string> = {
  'maj': 'major',
  'min': 'minor',
  'm': 'minor',
  'dim': 'diminished',
  'aug': 'augmented',
  '7': 'dominant7',
  'maj7': 'major7',
  'min7': 'minor7',
  'm7': 'minor7'
};

export function getGuitarChordShapes(root: string, quality: string): GuitarChordShape[] {
  const normalizedRoot = normalizeNote(root);
  const normalizedQuality = qualityAliases[quality] || quality;
  
  const key = `${normalizedRoot}_${normalizedQuality}`;
  const chordData = GUITAR_CHORD_LIBRARY[key];
  
  if (chordData) {
    return chordData.shapes;
  }
  
  const originalKey = `${root}_${normalizedQuality}`;
  const originalChordData = GUITAR_CHORD_LIBRARY[originalKey];
  
  if (originalChordData) {
    return originalChordData.shapes;
  }
  
  console.warn(`Guitar chord not found: ${root} ${quality} (tried ${key} and ${originalKey})`);
  return [];
}

export function getDefaultShape(shapes: GuitarChordShape[]): GuitarChordShape | null {
  if (shapes.length === 0) return null;
  const openShape = shapes.find(s => s.type === 'open');
  return openShape || shapes[0];
}

export function getShapeByType(shapes: GuitarChordShape[], type: ChordShapeType): GuitarChordShape | null {
  return shapes.find(s => s.type === type) || null;
}
