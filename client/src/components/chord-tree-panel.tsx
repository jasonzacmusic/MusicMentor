import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Volume2 } from 'lucide-react';
import { getChordsForNote, formatChordNotes, type Chord } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';

interface ChordTreePanelProps {
  selectedNote: string;
}

export default function ChordTreePanel({ selectedNote }: ChordTreePanelProps) {
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const { playChord, isPlaying } = useAudio();

  useEffect(() => {
    const chords = getChordsForNote(selectedNote);
    setAvailableChords(chords);
    setSelectedChord(chords[0] || null);
  }, [selectedNote]);

  const handlePlayChord = useCallback(async (chord: Chord) => {
    await playChord(chord.notes, 2000);
  }, [playChord]);

  const handleSelectChord = useCallback((chord: Chord) => {
    setSelectedChord(chord);
  }, []);

  const handlePlaySelectedChord = useCallback(async () => {
    if (selectedChord) {
      await playChord(selectedChord.notes, 2000);
    }
  }, [selectedChord, playChord]);

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Chord Harmonization</h3>
        
        {/* Selected Base Note */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Base Note</label>
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <span className="text-lg font-mono font-medium">{selectedNote}</span>
          </div>
        </div>

        {/* Chord Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Available Chords</h4>
          
          <div className="max-h-80 overflow-y-auto space-y-2">
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{chord.name}</div>
                    <div className="text-sm text-gray-600 font-mono">
                      {formatChordNotes(chord.notes)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayChord(chord);
                    }}
                    disabled={isPlaying}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Play Selected Chord */}
        <Button
          onClick={handlePlaySelectedChord}
          disabled={!selectedChord || isPlaying}
          className="w-full bg-orange-500 hover:bg-orange-600 mt-4"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Play Selected Chord
        </Button>
      </CardContent>
    </Card>
  );
}
