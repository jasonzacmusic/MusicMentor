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
  const [tempo, setTempo] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Auto Loop state - only active when feature flag is enabled
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

  // ATOMIC SEQUENCE PLAYER - Only one can run at a time
  const playSequenceOnce = useCallback(async () => {
    console.log("🎯 playSequenceOnce called!");
    
    // Guard: Only allow one sequence at a time
    if (isSequenceActiveRef.current) {
      console.log("🚫 Sequence already active, skipping");
      return 8000; // Return 8 second duration
    }


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
        const metronomeLabel = metronomeMultiplier === 1 ? 'Quarter notes' : metronomeMultiplier === 2 ? 'Eighth notes' : 'Sixteenth notes';
        console.log(`🥁 Metronome enabled - ${metronomeLabel}`);
        const totalDuration = 8 * beatDuration; // 8 beats total
        
        // Calculate metronome interval based on subdivision:
        // 1x = quarter notes (beatDuration), 2x = eighth notes (beatDuration/2), 3x = sixteenth notes (beatDuration/4)
        let metronomeInterval;
        switch (metronomeMultiplier) {
          case 1: // Quarter notes
            metronomeInterval = beatDuration;
            break;
          case 2: // Eighth notes  
            metronomeInterval = beatDuration / 2;
            break;
          case 3: // Sixteenth notes
            metronomeInterval = beatDuration / 4;
            break;
          default:
            metronomeInterval = beatDuration;
        }
        
        // Calculate exact number of clicks to avoid floating point precision issues
        const totalClicks = Math.floor((totalDuration / metronomeInterval) + 0.0001); // Small epsilon for precision
        console.log(`🥁 Metronome: multiplier=${metronomeMultiplier}, interval=${metronomeInterval.toFixed(3)}s, clicks=${totalClicks}`);
        
        for (let clickCount = 0; clickCount < totalClicks; clickCount++) {
          const clickTime = startTime + (clickCount * metronomeInterval);
          
          // Double-check we don't exceed the total duration (safety check)
          if (clickTime >= startTime + totalDuration) {
            console.log(`🛑 Stopping metronome at click ${clickCount + 1} - would exceed duration`);
            break;
          }
          
          scheduleMetronomeClick(clickTime);
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

      // Calculate exact duration from beats for precise timing
      const exactDurationSeconds = (chordDurations[0] + chordDurations[1] + chordDurations[2]) * beatDuration;
      const exactDurationMs = exactDurationSeconds * 1000;

      console.log(`⏱️ Sequence duration: ${exactDurationMs}ms (${exactDurationSeconds.toFixed(3)}s) - using beat-based calculation`);

      // Mark sequence as complete after duration - use exact beat-based timing
      const completionTimeout = setTimeout(() => {
        isSequenceActiveRef.current = false;
        console.log("✅ Sequence complete");
      }, exactDurationMs);
      activeTimeoutsRef.current.add(completionTimeout);

      return exactDurationMs;
    } catch (error) {
      console.error("❌ Sequence error:", error);
      isSequenceActiveRef.current = false;
      return 8000;
    }
  }, [selectedChords, notes, tempo, withMetronome, metronomeMultiplier, inversionModes]);

  // DEDICATED FUNCTION FOR RANDOM CHORD PLAYBACK - Uses chord array directly
  const playSequenceWithChords = useCallback(async (chordsToPlay: (Chord | null)[]) => {
    console.log("🎯 playSequenceWithChords called with:", chordsToPlay.map(c => c?.name || 'Note'));
    
    // Guard: Only allow one sequence at a time
    if (isSequenceActiveRef.current) {
      console.log("🚫 Sequence already active, skipping");
      return 8000;
    }

    isSequenceActiveRef.current = true;
    console.log("🎵 Starting chord sequence");

    try {
      if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
        await audioEngine.initialize();
      }
      
      if (audioEngine.audioContext?.state === 'suspended') {
        await audioEngine.audioContext.resume();
      }

      const beatDuration = 60 / tempo;
      const chordDurations = [2, 2, 4]; // beats per position
      
      const startTime = audioEngine.audioContext!.currentTime + 0.1;
      let currentTime = startTime;

      // Schedule metronome clicks if enabled
      if (withMetronome) {
        const metronomeLabel = metronomeMultiplier === 1 ? 'Quarter notes' : metronomeMultiplier === 2 ? 'Eighth notes' : 'Sixteenth notes';
        console.log(`🥁 Metronome enabled for chord sequence (${metronomeLabel})`);
        const totalDuration = 8 * beatDuration;
        
        // Calculate metronome interval based on subdivision:
        // 1x = quarter notes (beatDuration), 2x = eighth notes (beatDuration/2), 3x = sixteenth notes (beatDuration/4)
        let metronomeInterval;
        switch (metronomeMultiplier) {
          case 1: // Quarter notes
            metronomeInterval = beatDuration;
            break;
          case 2: // Eighth notes  
            metronomeInterval = beatDuration / 2;
            break;
          case 3: // Sixteenth notes
            metronomeInterval = beatDuration / 4;
            break;
          default:
            metronomeInterval = beatDuration;
        }
        
        const totalClicks = Math.floor((totalDuration / metronomeInterval) + 0.0001);
        console.log(`🥁 Metronome: multiplier=${metronomeMultiplier}, interval=${metronomeInterval.toFixed(3)}s, clicks=${totalClicks}`);
        
        for (let clickCount = 0; clickCount < totalClicks; clickCount++) {
          const clickTime = startTime + (clickCount * metronomeInterval);
          if (clickTime >= startTime + totalDuration) break;
          scheduleMetronomeClick(clickTime);
        }
      }

      // Play each position using the provided chords
      for (let i = 0; i < 3; i++) {
        const duration = beatDuration * chordDurations[i];
        const chordToPlay = chordsToPlay[i];
        
        console.log(`🎯 Position ${i + 1}: duration=${duration.toFixed(3)}s, hasChord=${!!chordToPlay}`);

        if (chordToPlay) {
          // CHORD: Play the chord notes
          const baseNotes = chordToPlay.notes.slice(0, 3);

          if (baseNotes.length !== 3) {
            console.error(`❌ ERROR: Chord has ${baseNotes.length} notes, expected exactly 3!`);
            return 8000;
          }

          console.log(`🎹 Position ${i + 1} - Chord:`, chordToPlay.name, baseNotes);

          baseNotes.forEach((note, noteIndex) => {
            const noteStartTime = currentTime + (noteIndex * 0.05);
            console.log(`🔊 Scheduling chord note ${noteIndex + 1}/3: ${note} at time ${noteStartTime.toFixed(3)}`);
            audioEngine.playNote(note, duration * 1000, 0, noteStartTime).catch(err => {
              console.error('Error playing chord note:', err);
            });
          });
        } else {
          // NOTE: Play individual note fallback
          let octaveOffset = 0;
          if (i === 2) octaveOffset = -1;

          console.log(`🎵 Position ${i + 1} - Note:`, notes[i], "octave:", octaveOffset);
          console.log(`🔊 Scheduling note: ${notes[i]} at time ${currentTime.toFixed(3)}`);
          audioEngine.playNote(notes[i], duration * 1000, octaveOffset, currentTime).catch(err => {
            console.error('Error playing note:', err);
          });
        }

        currentTime += duration;
      }

      // Calculate exact duration from beats for precise timing
      const exactDurationSeconds = (chordDurations[0] + chordDurations[1] + chordDurations[2]) * beatDuration;
      const exactDurationMs = exactDurationSeconds * 1000;

      console.log(`⏱️ Chord sequence duration: ${exactDurationMs}ms (${exactDurationSeconds.toFixed(3)}s)`);

      // Mark sequence as complete after duration
      const completionTimeout = setTimeout(() => {
        isSequenceActiveRef.current = false;
        console.log("✅ Chord sequence complete");
      }, exactDurationMs);
      activeTimeoutsRef.current.add(completionTimeout);

      return exactDurationMs;
    } catch (error) {
      console.error("❌ Chord sequence error:", error);
      isSequenceActiveRef.current = false;
      return 8000;
    }
  }, [notes, tempo, withMetronome, metronomeMultiplier]);

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
      const sequenceDuration = await playSequenceWithChords(chordsToUse);
      console.log('⏱️ Duration with specific chords:', sequenceDuration, 'ms');
      
      // Check if we should loop or play once
      const currentShouldLoop = isFeatureEnabled('AUTO_LOOP') && isLooping;
      
      if (currentShouldLoop) {
        console.log('🔄 Auto Loop enabled for specific chords');
        
        const scheduleNextLoop = () => {
          const loopTimeout = setTimeout(async () => {
            if (isFeatureEnabled('AUTO_LOOP') && isLooping) {
              // Use current chords from ref to get real-time updates
              const currentChords = currentChordsRef.current;
              console.log('🔄 Loop iteration with current chords from ref:', currentChords.map(c => c?.name || 'Note'));
              try {
                const nextDuration = await playSequenceWithChords(currentChords);
                console.log('⏱️ Loop duration:', nextDuration, 'ms');
                scheduleNextLoop();
              } catch (error) {
                console.error('Loop iteration error:', error);
                setIsPlaying(false);
              }
            }
          }, sequenceDuration);
          
          activeTimeoutsRef.current.add(loopTimeout);
        };
        
        scheduleNextLoop();
      } else {
        setTimeout(() => {
          setIsPlaying(false);
        }, sequenceDuration);
      }
    } catch (error) {
      console.error('❌ Play with chords error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, isLooping, emergencyReset, playSequenceWithChords, selectedChords]);

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
      
      // Check if we should loop or play once
      const currentShouldLoop = isFeatureEnabled('AUTO_LOOP') && isLooping;
      
      if (currentShouldLoop) {
        console.log('🔄 Auto Loop enabled - seamless continuous playback');
        
        // Create recursive loop function
        const scheduleNextLoop = () => {
          const loopTimeout = setTimeout(async () => {
            // Only continue if still looping - don't check isPlaying here
            if (isFeatureEnabled('AUTO_LOOP') && isLooping) {
              console.log('🔄 Loop iteration - starting next sequence');
              try {
                const nextDuration = await playSequenceOnce();
                console.log('⏱️ Loop duration:', nextDuration, 'ms');
                // Schedule the next loop iteration
                scheduleNextLoop();
              } catch (error) {
                console.error('Loop iteration error:', error);
                setIsPlaying(false);
              }
            }
          }, sequenceDuration);
          
          activeTimeoutsRef.current.add(loopTimeout);
        };
        
        // Start the loop
        scheduleNextLoop();
      } else {
        // Single play - stop after completion
        console.log('🔇 Single play - stopping after sequence');
        setTimeout(() => {
          setIsPlaying(false);
        }, sequenceDuration);
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

  // Monitor tempo/metronome changes and restart if playing
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

    if (isPlaying && (tempoChanged || metronomeChanged)) {
      console.log('🔄 Settings changed - restarting playback');
      // FORCE reset sequence flag to allow restart during playback
      isSequenceActiveRef.current = false;
      // Reset and restart manually to avoid handlePlay dependency
      emergencyReset();
      setTimeout(async () => {
        setIsPlaying(true);
        try {
          const sequenceDuration = await playSequenceOnce();
          console.log('⏱️ Restarted duration:', sequenceDuration, 'ms');
          
          // Handle restart with loop consideration
          const restartShouldLoop = isFeatureEnabled('AUTO_LOOP') && isLooping;
          
          if (restartShouldLoop) {
            // Continue looping after restart
            const scheduleRestartLoop = () => {
              const loopTimeout = setTimeout(async () => {
                if (isFeatureEnabled('AUTO_LOOP') && isLooping) {
                  console.log('🔄 Restart loop iteration');
                  try {
                    const nextDuration = await playSequenceOnce();
                    console.log('⏱️ Restart loop duration:', nextDuration, 'ms');
                    // Schedule the next loop iteration
                    scheduleRestartLoop();
                  } catch (error) {
                    console.error('Restart loop error:', error);
                    setIsPlaying(false);
                  }
                }
              }, sequenceDuration);
              
              activeTimeoutsRef.current.add(loopTimeout);
            };
            
            // Start the restart loop
            scheduleRestartLoop();
          } else {
            // Single playback
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
    
    // Update refs for next comparison
    prevTempoRef.current = tempo;
    prevMetronomeRef.current = withMetronome;
  }, [tempo, withMetronome, isPlaying, playSequenceOnce, emergencyReset, isLooping]); // Include dependencies needed for the effect

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
        <h3 className="text-lg font-medium text-gray-900 text-left">Random Note Practice</h3>
      </div>

      {/* Three buttons: Generate, Pause/Play, Auto Loop */}
      <div className="flex space-x-2">
        <Button
          onClick={handleGenerate}
          variant="outline"
          className="hover:bg-orange-50 border-orange-200 text-orange-600 flex-1"
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
            className={`${isLooping ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 border-blue-200'} flex-1 ${isLooping ? 'text-white' : 'text-blue-600'}`}
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
          className="hover:bg-purple-50 border-purple-200 text-purple-600 w-full max-w-[200px]"
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
          <label htmlFor="metronome" className="text-xs font-medium text-gray-700">
            Metronome
          </label>
        </div>
        
        <div className="flex-1 flex items-center space-x-2">
          <label className="text-xs font-medium text-gray-700 min-w-[60px]">
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
          <span className="text-xs text-gray-600">Speed:</span>
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
      <div className="p-2 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 flex flex-wrap gap-2 justify-center">
          <span><kbd className="px-1 py-0.5 bg-white rounded text-xs">Space</kbd> Play/Pause</span>
          <span><kbd className="px-1 py-0.5 bg-white rounded text-xs">M</kbd> Metronome</span>
          {isFeatureEnabled('AUTO_LOOP') && (
            <span><kbd className="px-1 py-0.5 bg-white rounded text-xs">L</kbd> Loop</span>
          )}
          <span><kbd className="px-1 py-0.5 bg-white rounded text-xs">R</kbd> Generate</span>
        </div>
      </div>
    </div>
  );
}