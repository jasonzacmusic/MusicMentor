// Color presets for chord visualization
// Extracted for better code splitting and reduced bundle size

export type ColorPreset = 'neon' | 'pastel' | 'earth' | 'sunset' | 'ocean';

export interface ChordColorScheme {
  bg: string;
  border: string;
  text: string;
  glow: string;
}

export const COLOR_PRESETS: Record<ColorPreset, Record<string, ChordColorScheme>> = {
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

export function getChordColorScheme(chordType: string, preset: ColorPreset = 'earth'): ChordColorScheme {
  const presetColors = COLOR_PRESETS[preset];
  return presetColors[chordType] || presetColors['default'];
}

export function getBranchGradient(chordType: string, isSelected: boolean): string {
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
