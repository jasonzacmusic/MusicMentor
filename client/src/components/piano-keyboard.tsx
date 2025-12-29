import { useMemo } from 'react';

interface PianoKeyboardProps {
  highlightedNotes?: string[];
  onKeyPress?: (note: string) => void;
  className?: string;
}

const PIANO_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];

export default function PianoKeyboard({ highlightedNotes = [], onKeyPress, className = '' }: PianoKeyboardProps) {
  const normalizedHighlightedNotes = useMemo(() => {
    // Normalize note names to handle enharmonic equivalents
    return highlightedNotes.map(note => {
      const normalizations: Record<string, string> = {
        'Db': 'C#',
        'Eb': 'D#',
        'Gb': 'F#',
        'Ab': 'G#',
        'Bb': 'A#'
      };
      return normalizations[note] || note;
    });
  }, [highlightedNotes]);

  const isHighlighted = (note: string) => {
    return normalizedHighlightedNotes.includes(note);
  };

  const isBlackKey = (note: string) => {
    return BLACK_KEYS.includes(note);
  };

  const getKeyPosition = (note: string, index: number) => {
    const whiteKeyWidth = 44;
    const blackKeyWidth = 28;
    const whiteKeysBeforeNote = PIANO_NOTES.slice(0, index).filter(n => !isBlackKey(n)).length;

    if (isBlackKey(note)) {
      // Position black keys between white keys
      const positions: Record<string, number> = {
        'C#': 0.7,
        'D#': 1.7,
        'F#': 3.7,
        'G#': 4.7,
        'A#': 5.7
      };
      return positions[note] * whiteKeyWidth - blackKeyWidth / 2;
    } else {
      return whiteKeysBeforeNote * whiteKeyWidth;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative h-44 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-3 shadow-2xl border border-slate-700/50">
        {/* White keys */}
        {PIANO_NOTES.filter(note => !isBlackKey(note)).map((note, whiteIndex) => (
          <button
            key={`white-${note}`}
            onClick={() => onKeyPress?.(note)}
            className={`absolute rounded-b-lg transition-all duration-150 shadow-lg ${
              isHighlighted(note)
                ? 'bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 border-2 border-blue-400 shadow-blue-400/50 shadow-xl'
                : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-300 hover:from-slate-50 hover:to-slate-200 hover:shadow-xl'
            }`}
            style={{
              left: `${whiteIndex * 44 + 12}px`,
              width: '42px',
              height: '140px',
              top: '12px'
            }}
          >
            <span className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 text-sm font-mono font-semibold ${
              isHighlighted(note) ? 'text-white' : 'text-slate-600'
            }`}>
              {note}
            </span>
          </button>
        ))}

        {/* Black keys */}
        {PIANO_NOTES.filter(note => isBlackKey(note)).map((note, index) => (
          <button
            key={`black-${note}`}
            onClick={() => onKeyPress?.(note)}
            className={`absolute rounded-b-lg transition-all duration-150 z-10 ${
              isHighlighted(note)
                ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 border-2 border-blue-400 shadow-xl shadow-blue-500/50'
                : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border border-slate-600 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 shadow-lg hover:shadow-xl'
            }`}
            style={{
              left: `${getKeyPosition(note, PIANO_NOTES.indexOf(note)) + 12}px`,
              width: '28px',
              height: '90px',
              top: '12px'
            }}
          >
            <span className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-mono font-semibold ${
              isHighlighted(note) ? 'text-blue-100' : 'text-slate-400'
            }`}>
              {note}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}