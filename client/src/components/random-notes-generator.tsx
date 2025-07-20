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
    const chromaticNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    
    // Note 1: Random base note
    const note1 = chromaticNotes[Math.floor(Math.random() * chromaticNotes.length)];
    const note1Index = chromaticNotes.indexOf(note1);
    
    // Note 2: Higher than Note 1 (2-5 semitones up)
    const note2Offset = 2 + Math.floor(Math.random() * 4); // 2-5 semitones
    const note2Index = (note1Index + note2Offset) % 12;
    const note2 = chromaticNotes[note2Index];
    
    // Note 3: Lower than Note 1 (2-5 semitones down)
    const note3Offset = 2 + Math.floor(Math.random() * 4); // 2-5 semitones
    const note3Index = (note1Index - note3Offset + 12) % 12;
    const note3 = chromaticNotes[note3Index];
    
    const newNotes = [note1, note2, note3];
    setNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [onNotesChange]);

  // Unified play function - plays chords if selected, otherwise plays notes
  const handlePlay = useCallback(async () => {
    const hasSelectedChords = selectedChords.some(chord => chord !== null);
    
    if (isPlaying) return; // Prevent multiple simultaneous plays
    
    setIsPlaying(true);
    try {
      do {
        if (hasSelectedChords) {
          // Play chord progression with precise timing
          await playChordProgression();
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
  }, [selectedChords, notes, tempo, withMetronome, metronomeMultiplier, playSequence, isLooping, isPlaying]);

  // Precise chord progression playback
  const playChordProgression = useCallback(async () => {
    if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
      await audioEngine.initialize();
    }

    const beatDuration = 60 / tempo; // seconds per beat
    const chordDurations = [2, 2, 4]; // beats per chord
    const startTime = audioEngine.audioContext!.currentTime;
    let currentTime = startTime;

    // Calculate metronome interval
    let metronomeInterval: number;
    if (metronomeMultiplier === 1) {
      metronomeInterval = beatDuration; // Quarter notes
    } else if (metronomeMultiplier === 2) {
      metronomeInterval = beatDuration / 2; // Eighth notes
    } else if (metronomeMultiplier === 3) {
      metronomeInterval = beatDuration / 3; // Triplets
    } else {
      metronomeInterval = beatDuration;
    }

    // Schedule metronome clicks for entire progression
    if (withMetronome) {
      const totalDuration = 8 * beatDuration; // 8 beats total
      let clickTime = startTime;
      while (clickTime < startTime + totalDuration) {
        scheduleMetronomeClick(clickTime);
        clickTime += metronomeInterval;
      }
    }

    // Schedule chord playback
    for (let i = 0; i < 3; i++) {
      const chord = selectedChords[i];
      const duration = beatDuration * chordDurations[i];
      
      if (chord && chord.notes) {
        const voiceLeadingNotes = applyVoiceLeading(chord.notes, i);
        scheduleChord(voiceLeadingNotes, currentTime, duration);
      }
      
      currentTime += duration;
      
      // Small gap between chords
      if (i < 2) {
        currentTime += 0.1;
      }
    }

    // Wait for progression to complete
    const totalDuration = (currentTime - startTime + 0.1) * 1000;
    await new Promise(resolve => setTimeout(resolve, totalDuration));
  }, [selectedChords, tempo, withMetronome, metronomeMultiplier, isPlaying]);

  // Schedule a chord with precise timing
  const scheduleChord = (notes: string[], startTime: number, duration: number) => {
    notes.forEach(note => {
      scheduleNote(note, startTime, duration);
    });
  };

  // Schedule a single note with precise timing
  const scheduleNote = (note: string, startTime: number, duration: number, octaveOffset: number = 0) => {
    if (!audioEngine.audioContext || !audioEngine.masterGainNode) return;

    const frequency = audioEngine.getFrequency(note, 0); // Always use octave 0 for correct pitch
    
    const oscillator = audioEngine.audioContext.createOscillator();
    const gainNode = audioEngine.audioContext.createGain();
    const filterNode = audioEngine.audioContext.createBiquadFilter();

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioEngine.masterGainNode);

    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = 'sawtooth';

    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1600, startTime);
    filterNode.Q.setValueAtTime(1.5, startTime);

    const attackTime = 0.1;
    const releaseTime = 0.3;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + attackTime);
    gainNode.gain.setValueAtTime(0.3, startTime + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  // Schedule metronome click with precise timing
  const scheduleMetronomeClick = (time: number) => {
    if (!audioEngine.audioContext || !audioEngine.masterGainNode) return;

    const oscillator = audioEngine.audioContext.createOscillator();
    const gainNode = audioEngine.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioEngine.masterGainNode);

    oscillator.frequency.setValueAtTime(800, time);
    oscillator.type = 'square';

    const clickDuration = 0.05;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.3, time + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, time + clickDuration);

    oscillator.start(time);
    oscillator.stop(time + clickDuration);
  };

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
                    {[
                      { value: 1, label: 'x1' },
                      { value: 2, label: 'x2' },
                      { value: 3, label: 'x3' }
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        size="sm"
                        variant={metronomeMultiplier === value ? "default" : "outline"}
                        onClick={() => setMetronomeMultiplier(value)}
                        className="px-2 py-1 text-xs"
                      >
                        {label}
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