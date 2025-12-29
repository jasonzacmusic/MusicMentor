import { useMemo } from 'react';

interface PianoKeyboardProps {
  highlightedNotes?: string[];
  onKeyPress?: (note: string) => void;
  className?: string;
  compact?: boolean;
}

const PIANO_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];

export default function PianoKeyboard({ highlightedNotes = [], onKeyPress, className = '', compact = false }: PianoKeyboardProps) {
  const normalizedHighlightedNotes = useMemo(() => {
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

  const whiteKeyWidth = compact ? 22 : 44;
  const blackKeyWidth = compact ? 14 : 28;
  const whiteKeyHeight = compact ? 70 : 140;
  const blackKeyHeight = compact ? 45 : 90;
  const containerHeight = compact ? 88 : 176;
  const containerPadding = compact ? 6 : 12;

  const getKeyPosition = (note: string) => {
    if (isBlackKey(note)) {
      const positions: Record<string, number> = {
        'C#': 1,
        'D#': 2,
        'F#': 4,
        'G#': 5,
        'A#': 6
      };
      return positions[note] * whiteKeyWidth - blackKeyWidth / 2;
    }
    return 0;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-xl border border-slate-700/50"
        style={{ 
          height: `${containerHeight}px`, 
          padding: `${containerPadding}px`,
          width: `${7 * whiteKeyWidth + containerPadding * 2}px`
        }}
      >
        {PIANO_NOTES.filter(note => !isBlackKey(note)).map((note, whiteIndex) => (
          <button
            key={`white-${note}`}
            onClick={() => onKeyPress?.(note)}
            className={`absolute rounded-b-md transition-all duration-150 shadow-md ${
              isHighlighted(note)
                ? 'bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 border border-blue-400 shadow-blue-400/50'
                : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-300 hover:from-slate-50 hover:to-slate-200'
            }`}
            style={{
              left: `${whiteIndex * whiteKeyWidth + containerPadding}px`,
              width: `${whiteKeyWidth - 2}px`,
              height: `${whiteKeyHeight}px`,
              top: `${containerPadding}px`
            }}
          >
            {!compact && (
              <span className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-mono font-semibold ${
                isHighlighted(note) ? 'text-white' : 'text-slate-600'
              }`}>
                {note}
              </span>
            )}
          </button>
        ))}

        {PIANO_NOTES.filter(note => isBlackKey(note)).map((note) => (
          <button
            key={`black-${note}`}
            onClick={() => onKeyPress?.(note)}
            className={`absolute rounded-b-md transition-all duration-150 z-10 ${
              isHighlighted(note)
                ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 border border-blue-400 shadow-blue-500/50'
                : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border border-slate-600 hover:from-slate-600'
            }`}
            style={{
              left: `${getKeyPosition(note) + containerPadding}px`,
              width: `${blackKeyWidth}px`,
              height: `${blackKeyHeight}px`,
              top: `${containerPadding}px`
            }}
          />
        ))}
      </div>
    </div>
  );
}