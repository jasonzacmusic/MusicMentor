import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Volume2 } from 'lucide-react';
import { getBeginnerChordsForNote, formatChordNotes, type Chord } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';

interface ChordTreePanelProps {
  selectedNote: string;
}

export default function ChordTreePanel({ selectedNote }: ChordTreePanelProps) {
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const { playChord, isPlaying } = useAudio();

  useEffect(() => {
    const chords = getBeginnerChordsForNote(selectedNote);
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Beginner Chord Tree</h3>
        
        {/* Base Note as Root of Tree */}
        <div className="mb-6">
          <div className="text-center">
            <div className="bg-blue-500 text-white rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
              <span className="text-2xl font-mono font-bold">{selectedNote}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">Base Note</div>
          </div>
        </div>

        {/* Tree Branches */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 text-center mb-4">Harmonizing Chords</h4>
          
          {/* Tree Structure */}
          <div className="relative">
            {/* Connecting Lines */}
            <div className="absolute left-1/2 top-0 w-0.5 h-8 bg-gray-300 transform -translate-x-0.5"></div>
            <div className="absolute left-1/2 top-8 w-full h-0.5 bg-gray-300 transform -translate-x-0.5"></div>
            
            {/* Chord Options in Tree Layout */}
            <div className="grid grid-cols-2 gap-3 pt-12">
              {availableChords.map((chord, index) => (
                <div key={index} className="relative">
                  {/* Branch Line */}
                  <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-gray-300 transform -translate-x-0.5"></div>
                  
                  <div
                    onClick={() => handleSelectChord(chord)}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors text-center ${
                      selectedChord?.name === chord.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900 text-sm leading-tight">
                        {chord.name}
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        {formatChordNotes(chord.notes)}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayChord(chord);
                        }}
                        disabled={isPlaying}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 h-6 w-full"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
