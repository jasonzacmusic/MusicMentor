import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getChordsForNoteBySkill, formatChordNotes, type Chord, type SkillLevel, getAllChordsContainingNote, type ChordMembership } from '@/lib/chord-theory';
import { getDiatonicChordsContainingNote, type ScaleType, type DiatonicChord } from '@/lib/scale-theory';
import { useAudio } from '@/hooks/use-audio';
import PianoKeyboard from './piano-keyboard';
import GuitarFretboard from './guitar-fretboard';
import { Piano, Guitar, ChevronDown, ChevronUp } from 'lucide-react';
import { CHORD_SYMBOLS, CHORD_NAMES } from '@/lib/music-constants';
import { useMascot, EnvironmentLayer, type ChordAnchor } from './animated-mascot';

// Format chord with jazz symbols (e.g., "C°7" instead of "C Diminished 7th")
function formatJazzChord(rootNote: string, chordType: string): string {
  const symbol = CHORD_SYMBOLS[chordType] ?? '';
  return `${rootNote}${symbol}`;
}

// Priority chord types for prominent display
const PRIORITY_CHORD_TYPES = ['major', 'minor', 'diminished', 'dominant7', 'augmented'];

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

function sortNotesByPitch(notes: string[], octaves?: number[]): string[] {
  const notesWithOctave = notes.map((note, i) => ({
    note,
    octave: octaves?.[i] ?? 0,
    chromatic: getChromaticPosition(note)
  }));
  notesWithOctave.sort((a, b) => {
    if (a.octave !== b.octave) return a.octave - b.octave;
    return a.chromatic - b.chromatic;
  });
  return notesWithOctave.map(n => n.note);
}

export type ColorPreset = 'neon' | 'pastel' | 'earth' | 'sunset' | 'ocean';

