import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Shuffle, Play, Square, RotateCcw } from 'lucide-react';
import { generateRandomNotes, type Chord } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import { audioEngine } from '@/lib/audio-engine';

interface RandomNotesGeneratorProps {
  onNotesChange?: (notes: string[]) => void;
  selectedChords?: Chord[];
}

export default function RandomNotesGenerator({ onNotesChange, selectedChords = [] }: RandomNotesGeneratorProps) {
  const [notes, setNotes] = useState<string[]>(['Bb', 'D', 'G']); // Default to Bb, D, G as requested
  const [tempo, setTempo] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [withMetronome, setWithMetronome] = useState(false);
  const [metronomeMultiplier, setMetronomeMultiplier] = useState(1);
  const { playSequence, playChord, isPlaying: audioIsPlaying, error } = useAudio();

  const generateNew = useCallback(() => {
    const newNotes = generateRandomNotes();
    setNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [onNotesChange]);

  // Unified play function - plays chords if selected, otherwise plays notes
  const handlePlay = useCallback(async () => {
    const hasSelectedChords = selectedChords.some(chord => chord !== null);
    
    setIsPlaying(true);
    try {
      do {
        if (hasSelectedChords) {
          // Play chord progression with metronome
          const beatDuration = (60 / tempo) * 1000;
          const metronomeBeatDuration = beatDuration / metronomeMultiplier;
          const chordDurations = [2, 2, 4];
          let currentBeat = 0;
          
          for (let i = 0; i < 3; i++) {
            const chord = selectedChords[i];
            const duration = beatDuration * chordDurations[i];
            
            if (chord && chord.notes) {
              const voiceLeadingNotes = applyVoiceLeading(chord.notes, i);
              
              // Start playing the chord
              const chordPromise = playChord(voiceLeadingNotes, duration);
              
              // Play metronome clicks for all beats in this section
              if (withMetronome) {
                const beatsInSection = chordDurations[i];
                for (let beat = 0; beat < beatsInSection; beat++) {
                  if (beat === 0) {
                    // Play metronome click immediately for first beat
                    playMetronomeClick();
                  } else {
                    // Schedule subsequent clicks
                    setTimeout(() => playMetronomeClick(), beat * metronomeBeatDuration);
                  }
                }
              }
              
              await chordPromise;
            } else {
              // If no chord selected, still play metronome and wait
              if (withMetronome) {
                const beatsInSection = chordDurations[i];
                for (let beat = 0; beat < beatsInSection; beat++) {
                  if (beat === 0) {
                    playMetronomeClick();
                  } else {
                    setTimeout(() => playMetronomeClick(), beat * metronomeBeatDuration);
                  }
                }
              }
              await new Promise(resolve => setTimeout(resolve, duration));
            }
            
            if (i < 2) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
        } else {
          // Play note sequence
          await playSequence(notes, tempo, withMetronome, metronomeMultiplier);
        }
        
        // If looping, add a brief pause before repeating
        if (isLooping && isPlaying) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } while (isLooping && isPlaying);
    } finally {
      setIsPlaying(false);
    }
  }, [selectedChords, notes, tempo, withMetronome, metronomeMultiplier, playChord, playSequence, isLooping, isPlaying]);

  // Use audioEngine's metronome click method
  const playMetronomeClick = () => {
    audioEngine.playMetronomeClick();
  };

  // Apply voice leading for smoother chord progressions
  const applyVoiceLeading = (notes: string[], position: number) => {
    // For now, use basic voice leading principles
    return notes; // Will enhance this with actual octave adjustments later
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsLooping(false);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const beatTimings = [2, 2, 4];

  return (
    <Card>
      <CardContent className="p-6">
        {/* Top section with tempo and metronome controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 min-w-[80px]">
                Tempo: {tempo} BPM
              </label>
              <Slider
                value={[tempo]}
                onValueChange={(value) => setTempo(value[0])}
                min={60}
                max={200}
                step={10}
                className="w-32"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metronome"
                  checked={withMetronome}
                  onCheckedChange={setWithMetronome}
                />
                <label htmlFor="metronome" className="text-sm font-medium text-gray-700">
                  Metronome
                </label>
              </div>
              {withMetronome && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Speed:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((multiplier) => (
                      <Button
                        key={multiplier}
                        size="sm"
                        variant={metronomeMultiplier === multiplier ? "default" : "outline"}
                        onClick={() => setMetronomeMultiplier(multiplier)}
                        className="px-2 py-1 text-xs"
                      >
                        x{multiplier}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <h2 className="text-lg font-medium text-gray-900">Random Note Practice</h2>
        </div>

        {/* Central controls section */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          {!isPlaying ? (
            <Button 
              onClick={handlePlay}
              disabled={audioIsPlaying}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
          ) : (
            <Button 
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
          <Button 
            onClick={toggleLoop}
            variant={isLooping ? "default" : "outline"}
            className={isLooping ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Loop: {isLooping ? "ON" : "OFF"}
          </Button>
          <Button onClick={generateNew} variant="outline">
            <Shuffle className="w-4 h-4 mr-2" />
            Generate New
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Notes display */}
        <div className="grid grid-cols-3 gap-4">
          {notes.map((note, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-blue-800 mb-1">{note}</div>
                <div className="text-sm text-blue-600">
                  {beatTimings[index]} beats
                  {index === 2 && " (octave lower)"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}