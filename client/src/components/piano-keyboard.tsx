import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CHROMATIC_NOTES } from '@/lib/music-constants';
import { useAudio } from '@/hooks/use-audio';

interface PianoKeyboardProps {
  activeNotes?: string[];
  chordNotes?: string[];
}

export default function PianoKeyboard({ activeNotes = [], chordNotes = [] }: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const { playNote, isPlaying } = useAudio();

  const handleKeyPress = useCallback(async (note: string) => {
    setPressedKeys(prev => new Set(prev).add(note));
    await playNote(note, 1000);
    setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, 150);
  }, [playNote]);

  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
  
  const blackKeyPositions = {
    'C#': 25,
    'D#': 65,
    'F#': 145,
    'G#': 185,
    'A#': 225
  };

  const getKeyClass = (note: string, isBlack: boolean) => {
    const baseClass = isBlack
      ? 'absolute h-20 w-6 rounded-b-lg shadow-md transition-colors'
      : 'relative h-32 w-10 rounded-b-lg shadow-sm transition-colors border border-gray-300';
    
    const isPressed = pressedKeys.has(note);
    const isActive = activeNotes.includes(note);
    const isChordNote = chordNotes.includes(note);
    
    if (isBlack) {
      return `${baseClass} ${
        isPressed
          ? 'bg-gray-600'
          : isActive
          ? 'bg-blue-600'
          : isChordNote
          ? 'bg-green-600'
          : 'bg-gray-800 hover:bg-gray-700'
      }`;
    } else {
      return `${baseClass} ${
        isPressed
          ? 'bg-gray-200'
          : isActive
          ? 'bg-blue-100'
          : isChordNote
          ? 'bg-green-100'
          : 'bg-white hover:bg-gray-50'
      }`;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Piano Keyboard</h2>
        
        <div className="relative bg-gray-100 rounded-lg p-4 overflow-x-auto">
          <div className="flex relative" style={{ minWidth: '280px' }}>
            {/* White Keys */}
            {whiteKeys.map((note, index) => (
              <button
                key={note}
                onClick={() => handleKeyPress(note)}
                disabled={isPlaying}
                className={`${getKeyClass(note, false)} flex items-end justify-center pb-2 text-xs font-mono text-gray-600`}
                style={{ zIndex: 1 }}
              >
                {note}
              </button>
            ))}
            
            {/* Black Keys */}
            {blackKeys.map((note) => (
              <button
                key={note}
                onClick={() => handleKeyPress(note)}
                disabled={isPlaying}
                className={`${getKeyClass(note, true)} text-white text-xs font-mono flex items-end justify-center pb-1`}
                style={{ 
                  left: `${blackKeyPositions[note as keyof typeof blackKeyPositions]}px`, 
                  top: 0,
                  zIndex: 2
                }}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
        
        {/* Keyboard Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Active Notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Chord Notes</span>
            </div>
          </div>
          <div>Click any key to play</div>
        </div>
      </CardContent>
    </Card>
  );
}