const COLOR_PRESETS: Record<ColorPreset, Record<string, { bg: string; border: string; text: string; glow: string }>> = {
  neon: {
    'major': {
      bg: 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90',
      border: 'border-emerald-400/60',
      text: 'text-white',
      glow: 'shadow-emerald-500/50'
    },
    'minor': {
      bg: 'bg-gradient-to-br from-violet-500/90 to-purple-700/90',
      border: 'border-violet-400/60',
      text: 'text-white',
      glow: 'shadow-purple-500/50'
    },
    'dominant7': {
      bg: 'bg-gradient-to-br from-orange-500/90 to-amber-600/90',
      border: 'border-orange-400/60',
      text: 'text-white',
      glow: 'shadow-orange-500/50'
    },
    'major7': {
      bg: 'bg-gradient-to-br from-pink-500/90 to-rose-600/90',
      border: 'border-pink-400/60',
      text: 'text-white',
      glow: 'shadow-pink-500/50'
    },
    'minor7': {
      bg: 'bg-gradient-to-br from-blue-500/90 to-indigo-700/90',
      border: 'border-blue-400/60',
      text: 'text-white',
      glow: 'shadow-blue-500/50'
    },
    'diminished': {
      bg: 'bg-gradient-to-br from-red-500/90 to-rose-700/90',
      border: 'border-red-400/60',
      text: 'text-white',
      glow: 'shadow-red-500/50'
    },
    'augmented': {
      bg: 'bg-gradient-to-br from-yellow-500/90 to-amber-600/90',
      border: 'border-yellow-400/60',
      text: 'text-gray-900',
      glow: 'shadow-yellow-500/50'
    },
    'sus4': {
      bg: 'bg-gradient-to-br from-cyan-500/90 to-sky-600/90',
      border: 'border-cyan-400/60',
      text: 'text-white',
      glow: 'shadow-cyan-500/50'
    },
    'sus2': {
      bg: 'bg-gradient-to-br from-lime-500/90 to-green-600/90',
      border: 'border-lime-400/60',
      text: 'text-white',
      glow: 'shadow-lime-500/50'
    },
    'diminished7': {
      bg: 'bg-gradient-to-br from-rose-600/90 to-red-800/90',
      border: 'border-rose-400/60',
      text: 'text-white',
      glow: 'shadow-rose-600/50'
    },
    '7sus4': {
      bg: 'bg-gradient-to-br from-teal-500/90 to-cyan-700/90',
      border: 'border-teal-400/60',
      text: 'text-white',
      glow: 'shadow-teal-500/50'
    },
    'minorMajor7': {
      bg: 'bg-gradient-to-br from-fuchsia-500/90 to-purple-800/90',
      border: 'border-fuchsia-400/60',
      text: 'text-white',
      glow: 'shadow-fuchsia-500/50'
    },
    'minor7b5': {
      bg: 'bg-gradient-to-br from-slate-500/90 to-zinc-700/90',
      border: 'border-slate-400/60',
      text: 'text-white',
      glow: 'shadow-slate-500/50'
    },
    'add9': {
      bg: 'bg-gradient-to-br from-emerald-400/90 to-green-600/90',
      border: 'border-emerald-300/60',
      text: 'text-white',
      glow: 'shadow-emerald-400/50'
    },
    'minorAdd9': {
      bg: 'bg-gradient-to-br from-violet-400/90 to-purple-600/90',
      border: 'border-violet-300/60',
      text: 'text-white',
      glow: 'shadow-violet-400/50'
    },
    'default': {
      bg: 'bg-gradient-to-br from-slate-500/90 to-gray-600/90',
      border: 'border-slate-400/60',
      text: 'text-white',
      glow: 'shadow-slate-500/50'
    }
  },
  pastel: {
    'major': {
      bg: 'bg-gradient-to-br from-green-300/80 to-emerald-400/80',
      border: 'border-green-200/70',
      text: 'text-gray-800',
      glow: 'shadow-green-400/40'
    },
    'minor': {
      bg: 'bg-gradient-to-br from-purple-300/80 to-violet-400/80',
      border: 'border-purple-200/70',
      text: 'text-gray-800',
      glow: 'shadow-purple-400/40'
    },
    'dominant7': {
      bg: 'bg-gradient-to-br from-orange-300/80 to-amber-400/80',
      border: 'border-orange-200/70',
      text: 'text-gray-800',
      glow: 'shadow-orange-400/40'
    },
    'major7': {
      bg: 'bg-gradient-to-br from-pink-300/80 to-rose-400/80',
      border: 'border-pink-200/70',
      text: 'text-gray-800',
      glow: 'shadow-pink-400/40'
    },
    'minor7': {
      bg: 'bg-gradient-to-br from-blue-300/80 to-indigo-400/80',
      border: 'border-blue-200/70',
      text: 'text-gray-800',
      glow: 'shadow-blue-400/40'
    },
    'diminished': {
      bg: 'bg-gradient-to-br from-red-300/80 to-rose-400/80',
      border: 'border-red-200/70',
      text: 'text-gray-800',
      glow: 'shadow-red-400/40'
    },
    'augmented': {
      bg: 'bg-gradient-to-br from-yellow-300/80 to-amber-400/80',
      border: 'border-yellow-200/70',
      text: 'text-gray-800',
      glow: 'shadow-yellow-400/40'
    },
    'sus4': {
      bg: 'bg-gradient-to-br from-cyan-300/80 to-sky-400/80',
      border: 'border-cyan-200/70',
      text: 'text-gray-800',
      glow: 'shadow-cyan-400/40'
    },
    'sus2': {
      bg: 'bg-gradient-to-br from-lime-300/80 to-green-400/80',
      border: 'border-lime-200/70',
      text: 'text-gray-800',
      glow: 'shadow-lime-400/40'
    },
    'diminished7': {
      bg: 'bg-gradient-to-br from-rose-300/80 to-red-400/80',
      border: 'border-rose-200/70',
      text: 'text-gray-800',
      glow: 'shadow-rose-400/40'
    },
    '7sus4': {
      bg: 'bg-gradient-to-br from-teal-300/80 to-cyan-400/80',
      border: 'border-teal-200/70',
      text: 'text-gray-800',
      glow: 'shadow-teal-400/40'
    },
    'minorMajor7': {
      bg: 'bg-gradient-to-br from-fuchsia-300/80 to-purple-400/80',
      border: 'border-fuchsia-200/70',
      text: 'text-gray-800',
      glow: 'shadow-fuchsia-400/40'
    },
    'minor7b5': {
      bg: 'bg-gradient-to-br from-zinc-300/80 to-slate-400/80',
      border: 'border-zinc-200/70',
      text: 'text-gray-800',
      glow: 'shadow-zinc-400/40'
    },
    'add9': {
      bg: 'bg-gradient-to-br from-emerald-300/80 to-green-400/80',
      border: 'border-emerald-200/70',
      text: 'text-gray-800',
      glow: 'shadow-emerald-400/40'
    },
    'minorAdd9': {
      bg: 'bg-gradient-to-br from-violet-300/80 to-purple-400/80',
      border: 'border-violet-200/70',
      text: 'text-gray-800',
      glow: 'shadow-violet-400/40'
    },
    'default': {
      bg: 'bg-gradient-to-br from-slate-300/80 to-gray-400/80',
      border: 'border-slate-200/70',
      text: 'text-gray-800',
      glow: 'shadow-slate-400/40'
    }
  },
  earth: {
    'major': {
      bg: 'bg-gradient-to-br from-teal-600/85 to-emerald-700/85',
      border: 'border-teal-400/50',
      text: 'text-white',
      glow: 'shadow-teal-600/40'
    },
    'minor': {
      bg: 'bg-gradient-to-br from-indigo-600/85 to-purple-700/85',
      border: 'border-indigo-400/50',
      text: 'text-white',
      glow: 'shadow-indigo-600/40'
    },
    'dominant7': {
      bg: 'bg-gradient-to-br from-amber-600/85 to-orange-700/85',
      border: 'border-amber-400/50',
      text: 'text-white',
      glow: 'shadow-amber-600/40'
    },
    'major7': {
      bg: 'bg-gradient-to-br from-rose-600/85 to-pink-700/85',
      border: 'border-rose-400/50',
      text: 'text-white',
      glow: 'shadow-rose-600/40'
    },
    'minor7': {
      bg: 'bg-gradient-to-br from-blue-600/85 to-indigo-700/85',
      border: 'border-blue-400/50',
      text: 'text-white',
      glow: 'shadow-blue-600/40'
    },
    'diminished': {
      bg: 'bg-gradient-to-br from-red-600/85 to-rose-700/85',
      border: 'border-red-400/50',
      text: 'text-white',
      glow: 'shadow-red-600/40'
    },
    'augmented': {
      bg: 'bg-gradient-to-br from-yellow-600/85 to-amber-700/85',
      border: 'border-yellow-400/50',
      text: 'text-white',
      glow: 'shadow-yellow-600/40'
    },
    'sus4': {
      bg: 'bg-gradient-to-br from-cyan-600/85 to-sky-700/85',
      border: 'border-cyan-400/50',
      text: 'text-white',
      glow: 'shadow-cyan-600/40'
    },
    'sus2': {
      bg: 'bg-gradient-to-br from-green-600/85 to-lime-700/85',
      border: 'border-green-400/50',
      text: 'text-white',
      glow: 'shadow-green-600/40'
    },
    'diminished7': {
      bg: 'bg-gradient-to-br from-rose-600/85 to-red-800/85',
      border: 'border-rose-400/50',
      text: 'text-white',
      glow: 'shadow-rose-600/40'
    },
    '7sus4': {
      bg: 'bg-gradient-to-br from-teal-600/85 to-cyan-700/85',
      border: 'border-teal-400/50',
      text: 'text-white',
      glow: 'shadow-teal-600/40'
    },
    'minorMajor7': {
      bg: 'bg-gradient-to-br from-fuchsia-600/85 to-purple-700/85',
      border: 'border-fuchsia-400/50',
      text: 'text-white',
      glow: 'shadow-fuchsia-600/40'
    },
    'minor7b5': {
      bg: 'bg-gradient-to-br from-zinc-600/85 to-slate-700/85',
      border: 'border-zinc-400/50',
      text: 'text-white',
      glow: 'shadow-zinc-600/40'
    },
    'add9': {
      bg: 'bg-gradient-to-br from-emerald-600/85 to-green-700/85',
      border: 'border-emerald-400/50',
      text: 'text-white',
      glow: 'shadow-emerald-600/40'
    },
    'minorAdd9': {
      bg: 'bg-gradient-to-br from-violet-600/85 to-purple-700/85',
      border: 'border-violet-400/50',
      text: 'text-white',
      glow: 'shadow-violet-600/40'
    },
    'default': {
      bg: 'bg-gradient-to-br from-stone-600/85 to-gray-700/85',
      border: 'border-stone-400/50',
      text: 'text-white',
      glow: 'shadow-stone-600/40'
    }
  },
  sunset: {
    'major': {
      bg: 'bg-gradient-to-br from-amber-500/90 to-orange-600/90',
      border: 'border-amber-300/60',
      text: 'text-white',
      glow: 'shadow-amber-500/50'
    },
    'minor': {
      bg: 'bg-gradient-to-br from-fuchsia-500/90 to-pink-700/90',
      border: 'border-fuchsia-400/60',
      text: 'text-white',
      glow: 'shadow-fuchsia-500/50'
    },
    'dominant7': {
      bg: 'bg-gradient-to-br from-red-500/90 to-rose-600/90',
      border: 'border-red-400/60',
      text: 'text-white',
      glow: 'shadow-red-500/50'
    },
    'major7': {
      bg: 'bg-gradient-to-br from-yellow-500/90 to-amber-600/90',
      border: 'border-yellow-400/60',
      text: 'text-gray-900',
      glow: 'shadow-yellow-500/50'
    },
    'minor7': {
      bg: 'bg-gradient-to-br from-rose-500/90 to-pink-700/90',
      border: 'border-rose-400/60',
      text: 'text-white',
      glow: 'shadow-rose-500/50'
    },
    'diminished': {
      bg: 'bg-gradient-to-br from-stone-500/90 to-zinc-700/90',
      border: 'border-stone-400/60',
      text: 'text-white',
      glow: 'shadow-stone-500/50'
    },
    'augmented': {
      bg: 'bg-gradient-to-br from-lime-500/90 to-yellow-600/90',
      border: 'border-lime-400/60',
      text: 'text-gray-900',
      glow: 'shadow-lime-500/50'
    },
    'sus4': {
      bg: 'bg-gradient-to-br from-orange-400/90 to-amber-500/90',
      border: 'border-orange-300/60',
      text: 'text-white',
      glow: 'shadow-orange-400/50'
    },
    'sus2': {
      bg: 'bg-gradient-to-br from-coral-500/90 to-red-500/90',
      border: 'border-red-300/60',
      text: 'text-white',
      glow: 'shadow-red-400/50'
    },
    'diminished7': {
      bg: 'bg-gradient-to-br from-zinc-600/90 to-slate-800/90',
      border: 'border-zinc-400/60',
      text: 'text-white',
      glow: 'shadow-zinc-500/50'
    },
    '7sus4': {
      bg: 'bg-gradient-to-br from-amber-400/90 to-yellow-600/90',
      border: 'border-amber-300/60',
      text: 'text-gray-900',
      glow: 'shadow-amber-400/50'
    },
    'minorMajor7': {
      bg: 'bg-gradient-to-br from-pink-500/90 to-rose-700/90',
      border: 'border-pink-400/60',
      text: 'text-white',
      glow: 'shadow-pink-500/50'
    },
    'minor7b5': {
      bg: 'bg-gradient-to-br from-slate-500/90 to-gray-700/90',
      border: 'border-slate-400/60',
      text: 'text-white',
      glow: 'shadow-slate-500/50'
    },
    'add9': {
      bg: 'bg-gradient-to-br from-lime-500/90 to-green-600/90',
      border: 'border-lime-400/60',
      text: 'text-gray-900',
      glow: 'shadow-lime-500/50'
    },
    'minorAdd9': {
      bg: 'bg-gradient-to-br from-fuchsia-400/90 to-pink-600/90',
      border: 'border-fuchsia-300/60',
      text: 'text-white',
      glow: 'shadow-fuchsia-400/50'
    },
    'default': {
      bg: 'bg-gradient-to-br from-orange-600/85 to-amber-700/85',
      border: 'border-orange-400/50',
      text: 'text-white',
      glow: 'shadow-orange-600/40'
    }
  },
  ocean: {
    'major': {
      bg: 'bg-gradient-to-br from-cyan-500/90 to-teal-600/90',
      border: 'border-cyan-400/60',
      text: 'text-white',
      glow: 'shadow-cyan-500/50'
    },
    'minor': {
      bg: 'bg-gradient-to-br from-slate-500/90 to-blue-800/90',
      border: 'border-slate-400/60',
      text: 'text-white',
      glow: 'shadow-slate-500/50'
    },
    'dominant7': {
      bg: 'bg-gradient-to-br from-sky-500/90 to-blue-600/90',
      border: 'border-sky-400/60',
      text: 'text-white',
      glow: 'shadow-sky-500/50'
    },
    'major7': {
      bg: 'bg-gradient-to-br from-teal-400/90 to-emerald-500/90',
      border: 'border-teal-300/60',
      text: 'text-white',
      glow: 'shadow-teal-400/50'
    },
    'minor7': {
      bg: 'bg-gradient-to-br from-indigo-500/90 to-blue-700/90',
      border: 'border-indigo-400/60',
      text: 'text-white',
      glow: 'shadow-indigo-500/50'
    },
    'diminished': {
      bg: 'bg-gradient-to-br from-gray-500/90 to-slate-700/90',
      border: 'border-gray-400/60',
      text: 'text-white',
      glow: 'shadow-gray-500/50'
    },
    'augmented': {
      bg: 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90',
      border: 'border-emerald-400/60',
      text: 'text-white',
      glow: 'shadow-emerald-500/50'
    },
    'sus4': {
      bg: 'bg-gradient-to-br from-sky-400/90 to-cyan-500/90',
      border: 'border-sky-300/60',
      text: 'text-white',
      glow: 'shadow-sky-400/50'
    },
    'sus2': {
      bg: 'bg-gradient-to-br from-blue-400/90 to-indigo-500/90',
      border: 'border-blue-300/60',
      text: 'text-white',
      glow: 'shadow-blue-400/50'
    },
    'diminished7': {
      bg: 'bg-gradient-to-br from-slate-600/90 to-zinc-800/90',
      border: 'border-slate-400/60',
      text: 'text-white',
      glow: 'shadow-slate-500/50'
    },
    '7sus4': {
      bg: 'bg-gradient-to-br from-sky-500/90 to-cyan-600/90',
      border: 'border-sky-400/60',
      text: 'text-white',
      glow: 'shadow-sky-500/50'
    },
    'minorMajor7': {
      bg: 'bg-gradient-to-br from-purple-500/90 to-indigo-700/90',
      border: 'border-purple-400/60',
      text: 'text-white',
      glow: 'shadow-purple-500/50'
    },
    'minor7b5': {
      bg: 'bg-gradient-to-br from-zinc-500/90 to-slate-700/90',
      border: 'border-zinc-400/60',
      text: 'text-white',
      glow: 'shadow-zinc-500/50'
    },
    'add9': {
      bg: 'bg-gradient-to-br from-teal-400/90 to-emerald-600/90',
      border: 'border-teal-300/60',
      text: 'text-white',
      glow: 'shadow-teal-400/50'
    },
    'minorAdd9': {
      bg: 'bg-gradient-to-br from-violet-500/90 to-purple-700/90',
      border: 'border-violet-400/60',
      text: 'text-white',
      glow: 'shadow-violet-500/50'
    },
    'default': {
      bg: 'bg-gradient-to-br from-blue-600/85 to-slate-700/85',
      border: 'border-blue-400/50',
      text: 'text-white',
      glow: 'shadow-blue-600/40'
    }
  }
};

