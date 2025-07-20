import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBeginnerChordsForNote, formatChordNotes, type Chord } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import PianoKeyboard from './piano-keyboard';

interface ChordSkillSelectorProps {
  baseNote: string;
  noteIndex: number;
  selectedChord?: Chord | null;
  onChordSelect: (chord: Chord | null, noteIndex: number) => void;
  inversionMode?: 'auto' | 'root' | 'first' | 'second';
  onInversionChange?: (mode: 'auto' | 'root' | 'first' | 'second') => void;
  treeLayout?: boolean;
}

export default function ChordSkillSelector({ baseNote, noteIndex, selectedChord: parentSelectedChord, onChordSelect, inversionMode = 'auto', onInversionChange, treeLayout = false }: ChordSkillSelectorProps) {
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const { playChord, isPlaying } = useAudio();

  // Use the parent's selected chord if provided, otherwise use local state
  const selectedChord = parentSelectedChord;

  useEffect(() => {
    // Always use beginner chords
    const chords = getBeginnerChordsForNote(baseNote);
    setAvailableChords(chords);
  }, [baseNote]);

  const handleSelectChord = (chord: Chord) => {
    onChordSelect(chord, noteIndex);
  };

  const handleDeselectChord = () => {
    onChordSelect(null, noteIndex);
  };

  if (treeLayout) {
    // Tree layout with chords arranged in a circle around the central note
    return (
      <div className="relative w-96 h-96 mx-auto flex items-center justify-center">
        {/* Central Root Note (Orange Circle) */}
        <div className="absolute z-20 flex items-center justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
            <span className="text-3xl font-bold text-white">{baseNote}</span>
          </div>
        </div>

        {/* Chord branches arranged with Major on right, Minor on left */}
        {availableChords.map((chord, index) => {
          // Separate Major and Minor chords by position
          const isMajor = !chord.name.includes('m') || chord.name.includes('Major');
          
          // Right side angles for Major chords: 30°, 90°, 150°
          // Left side angles for Minor chords: -30°, -90°, -150°
          const rightAngles = [30, 90, 150];
          const leftAngles = [-30, -90, -150];
          
          let angle;
          let positionIndex;
          
          if (isMajor) {
            // Count how many major chords we've seen so far
            const majorCount = availableChords.slice(0, index).filter(c => 
              !c.name.includes('m') || c.name.includes('Major')
            ).length;
            angle = rightAngles[majorCount % 3];
            positionIndex = majorCount;
          } else {
            // Count how many minor chords we've seen so far
            const minorCount = availableChords.slice(0, index).filter(c => 
              c.name.includes('m') && !c.name.includes('Major')
            ).length;
            angle = leftAngles[minorCount % 3];
            positionIndex = minorCount + 3; // Offset for color scheme
          }
          
          const radius = 130;
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;
          
          const isSelected = selectedChord?.name === chord.name;
          
          // Unique colors for each chord position
          const chordColors = [
            { // Position 0
              default: 'from-blue-200 to-blue-400 border-blue-300 text-blue-800',
              selected: 'from-blue-500 to-blue-700 border-blue-400 text-white',
              hover: 'hover:from-blue-300 hover:to-blue-500',
              branch: '#3b82f6'
            },
            { // Position 1
              default: 'from-purple-200 to-purple-400 border-purple-300 text-purple-800',
              selected: 'from-purple-500 to-purple-700 border-purple-400 text-white',
              hover: 'hover:from-purple-300 hover:to-purple-500',
              branch: '#8b5cf6'
            },
            { // Position 2
              default: 'from-red-200 to-red-400 border-red-300 text-red-800',
              selected: 'from-red-500 to-red-700 border-red-400 text-white',
              hover: 'hover:from-red-300 hover:to-red-500',
              branch: '#ef4444'
            },
            { // Position 3
              default: 'from-pink-200 to-pink-400 border-pink-300 text-pink-800',
              selected: 'from-pink-500 to-pink-700 border-pink-400 text-white',
              hover: 'hover:from-pink-300 hover:to-pink-500',
              branch: '#ec4899'
            },
            { // Position 4
              default: 'from-green-200 to-green-400 border-green-300 text-green-800',
              selected: 'from-green-500 to-green-700 border-green-400 text-white',
              hover: 'hover:from-green-300 hover:to-green-500',
              branch: '#10b981'
            },
            { // Position 5
              default: 'from-teal-200 to-teal-400 border-teal-300 text-teal-800',
              selected: 'from-teal-500 to-teal-700 border-teal-400 text-white',
              hover: 'hover:from-teal-300 hover:to-teal-500',
              branch: '#14b8a6'
            }
          ];
          
          const colorScheme = chordColors[positionIndex % 6];
          
          // Extract interval name from chord name
          const getIntervalName = (chordName: string) => {
            if (chordName.includes('(p5)')) return 'p5';
            if (chordName.includes('(M3)')) return 'M3';
            if (chordName.includes('(m3)')) return 'm3';
            return 'Root';
          };
          
          const intervalName = getIntervalName(chord.name);
          
          return (
            <div key={index} className="absolute">
              {/* Simple straight branch line - properly positioned */}
              <div 
                className="absolute z-10"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${radius - 48}px`,
                  height: '3px',
                  backgroundColor: colorScheme.branch,
                  transform: `translate(0, -50%) rotate(${angle}deg)`,
                  transformOrigin: 'left center'
                }}
              />
              
              {/* Chord button (leaf) - positioned at end of branch */}
              <div
                className={`absolute w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border-3 shadow-xl transform hover:scale-110 z-30 ${
                  isSelected 
                    ? `bg-gradient-to-br ${colorScheme.selected} scale-115 shadow-2xl` 
                    : `bg-gradient-to-br ${colorScheme.default} ${colorScheme.hover}`
                }`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => handleSelectChord(chord)}
              >
                <span className="text-xs font-bold text-center leading-tight px-1">
                  {chord.name}
                </span>
              </div>
              
              {/* Interval label outside the circle */}
              <div
                className="absolute text-xs font-semibold text-gray-600 z-40"
                style={{
                  left: `calc(50% + ${x + Math.cos(angle * Math.PI / 180) * 35}px)`,
                  top: `calc(50% + ${y + Math.sin(angle * Math.PI / 180) * 35}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {intervalName}
              </div>
            </div>
          );
        })}
        
        {/* Clear button - positioned below the tree */}
        {selectedChord && (
          <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2">
            <Button
              onClick={handleDeselectChord}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Original grid layout for non-tree mode
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Chord Options for {baseNote}
        </h2>
        <div className="text-sm text-gray-600 mb-4">
          Select a harmonizing chord
        </div>
      </div>

      {/* Chord Options */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Clear button */}
            {selectedChord && (
              <div className="flex justify-center">
                <Button
                  onClick={handleDeselectChord}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear Selection
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {availableChords.map((chord, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectChord(chord)}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedChord?.name === chord.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="font-medium text-gray-900 text-sm text-center">
                      {chord.name}
                    </div>
                    
                    {/* Show inversion controls only when this chord is selected */}
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
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              inversionMode === option.value 
                                ? 'bg-purple-600 text-white border-purple-600' 
                                : 'text-purple-600 border-purple-200 bg-white hover:bg-purple-50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                    

                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Piano Keyboard Visualization */}
      {selectedChord && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 text-center">
                {selectedChord.name} on Piano
              </h4>
              <div className="flex justify-center">
                <PianoKeyboard 
                  highlightedNotes={selectedChord.notes}
                  onKeyPress={(note) => {
                    // Could add individual note playback here
                  }}
                />
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">
                  {selectedChord.name}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}