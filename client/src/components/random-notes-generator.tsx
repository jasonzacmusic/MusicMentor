import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Shuffle, Play, Square, RotateCcw } from 'lucide-react';
import { generateRandomNotes, getChordFromNote, getBeginnerChordsForNote, type Chord, applyVoiceLeading } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import { audioEngine } from '@/lib/audio-engine';

interface RandomNotesGeneratorProps {
  onNotesChange?: (notes: string[]) => void;
  onChordsChange?: (chords: (Chord | null)[]) => void;
  selectedChords?: (Chord | null)[];
  inversionModes?: ('auto' | 'root' | 'first' | 'second')[];
}

export default function RandomNotesGenerator({ onNotesChange, onChordsChange, selectedChords = [null, null, null], inversionModes = ['auto', 'auto', 'auto'] }: RandomNotesGeneratorProps) {
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
    
    // Clear all chord selections when generating new notes
    const clearedChords: (Chord | null)[] = [null, null, null];
    onChordsChange?.(clearedChords);
    console.log('🧹 Cleared chord selections after generating new notes');
  }, [onNotesChange, onChordsChange]);

  // Single loop control ref 
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Single sequence control ref
  const isSequenceActiveRef = useRef(false);
  // Track all active timeouts for immediate cancellation
  const activeTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  // Track all scheduled timeouts for cancellation
  const scheduledTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  
  // Store previous chord selection to detect changes
  const prevChordsRef = useRef<(Chord | null)[]>(selectedChords);

  // Function to apply chord inversions with proper pitch ordering
  const applyInversion = (notes: string[], mode: string) => {
    if (mode === 'auto') {
      return notes.map(note => ({ note, octave: 0 })); // Return with octave info for auto mode
    }
    
    if (notes.length !== 3) {
      return notes.map(note => ({ note, octave: 0 }));
    }
    
    const [root, third, fifth] = notes;
    
    switch (mode) {
      case 'root':
        // Root Position: LOWEST=Root, MIDDLE=Third, HIGHEST=Fifth
        // A Major: A(lowest) - C#(middle) - E(highest)
        return [
          { note: root, octave: 0 },   // LOWEST: A4
          { note: third, octave: 0 },  // MIDDLE: C#4
          { note: fifth, octave: 0 }   // HIGHEST: E4
        ];
      case 'first':
        // 1st Inversion: LOWEST=Third, MIDDLE=Fifth, HIGHEST=Root
        // A Major: C#(lowest) - E(middle) - A(highest)
        return [
          { note: third, octave: 0 },  // LOWEST: C#4
          { note: fifth, octave: 0 },  // MIDDLE: E4
          { note: root, octave: 1 }    // HIGHEST: A5 (octave up)
        ];
      case 'second':
        // 2nd Inversion: LOWEST=Fifth, MIDDLE=Root, HIGHEST=Third
        // A Major: E(lowest) - A(middle) - C#(highest)
        return [
          { note: fifth, octave: 0 },  // LOWEST: E4
          { note: root, octave: 1 },   // MIDDLE: A5 (octave up)
          { note: third, octave: 1 }   // HIGHEST: C#5 (octave up)
        ];
      default:
        return notes.map(note => ({ note, octave: 0 }));
    }
  };

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
      console.log('🔄 Cleared loop interval');
    }
    
    // Cancel all scheduled timeouts immediately
    activeTimeoutsRef.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    activeTimeoutsRef.current.clear();
    console.log('🔄 Cancelled all scheduled audio');
    
    // Stop all oscillators immediately
    audioEngine.stopAll();
    
    console.log('✅ Emergency reset complete');
  }, []);

  // ATOMIC SEQUENCE PLAYER - Only one can run at a time
  const playSequenceOnce = useCallback(async () => {
    console.log("🎯 playSequenceOnce called!");
    
    // Guard: Only allow one sequence at a time
    if (isSequenceActiveRef.current) {
      console.log("🚫 Sequence already active, skipping");
      return 8000; // Return 8 second duration
    }

    //SRI: Reset the notes and selected chords before starting a new sequence
    //const defaultNotes = ["Bb", "D", "G"]; // Default to Bb, D, G
    //const defaultChords: (Chord | null)[] = [null, null, null]; // Default to no chords
    //setNotes(defaultNotes);
   // setSelectedChords(defaultChords);
    //onChordsChange?.(defaultChords); // Ensure parent is updated

    isSequenceActiveRef.current = true;
    console.log("🎵 Starting new sequence");
    console.log("🔍 selectedChords at playback start:", selectedChords);

    try {
      if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
        await audioEngine.initialize();
      }
      
      // Always ensure audio context is running
      if (audioEngine.audioContext?.state === 'suspended') {
        await audioEngine.audioContext.resume();
      }

      const beatDuration = 60 / tempo;
      const chordDurations = [2, 2, 4]; // beats per position
      
      // Start with a small buffer to ensure timing stability
      const startTime = audioEngine.audioContext!.currentTime + 0.1; // 100ms buffer for stability
      let currentTime = startTime;

      // Schedule metronome clicks if enabled
      if (withMetronome) {
        console.log(`🥁 Metronome enabled - scheduling clicks at ${metronomeMultiplier}x speed`);
        // Apply multiplier: 1x = quarter notes, 2x = eighth notes, 3x = eighth note triplets
        let metronomeInterval = beatDuration / metronomeMultiplier;
        const totalDuration = 8 * beatDuration; // 8 beats total
        let clickTime = startTime;
        let clickCount = 0;
        while (clickTime < startTime + totalDuration) {
          scheduleMetronomeClick(clickTime);
          console.log(
            `⏰ Scheduling metronome click ${clickCount + 1} at time ${clickTime.toFixed(3)} (${metronomeMultiplier}x speed)`,
          );
          clickTime += metronomeInterval;
          clickCount++;
        }
      } else {
        console.log("🔇 Metronome disabled");
      }

      // MIXED MODE: Check each position individually for chord or note
      console.log(
        "🎼 Mixed Mode - Checking each position:",
        selectedChords.map((c, i) =>
          c ? `Pos${i + 1}:Chord` : `Pos${i + 1}:Note`,
        ),
      );
      
      // Play each position individually (3 positions total)
      for (let i = 0; i < 3; i++) {
        const duration = beatDuration * chordDurations[i];
        const selectedChord = selectedChords[i]; // Get chord for this specific position
        
        console.log(`🎯 Position ${i + 1}: duration=${duration.toFixed(3)}s (${chordDurations[i]} beats), hasChord=${!!selectedChord}`);

        if (selectedChord) {
          // CHORD: Play the selected chord for this position - STRICT 3 NOTES ONLY
          const baseNotes = selectedChord.notes.slice(0, 3); // Ensure only 3 notes

          // VALIDATION: Must be exactly 3 notes
          if (baseNotes.length !== 3) {
            console.error(
              `❌ ERROR: Chord has ${baseNotes.length} notes, expected exactly 3!`,
            );
            return;
          }

          console.log(
            `🎹 Position ${i + 1} - Chord:`,
            selectedChord.name,
            baseNotes,
          );
          console.log(
            `✅ Validated: Playing exactly ${baseNotes.length} notes`,
          );

          // Schedule ONLY these 3 notes with Web Audio timing - NO setTimeout
          baseNotes.forEach((note, noteIndex) => {
            const noteStartTime = currentTime + (noteIndex * 0.05); // 50ms stagger
            console.log(`🔊 Scheduling chord note ${noteIndex + 1}/3: ${note} at time ${noteStartTime.toFixed(3)}`);
            audioEngine.playNote(note, duration * 1000, 0, noteStartTime).catch(err => {
              console.error('Error playing chord note:', err);
            });
          });
        } else {
          // NOTE: Play individual note for this position using Web Audio scheduling
          let octaveOffset = 0;
          if (i === 2) octaveOffset = -1; // Note 3 below Note 1

          console.log(
            `🎵 Position ${i + 1} - Note:`,
            notes[i],
            "octave:",
            octaveOffset,
          );

          // Use Web Audio scheduling directly - no setTimeout delays
          console.log(`🔊 Scheduling note: ${notes[i]} at time ${currentTime.toFixed(3)}`);
          audioEngine.playNote(notes[i], duration * 1000, octaveOffset, currentTime).catch(err => {
            console.error('Error playing note:', err);
          });
        }

        currentTime += duration;
      }

      // Calculate actual duration in milliseconds
      const totalDurationSeconds = currentTime - startTime;
      const totalDurationMs = totalDurationSeconds * 1000;

      console.log(`⏱️ Sequence duration calculated: ${totalDurationMs}ms (${totalDurationSeconds.toFixed(3)}s)`);

      // Mark sequence as complete after duration - still use setTimeout for completion tracking
      const completionTimeout = setTimeout(() => {
        isSequenceActiveRef.current = false;
        console.log("✅ Sequence complete");
      }, totalDurationMs);
      activeTimeoutsRef.current.add(completionTimeout);

      return totalDurationMs;
    } catch (error) {
      console.error("❌ Sequence error:", error);
      isSequenceActiveRef.current = false;
      return 8000;
    }
  }, [selectedChords, notes, tempo, withMetronome, inversionModes]);

  // SIMPLIFIED PLAY FUNCTION  
  const handlePlay = useCallback(async () => {
    console.log('▶️ PLAY PRESSED - Starting sequence');
    
    if (isPlaying) {      
      emergencyReset();
      return;
    }

    // Pre-initialize audio context and wait for it to be ready
    if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
      await audioEngine.initialize();
    }
    
    // Ensure audio context is running and stable
    if (audioEngine.audioContext?.state === 'suspended') {
      await audioEngine.audioContext.resume();
      // Small delay to ensure context is fully running
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setIsPlaying(true);

    try {
      const sequenceDuration = await playSequenceOnce();
      console.log('⏱️ Duration:', sequenceDuration, 'ms');
      
      // Only loop if Auto Loop is enabled
      if (isLooping) {
        console.log('🔄 Setting up seamless loop');
        
        loopIntervalRef.current = setInterval(async () => {
          if (isLooping && isPlaying) {
            console.log('🔄 Loop trigger');
            try {
              await playSequenceOnce();
            } catch (error) {
              console.error('Loop playback error:', error);
            }
          }
        }, sequenceDuration);
      } else {
        console.log('🔇 Auto Loop disabled - playing once only');
        // Set playing to false after the sequence completes
        setTimeout(() => {
          setIsPlaying(false);
        }, sequenceDuration);
      }
    } catch (error) {
      console.error('❌ Play error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, isLooping, playSequenceOnce, emergencyReset]);

  // REMOVED OLD CONFLICTING AUDIO FUNCTIONS

  // SIMPLIFIED NOTE SCHEDULING
  const scheduleNote = (note: string, startTime: number, duration: number, octaveOffset: number = 0) => {
    try {
      // Use audioEngine's built-in playNote method instead
      audioEngine.playNote(note, duration * 1000, octaveOffset).catch(error => {
        console.error('Note scheduling error:', error);
      });
    } catch (error) {
      console.error('Note scheduling error:', error);
    }
  };

  // SIMPLIFIED METRONOME - Schedule at specific time
  const scheduleMetronomeClick = (time: number) => {
    try {
      if (audioEngine.audioContext && audioEngine.masterGainNode) {
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

        // Track metronome oscillators in audio engine for proper stopping
        audioEngine.activeOscillators.add(oscillator);

        try {
          oscillator.start(time);
          oscillator.stop(time + clickDuration);
        } catch (error) {
          console.error('Error with metronome click:', error);
          audioEngine.activeOscillators.delete(oscillator);
        }
        
        // Remove from tracking when it ends
        oscillator.addEventListener('ended', () => {
          audioEngine.activeOscillators.delete(oscillator);
        });
        
        console.log(`🥁 Metronome click scheduled at ${time.toFixed(3)}`);
      }
    } catch (error) {
      console.error('Metronome scheduling error:', error);
    }
  };

  // Add generate function
  const handleGenerate = useCallback(() => {
    console.log('🎲 GENERATE PRESSED');
    
    // Always reset before generating
    emergencyReset();
    
    // Generate new notes and clear chords
    generateNew();
    
    // Add small delay to ensure state has updated
    setTimeout(() => {
      console.log('🔄 Post-generate chord state check:', selectedChords);
    }, 50);
  }, [generateNew, emergencyReset, selectedChords]);

  const handleStop = useCallback(() => {
    console.log('⏹️ STOP PRESSED');
     // Resetting the sequence active flag
    isSequenceActiveRef.current = false; // Prevents any new sequences from starting
    emergencyReset();
  }, [emergencyReset]);

  const toggleLoop = useCallback(() => {
    setIsLooping(!isLooping);
  }, [isLooping]);

  // RANDOM HARMONIZER - Select random chords from available options for each note
  const handleRandomHarmonize = useCallback(() => {
    console.log('🎭 RANDOM HARMONIZER PRESSED');
    
    // Get beginner chords for each note position
    
    const randomChords: (Chord | null)[] = [];
    
    // For each note position, get its available chords and pick one randomly
    for (let i = 0; i < 3; i++) {
      const noteForPosition = notes[i];
      const availableChords = getBeginnerChordsForNote(noteForPosition);
      
      if (availableChords.length > 0) {
        // Pick a random chord from the 6 available options
        const randomIndex = Math.floor(Math.random() * availableChords.length);
        const selectedChord = availableChords[randomIndex];
        randomChords.push(selectedChord);
        console.log(`🎯 Position ${i + 1} (${noteForPosition}): Selected "${selectedChord.name}" from ${availableChords.length} options`);
      } else {
        randomChords.push(null);
        console.log(`❌ Position ${i + 1} (${noteForPosition}): No chords available`);
      }
    }
    
    console.log('🎯 Random chords selected:', randomChords.map(c => c?.name || 'None'));
    
    // Update the chord selections
    onChordsChange?.(randomChords);
    
    // Always start playing after selecting random chords
    setTimeout(() => {
      emergencyReset(); // Always reset first to clear any existing audio
      setTimeout(() => {
        handlePlay();
      }, 150);
    }, 50);
  }, [notes, onChordsChange, isPlaying, handlePlay, emergencyReset]);

  // Monitor tempo/metronome changes and restart if playing
  useEffect(() => {
    if (isPlaying) {
      console.log('🔄 Settings changed - restarting playback');
      // Reset and restart manually to avoid handlePlay dependency
      emergencyReset();
      setTimeout(async () => {
        setIsPlaying(true);
        try {
          const sequenceDuration = await playSequenceOnce();
          console.log('⏱️ Restarted duration:', sequenceDuration, 'ms');
          
          if (isLooping) {
            loopIntervalRef.current = setInterval(async () => {
              if (isLooping && isPlaying) {
                console.log('🔄 Restart loop trigger');
                try {
                  await playSequenceOnce();
                } catch (error) {
                  console.error('Restart loop error:', error);
                }
              }
            }, sequenceDuration);
          } else {
            setTimeout(() => {
              setIsPlaying(false);
            }, sequenceDuration);
          }
        } catch (error) {
          console.error('❌ Restart error:', error);
          setIsPlaying(false);
        }
      }, 100);
    }
  }, [tempo, withMetronome]); // Only tempo and metronome, no other deps to avoid loops

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
                  onCheckedChange={(checked) => setWithMetronome(checked === true)}
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
        <div className="space-y-4 mb-6">
          <div className="flex justify-center space-x-3">
            <Button
              onClick={handlePlay}
              variant={isPlaying ? "default" : "outline"}
              className={`${isPlaying ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white min-w-[120px]`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop (Space)
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play (Space)
                </>
              )}
            </Button>

            <Button
              onClick={handleRandomHarmonize}
              variant="outline"
              className="hover:bg-purple-50 border-purple-200 text-purple-600 min-w-[140px]"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Random Chords
            </Button>

            <Button
              onClick={toggleLoop}
              variant={isLooping ? "default" : "outline"}
              className={`${isLooping ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 border-blue-200'} min-w-[120px] ${isLooping ? 'text-white' : 'text-blue-600'}`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Auto Loop: {isLooping ? 'ON' : 'OFF'}
            </Button>
            
            <Button
              onClick={handleGenerate}
              variant="outline"
              className="hover:bg-orange-50 border-orange-200 text-orange-600 min-w-[140px]"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Generate New (R)
            </Button>
          </div>


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


      </CardContent>
    </Card>
  );
}