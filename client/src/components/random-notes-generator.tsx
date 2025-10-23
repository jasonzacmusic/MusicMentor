import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Shuffle, Play, Square, RotateCcw } from 'lucide-react';
import { generateRandomNotes, getChordFromNote, getChordsForNoteBySkill, type Chord, type SkillLevel, applyVoiceLeading } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import { audioEngine } from '@/lib/audio-engine';
import { isFeatureEnabled } from '@/lib/feature-flags';

interface RandomNotesGeneratorProps {
  onNotesChange?: (notes: string[]) => void;
  onChordsChange?: (chords: (Chord | null)[]) => void;
  selectedChords?: (Chord | null)[];
  inversionModes?: ('auto' | 'root' | 'first' | 'second')[];
  skillLevel?: SkillLevel;
}

export default function RandomNotesGenerator({ onNotesChange, onChordsChange, selectedChords = [null, null, null], inversionModes = ['auto', 'auto', 'auto'], skillLevel = 'beginner' }: RandomNotesGeneratorProps) {
  const [notes, setNotes] = useState<string[]>(['Bb', 'D', 'G']); // Default to Bb, D, G
  const [tempo, setTempo] = useState(60);
  const tempoRef = useRef(60); // Ref for real-time tempo access during playback
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Auto Loop state - only active when feature flag is enabled
  const [isLooping, setIsLooping] = useState(false);
  const isLoopingRef = useRef(false); // Ref for real-time loop state access during playback
  
  const [withMetronome, setWithMetronome] = useState(false);
  const withMetronomeRef = useRef(false); // Ref for real-time metronome access
  const [metronomeMultiplier, setMetronomeMultiplier] = useState(1);
  const metronomeMultiplierRef = useRef(1); // Ref for real-time metronome speed access

  // Update refs when values change
  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);
  
  useEffect(() => {
    withMetronomeRef.current = withMetronome;
  }, [withMetronome]);
  
  useEffect(() => {
    metronomeMultiplierRef.current = metronomeMultiplier;
  }, [metronomeMultiplier]);
  
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);
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
  // Store random chords to avoid prop timing issues
  const randomChordsRef = useRef<(Chord | null)[]>([null, null, null]);
  // Store current selected chords for auto-loop
  const currentChordsRef = useRef<(Chord | null)[]>(selectedChords);

  // Update the current chords ref whenever selectedChords changes
  useEffect(() => {
    currentChordsRef.current = selectedChords;
    console.log('🔄 Updated currentChordsRef:', selectedChords.map(c => c?.name || 'Note'));
  }, [selectedChords]);

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

  // DYNAMIC METRONOME with real-time tempo and speed adaptation
  const startDynamicMetronome = useCallback((startRealTime: number) => {
    if (!withMetronomeRef.current) return null;
    
    let lastClickBeat = -1;
    const metronomeStartTime = audioEngine.audioContext!.currentTime + 0.1;
    
    const checkAndPlayMetronome = () => {
      if (!isSequenceActiveRef.current || !withMetronomeRef.current) {
        console.log("🥁 Metronome stopped");
        return;
      }
      
      const realElapsedMs = Date.now() - startRealTime;
      const currentTempo = tempoRef.current;
      const msPerBeat = (60 / currentTempo) * 1000;
      const realElapsedBeats = realElapsedMs / msPerBeat;
      
      // Determine metronome subdivision based on current multiplier
      const currentMultiplier = metronomeMultiplierRef.current;
      let clicksPerBeat = 1;
      switch (currentMultiplier) {
        case 1: clicksPerBeat = 1; break; // Quarter notes
        case 2: clicksPerBeat = 2; break; // Eighth notes
        case 3: clicksPerBeat = 4; break; // Sixteenth notes
      }
      
      const totalClicksElapsed = realElapsedBeats * clicksPerBeat;
      const nextClickNumber = Math.floor(totalClicksElapsed);
      
      // Play click if we've crossed into a new subdivision
      if (nextClickNumber > lastClickBeat && realElapsedBeats < 8) {
        const audioClickTime = metronomeStartTime + (realElapsedMs / 1000);
        scheduleMetronomeClick(audioClickTime);
        lastClickBeat = nextClickNumber;
      }
      
      // Continue polling
      if (isSequenceActiveRef.current && realElapsedBeats < 8) {
        const metronomeTimeout = setTimeout(checkAndPlayMetronome, 10);
        activeTimeoutsRef.current.add(metronomeTimeout);
      }
    };
    
    checkAndPlayMetronome();
  }, []);

  // REAL-TIME TEMPO-ADAPTIVE SEQUENCE PLAYER with dynamic metronome (Promise-based)
  const playSequenceOnce = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log("🎯 playSequenceOnce called!");
      
      if (isSequenceActiveRef.current) {
        console.log("🚫 Sequence already active, skipping");
        resolve();
        return;
      }

      isSequenceActiveRef.current = true;
      console.log("🎵 Starting real-time tempo-adaptive sequence");

      const initializeAndPlay = async () => {
        try {
          if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
            await audioEngine.initialize();
          }
          
          if (audioEngine.audioContext?.state === 'suspended') {
            await audioEngine.audioContext.resume();
          }

          const chordDurations = [2, 2, 4]; // beats per position
          let positionIndex = 0;
          let elapsedBeats = 0;
          const startRealTime = Date.now();
          
          // Start dynamic metronome
          startDynamicMetronome(startRealTime);
          
          // Polling function that checks if it's time to play next position
          const checkAndPlayNext = () => {
            if (positionIndex >= 3 || !isSequenceActiveRef.current) {
              isSequenceActiveRef.current = false;
              // Clear all pending timeouts before resolving
              activeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
              activeTimeoutsRef.current.clear();
              console.log("✅ Sequence complete");
              resolve(); // Resolve promise on actual completion
              return;
            }

            // Calculate how many beats have elapsed based on current tempo
            const realElapsedMs = Date.now() - startRealTime;
            const currentTempo = tempoRef.current;
            const msPerBeat = (60 / currentTempo) * 1000;
            const realElapsedBeats = realElapsedMs / msPerBeat;

            // Check if it's time to play the next position
            if (realElapsedBeats >= elapsedBeats) {
              const durationBeats = chordDurations[positionIndex];
              const durationMs = (60 / currentTempo) * durationBeats * 1000;
              const selectedChord = selectedChords[positionIndex];
              const audioStartTime = audioEngine.audioContext!.currentTime + 0.05;
              
              console.log(`🎯 Pos ${positionIndex + 1}: tempo=${currentTempo} BPM, ${durationBeats}beats = ${(durationMs/1000).toFixed(2)}s`);

              if (selectedChord) {
                const baseNotes = selectedChord.notes.slice(0, 3);
                if (baseNotes.length === 3) {
                  audioEngine.playChord(baseNotes, durationMs, audioStartTime, currentTempo, selectedChord.rootNote, selectedChord.octaves).catch(err => {
                    console.error('Error playing chord:', err);
                  });
                }
              } else {
                const octaveOffset = (positionIndex === 2) ? -1 : 0;
                audioEngine.playNote(notes[positionIndex], durationMs, octaveOffset, audioStartTime).catch(err => {
                  console.error('Error playing note:', err);
                });
              }

              elapsedBeats += durationBeats;
              positionIndex++;
              
              // Check if we just completed the last position
              if (positionIndex >= 3) {
                isSequenceActiveRef.current = false;
                // Clear all pending timeouts before resolving
                activeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
                activeTimeoutsRef.current.clear();
                console.log("✅ Sequence complete");
                resolve();
                return;
              }
            }

            // Continue polling every 10ms
            if (positionIndex < 3 && isSequenceActiveRef.current) {
              const pollTimeout = setTimeout(() => {
                // Remove this timeout from tracking when it fires
                activeTimeoutsRef.current.delete(pollTimeout);
                checkAndPlayNext();
              }, 10);
              activeTimeoutsRef.current.add(pollTimeout);
            }
          };

          // Start polling
          checkAndPlayNext();
        } catch (error) {
          console.error("❌ Sequence error:", error);
          isSequenceActiveRef.current = false;
          reject(error);
        }
      };

      initializeAndPlay();
    });
  }, [selectedChords, notes, startDynamicMetronome]);

  // DEDICATED FUNCTION FOR RANDOM CHORD PLAYBACK with dynamic tempo/metronome (Promise-based)
  const playSequenceWithChords = useCallback((chordsToPlay: (Chord | null)[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log("🎯 playSequenceWithChords called with:", chordsToPlay.map(c => c?.name || 'Note'));
      
      if (isSequenceActiveRef.current) {
        console.log("🚫 Sequence already active, skipping");
        resolve();
        return;
      }

      isSequenceActiveRef.current = true;
      console.log("🎵 Starting real-time chord sequence");

      const initializeAndPlay = async () => {
        try {
          if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
            await audioEngine.initialize();
          }
          
          if (audioEngine.audioContext?.state === 'suspended') {
            await audioEngine.audioContext.resume();
          }

          const chordDurations = [2, 2, 4]; // beats per position
          let positionIndex = 0;
          let elapsedBeats = 0;
          const startRealTime = Date.now();
          
          // Start dynamic metronome
          startDynamicMetronome(startRealTime);
          
          // Polling function for chord playback
          const checkAndPlayNext = () => {
            if (positionIndex >= 3 || !isSequenceActiveRef.current) {
              isSequenceActiveRef.current = false;
              // Clear all pending timeouts before resolving
              activeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
              activeTimeoutsRef.current.clear();
              console.log("✅ Chord sequence complete");
              resolve(); // Resolve promise on actual completion
              return;
            }

            const realElapsedMs = Date.now() - startRealTime;
            const currentTempo = tempoRef.current;
            const msPerBeat = (60 / currentTempo) * 1000;
            const realElapsedBeats = realElapsedMs / msPerBeat;

            if (realElapsedBeats >= elapsedBeats) {
              const durationBeats = chordDurations[positionIndex];
              const durationMs = (60 / currentTempo) * durationBeats * 1000;
              const chordToPlay = chordsToPlay[positionIndex];
              const audioStartTime = audioEngine.audioContext!.currentTime + 0.05;
              
              console.log(`🎯 Pos ${positionIndex + 1}: tempo=${currentTempo} BPM, ${durationBeats}beats, hasChord=${!!chordToPlay}`);

              if (chordToPlay) {
                const baseNotes = chordToPlay.notes.slice(0, 3);
                if (baseNotes.length === 3) {
                  audioEngine.playChord(baseNotes, durationMs, audioStartTime, currentTempo, chordToPlay.rootNote, chordToPlay.octaves).catch(err => {
                    console.error('Error playing chord:', err);
                  });
                }
              } else {
                const octaveOffset = (positionIndex === 2) ? -1 : 0;
                audioEngine.playNote(notes[positionIndex], durationMs, octaveOffset, audioStartTime).catch(err => {
                  console.error('Error playing note:', err);
                });
              }

              elapsedBeats += durationBeats;
              positionIndex++;
              
              // Check if we just completed the last position
              if (positionIndex >= 3) {
                isSequenceActiveRef.current = false;
                // Clear all pending timeouts before resolving
                activeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
                activeTimeoutsRef.current.clear();
                console.log("✅ Chord sequence complete");
                resolve();
                return;
              }
            }

            if (positionIndex < 3 && isSequenceActiveRef.current) {
              const pollTimeout = setTimeout(() => {
                // Remove this timeout from tracking when it fires
                activeTimeoutsRef.current.delete(pollTimeout);
                checkAndPlayNext();
              }, 10);
              activeTimeoutsRef.current.add(pollTimeout);
            }
          };

          checkAndPlayNext();
        } catch (error) {
          console.error("❌ Chord sequence error:", error);
          isSequenceActiveRef.current = false;
          reject(error);
        }
      };

      initializeAndPlay();
    });
  }, [notes, startDynamicMetronome]);

  // PLAY FUNCTION WITH SPECIFIC CHORDS - bypasses prop timing issues
  const handlePlayWithChords = useCallback(async (chordsToUse: (Chord | null)[]) => {
    console.log('▶️ PLAY WITH CHORDS - Using provided chords:', chordsToUse.map(c => c?.name || 'Note'));
    
    if (isPlaying) {      
      emergencyReset();
      return;
    }

    // Pre-initialize audio context
    if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
      await audioEngine.initialize();
    }
    
    if (audioEngine.audioContext?.state === 'suspended') {
      await audioEngine.audioContext.resume();
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setIsPlaying(true);

    try {
      // Await actual sequence completion
      await playSequenceWithChords(chordsToUse);
      console.log('⏱️ Sequence with specific chords complete');
      
      // Check if we should loop or play once
      const currentShouldLoop = isFeatureEnabled('AUTO_LOOP') && isLooping;
      
      if (currentShouldLoop) {
        console.log('🔄 Auto Loop enabled for specific chords');
        
        const runLoop = async () => {
          while (isFeatureEnabled('AUTO_LOOP') && isLoopingRef.current) {
            // Use current chords from ref to get real-time updates
            const currentChords = currentChordsRef.current;
            console.log('🔄 Loop iteration - Reading from REF:', currentChords.map(c => c?.name || 'Note'));
            try {
              await playSequenceWithChords(currentChords);
              console.log('⏱️ Loop iteration complete');
            } catch (error) {
              console.error('Loop iteration error:', error);
              setIsPlaying(false);
              break;
            }
          }
          // Loop exited - stop playing
          setIsPlaying(false);
        };
        
        runLoop();
      } else {
        // Single play - stop after completion
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('❌ Play with chords error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, isLooping, emergencyReset, playSequenceWithChords, selectedChords]);

  // SIMPLIFIED PLAY FUNCTION  
  const handlePlay = useCallback(async () => {
    console.log('▶️ PLAY PRESSED - Starting sequence');
    
    // Track play sequence event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'play_sequence', {
        event_category: 'music_interaction'
      });
    }
    
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
      // Await actual sequence completion
      await playSequenceOnce();
      console.log('⏱️ Sequence complete');
      
      // Check if we should loop or play once
      const currentShouldLoop = isFeatureEnabled('AUTO_LOOP') && isLooping;
      
      if (currentShouldLoop) {
        console.log('🔄 Auto Loop enabled - seamless continuous playback');
        
        const runLoop = async () => {
          while (isFeatureEnabled('AUTO_LOOP') && isLoopingRef.current) {
            console.log('🔄 Loop iteration - starting next sequence');
            try {
              await playSequenceOnce();
              console.log('⏱️ Loop iteration complete');
            } catch (error) {
              console.error('Loop iteration error:', error);
              setIsPlaying(false);
              break;
            }
          }
          // Loop exited - stop playing
          setIsPlaying(false);
        };
        
        runLoop();
      } else {
        // Single play - stop after completion
        console.log('🔇 Single play - stopping after sequence');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('❌ Play error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, playSequenceOnce, emergencyReset, isLooping]);

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
    
    // Track generate chords event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'generate_chords', {
        event_category: 'music_interaction'
      });
    }
    
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
    
    // Exit auto loop when stopping
    if (isFeatureEnabled('AUTO_LOOP') && isLooping) {
      setIsLooping(false);
      console.log('🔄 Exiting Auto Loop mode');
    }
    
    emergencyReset();
  }, [emergencyReset, isLooping]);

  // Auto Loop toggle function - only works if feature enabled
  const toggleLoop = useCallback(() => {
    if (!isFeatureEnabled('AUTO_LOOP')) {
      console.log('🚫 Auto Loop feature disabled');
      return;
    }
    
    const newLoopState = !isLooping;
    setIsLooping(newLoopState);
    console.log(`🔄 Auto Loop ${newLoopState ? 'ENABLED' : 'DISABLED'}`);
  }, [isLooping]);





  // RANDOM HARMONIZER - Select random chords from available options for each note
  const handleRandomHarmonize = useCallback(() => {
    console.log('🎭 RANDOM HARMONIZER PRESSED');
    
    // Get beginner chords for each note position
    
    const randomChords: (Chord | null)[] = [];
    
    // For each note position, get its available chords and pick one randomly
    for (let i = 0; i < 3; i++) {
      const noteForPosition = notes[i];
      const availableChords = getChordsForNoteBySkill(noteForPosition, skillLevel);
      
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
    
    // Store the random chords in the ref to avoid prop timing issues
    randomChordsRef.current = randomChords;

    // Always start playing after selecting random chords
    setTimeout(() => {
      emergencyReset(); // Always reset first to clear any existing audio
      setTimeout(() => {
        // Use the stored random chords directly instead of relying on prop updates
        console.log('🎯 Playing with stored random chords:', randomChordsRef.current.map(c => c?.name || 'None'));
        handlePlayWithChords(randomChordsRef.current);
      }, 100);
    }, 50);
  }, [notes, onChordsChange, isPlaying, handlePlay, emergencyReset]);

  // Use refs to track previous values for tempo restart detection
  const prevTempoRef = useRef(tempo);
  const prevMetronomeRef = useRef(withMetronome);

  // Monitor metronome changes and restart if playing
  // Note: Tempo changes do NOT restart - they take effect on next play/loop
  // Log tempo/metronome changes for debugging (no restart needed - dynamic polling handles it)
  useEffect(() => {
    const tempoChanged = prevTempoRef.current !== tempo;
    const metronomeChanged = prevMetronomeRef.current !== withMetronome;
    
    console.log('🔄 Tempo/Metronome effect triggered:', {
      isPlaying,
      tempoChanged,
      metronomeChanged,
      prevTempo: prevTempoRef.current,
      newTempo: tempo,
      prevMetronome: prevMetronomeRef.current,
      newMetronome: withMetronome
    });
    
    // Update refs for next comparison
    prevTempoRef.current = tempo;
    prevMetronomeRef.current = withMetronome;
    
    // Note: No restart needed! Dynamic polling system handles tempo/metronome changes seamlessly
  }, [tempo, withMetronome, isPlaying]);

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
          // Only enable keyboard shortcut if feature is enabled
          if (isFeatureEnabled('AUTO_LOOP')) {
            event.preventDefault();
            toggleLoop();
          }
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
    <div className="space-y-4">
      {/* Title aligned to the left */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white text-left">Random Note Practice</h3>
      </div>

      {/* Three buttons: Generate, Pause/Play, Auto Loop */}
      <div className="flex space-x-2">
        <Button
          onClick={handleGenerate}
          variant="outline"
          className="hover:bg-orange-50 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 flex-1"
          data-testid="button-generate"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Generate
        </Button>
        
        <Button
          onClick={handlePlay}
          variant={isPlaying ? "default" : "outline"}
          className={`${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white flex-1`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play
            </>
          )}
        </Button>

        {/* Auto Loop Button - only show if feature enabled */}
        {isFeatureEnabled('AUTO_LOOP') && (
          <Button
            onClick={toggleLoop}
            variant={isLooping ? "default" : "outline"}
            className={`${isLooping ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-700'} flex-1 ${isLooping ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}
            data-testid="button-auto-loop"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Auto Loop
          </Button>
        )}
      </div>

      {/* Random Chords button directly below Pause/Play */}
      <div className="flex justify-center">
        <Button
          onClick={handleRandomHarmonize}
          variant="outline"
          className="hover:bg-purple-50 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 w-full max-w-[200px]"
          data-testid="button-random-chords"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Random Chords
        </Button>
      </div>

      {/* Tempo slider and metronome */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="metronome"
            checked={withMetronome}
            onCheckedChange={(checked) => setWithMetronome(checked === true)}
          />
          <label htmlFor="metronome" className="text-xs font-medium text-gray-700 dark:text-white">
            Metronome
          </label>
        </div>
        
        <div className="flex-1 flex items-center space-x-2">
          <label className="text-xs font-medium text-gray-700 dark:text-white min-w-[60px]">
            {tempo} BPM
          </label>
          <Slider
            value={[tempo]}
            onValueChange={(value) => setTempo(value[0])}
            min={60}
            max={200}
            step={10}
            className="flex-1"
          />
        </div>
      </div>

      {/* Metronome speed controls */}
      {withMetronome && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600 dark:text-white">Speed:</span>
          <div className="flex space-x-1">
            {[
              { value: 1, label: '♩' }, // Quarter notes
              { value: 2, label: '♫' }, // Eighth notes
              { value: 3, label: '♬' }  // Sixteenth notes
            ].map(({ value, label }) => (
              <Button
                key={value}
                size="sm"
                variant={metronomeMultiplier === value ? "default" : "outline"}
                onClick={() => {
                  console.log(`🔄 Setting metronome multiplier from ${metronomeMultiplier} to ${value}`);
                  setMetronomeMultiplier(value);
                }}
                className="px-2 py-1 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-white flex flex-wrap gap-2 justify-center">
          <span><kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-gray-900 dark:text-white">Space</kbd> Play/Pause</span>
          <span><kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-gray-900 dark:text-white">M</kbd> Metronome</span>
          {isFeatureEnabled('AUTO_LOOP') && (
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-gray-900 dark:text-white">L</kbd> Loop</span>
          )}
          <span><kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-gray-900 dark:text-white">R</kbd> Generate</span>
        </div>
      </div>
    </div>
  );
}