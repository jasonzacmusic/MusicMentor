import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Shuffle, Play, Square } from 'lucide-react';
import { generateRandomNotes } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';

interface RandomNotesGeneratorProps {
  onNotesChange?: (notes: string[]) => void;
}

export default function RandomNotesGenerator({ onNotesChange }: RandomNotesGeneratorProps) {
  const [notes, setNotes] = useState<string[]>(['C', 'E', 'A']);
  const [tempo, setTempo] = useState(120);
  const { playNote, playSequence, isPlaying, error } = useAudio();

  const generateNew = useCallback(() => {
    const newNotes = generateRandomNotes();
    setNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [onNotesChange]);

  const handlePlayNote = useCallback(async (note: string, beats: number) => {
    const beatDuration = (60 / tempo) * 1000 * beats;
    await playNote(note, beatDuration);
  }, [playNote, tempo]);

  const handlePlaySequence = useCallback(async () => {
    await playSequence(notes, tempo);
  }, [playSequence, notes, tempo]);

  const beatTimings = [2, 2, 4];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Random Note Practice</h2>
          <Button onClick={generateNew} className="bg-blue-600 hover:bg-blue-700">
            <Shuffle className="w-4 h-4 mr-2" />
            Generate New
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Note Display Section */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {notes.map((note, index) => {
            const getRelationshipLabel = (index: number) => {
              switch(index) {
                case 0: return 'Base Note';
                case 1: return 'Major 3rd up';
                case 2: return 'Minor 3rd down';
                default: return '';
              }
            };
            
            return (
              <div key={index} className="text-center">
                <div className={`rounded-lg p-6 mb-3 ${
                  index === 0 ? 'bg-blue-100' : 
                  index === 1 ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <div className="text-3xl font-mono font-medium text-gray-900 mb-2">
                    {note}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {beatTimings[index]} beats
                  </div>
                  <div className="text-xs text-gray-500">
                    {getRelationshipLabel(index)}
                  </div>
                </div>
                <Button
                  onClick={() => handlePlayNote(note, beatTimings[index])}
                  disabled={isPlaying}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
              </div>
            );
          })}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlaySequence}
              disabled={isPlaying}
              className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full"
            >
              <Play className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="p-3 rounded-full"
            >
              <Square className="w-5 h-5" />
            </Button>
          </div>

          {/* Tempo Control */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Tempo:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono text-gray-700 w-8">
                {tempo}
              </span>
              <span className="text-sm text-gray-600">BPM</span>
            </div>
            <Slider
              value={[tempo]}
              onValueChange={(value) => setTempo(value[0])}
              min={60}
              max={200}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
