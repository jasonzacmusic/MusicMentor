import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getBeginnerChordsForNote, formatChordNotes, type Chord } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';

interface ChordSkillSelectorProps {
  baseNote: string;
  noteIndex: number;
  onChordSelect: (chord: Chord | null, noteIndex: number) => void;
}

export default function ChordSkillSelector({ baseNote, noteIndex, onChordSelect }: ChordSkillSelectorProps) {
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const { playChord, isPlaying } = useAudio();

  useEffect(() => {
    // Always use beginner chords
    const chords = getBeginnerChordsForNote(baseNote);
    setAvailableChords(chords);
    setSelectedChord(null);
    onChordSelect(null, noteIndex);
  }, [baseNote, onChordSelect, noteIndex]);

  const handleSelectChord = (chord: Chord) => {
    setSelectedChord(chord);
    onChordSelect(chord, noteIndex);
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
                  <div className="text-xs text-gray-600 font-mono text-center">
                    {formatChordNotes(chord.notes)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}