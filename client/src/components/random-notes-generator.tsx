import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Shuffle, Play, Square, RotateCcw } from 'lucide-react';
import { generateRandomNotes, type Chord, applyVoiceLeading } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import { audioEngine } from '@/lib/audio-engine';

interface RandomNotesGeneratorProps {
  onNotesChange?: (notes: string[]) => void;
  selectedChords?: Chord[];
}

export default function RandomNotesGenerator({ onNotesChange, selectedChords = [] }: RandomNotesGeneratorProps) {
  const [notes, setNotes] = useState<string[]>(['Bb', 'D', 'G']); // Default to Bb, D, G
  const [tempo, setTempo] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [withMetronome, setWithMetronome] = useState(false);
  const [metronomeMultiplier, setMetronomeMultiplier] = useState(1);
  const { playSequence, playChord, isPlaying: audioIsPlaying, error } = useAudio();

  const generateNew = useCallback(() => {
    const chromaticNotes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    
    // Note 1: Any of the 12 chromatic notes (random base note)
    const note1 = chromaticNotes[Math.floor(Math.random() * chromaticNotes.length)];
    const note1Index = chromaticNotes.indexOf(note1);
    
    // Note 2: Major 3rd up from Note 1 (4 semitones up)
    const note2Index = (note1Index + 4) % 12;
    const note2 = chromaticNotes[note2Index];
    
    // Note 3: Minor 3rd down from Note 1 (3 semitones down)
    const note3Index = (note1Index - 3 + 12) % 12;
    const note3 = chromaticNotes[note3Index];
    
    const newNotes = [note1, note2, note3];
    setNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [onNotesChange]);

  // Store loop interval reference
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store previous chord selection to detect changes
  const prevChordsRef = useRef<Chord[]>(selectedChords);

  // Single play function that plays the sequence once
  const playSequenceOnce = useCallback(async () => {
    if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
      await audioEngine.initialize();
    }

    const beatDuration = 60 / tempo;
    const chordDurations = [2, 2, 4]; // beats per position
    const startTime = audioEngine.audioContext!.currentTime;
    let currentTime = startTime;

    // Apply voice leading to selected chords for smooth transitions
    const voiceLedChords = applyVoiceLeading(selectedChords, notes);

    // Schedule metronome clicks if enabled
    if (withMetronome) {
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

      const totalDuration = 8 * beatDuration; // 8 beats total
      let clickTime = startTime;
      while (clickTime < startTime + totalDuration) {
        scheduleMetronomeClick(clickTime);
        clickTime += metronomeInterval;
      }
    }

    // Always play 3 sounds with specific pitch placement and voice leading
    for (let i = 0; i < 3; i++) {
      const duration = beatDuration * chordDurations[i];
      const chord = voiceLedChords[i];
      
      if (chord && chord.notes) {
        // Play exactly 3 notes for each chord within specified range
        const triadNotes = chord.notes.slice(0, 3); // Ensure only 3 notes
        triadNotes.forEach((note, noteIndex) => {
          // Keep all chord notes within range: -1 octave to +1 octave from middle C
          // Root note around middle C (0), 3rd and 5th within close range
          let octaveOffset = 0;
          if (noteIndex === 0) octaveOffset = 0;  // Root at middle C
          if (noteIndex === 1) octaveOffset = 0;  // 3rd same octave as root
          if (noteIndex === 2) octaveOffset = 0;  // 5th same octave as root
          
          scheduleNote(note, currentTime + (noteIndex * 0.05), duration, octaveOffset);
        });
      } else {
        // Play individual notes with specific pitch placement:
        // Note 1 (D) - middle C area (0)
        // Note 2 (F#) - same octave as D (0) 
        // Note 3 (B) - octave below D (-1)
        let octaveOffset = 0;
        if (i === 0) octaveOffset = 0;  // Note 1 around middle C
        if (i === 1) octaveOffset = 0;  // Note 2 above Note 1 in same octave  
        if (i === 2) octaveOffset = -1; // Note 3 below Note 1
        
        scheduleNote(notes[i], currentTime, duration, octaveOffset);
      }
      
      currentTime += duration;
    }

    // Return total duration for timing
    return (currentTime - startTime) * 1000;
  }, [selectedChords, notes, tempo, withMetronome, metronomeMultiplier]);

  // Main play function - automatically loops continuously
  const handlePlay = useCallback(async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // Play the sequence once
      const sequenceDuration = await playSequenceOnce();
      
      // Set up continuous looping - simplified approach
      loopIntervalRef.current = setInterval(() => {
        playSequenceOnce();
      }, sequenceDuration); // Perfect timing - no extra pause
      
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  }, [playSequenceOnce]);

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
  }, [selectedChords, tempo, withMetronome, metronomeMultiplier]);

  // Schedule a chord with precise timing
  const scheduleChord = (notes: string[], startTime: number, duration: number) => {
    notes.forEach(note => {
      scheduleNote(note, startTime, duration);
    });
  };

  // Schedule a single note with precise timing
  const scheduleNote = (note: string, startTime: number, duration: number, octaveOffset: number = 0) => {
    if (!audioEngine.audioContext || !audioEngine.masterGainNode) return;

    // Use NOTE_FREQUENCIES directly for correct pitch
    const NOTE_FREQUENCIES: Record<string, number> = {
      'C': 261.63, 'C#': 277.18, 'Db': 277.18, 'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99, 'G': 392.00, 'G#': 415.30,
      'Ab': 415.30, 'A': 440.00, 'A#': 466.16, 'Bb': 466.16, 'B': 493.88
    };
    
    let frequency = NOTE_FREQUENCIES[note];
    if (!frequency) {
      console.warn(`Unknown note: ${note}`);
      return;
    }

    // Apply octave offset (each octave is double/half the frequency)
    if (octaveOffset !== 0) {
      frequency = frequency * Math.pow(2, octaveOffset);
    }
    
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

  const handleStop = useCallback(() => {
    // Stop all audio immediately
    audioEngine.stopAll();
    
    // Clear loop interval if active
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping(!isLooping);
  }, [isLooping]);

  // Monitor changes that require playback restart during play
  useEffect(() => {
    const chordsChanged = JSON.stringify(prevChordsRef.current) !== JSON.stringify(selectedChords);
    
    if (isPlaying && (chordsChanged)) {
      prevChordsRef.current = selectedChords;
      
      // Stop all current audio immediately to prevent chaos
      audioEngine.stopAll();
      
      // Clear interval
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
      
      const restartPlayback = async () => {
        try {
          // Small delay to ensure all audio has stopped
          await new Promise(resolve => setTimeout(resolve, 50));
          const sequenceDuration = await playSequenceOnce();
          loopIntervalRef.current = setInterval(() => {
            playSequenceOnce();
          }, sequenceDuration);
        } catch (error) {
          console.error('Restart playback error:', error);
        }
      };
      
      restartPlayback();
    } else {
      prevChordsRef.current = selectedChords;
    }
  }, [selectedChords, isPlaying, playSequenceOnce]);

  // Monitor tempo and metronome changes for seamless updates
  useEffect(() => {
    if (isPlaying) {
      // Stop all current audio and restart with new settings
      audioEngine.stopAll();
      
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
      
      const restartWithNewSettings = async () => {
        try {
          // Small delay to ensure all audio has stopped
          await new Promise(resolve => setTimeout(resolve, 50));
          const sequenceDuration = await playSequenceOnce();
          loopIntervalRef.current = setInterval(() => {
            playSequenceOnce();
          }, sequenceDuration);
        } catch (error) {
          console.error('Settings restart error:', error);
        }
      };
      
      restartWithNewSettings();
    }
  }, [tempo, withMetronome, metronomeMultiplier, isPlaying, playSequenceOnce]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (isPlaying) {
            handleStop();
          } else {
            handlePlay();
          }
          break;
        case 'KeyM':
          event.preventDefault();
          setWithMetronome(prev => !prev);
          break;
        case 'KeyL':
          event.preventDefault();
          toggleLoop();
          break;
        case 'KeyR':
          event.preventDefault();
          generateNew();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, withMetronome, handlePlay, handleStop, toggleLoop, generateNew]);

  // Update replit.md with the bug fixes
  useEffect(() => {
    // This effect helps track that these specific bugs were fixed
  }, []);

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
                  Metronome <span className="text-xs opacity-75">(M)</span>
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
              Play <span className="text-xs opacity-75">(Space)</span>
            </Button>
          ) : (
            <Button 
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop <span className="text-xs opacity-75">(Space)</span>
            </Button>
          )}
          <div className="text-sm text-gray-600 flex items-center">
            <RotateCcw className="w-4 h-4 mr-1" />
            Auto Loop: ON
          </div>
          <Button onClick={generateNew} variant="outline">
            <Shuffle className="w-4 h-4 mr-2" />
            Generate New <span className="text-xs opacity-75">(R)</span>
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Keyboard shortcuts help */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 flex flex-wrap gap-4 justify-center">
            <span><kbd className="px-1 py-0.5 bg-white rounded text-xs">Space</kbd> Play/Stop</span>
            <span><kbd className="px-1 py-0.5 bg-white rounded text-xs">M</kbd> Metronome</span>
            <span><kbd className="px-1 py-0.5 bg-white rounded text-xs">L</kbd> Loop</span>
            <span><kbd className="px-1 py-0.5 bg-white rounded text-xs">R</kbd> Generate New</span>
          </div>
        </div>

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