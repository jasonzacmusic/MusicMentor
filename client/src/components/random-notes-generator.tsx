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
  // Removed old useAudio hook - using direct audioEngine now

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

  // Single loop control ref 
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Single sequence control ref
  const isSequenceActiveRef = useRef(false);
  
  // Store previous chord selection to detect changes
  const prevChordsRef = useRef<Chord[]>(selectedChords);

  // EMERGENCY RESET FUNCTION - Completely stop all audio
  const emergencyReset = useCallback(() => {
    console.log('🚨 EMERGENCY RESET - Clearing all audio');
    
    // Set flags to prevent new sequences
    isSequenceActiveRef.current = false;
    setIsPlaying(false);
    
    // Clear all intervals/timeouts
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    
    // Stop all oscillators
    audioEngine.stopAll();
    
    console.log('✅ Emergency reset complete');
  }, []);

  // ATOMIC SEQUENCE PLAYER - Only one can run at a time
  const playSequenceOnce = useCallback(async () => {
    // Guard: Only allow one sequence at a time
    if (isSequenceActiveRef.current) {
      console.log('🚫 Sequence already active, skipping');
      return 8000; // Return 8 second duration
    }
    
    isSequenceActiveRef.current = true;
    console.log('🎵 Starting new sequence');
    
    try {
      if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
        await audioEngine.initialize();
      }

      const beatDuration = 60 / tempo;
      const chordDurations = [2, 2, 4]; // beats per position
      
      // Start immediately at the next audio context time (beat 1)
      const startTime = audioEngine.audioContext!.currentTime + 0.01;
      let currentTime = startTime;

      // Schedule metronome clicks if enabled
      if (withMetronome) {
        let metronomeInterval = beatDuration; // Quarter notes only for simplicity
        const totalDuration = 8 * beatDuration; // 8 beats total
        let clickTime = startTime;
        while (clickTime < startTime + totalDuration) {
          scheduleMetronomeClick(clickTime);
          clickTime += metronomeInterval;
        }
      }

      // Check if we have chords selected or should play individual notes
      const hasSelectedChords = selectedChords && selectedChords.length > 0;
      console.log('🎼 Mode:', hasSelectedChords ? 'CHORDS' : 'NOTES', 'Count:', selectedChords.length);

      // Always play exactly 3 positions
      for (let i = 0; i < 3; i++) {
        const duration = beatDuration * chordDurations[i];
        
        if (hasSelectedChords) {
          // CHORD MODE: Use selected chords, cycling if needed
          const chordIndex = i % selectedChords.length;
          const chord = selectedChords[chordIndex];
          const triadNotes = chord.notes.slice(0, 3); // Ensure only 3 notes
          console.log(`🎹 Chord ${i + 1}:`, chord.notes);
          
          triadNotes.forEach((note, noteIndex) => {
            scheduleNote(note, currentTime + (noteIndex * 0.05), duration, 0);
          });
        } else {
          // NOTE MODE: Play individual notes
          console.log(`🎵 Note ${i + 1}:`, notes[i]);
          let octaveOffset = 0;
          if (i === 2) octaveOffset = -1; // Note 3 below Note 1
          
          scheduleNote(notes[i], currentTime, duration, octaveOffset);
        }
        
        currentTime += duration;
      }

      // Return total duration for timing
      const totalDuration = (currentTime - startTime) * 1000;
      
      // Mark sequence as complete after duration
      setTimeout(() => {
        isSequenceActiveRef.current = false;
        console.log('✅ Sequence complete');
      }, totalDuration);
      
      return totalDuration;
    } catch (error) {
      console.error('❌ Sequence error:', error);
      isSequenceActiveRef.current = false;
      return 8000;
    }
  }, [selectedChords, notes, tempo, withMetronome]);

  // NEW CLEAN PLAY FUNCTION
  const handlePlay = useCallback(async () => {
    console.log('▶️ PLAY PRESSED');
    
    if (isPlaying) {
      // If already playing, stop
      emergencyReset();
      return;
    }

    setIsPlaying(true);

    try {
      const sequenceDuration = await playSequenceOnce();
      console.log('⏱️ Sequence duration:', sequenceDuration, 'ms');
      
      if (isLooping) {
        loopIntervalRef.current = setInterval(() => {
          console.log('🔄 Loop triggered');
          playSequenceOnce();
        }, sequenceDuration);
      }
    } catch (error) {
      console.error('❌ Play error:', error);
      emergencyReset();
    }
  }, [isPlaying, playSequenceOnce, isLooping, emergencyReset]);

  // REMOVED OLD CONFLICTING AUDIO FUNCTIONS

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

    // Track this oscillator in the audio engine
    audioEngine.activeOscillators.add(oscillator);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    // Remove from tracking when it ends
    oscillator.addEventListener('ended', () => {
      audioEngine.activeOscillators.delete(oscillator);
    });
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

    // Track metronome oscillators too
    audioEngine.activeOscillators.add(oscillator);
    
    oscillator.start(time);
    oscillator.stop(time + clickDuration);
    
    oscillator.addEventListener('ended', () => {
      audioEngine.activeOscillators.delete(oscillator);
    });
  };

  // Add generate function
  const handleGenerate = useCallback(() => {
    console.log('🎲 GENERATE PRESSED');
    
    // Always reset before generating
    emergencyReset();
    
    // Generate new notes
    generateNew();
  }, [generateNew, emergencyReset]);

  const handleStop = useCallback(() => {
    console.log('⏹️ STOP PRESSED');
    emergencyReset();
  }, [emergencyReset]);

  const toggleLoop = useCallback(() => {
    setIsLooping(!isLooping);
  }, [isLooping]);

  // Monitor chord selection changes and restart immediately
  useEffect(() => {
    const chordsChanged = JSON.stringify(prevChordsRef.current) !== JSON.stringify(selectedChords);
    
    if (isPlaying && chordsChanged) {
      console.log('🔄 Chord change detected - immediate restart');
      prevChordsRef.current = selectedChords;
      
      // Emergency reset to stop everything
      emergencyReset();
      
      // Restart after brief moment
      setTimeout(() => {
        setIsPlaying(true);
        const startNewSequence = async () => {
          try {
            const sequenceDuration = await playSequenceOnce();
            if (isLooping) {
              loopIntervalRef.current = setInterval(() => {
                playSequenceOnce();
              }, sequenceDuration);
            }
          } catch (error) {
            console.error('❌ Restart error:', error);
            emergencyReset();
          }
        };
        startNewSequence();
      }, 50);
    } else {
      prevChordsRef.current = selectedChords;
    }
  }, [selectedChords, isPlaying, playSequenceOnce, isLooping, emergencyReset]);

  // Monitor tempo and metronome changes
  useEffect(() => {
    if (isPlaying) {
      console.log('⚡ Settings changed - immediate restart');
      
      // Emergency reset to stop everything  
      emergencyReset();
      
      // Restart after brief moment
      setTimeout(() => {
        setIsPlaying(true);
        const startNewSequence = async () => {
          try {
            const sequenceDuration = await playSequenceOnce();
            if (isLooping) {
              loopIntervalRef.current = setInterval(() => {
                playSequenceOnce();
              }, sequenceDuration);
            }
          } catch (error) {
            console.error('❌ Settings restart error:', error);
            emergencyReset();
          }
        };
        startNewSequence();
      }, 50);
    }
  }, [tempo, withMetronome, metronomeMultiplier, isPlaying, playSequenceOnce, isLooping, emergencyReset]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
      audioEngine.stopAll();
    };
  }, []);

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
          handleGenerate();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, withMetronome, handlePlay, handleStop, toggleLoop, handleGenerate]);

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
          <Button onClick={handleGenerate} variant="outline">
            <Shuffle className="w-4 h-4 mr-2" />
            Generate New <span className="text-xs opacity-75">(R)</span>
          </Button>
        </div>



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