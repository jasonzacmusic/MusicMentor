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
    const whiteKeyWidth = 32;
    const blackKeyWidth = 20;
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
      <div className="relative h-32 bg-gray-100 rounded-lg p-2">
        {/* White keys */}
        {PIANO_NOTES.filter(note => !isBlackKey(note)).map((note, whiteIndex) => (
          <button
            key={`white-${note}`}
            onClick={() => onKeyPress?.(note)}
            className={`absolute border border-gray-300 rounded-b transition-colors ${
              isHighlighted(note)
                ? 'bg-blue-400 border-blue-500'
                : 'bg-white hover:bg-gray-50'
            }`}
            style={{
              left: `${whiteIndex * 32}px`,
              width: '30px',
              height: '112px',
              top: '8px'
            }}
          >
            <span className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
              isHighlighted(note) ? 'text-white' : 'text-gray-700'
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
            className={`absolute border border-gray-600 rounded-b transition-colors z-10 ${
              isHighlighted(note)
                ? 'bg-blue-600 border-blue-700'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            style={{
              left: `${getKeyPosition(note, PIANO_NOTES.indexOf(note))}px`,
              width: '20px',
              height: '72px',
              top: '8px'
            }}
          >
            <span className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
              isHighlighted(note) ? 'text-white' : 'text-white'
            }`}>
              {note}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}