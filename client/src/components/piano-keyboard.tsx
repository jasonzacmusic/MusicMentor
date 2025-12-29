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
      <div className="relative h-44 bg-gradient-to-b from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-xl p-3 shadow-2xl border border-gray-700/50">
        {/* White keys */}
        {PIANO_NOTES.filter(note => !isBlackKey(note)).map((note, whiteIndex) => (
          <button
            key={`white-${note}`}
            onClick={() => onKeyPress?.(note)}
            className={`absolute rounded-b-lg transition-all duration-150 shadow-lg ${
              isHighlighted(note)
                ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-400 shadow-amber-400/50 shadow-xl'
                : 'bg-gradient-to-b from-white via-gray-50 to-gray-100 border border-gray-300 hover:from-gray-50 hover:to-gray-200 hover:shadow-xl'
            }`}
            style={{
              left: `${whiteIndex * 44 + 12}px`,
              width: '42px',
              height: '140px',
              top: '12px'
            }}
          >
            <span className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 text-sm font-mono font-semibold ${
              isHighlighted(note) ? 'text-amber-900' : 'text-gray-600'
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
                ? 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 border-2 border-amber-400 shadow-xl shadow-amber-500/50'
                : 'bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 border border-gray-600 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl'
            }`}
            style={{
              left: `${getKeyPosition(note, PIANO_NOTES.indexOf(note)) + 12}px`,
              width: '28px',
              height: '90px',
              top: '12px'
            }}
          >
            <span className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-mono font-semibold ${
              isHighlighted(note) ? 'text-amber-100' : 'text-gray-400'
            }`}>
              {note}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}