function getChordColorScheme(chordType: string, preset: ColorPreset = 'earth') {
  const presetColors = COLOR_PRESETS[preset];
  return presetColors[chordType] || presetColors['default'];
}

function getBranchGradient(chordType: string, isSelected: boolean): string {
  if (!isSelected) {
    return 'linear-gradient(90deg, rgba(100, 116, 139, 0.3), rgba(100, 116, 139, 0.6))';
  }
  
  const colorMap: Record<string, string> = {
    'major': 'linear-gradient(90deg, rgba(52, 211, 153, 0.4), rgba(20, 184, 166, 1))',
    'minor': 'linear-gradient(90deg, rgba(167, 139, 250, 0.4), rgba(147, 51, 234, 1))',
    'dominant7': 'linear-gradient(90deg, rgba(251, 146, 60, 0.4), rgba(245, 158, 11, 1))',
    'major7': 'linear-gradient(90deg, rgba(244, 114, 182, 0.4), rgba(244, 63, 94, 1))',
    'minor7': 'linear-gradient(90deg, rgba(96, 165, 250, 0.4), rgba(79, 70, 229, 1))',
    'diminished': 'linear-gradient(90deg, rgba(248, 113, 113, 0.4), rgba(225, 29, 72, 1))',
    'augmented': 'linear-gradient(90deg, rgba(250, 204, 21, 0.4), rgba(245, 158, 11, 1))',
    'sus4': 'linear-gradient(90deg, rgba(34, 211, 238, 0.4), rgba(14, 165, 233, 1))',
    'sus2': 'linear-gradient(90deg, rgba(163, 230, 53, 0.4), rgba(34, 197, 94, 1))',
  };
  
  return colorMap[chordType] || 'linear-gradient(90deg, rgba(148, 163, 184, 0.4), rgba(100, 116, 139, 1))';
}

