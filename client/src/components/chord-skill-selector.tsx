import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBeginnerChordsForNote, formatChordNotes, type Chord } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import PianoKeyboard from './piano-keyboard';

interface ChordSkillSelectorProps {
  baseNote: string;
  noteIndex: number;
  onChordSelect: (chord: Chord | null, noteIndex: number) => void;
  inversionMode?: 'auto' | 'root' | 'first' | 'second';
  onInversionChange?: (mode: 'auto' | 'root' | 'first' | 'second') => void;
}

export default function ChordSkillSelector({ baseNote, noteIndex, onChordSelect, inversionMode = 'auto', onInversionChange }: ChordSkillSelectorProps) {
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const { playChord, isPlaying } = useAudio();

  useEffect(() => {
    // Always use beginner chords
    const chords = getBeginnerChordsForNote(baseNote);
    setAvailableChords(chords);
    // Only reset selection when base note changes
    setSelectedChord(null);
  }, [baseNote]);

  const handleSelectChord = (chord: Chord) => {
    setSelectedChord(chord);
    onChordSelect(chord, noteIndex);
  };

  const handleDeselectChord = () => {
    setSelectedChord(null);
    onChordSelect(null, noteIndex);
  };

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
                      {chord.name.replace('Minor', 'minor')}
                    </div>
                    
                    {/* Show inversion controls only when this chord is selected */}
                    {selectedChord?.name === chord.name && onInversionChange && (
                      <div className="flex justify-center space-x-1">
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
                {selectedChord.name.replace('Minor', 'minor')} on Piano
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
                  {selectedChord.name.replace('Minor', 'minor')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}