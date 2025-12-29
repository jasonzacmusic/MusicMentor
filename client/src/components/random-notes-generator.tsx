import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle, Play, Square, RotateCcw, Edit3, Dices } from 'lucide-react';
import { generateRandomNotes, getChordFromNote, getChordsForNoteBySkill, type Chord, type SkillLevel, applyVoiceLeading } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import { audioEngine } from '@/lib/audio-engine';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { VALID_NOTES_FOR_SELECTION } from '@/lib/music-constants';

interface RandomNotesGeneratorProps {
  onNotesChange?: (notes: string[]) => void;
  onChordsChange?: (chords: (Chord | null)[]) => void;
  selectedChords?: (Chord | null)[];
  inversionModes?: ('auto' | 'root' | 'first' | 'second')[];
  skillLevel?: SkillLevel;
  noteCount?: number;
  onNoteCountChange?: (count: number) => void;
}

// Beat duration patterns for different note counts (total: 8 beats)
const BEAT_PATTERNS: Record<number, number[]> = {
  1: [8],
  2: [4, 4],
  3: [2, 2, 4],
  4: [2, 2, 2, 2],
  5: [1.5, 1.5, 1.5, 1.5, 2]
};

export default function RandomNotesGenerator({ onNotesChange, onChordsChange, selectedChords = [null, null, null, null], inversionModes = ['auto', 'auto', 'auto', 'auto'], skillLevel = 'beginner', noteCount = 4, onNoteCountChange }: RandomNotesGeneratorProps) {
  const [notes, setNotes] = useState<string[]>(['Bb', 'D', 'G', 'F']); // Default to 4 notes
  const [inputMode, setInputMode] = useState<'random' | 'manual'>('random');
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

  // Arpeggio speed: 1 = eighth notes (default), 2 = sixteenth notes
  const [arpeggioSpeed, setArpeggioSpeed] = useState(1);
  const arpeggioSpeedRef = useRef(1);

  // Scheduled loop tracking for seamless looping
  const scheduledEndTimeRef = useRef<number>(0);
  const loopSchedulerRef = useRef<number | null>(null);

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

  useEffect(() => {
    arpeggioSpeedRef.current = arpeggioSpeed;
    // Update global for audio engine
    (window as any).__arpeggioSpeed = arpeggioSpeed;
  }, [arpeggioSpeed]);

  // Helper function to generate unique notes
  const generateUniqueNotes = useCallback((count: number, baseNote?: string): string[] => {
    const chromaticNotes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

    // Musical intervals from base note (all unique intervals ensure unique notes)
    const intervals = [0, 4, -3, 7, 5, 2, -5, 1, 6, -1, 3, -4]; // Extended for safety

    // Use provided base or pick random
    const base = baseNote || chromaticNotes[Math.floor(Math.random() * chromaticNotes.length)];
    const baseIndex = chromaticNotes.indexOf(base);

    const usedNotes = new Set<string>();
    const newNotes: string[] = [];

    // First, try to use the musical intervals
    for (let i = 0; i < count && i < intervals.length; i++) {
      const interval = intervals[i];
      const noteIndex = (baseIndex + interval + 12) % 12;
      const note = chromaticNotes[noteIndex];

      if (!usedNotes.has(note)) {
        usedNotes.add(note);
        newNotes.push(note);
      }
    }

    // If we still need more unique notes, pick randomly from remaining
    if (newNotes.length < count) {
      const remainingNotes = chromaticNotes.filter(n => !usedNotes.has(n));
      while (newNotes.length < count && remainingNotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingNotes.length);
        const note = remainingNotes.splice(randomIndex, 1)[0];
        newNotes.push(note);
      }
    }

    return newNotes;
  }, []);

  // Regenerate notes when noteCount changes
  useEffect(() => {
    // Only regenerate if we're in random mode
    if (inputMode === 'random') {
      const baseNote = notes[0] || undefined;
      const newNotes = generateUniqueNotes(noteCount, baseNote);

      setNotes(newNotes);
      onNotesChange?.(newNotes);
      onChordsChange?.(Array(noteCount).fill(null));
      console.log(`🔄 Note count changed to ${noteCount}, regenerated unique notes:`, newNotes);
    }
  }, [noteCount]); // Only depend on noteCount

  const generateNew = useCallback(() => {
    const newNotes = generateUniqueNotes(noteCount);

    setNotes(newNotes);
    onNotesChange?.(newNotes);

    // Clear all chord selections when generating new notes
    const clearedChords: (Chord | null)[] = Array(noteCount).fill(null);
    onChordsChange?.(clearedChords);
    console.log(`🧹 Generated ${noteCount} unique notes:`, newNotes);
  }, [onNotesChange, onChordsChange, noteCount, generateUniqueNotes]);

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

    // Cancel seamless loop scheduler (requestAnimationFrame)
    if (loopSchedulerRef.current) {
      cancelAnimationFrame(loopSchedulerRef.current);
      loopSchedulerRef.current = null;
      console.log('🔄 Cancelled seamless loop scheduler');
    }

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

  // PRE-SCHEDULE METRONOME CLICKS - DAW-style precise timing
  const scheduleMetronomeClicks = useCallback((startTime: number, totalBeats: number, tempo: number) => {
    if (!withMetronomeRef.current || !audioEngine.audioContext) return;

    const beatDuration = 60 / tempo; // seconds per beat
    const multiplier = metronomeMultiplierRef.current;
    const clicksPerBeat = multiplier === 1 ? 1 : multiplier === 2 ? 2 : 4;
    const clickInterval = beatDuration / clicksPerBeat;
    const totalClicks = Math.floor(totalBeats * clicksPerBeat);

    for (let i = 0; i < totalClicks; i++) {
      const clickTime = startTime + (i * clickInterval);
      scheduleMetronomeClick(clickTime);
    }

    console.log(`🥁 Scheduled ${totalClicks} metronome clicks over ${totalBeats} beats`);
  }, []);

  // DAW-STYLE PRE-SCHEDULED SEQUENCE PLAYER - schedules all audio upfront
  const scheduleSequence = useCallback((startTime: number, chordsToUse: (Chord | null)[]): number => {
    const currentNoteCount = notes.length;
    const chordDurations = BEAT_PATTERNS[currentNoteCount] || BEAT_PATTERNS[4];
    const totalBeats = 8;
    const currentTempo = tempoRef.current;
    const beatDuration = 60 / currentTempo; // seconds per beat

    let currentTime = startTime;

    // Schedule all notes/chords with precise Web Audio timing
    for (let i = 0; i < currentNoteCount; i++) {
      const durationBeats = chordDurations[i];
      const durationMs = durationBeats * beatDuration * 1000;
      const selectedChord = chordsToUse[i];

      if (selectedChord) {
        const baseNotes = selectedChord.notes.slice(0, 3);
        if (baseNotes.length === 3) {
          audioEngine.playChord(baseNotes, durationMs, currentTime, currentTempo, selectedChord.rootNote, selectedChord.octaves).catch(err => {
            console.error('Error playing chord:', err);
          });
        }
      } else {
        const octaveOffset = i === 2 ? -1 : 0;
        audioEngine.playNote(notes[i], durationMs, octaveOffset, currentTime).catch(err => {
          console.error('Error playing note:', err);
        });
      }

      currentTime += durationBeats * beatDuration;
    }

    // Schedule metronome clicks for this cycle
    scheduleMetronomeClicks(startTime, totalBeats, currentTempo);

    const sequenceEndTime = startTime + (totalBeats * beatDuration);
    console.log(`🎵 Scheduled sequence: ${currentNoteCount} positions, ${totalBeats} beats, ends at ${sequenceEndTime.toFixed(3)}`);

    return sequenceEndTime;
  }, [notes, scheduleMetronomeClicks]);

  // SEAMLESS LOOP SCHEDULER - schedules next iteration before current ends
  const startSeamlessLoop = useCallback(async (chordsToUse: (Chord | null)[]) => {
    if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
      await audioEngine.initialize();
    }

    if (audioEngine.audioContext?.state === 'suspended') {
      await audioEngine.audioContext.resume();
    }

    isSequenceActiveRef.current = true;
    const lookAheadTime = 0.1; // Schedule 100ms ahead
    let nextStartTime = audioEngine.audioContext!.currentTime + 0.05;

    // Schedule first iteration
    let endTime = scheduleSequence(nextStartTime, chordsToUse);
    scheduledEndTimeRef.current = endTime;

    // Continuous scheduling loop
    const scheduleAhead = () => {
      if (!isSequenceActiveRef.current) {
        console.log('🛑 Loop scheduler stopped');
        return;
      }

      const currentTime = audioEngine.audioContext!.currentTime;
      const timeUntilEnd = scheduledEndTimeRef.current - currentTime;

      // If we're within lookAhead time of the end, schedule next iteration
      if (isLoopingRef.current && timeUntilEnd < lookAheadTime) {
        nextStartTime = scheduledEndTimeRef.current;
        endTime = scheduleSequence(nextStartTime, currentChordsRef.current);
        scheduledEndTimeRef.current = endTime;
        console.log(`🔄 Seamless loop: scheduled next at ${nextStartTime.toFixed(3)}`);
      }

      // Check if we should stop (non-looping mode and sequence ended)
      if (!isLoopingRef.current && currentTime >= scheduledEndTimeRef.current) {
        isSequenceActiveRef.current = false;
        setIsPlaying(false);
        console.log('✅ Sequence complete (non-looping)');
        return;
      }

      // Continue the scheduler
      loopSchedulerRef.current = requestAnimationFrame(scheduleAhead);
    };

    // Start the scheduling loop
    loopSchedulerRef.current = requestAnimationFrame(scheduleAhead);
  }, [scheduleSequence]);

  // Legacy function for compatibility - now uses pre-scheduling
  const playSequenceOnce = useCallback((): Promise<void> => {
    return new Promise(async (resolve) => {
      console.log("🎯 playSequenceOnce called!");

      if (isSequenceActiveRef.current) {
        console.log("🚫 Sequence already active, skipping");
        resolve();
        return;
      }

      try {
        if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
          await audioEngine.initialize();
        }

        if (audioEngine.audioContext?.state === 'suspended') {
          await audioEngine.audioContext.resume();
        }

        isSequenceActiveRef.current = true;
        const startTime = audioEngine.audioContext!.currentTime + 0.05;
        const endTime = scheduleSequence(startTime, selectedChords);
        scheduledEndTimeRef.current = endTime;

        const totalDurationMs = (endTime - startTime) * 1000;

        // Wait for sequence to complete
        setTimeout(() => {
          isSequenceActiveRef.current = false;
          console.log("✅ Sequence complete");
          resolve();
        }, totalDurationMs + 50);

      } catch (error) {
        console.error("❌ Sequence error:", error);
        isSequenceActiveRef.current = false;
        resolve();
      }
    });
  }, [selectedChords, scheduleSequence]);

  // DYNAMIC METRONOME - Polls and schedules clicks in real-time based on tempo
  // NOTE: Must be defined BEFORE playSequenceWithChords which calls it
  const startDynamicMetronome = useCallback((startRealTime: number) => {
    if (!withMetronomeRef.current) return;
    
    let lastScheduledBeat = -1;
    
    const pollMetronome = () => {
      if (!isSequenceActiveRef.current || !audioEngine.audioContext) return;
      
      const realElapsedMs = Date.now() - startRealTime;
      const currentTempo = tempoRef.current;
      const msPerBeat = (60 / currentTempo) * 1000;
      const multiplier = metronomeMultiplierRef.current;
      const clicksPerBeat = multiplier === 1 ? 1 : multiplier === 2 ? 2 : 4;
      const msPerClick = msPerBeat / clicksPerBeat;
      
      const currentClick = Math.floor(realElapsedMs / msPerClick);
      
      // Schedule next click if we haven't already
      if (currentClick > lastScheduledBeat && withMetronomeRef.current) {
        lastScheduledBeat = currentClick;
        const nextClickTime = audioEngine.audioContext.currentTime + 0.01;
        scheduleMetronomeClick(nextClickTime);
      }
      
      // Continue polling while playing
      if (isSequenceActiveRef.current) {
        const pollTimeout = setTimeout(pollMetronome, 10);
        activeTimeoutsRef.current.add(pollTimeout);
      }
    };
    
    pollMetronome();
  }, []);

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
      const currentNoteCount = chordsToPlay.length;
      console.log(`🎵 Starting chord sequence with ${currentNoteCount} positions`);

      const initializeAndPlay = async () => {
        try {
          if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
            await audioEngine.initialize();
          }

          if (audioEngine.audioContext?.state === 'suspended') {
            await audioEngine.audioContext.resume();
          }

          // Use dynamic beat pattern based on note count
          const chordDurations = BEAT_PATTERNS[currentNoteCount] || BEAT_PATTERNS[4];
          const totalBeats = 8; // Total duration always 8 beats
          let positionIndex = 0;
          let elapsedBeats = 0;
          const startRealTime = Date.now();

          // Start dynamic metronome
          startDynamicMetronome(startRealTime);

          // Polling function for chord playback
          const checkAndPlayNext = () => {
            const realElapsedMs = Date.now() - startRealTime;
            const currentTempo = tempoRef.current;
            const msPerBeat = (60 / currentTempo) * 1000;
            const realElapsedBeats = realElapsedMs / msPerBeat;

            // Check if sequence is complete (all positions played AND full duration elapsed)
            if (!isSequenceActiveRef.current || (positionIndex >= currentNoteCount && realElapsedBeats >= totalBeats)) {
              isSequenceActiveRef.current = false;
              // Clear all pending timeouts before resolving
              activeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
              activeTimeoutsRef.current.clear();
              console.log("✅ Chord sequence complete");
              resolve(); // Resolve promise on actual completion
              return;
            }

            if (positionIndex < currentNoteCount && realElapsedBeats >= elapsedBeats) {
              const durationBeats = chordDurations[positionIndex];
              const durationMs = (60 / currentTempo) * durationBeats * 1000;
              const chordToPlay = chordsToPlay[positionIndex];
              const audioStartTime = audioEngine.audioContext!.currentTime + 0.05;

              console.log(`🎯 Pos ${positionIndex + 1}/${currentNoteCount}: tempo=${currentTempo} BPM, ${durationBeats}beats, hasChord=${!!chordToPlay}`);

              if (chordToPlay) {
                const baseNotes = chordToPlay.notes.slice(0, 3);
                if (baseNotes.length === 3) {
                  audioEngine.playChord(baseNotes, durationMs, audioStartTime, currentTempo, chordToPlay.rootNote, chordToPlay.octaves).catch(err => {
                    console.error('Error playing chord:', err);
                  });
                }
              } else {
                const octaveOffset = positionIndex === 2 ? -1 : 0;
                audioEngine.playNote(notes[positionIndex], durationMs, octaveOffset, audioStartTime).catch(err => {
                  console.error('Error playing note:', err);
                });
              }

              elapsedBeats += durationBeats;
              positionIndex++;
            }

            if (isSequenceActiveRef.current) {
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
    // Note: startDynamicMetronome is defined later but is a stable useCallback
  }, [notes]);

  // PLAY FUNCTION WITH SPECIFIC CHORDS - Uses DAW-style seamless pre-scheduling
  const handlePlayWithChords = useCallback(async (chordsToUse: (Chord | null)[]) => {
    console.log('▶️ PLAY WITH CHORDS - Using provided chords:', chordsToUse.map(c => c?.name || 'Note'));

    if (isPlaying) {
      emergencyReset();
      return;
    }

    // Update the current chords ref so seamless loop uses these chords
    currentChordsRef.current = chordsToUse;

    setIsPlaying(true);

    // Use the DAW-style seamless loop system
    // It handles both single play and looping via isLoopingRef
    await startSeamlessLoop(chordsToUse);

  }, [isPlaying, emergencyReset, startSeamlessLoop]);

  // SIMPLIFIED PLAY FUNCTION - Uses DAW-style seamless pre-scheduling
  const handlePlay = useCallback(async () => {
    console.log('▶️ PLAY PRESSED - Starting seamless sequence');

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

    setIsPlaying(true);

    // Use the DAW-style seamless loop system
    // It handles both single play and looping via isLoopingRef
    await startSeamlessLoop(selectedChords);

  }, [isPlaying, emergencyReset, startSeamlessLoop, selectedChords]);

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

    const randomChords: (Chord | null)[] = [];

    // For each note position, get its available chords and pick one randomly
    for (let i = 0; i < notes.length; i++) {
      const noteForPosition = notes[i];
      const availableChords = getChordsForNoteBySkill(noteForPosition, skillLevel);

      if (availableChords.length > 0) {
        // Pick a random chord from the available options
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
  }, [notes, onChordsChange, isPlaying, handlePlay, emergencyReset, skillLevel]);

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
      // Cancel seamless loop scheduler
      if (loopSchedulerRef.current) {
        cancelAnimationFrame(loopSchedulerRef.current);
        loopSchedulerRef.current = null;
      }
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

  // Handler for manual note selection
  const handleManualNoteChange = useCallback((noteIndex: number, newNote: string) => {
    const newNotes = [...notes];
    newNotes[noteIndex] = newNote;
    setNotes(newNotes);
    onNotesChange?.(newNotes);

    // Clear chord selection for this position when note changes
    const newChords = [...(selectedChords || [null, null, null])];
    newChords[noteIndex] = null;
    onChordsChange?.(newChords);

    console.log(`🎹 Manual note ${noteIndex + 1} changed to: ${newNote}`);
  }, [notes, selectedChords, onNotesChange, onChordsChange]);

  // Toggle between random and manual mode
  const handleModeToggle = useCallback((mode: 'random' | 'manual') => {
    setInputMode(mode);
    console.log(`🔄 Input mode changed to: ${mode}`);
  }, []);

  return (
    <div className="space-y-2">
      {/* Note Count Selector */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Notes</label>
        <div className="flex rounded-md overflow-hidden border border-border">
          {[1, 2, 3, 4, 5].map((count) => (
            <button
              key={count}
              onClick={() => onNoteCountChange?.(count)}
              className={`px-2 py-1 text-xs font-semibold transition-colors min-w-[28px] ${
                noteCount === count
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
              data-testid={`button-note-count-${count}`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Mode</label>
        <div className="flex rounded-md overflow-hidden border border-border">
          <button
            onClick={() => handleModeToggle('random')}
            className={`px-2 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
              inputMode === 'random'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            <Dices className="w-3 h-3" />
            Random
          </button>
          <button
            onClick={() => handleModeToggle('manual')}
            className={`px-2 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
              inputMode === 'manual'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            Manual
          </button>
        </div>
      </div>

      {/* Manual Note Selection - shown when in manual mode */}
      {inputMode === 'manual' && (
        <div className="bg-muted/50 rounded-md p-2 border border-border">
          <div className={`grid gap-1.5 ${
            noteCount <= 3 ? 'grid-cols-3' : noteCount === 4 ? 'grid-cols-4' : 'grid-cols-5'
          }`}>
            {Array.from({ length: noteCount }, (_, index) => (
              <div key={index}>
                <Select
                  value={notes[index] || 'C'}
                  onValueChange={(value) => handleManualNoteChange(index, value)}
                >
                  <SelectTrigger className="w-full h-8 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_NOTES_FOR_SELECTION.map((note) => (
                      <SelectItem
                        key={note.value}
                        value={note.value}
                        className={`font-mono ${note.isBlack ? 'text-muted-foreground' : ''}`}
                      >
                        {note.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Random mode controls */}
      {inputMode === 'random' && (
        <Button
          onClick={handleGenerate}
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          data-testid="button-generate"
        >
          <Shuffle className="w-3 h-3 mr-1.5" />
          Generate Notes
        </Button>
      )}

      {/* Play/Pause and Auto Loop buttons */}
      <div className="flex space-x-1.5">
        <Button
          onClick={handlePlay}
          size="sm"
          className={`flex-1 h-8 text-xs font-semibold ${
            isPlaying
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3 h-3 mr-1" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-3 h-3 mr-1" />
              Play
            </>
          )}
        </Button>

        {/* Auto Loop Button - only show if feature enabled */}
        {isFeatureEnabled('AUTO_LOOP') && (
          <Button
            onClick={toggleLoop}
            variant={isLooping ? "default" : "outline"}
            size="sm"
            className="flex-1 h-8 text-xs"
            data-testid="button-auto-loop"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Loop
          </Button>
        )}
      </div>

      {/* Random Chords button */}
      <Button
        onClick={handleRandomHarmonize}
        variant="outline"
        size="sm"
        className="w-full h-8 text-xs"
        data-testid="button-random-chords"
      >
        <Shuffle className="w-3 h-3 mr-1.5" />
        Random Chords
      </Button>

      {/* Tempo slider and metronome */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5">
          <Checkbox
            id="metronome"
            checked={withMetronome}
            onCheckedChange={(checked) => setWithMetronome(checked === true)}
            className="h-3.5 w-3.5"
          />
          <label htmlFor="metronome" className="text-xs text-muted-foreground">
            Metro
          </label>
        </div>

        <div className="flex-1 flex items-center space-x-1.5">
          <span className="text-xs font-medium text-foreground min-w-[45px]">
            {tempo}
          </span>
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
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-muted-foreground">Speed:</span>
          <div className="flex space-x-0.5">
            {[
              { value: 1, label: '♩' },
              { value: 2, label: '♫' },
              { value: 3, label: '♬' }
            ].map(({ value, label }) => (
              <Button
                key={value}
                size="sm"
                variant={metronomeMultiplier === value ? "default" : "outline"}
                onClick={() => setMetronomeMultiplier(value)}
                className="px-1.5 py-0.5 h-6 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Arpeggio Speed Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Arpeggio</label>
        <div className="flex rounded-md overflow-hidden border border-border">
          <button
            onClick={() => setArpeggioSpeed(1)}
            className={`px-2 py-1 text-xs font-medium transition-colors ${
              arpeggioSpeed === 1
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
            data-testid="button-arpeggio-eighth"
          >
            8th
          </button>
          <button
            onClick={() => setArpeggioSpeed(2)}
            className={`px-2 py-1 text-xs font-medium transition-colors ${
              arpeggioSpeed === 2
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
            data-testid="button-arpeggio-sixteenth"
          >
            16th
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="flex flex-wrap gap-1.5 justify-center text-[10px] text-muted-foreground">
        <span><kbd className="px-1 py-0.5 bg-muted rounded font-mono">Space</kbd> Play</span>
        <span><kbd className="px-1 py-0.5 bg-muted rounded font-mono">M</kbd> Metro</span>
        {isFeatureEnabled('AUTO_LOOP') && (
          <span><kbd className="px-1 py-0.5 bg-muted rounded font-mono">L</kbd> Loop</span>
        )}
        <span><kbd className="px-1 py-0.5 bg-muted rounded font-mono">R</kbd> Gen</span>
      </div>
    </div>
  );
}