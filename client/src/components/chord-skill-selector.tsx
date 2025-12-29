import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getChordsForNoteBySkill, formatChordNotes, type Chord, type SkillLevel } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import PianoKeyboard from './piano-keyboard';

interface ChordSkillSelectorProps {
  baseNote: string;
  noteIndex: number;
  selectedChord?: Chord | null;
  onChordSelect: (chord: Chord | null, noteIndex: number) => void;
  inversionMode?: 'auto' | 'root' | 'first' | 'second';
  onInversionChange?: (mode: 'auto' | 'root' | 'first' | 'second') => void;
  skillLevel?: SkillLevel;
  treeLayout?: boolean;
}

export default function ChordSkillSelector({ baseNote, noteIndex, selectedChord: parentSelectedChord, onChordSelect, inversionMode = 'auto', onInversionChange, skillLevel = 'beginner', treeLayout = false }: ChordSkillSelectorProps) {
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const { playChord, isPlaying } = useAudio();

  // Use the parent's selected chord if provided, otherwise use local state
  const selectedChord = parentSelectedChord;

  useEffect(() => {
    // Use chords based on skill level
    const chords = getChordsForNoteBySkill(baseNote, skillLevel);
    setAvailableChords(chords);
  }, [baseNote, skillLevel]);

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
        {/* Central Root Note - Elegant Gold Circle */}
        <div className="absolute z-20 flex items-center justify-center">
          <div className="w-28 h-28 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 dark:from-amber-500 dark:via-yellow-600 dark:to-orange-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50 dark:border-amber-300/30 glow-gold">
            <span className="text-4xl font-display font-bold text-white drop-shadow-lg tracking-wide">{baseNote}</span>
          </div>
        </div>

        {/* Chord branches arranged in hexagonal pattern */}
        {availableChords.map((chord, index) => {
          // Fixed hexagonal arrangement: 6 positions at 60° intervals starting from top-right
          const angles = [30, 90, 150, 210, 270, 330]; // 6 positions around the circle
          const angle = angles[index] || 0; // Use index directly for consistent positioning
          const positionIndex = index;

          const radius = 140;
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;

          const isSelected = selectedChord?.name === chord.name;

          // Elegant, sophisticated colors for musicians
          const chordColors = [
            { // Position 0 - Royal Purple
              default: 'from-purple-100 to-purple-300 dark:from-purple-800 dark:to-purple-600 border-purple-300 dark:border-purple-500 text-purple-900 dark:text-purple-100',
              selected: 'from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800 border-purple-400 dark:border-purple-400 text-white',
              hover: 'hover:from-purple-200 hover:to-purple-400 dark:hover:from-purple-700 dark:hover:to-purple-500',
              branch: 'rgba(147, 51, 234, 0.6)',
              glow: 'shadow-purple-400/40'
            },
            { // Position 1 - Deep Blue
              default: 'from-blue-100 to-blue-300 dark:from-blue-800 dark:to-blue-600 border-blue-300 dark:border-blue-500 text-blue-900 dark:text-blue-100',
              selected: 'from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 border-blue-400 dark:border-blue-400 text-white',
              hover: 'hover:from-blue-200 hover:to-blue-400 dark:hover:from-blue-700 dark:hover:to-blue-500',
              branch: 'rgba(59, 130, 246, 0.6)',
              glow: 'shadow-blue-400/40'
            },
            { // Position 2 - Teal
              default: 'from-teal-100 to-teal-300 dark:from-teal-800 dark:to-teal-600 border-teal-300 dark:border-teal-500 text-teal-900 dark:text-teal-100',
              selected: 'from-teal-500 to-teal-700 dark:from-teal-600 dark:to-teal-800 border-teal-400 dark:border-teal-400 text-white',
              hover: 'hover:from-teal-200 hover:to-teal-400 dark:hover:from-teal-700 dark:hover:to-teal-500',
              branch: 'rgba(20, 184, 166, 0.6)',
              glow: 'shadow-teal-400/40'
            },
            { // Position 3 - Emerald
              default: 'from-emerald-100 to-emerald-300 dark:from-emerald-800 dark:to-emerald-600 border-emerald-300 dark:border-emerald-500 text-emerald-900 dark:text-emerald-100',
              selected: 'from-emerald-500 to-emerald-700 dark:from-emerald-600 dark:to-emerald-800 border-emerald-400 dark:border-emerald-400 text-white',
              hover: 'hover:from-emerald-200 hover:to-emerald-400 dark:hover:from-emerald-700 dark:hover:to-emerald-500',
              branch: 'rgba(16, 185, 129, 0.6)',
              glow: 'shadow-emerald-400/40'
            },
            { // Position 4 - Rose
              default: 'from-rose-100 to-rose-300 dark:from-rose-800 dark:to-rose-600 border-rose-300 dark:border-rose-500 text-rose-900 dark:text-rose-100',
              selected: 'from-rose-500 to-rose-700 dark:from-rose-600 dark:to-rose-800 border-rose-400 dark:border-rose-400 text-white',
              hover: 'hover:from-rose-200 hover:to-rose-400 dark:hover:from-rose-700 dark:hover:to-rose-500',
              branch: 'rgba(244, 63, 94, 0.6)',
              glow: 'shadow-rose-400/40'
            },
            { // Position 5 - Amber
              default: 'from-amber-100 to-amber-300 dark:from-amber-800 dark:to-amber-600 border-amber-300 dark:border-amber-500 text-amber-900 dark:text-amber-100',
              selected: 'from-amber-500 to-amber-700 dark:from-amber-600 dark:to-amber-800 border-amber-400 dark:border-amber-400 text-white',
              hover: 'hover:from-amber-200 hover:to-amber-400 dark:hover:from-amber-700 dark:hover:to-amber-500',
              branch: 'rgba(245, 158, 11, 0.6)',
              glow: 'shadow-amber-400/40'
            }
          ];

          const colorScheme = chordColors[positionIndex % 6];

          return (
            <div key={index} className="absolute">
              {/* Elegant branch line with gradient effect */}
              <div
                className="absolute z-10"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${radius - 60}px`,
                  height: '4px',
                  background: `linear-gradient(90deg, transparent, ${colorScheme.branch})`,
                  transform: `translate(0, -50%) rotate(${angle}deg)`,
                  transformOrigin: 'left center',
                  borderRadius: '2px'
                }}
              />

              {/* Chord button (leaf) - larger with elegant typography */}
              <div
                className={`absolute w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border-3 shadow-xl transform hover:scale-110 z-30 ${
                  isSelected
                    ? `bg-gradient-to-br ${colorScheme.selected} scale-115 ${colorScheme.glow} shadow-2xl`
                    : `bg-gradient-to-br ${colorScheme.default} ${colorScheme.hover} hover:shadow-2xl`
                }`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  borderWidth: '3px'
                }}
                onClick={() => handleSelectChord(chord)}
              >
                <span className="text-base font-display font-bold text-center leading-tight px-2 drop-shadow-sm">
                  {chord.name}
                </span>
              </div>
            </div>
          );
        })}

        {/* Clear button - positioned below the tree */}
        {selectedChord && (
          <div className="absolute bottom-[-70px] left-1/2 transform -translate-x-1/2">
            <Button
              onClick={handleDeselectChord}
              variant="outline"
              size="sm"
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 border-rose-300 dark:border-rose-700 font-medium"
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
        <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
          Chord Options for <span className="text-amber-600 dark:text-amber-400">{baseNote}</span>
        </h2>
        <div className="text-sm text-muted-foreground mb-4">
          Select a harmonizing chord
        </div>
      </div>

      {/* Chord Options */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Clear button */}
            {selectedChord && (
              <div className="flex justify-center">
                <Button
                  onClick={handleDeselectChord}
                  variant="outline"
                  size="sm"
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 border-rose-300 dark:border-rose-700"
                >
                  Clear Selection
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {availableChords.map((chord, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectChord(chord)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    selectedChord?.name === chord.name
                      ? 'border-amber-500 dark:border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30'
                      : 'border-border hover:border-amber-300 dark:hover:border-amber-600 hover:bg-gradient-to-br hover:from-amber-50/50 hover:to-orange-50/50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="font-display font-semibold text-foreground text-xl text-center">
                      {chord.name}
                    </div>

                    {/* Show inversion controls only when this chord is selected */}
                    {selectedChord?.name === chord.name && onInversionChange && (
                      <div className="flex justify-center space-x-1 mt-3">
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
                            className={`px-3 py-1.5 text-xs rounded-lg border-2 transition-all duration-200 font-medium ${
                              inversionMode === option.value
                                ? 'bg-amber-500 dark:bg-amber-600 text-white border-amber-500 dark:border-amber-600 shadow-md'
                                : 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/30'
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
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="text-lg font-display font-medium text-foreground text-center">
                <span className="text-amber-600 dark:text-amber-400">{selectedChord.name}</span> on Piano
              </h4>
              <div className="flex justify-center">
                <PianoKeyboard
                  highlightedNotes={selectedChord.notes}
                  onKeyPress={(note) => {
                    // Could add individual note playback here
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}