interface ChordSkillSelectorProps {
  baseNote: string;
  noteIndex: number;
  selectedChord?: Chord | null;
  onChordSelect: (chord: Chord | null, noteIndex: number) => void;
  inversionMode?: 'auto' | 'root' | 'first' | 'second';
  onInversionChange?: (mode: 'auto' | 'root' | 'first' | 'second') => void;
  skillLevel?: SkillLevel;
  treeLayout?: boolean;
  isPlaying?: boolean;
  colorPreset?: ColorPreset;
  expandedView?: boolean;
  showPiano?: boolean;
  showGuitar?: boolean;
  onAnchorUpdate?: (anchor: ChordAnchor) => void;
  diatonicKey?: string;
  diatonicScale?: ScaleType;
  diatonicMode?: number;
}

export default function ChordSkillSelector({
  baseNote,
  noteIndex,
  selectedChord: parentSelectedChord,
  onChordSelect,
  inversionMode = 'auto',
  onInversionChange,
  skillLevel = 'beginner',
  treeLayout = false,
  isPlaying = false,
  colorPreset = 'earth',
  expandedView = false,
  showPiano = false,
  showGuitar = false,
  onAnchorUpdate,
  diatonicKey,
  diatonicScale,
  diatonicMode
}: ChordSkillSelectorProps) {
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const [diatonicSeventhChords, setDiatonicSeventhChords] = useState<DiatonicChord[]>([]);
  const { playChord } = useAudio();
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const centerButtonRef = useRef<HTMLButtonElement>(null);
  const chordButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const selectedChord = parentSelectedChord;

  useEffect(() => {
    if (skillLevel === 'diatonic' && diatonicKey && diatonicScale) {
      const mode = diatonicMode || 1;
      const diatonicChords = getDiatonicChordsContainingNote(baseNote, diatonicKey, diatonicScale, mode);
      const triadsAsChords: Chord[] = diatonicChords.triads.map(dc => ({
        name: dc.name,
        notes: dc.notes,
        type: dc.type,
        rootNote: dc.rootNote,
        category: 'triad' as const,
        romanNumeral: dc.romanNumeral
      }));

      // If a seventh chord is selected, add it to the tree display
      if (selectedChord && selectedChord.category === 'seventh') {
        // Check if this seventh chord is in the diatonic seventh chords
        const matchingSeventh = diatonicChords.seventhChords.find(sc => sc.name === selectedChord.name);
        if (matchingSeventh && !triadsAsChords.find(tc => tc.name === matchingSeventh.name)) {
          // Add the selected seventh chord to the display
          triadsAsChords.push({
            name: matchingSeventh.name,
            notes: matchingSeventh.notes,
            type: matchingSeventh.type,
            rootNote: matchingSeventh.rootNote,
            category: 'seventh' as const,
            romanNumeral: matchingSeventh.romanNumeral
          });
        }
      }

      setAvailableChords(triadsAsChords);
      setDiatonicSeventhChords(diatonicChords.seventhChords);
    } else {
      const chords = getChordsForNoteBySkill(baseNote, skillLevel);
      setAvailableChords(chords);
      setDiatonicSeventhChords([]);
    }
  }, [baseNote, skillLevel, diatonicKey, diatonicScale, diatonicMode, selectedChord]);

  const handleSelectChord = useCallback((chord: Chord, buttonElement?: HTMLButtonElement) => {
    onChordSelect(chord, noteIndex);
    
    const targetElement = buttonElement || chordButtonRefs.current.get(chord.name);
    if (onAnchorUpdate && targetElement) {
      const rect = targetElement.getBoundingClientRect();
      onAnchorUpdate({
        id: `tree-${noteIndex}`,
        noteIndex,
        chordId: chord.name,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        element: targetElement,
      });
    }
  }, [onChordSelect, noteIndex, onAnchorUpdate]);

  const handleDeselectChord = () => {
    onChordSelect(null, noteIndex);
    if (onAnchorUpdate && centerButtonRef.current) {
      const rect = centerButtonRef.current.getBoundingClientRect();
      onAnchorUpdate({
        id: `tree-${noteIndex}`,
        noteIndex,
        chordId: null,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        element: centerButtonRef.current,
      });
    }
  };

  useEffect(() => {
    if (isPlaying && selectedChord && onAnchorUpdate) {
      const chordButton = chordButtonRefs.current.get(selectedChord.name);
      if (chordButton) {
        const rect = chordButton.getBoundingClientRect();
        onAnchorUpdate({
          id: `tree-${noteIndex}`,
          noteIndex,
          chordId: selectedChord.name,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          element: chordButton,
        });
      }
    } else if (!selectedChord && onAnchorUpdate && centerButtonRef.current) {
      const rect = centerButtonRef.current.getBoundingClientRect();
      onAnchorUpdate({
        id: `tree-${noteIndex}`,
        noteIndex,
        chordId: null,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        element: centerButtonRef.current,
      });
    }
  }, [isPlaying, selectedChord, noteIndex, onAnchorUpdate]);

  const [showPianoView, setShowPianoView] = useState(false);
  const [showGuitarView, setShowGuitarView] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Major': true, 'Minor': true, 'Dominant 7th': true, 'Major 7th': true, 'Minor 7th': true,
    'Diminished': true, 'Diminished 7th': true, 'Augmented': true, 'sus2': false, 'sus4': false,
    '7sus4': false, 'Minor(Maj7)': false, 'Minor 7b5': false, 'Add 9': false, 'Minor Add 9': false
  });

  const isIntermediateMode = skillLevel === 'intermediate';
  const triads = availableChords.filter(c => c.category === 'triad' || !c.parentType);
  const majorBranches = availableChords.filter(c => c.parentType === 'major');
  const minorBranches = availableChords.filter(c => c.parentType === 'minor');

  const chordsByType = useMemo(() => {
    if (!isIntermediateMode) return {};
    const grouped: Record<string, Chord[]> = {};
    const typeOrder = ['Major', 'Minor', 'Dominant 7th', 'Major 7th', 'Minor 7th', 'Diminished', 'Diminished 7th', 
                       'Augmented', 'sus2', 'sus4', '7sus4', 'Minor(Maj7)', 'Minor 7b5', 'Add 9', 'Minor Add 9'];
    const typeMap: Record<string, string> = {
      'major': 'Major', 'minor': 'Minor', 'dominant7': 'Dominant 7th', 'major7': 'Major 7th', 
      'minor7': 'Minor 7th', 'diminished': 'Diminished', 'diminished7': 'Diminished 7th',
      'augmented': 'Augmented', 'sus2': 'sus2', 'sus4': 'sus4', '7sus4': '7sus4',
      'minorMajor7': 'Minor(Maj7)', 'minor7b5': 'Minor 7b5', 'add9': 'Add 9', 'minorAdd9': 'Minor Add 9'
    };
    for (const chord of availableChords) {
      const typeName = typeMap[chord.type] || chord.type;
      if (!grouped[typeName]) grouped[typeName] = [];
      grouped[typeName].push(chord);
    }
    const sorted: Record<string, Chord[]> = {};
    for (const type of typeOrder) {
      if (grouped[type]) sorted[type] = grouped[type];
    }
    return sorted;
  }, [availableChords, isIntermediateMode]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  if (treeLayout) {
    if (isIntermediateMode && availableChords.length > 6) {
      return (
        <div className={`flex flex-col h-full w-full overflow-hidden transition-all duration-300 ${
          expandedView ? 'max-w-sm' : 'max-w-xs'
        }`}>
          {/* Header with base note */}
          <div className="flex items-center justify-center mb-1 px-1">
            <button
              onClick={handleDeselectChord}
              className={`px-3 py-1 rounded-full flex items-center gap-1 transition-all duration-300
                ${isPlaying
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-300 shadow-md'
                  : selectedChord
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-500/50 ring-1 ring-emerald-400/60'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50'
                }`}
              title={selectedChord ? 'Click to clear selection' : baseNote}
            >
              <span className="text-sm font-bold text-white">{baseNote}</span>
              {selectedChord && (
                <span className="text-[10px] text-slate-300">• {selectedChord.name}</span>
              )}
            </button>
          </div>

          {/* Scrollable chord categories */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-1 scrollbar-thin">
            {Object.entries(chordsByType).map(([typeName, chords]) => {
              const isExpanded = expandedCategories[typeName] ?? false;
              const hasSelection = chords.some(c => c.name === selectedChord?.name);
              
              return (
                <div key={typeName} className="border border-slate-700/30 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(typeName)}
                    className={`w-full flex items-center justify-between px-2 py-1 text-left transition-all ${
                      hasSelection ? 'bg-emerald-900/30' : 'bg-slate-800/40 hover:bg-slate-800/60'
                    }`}
                    data-testid={`category-${typeName.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${hasSelection ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {typeName} <span className="text-slate-500">({chords.length})</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="p-1.5 flex flex-wrap gap-1 bg-slate-900/30">
                      {chords.map((chord) => {
                        const isSelected = selectedChord?.name === chord.name;
                        const colorScheme = getChordColorScheme(chord.type, colorPreset);
                        const roleLabel = chord.noteRole || 'Root';
                        const isPriority = PRIORITY_CHORD_TYPES.includes(chord.type);
                        const jazzName = formatJazzChord(chord.rootNote, chord.type);
                        
                        return (
                          <button
                            key={`${chord.name}-${chord.noteRole}`}
                            onClick={() => handleSelectChord(chord)}
                            title={`${chord.rootNote} ${CHORD_NAMES[chord.type] || chord.type} - ${baseNote} is ${roleLabel}`}
                            className={`group relative rounded font-medium transition-all border
                              ${isPriority ? 'px-2 py-1 text-[11px]' : 'px-1.5 py-0.5 text-[9px]'}
                              ${isSelected 
                                ? `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-md scale-105` 
                                : isPriority
                                  ? `bg-slate-700/80 border-slate-500/50 text-white hover:bg-slate-600/80 hover:scale-105`
                                  : `bg-slate-800/60 border-slate-600/40 text-slate-300 hover:bg-slate-700/60 hover:scale-102`
                              }
                              ${isPlaying && isSelected ? 'animate-pulse' : ''}`}
                            data-testid={`chord-chip-${chord.rootNote}-${chord.type}`}
                          >
                            <span className="font-bold">{jazzName}</span>
                            <span className={`ml-1 px-1 py-0 rounded text-[7px] ${
                              isSelected ? 'bg-white/25' : 'bg-slate-600/60'
                            }`}>
                              {roleLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected chord info and instruments (optional) */}
          {selectedChord && (
            <div className="mt-1 pt-1 border-t border-slate-700/30">
              <div className={`px-2 py-1.5 rounded text-center transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-emerald-600/60 to-teal-600/60 border border-emerald-400/30'
                  : 'bg-slate-800/60 border border-slate-600/20'
              }`}>
                <div className="text-sm font-bold text-white">
                  {formatJazzChord(selectedChord.rootNote, selectedChord.type)}
                </div>
                <div className="text-[8px] text-slate-400 uppercase tracking-wide">
                  {CHORD_NAMES[selectedChord.type] || selectedChord.type}
                </div>
                <div className="text-[9px] text-slate-300 mt-0.5">
                  {sortNotesByPitch(selectedChord.notes, selectedChord.octaves).join(' • ')}
                  {selectedChord.noteRole && (
                    <span className="ml-1 px-1 py-0 rounded bg-amber-500/30 text-amber-200 text-[8px]">
                      {baseNote} is {selectedChord.noteRole}
                    </span>
                  )}
                </div>
              </div>
              
              {showPiano && (
                <div className="mt-1">
                  <PianoKeyboard
                    highlightedNotes={selectedChord.notes}
                    compact={true}
                    onKeyPress={(note) => {}}
                  />
                </div>
              )}
              
              {showGuitar && (
                <div className="mt-1">
                  <GuitarFretboard
                    root={selectedChord.rootNote}
                    quality={selectedChord.type}
                    compact={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    const treeSize = expandedView ? 'w-72 h-72' : 'w-64 h-64';
    const treeRadius = expandedView ? 100 : 90;
    const centerSize = expandedView ? 'w-24 h-24' : 'w-20 h-20';
    const chordButtonSize = expandedView ? 'w-16 h-16' : 'w-14 h-14';
    
    const mascotContext = useMascot();
    const currentAnimal = mascotContext.animal;

    return (
      <div className="flex flex-col items-center w-full">
        <div 
          ref={treeContainerRef}
          className={`relative ${treeSize} mx-auto flex items-center justify-center transition-all duration-300 ${
            isPlaying ? 'scale-105' : ''
          }`}
        >
          {skillLevel !== 'diatonic' && (
            <EnvironmentLayer 
              animal={currentAnimal} 
              noteIndex={noteIndex} 
              isPlaying={isPlaying}
              enabled={mascotContext.enabled}
            />
          )}

          <div className={`absolute w-56 h-56 rounded-full border transition-all duration-300 ${
            isPlaying ? 'border-emerald-400/50 shadow-lg shadow-emerald-500/20' : 'border-slate-700/30'
          }`} style={{ zIndex: 2 }} />
          <div className={`absolute w-48 h-48 rounded-full border transition-all duration-300 ${
            isPlaying ? 'border-emerald-400/30' : 'border-slate-700/20'
          }`} style={{ zIndex: 2 }} />
          
          <div className="absolute z-20 flex items-center justify-center">
            <button
              ref={centerButtonRef}
              onClick={handleDeselectChord}
              className={`${centerSize} rounded-full flex items-center justify-center transition-all duration-300 
                ${isPlaying 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-emerald-300 shadow-xl shadow-emerald-500/50 scale-110 animate-pulse'
                  : selectedChord
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-500/50 shadow-xl ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-background hover:scale-105'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600/50 shadow-xl hover:border-slate-500/70'
                }`}
              title={selectedChord ? 'Click to clear selection' : baseNote}
            >
              <span className={`${expandedView ? 'text-3xl' : 'text-2xl'} font-bold tracking-tight drop-shadow-md ${
                isPlaying ? 'text-white' : 'text-white'
              }`}>{baseNote}</span>
            </button>
          </div>

          {availableChords.map((chord, index) => {
            // Calculate angles based on number of chords for better spacing
            let angle: number;
            const numChords = availableChords.length;

            if (numChords <= 3) {
              // For 3 or fewer chords, space them at 120-degree intervals starting from top
              const angleStep = 120;
              angle = 270 + (index * angleStep);
            } else if (numChords === 4) {
              // For 4 chords, space at 90-degree intervals
              const angles = [270, 0, 90, 180];
              angle = angles[index] || 0;
            } else if (numChords === 5) {
              // For 5 chords, space at 72-degree intervals
              const angleStep = 72;
              angle = 270 + (index * angleStep);
            } else {
              // For 6 chords, use the original layout
              const angles = [270, 330, 30, 90, 150, 210];
              angle = angles[index] || 0;
            }

            const x = Math.cos(angle * Math.PI / 180) * treeRadius;
            const y = Math.sin(angle * Math.PI / 180) * treeRadius;

            const isSelected = selectedChord?.name === chord.name;
            const colorScheme = getChordColorScheme(chord.type, colorPreset);

            return (
              <div key={index} className="absolute">
                {/* Vine/rope connector */}
                <svg 
                  className="absolute pointer-events-none overflow-visible"
                  style={{ 
                    left: '50%', 
                    top: '50%', 
                    width: '200px', 
                    height: '200px',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 5
                  }}
                >
                  <defs>
                    <linearGradient id={`vineGrad-${noteIndex}-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={isSelected ? '#22c55e' : '#4b5563'} stopOpacity="0.4" />
                      <stop offset="50%" stopColor={isSelected ? '#4ade80' : '#6b7280'} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={isSelected ? '#22c55e' : '#4b5563'} stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 100 100 Q ${100 + x * 0.5} ${100 + y * 0.5 + 10} ${100 + x * 0.55} ${100 + y * 0.55}`}
                    fill="none"
                    stroke={`url(#vineGrad-${noteIndex}-${index})`}
                    strokeWidth={isSelected ? 4 : 3}
                    strokeLinecap="round"
                  />
                </svg>

                <div
                  className="absolute z-30"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-r from-emerald-400/40 via-teal-300/50 to-emerald-400/40 animate-spin" style={{ animationDuration: '3s' }} />
                      <div className="absolute inset-0 -m-1 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                    </>
                  )}
                  <button
                    ref={(el) => {
                      if (el) chordButtonRefs.current.set(chord.name, el);
                    }}
                    className={`relative ${chordButtonSize} rounded-full flex flex-col items-center justify-center cursor-pointer
                      transition-all duration-200 font-semibold backdrop-blur-sm
                      ${chord.category === 'seventh'
                        ? 'border-[3px] border-double'
                        : 'border-2'
                      }
                      ${isSelected
                        ? `${colorScheme.bg} border-emerald-300 ${colorScheme.text} shadow-xl shadow-emerald-500/50 scale-115 ring-4 ring-emerald-400/60 ring-offset-2 ring-offset-slate-900`
                        : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-md ${colorScheme.glow} opacity-50 hover:opacity-90 hover:scale-105 grayscale-[30%] hover:grayscale-0`
                      }
                      ${isPlaying && isSelected ? 'animate-pulse' : ''}`}
                    onClick={(e) => handleSelectChord(chord, e.currentTarget)}
                    title={`${chord.rootNote} ${CHORD_NAMES[chord.type] || chord.type}`}
                    data-testid={`chord-button-${chord.type}-${index}`}
                  >
                    {chord.romanNumeral ? (
                      <div className="flex flex-col items-center gap-0">
                        <span className={`${expandedView ? 'text-[11px]' : 'text-[10px]'} font-bold text-center leading-tight drop-shadow-md opacity-80`}>
                          {chord.romanNumeral}
                        </span>
                        <span className={`${expandedView ? 'text-[13px]' : 'text-[12px]'} font-bold text-center leading-tight drop-shadow-md`}>
                          {formatJazzChord(chord.rootNote, chord.type)}
                        </span>
                      </div>
                    ) : (
                      <span className={`${expandedView ? 'text-[14px]' : 'text-[13px]'} font-bold text-center leading-tight drop-shadow-md`}>
                        {formatJazzChord(chord.rootNote, chord.type)}
                      </span>
                    )}
                    {chord.category === 'seventh' && !isSelected && (
                      <span className="absolute -top-1 -left-1 w-4 h-4 bg-purple-500/90 rounded-full border-2 border-purple-300 shadow-lg flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">7</span>
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <span className="text-[6px] text-emerald-900 font-bold">✓</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex flex-col items-center">
          {selectedChord ? (
            <>
              <div className={`mb-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-emerald-600/80 to-teal-600/80 border border-emerald-400/50 shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-600/30 shadow-md'
              }`}>
                <h4 className="text-base font-bold text-white text-center tracking-wide">
                  {formatJazzChord(selectedChord.rootNote, selectedChord.type)}
                  {selectedChord.inversion !== undefined && selectedChord.inversion > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">
                      {selectedChord.inversion === 1 ? '1st' : '2nd'}
                    </span>
                  )}
                </h4>
                <div className="text-[9px] text-slate-400 text-center uppercase tracking-wide">
                  {CHORD_NAMES[selectedChord.type] || selectedChord.type}
                </div>
                <div className="text-xs text-slate-300 text-center font-medium mt-0.5">
                  {sortNotesByPitch(selectedChord.notes, selectedChord.octaves).join(' • ')}
                </div>
              </div>
              <PianoKeyboard
                highlightedNotes={selectedChord.notes}
                compact={true}
                onKeyPress={(note) => {}}
              />
            </>
          ) : (
            <>
              <div className={`mb-2 px-4 py-1.5 rounded-lg transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-slate-700/80 to-slate-800/80 border border-slate-500/50 shadow-lg shadow-slate-500/20'
                  : 'bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/30 shadow-md'
              }`}>
                <h4 className="text-sm font-semibold text-slate-300 text-center tracking-wide">
                  {baseNote}
                </h4>
                <div className="text-xs text-slate-500 text-center">
                  Single note
                </div>
              </div>
              <PianoKeyboard
                highlightedNotes={[baseNote]}
                compact={true}
                onKeyPress={(note) => {}}
              />
            </>
          )}
        </div>

        {skillLevel === 'diatonic' && diatonicSeventhChords.length > 0 && (
          <div className="mt-3 w-full">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider text-center mb-2 font-semibold">
              Seventh Chords
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {diatonicSeventhChords.map((chord, index) => {
                const colorScheme = getChordColorScheme(chord.type, colorPreset);
                const isSelected = selectedChord?.name === chord.name;
                const chordAsRegular: Chord = {
                  name: chord.name,
                  notes: chord.notes,
                  type: chord.type,
                  rootNote: chord.rootNote,
                  category: 'seventh' as const,
                  romanNumeral: chord.romanNumeral
                };

                return (
                  <button
                    key={index}
                    ref={(el) => {
                      if (el) chordButtonRefs.current.set(chord.name, el);
                    }}
                    onClick={() => handleSelectChord(chordAsRegular)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border
                      ${isSelected
                        ? `${colorScheme.bg} border-emerald-300 ${colorScheme.text} shadow-md scale-105`
                        : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} opacity-60 hover:opacity-90 hover:scale-105`
                      }`}
                    title={chord.romanNumeral ? `${chord.romanNumeral} - ${chord.function}` : chord.name}
                    data-testid={`seventh-chord-${chord.rootNote}-${chord.type}`}
                  >
                    {formatJazzChord(chord.rootNote, chord.type)}
                    {chord.romanNumeral && (
                      <span className="ml-1 text-[9px] opacity-70">({chord.romanNumeral})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedChord && (
          <div className="mt-4">
            <GuitarFretboard
              root={selectedChord.rootNote}
              quality={selectedChord.type}
              compact={true}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Chord Options for <span className="text-primary">{baseNote}</span>
        </h2>
        <div className="text-sm text-muted-foreground">
          Select a harmonizing chord
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {selectedChord && (
              <div className="flex justify-center">
                <Button
                  onClick={handleDeselectChord}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                >
                  Clear Selection
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {availableChords.map((chord, index) => {
                const colorScheme = getChordColorScheme(chord.type, colorPreset);
                const isSelected = selectedChord?.name === chord.name;
                
                return (
                <div
                  key={index}
                  onClick={() => handleSelectChord(chord)}
                  className={`rounded-xl p-3 cursor-pointer transition-all duration-200 border-2 backdrop-blur-sm ${
                    isSelected
                      ? `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-lg ${colorScheme.glow} scale-[1.02]`
                      : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-md ${colorScheme.glow} opacity-80 hover:opacity-100 hover:scale-[1.02]`
                  }`}
                  title={`${chord.rootNote} ${CHORD_NAMES[chord.type] || chord.type}`}
                  data-testid={`chord-grid-${chord.type}-${index}`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-lg text-center drop-shadow-md">
                      {formatJazzChord(chord.rootNote, chord.type)}
                    </div>
                    <div className="text-[9px] text-center opacity-75 uppercase tracking-wide">
                      {CHORD_NAMES[chord.type] || chord.type}
                    </div>

                    {selectedChord?.name === chord.name && onInversionChange && (
                      <div className="flex justify-center space-x-1 mt-2">
                        {[
                          { value: 'auto', label: 'Auto' },
                          { value: 'root', label: 'Root' },
                          { value: 'first', label: '1st' },
                          { value: 'second', label: '2nd' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              onInversionChange(option.value as any);
                            }}
                            className={`px-2 py-1 text-xs rounded border transition-colors font-medium ${
                              inversionMode === option.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'text-muted-foreground border-border bg-background hover:bg-muted'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedChord && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-lg font-bold text-primary">{formatJazzChord(selectedChord.rootNote, selectedChord.type)}</span>
                <span className="text-xs text-muted-foreground ml-2">{CHORD_NAMES[selectedChord.type] || selectedChord.type}</span>
              </div>
              <div className="flex justify-center">
                <PianoKeyboard
                  highlightedNotes={selectedChord.notes}
                  compact={true}
                  onKeyPress={(note) => {}}
                />
              </div>
              <div className="flex justify-center">
                <GuitarFretboard
                  root={selectedChord.rootNote}
                  quality={selectedChord.type}
                  compact={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}