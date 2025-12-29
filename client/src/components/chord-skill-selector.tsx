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
      <div className="flex flex-col items-center">
        {/* Chord Tree */}
        <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
          {/* Central Root Note */}
          <div className="absolute z-20 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">{baseNote}</span>
            </div>
          </div>

          {/* Chord branches arranged in hexagonal pattern */}
          {availableChords.map((chord, index) => {
            const angles = [30, 90, 150, 210, 270, 330];
            const angle = angles[index] || 0;

            const radius = 100;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;

            const isSelected = selectedChord?.name === chord.name;

            return (
              <div key={index} className="absolute">
                {/* Branch line */}
                <div
                  className="absolute z-10"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${radius - 45}px`,
                    height: '2px',
                    background: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    transform: `translate(0, -50%) rotate(${angle}deg)`,
                    transformOrigin: 'left center'
                  }}
                />

                {/* Chord button */}
                <button
                  className={`absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 border-2 z-30 ${
                    isSelected
                      ? 'bg-primary border-primary text-primary-foreground shadow-md'
                      : 'bg-card border-border text-foreground hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => handleSelectChord(chord)}
                >
                  <span className="text-xs font-semibold text-center leading-tight px-1">
                    {chord.name}
                  </span>
                </button>
              </div>
            );
          })}

          {/* Clear button */}
          {selectedChord && (
            <div className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2">
              <Button
                onClick={handleDeselectChord}
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Piano Keyboard showing selected chord with proper voice leading inversion */}
        {selectedChord && (
          <div className="mt-16 flex flex-col items-center">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              <span className="text-primary">{selectedChord.name}</span> - Voice Leading
            </h4>
            <div className="text-xs text-muted-foreground mb-2">
              Notes: {selectedChord.notes.join(' - ')}
              {selectedChord.inversion !== undefined && selectedChord.inversion > 0 && (
                <span className="ml-2 text-primary">
                  ({selectedChord.inversion === 1 ? '1st Inversion' : '2nd Inversion'})
                </span>
              )}
            </div>
            <PianoKeyboard
              highlightedNotes={selectedChord.notes}
              onKeyPress={(note) => {
                // Could add individual note playback here
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Original grid layout for non-tree mode
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

      {/* Chord Options */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Clear button */}
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
              {availableChords.map((chord, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectChord(chord)}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedChord?.name === chord.name
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground text-base text-center">
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
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Piano Keyboard Visualization */}
      {selectedChord && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground text-center">
                <span className="text-primary">{selectedChord.name}</span> on Piano
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