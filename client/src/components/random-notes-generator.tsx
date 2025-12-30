import { logger } from '@/lib/logger';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle, Play, Square, RotateCcw, Edit3, Dices, Music, Volume2, Timer, Repeat, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateRandomNotes, getChordFromNote, getChordsForNoteBySkill, type Chord, type SkillLevel, applyVoiceLeading } from '@/lib/chord-theory';
import { getDiatonicChordsContainingNote, type ScaleType } from '@/lib/scale-theory';
import { useAudio } from '@/hooks/use-audio';
import { audioEngine } from '@/lib/audio-engine';
import { sampleEngine, INSTRUMENT_COMBOS, type InstrumentCombo } from '@/lib/sample-engine';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { VALID_NOTES_FOR_SELECTION } from '@/lib/music-constants';

type PanelMode = 'icon' | 'compact' | 'normal';

interface RandomNotesGeneratorProps {
  onNotesChange?: (notes: string[]) => void;
  onChordsChange?: (chords: (Chord | null)[]) => void;
  selectedChords?: (Chord | null)[];
  inversionModes?: ('auto' | 'root' | 'first' | 'second')[];
  skillLevel?: SkillLevel;
  noteCount?: number;
  onNoteCountChange?: (count: number) => void;
  onPlayingIndexChange?: (index: number | null) => void;
  panelMode?: PanelMode;
  diatonicNotes?: string[]; // Optional array of notes to restrict selection to
  diatonicKey?: string; // Key for diatonic mode
  diatonicScale?: string; // Scale type for diatonic mode
  diatonicMode?: number; // Mode number for diatonic mode
}

// Beat duration patterns for different note counts (total: 8 beats)
const BEAT_PATTERNS: Record<number, number[]> = {
  1: [8],
  2: [4, 4],
  3: [2, 2, 4],
  4: [2, 2, 2, 2],
  5: [1.5, 1.5, 1.5, 1.5, 2]
};

export default function RandomNotesGenerator({ onNotesChange, onChordsChange, selectedChords = [null, null, null, null], inversionModes = ['auto', 'auto', 'auto', 'auto'], skillLevel = 'beginner', noteCount = 4, onNoteCountChange, onPlayingIndexChange, panelMode = 'normal', diatonicNotes, diatonicKey, diatonicScale, diatonicMode }: RandomNotesGeneratorProps) {
  // Use diatonic notes if provided, otherwise use all valid notes
  const availableNotesForSelection = diatonicNotes && diatonicNotes.length > 0
    ? diatonicNotes.map(note => ({ value: note, label: note }))
    : VALID_NOTES_FOR_SELECTION;

  const [notes, setNotes] = useState<string[]>(['Bb', 'D', 'G', 'F']); // Default to 4 notes
  const [inputMode, setInputMode] = useState<'random' | 'manual'>('random');
  const [tempo, setTempo] = useState(120);
  const tempoRef = useRef(120); // Ref for real-time tempo access during playback
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Auto Loop state - only active when feature flag is enabled
  const [isLooping, setIsLooping] = useState(true);
  const isLoopingRef = useRef(true); // Ref for real-time loop state access during playback
  
  const [withMetronome, setWithMetronome] = useState(false);
  const withMetronomeRef = useRef(false); // Ref for real-time metronome access
  const [metronomeMultiplier, setMetronomeMultiplier] = useState(1);
  const metronomeMultiplierRef = useRef(1); // Ref for real-time metronome speed access

  // Arpeggio speed: 1 = eighth notes (default), 2 = sixteenth notes
  const [arpeggioSpeed, setArpeggioSpeed] = useState(1);
  const arpeggioSpeedRef = useRef(1);

  // Chord cycles: how many times to repeat each chord's arpeggio pattern (1, 2, or 4)
  const [chordCycles, setChordCycles] = useState(2); // Default to 2 cycles
  const chordCyclesRef = useRef(2);

  // Instrument combo selection
  const [selectedComboId, setSelectedComboId] = useState('orchestral-piano');
  const [blockChordVolume, setBlockChordVolume] = useState(0.5);
  const [arpeggioVolume, setArpeggioVolume] = useState(0.7);
  
  // Track engine version to re-render when loading completes
  const [engineVersion, setEngineVersion] = useState(sampleEngine.version);
  
  // Derive loading state from engine - no component state needed
  const isLoadingInstruments = !sampleEngine.loaded || sampleEngine.loadedComboId !== selectedComboId || sampleEngine.isLoading;
  const comboLoadedRef = useRef(sampleEngine.loaded && sampleEngine.loadedComboId === selectedComboId);

  // Scheduled loop tracking for seamless looping
  const scheduledEndTimeRef = useRef<number>(0);
  const loopSchedulerRef = useRef<number | null>(null);
  const playingIndexTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const onPlayingIndexChangeRef = useRef(onPlayingIndexChange);

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
    (window as any).__arpeggioSpeed = arpeggioSpeed;
  }, [arpeggioSpeed]);

  useEffect(() => {
    chordCyclesRef.current = chordCycles;
  }, [chordCycles]);

  useEffect(() => {
    onPlayingIndexChangeRef.current = onPlayingIndexChange;
  }, [onPlayingIndexChange]);

  // Load instrument combo using shared promise
  useEffect(() => {
    const loadCombo = async () => {
      try {
        await sampleEngine.ensureLoaded(selectedComboId);
        sampleEngine.setBlockChordVolume(blockChordVolume);
        sampleEngine.setArpeggioVolume(arpeggioVolume);
        comboLoadedRef.current = true;
        setEngineVersion(sampleEngine.version);
        logger.log(`✅ Loaded instrument combo: ${selectedComboId}`);
      } catch (error) {
        console.error('Failed to load instrument combo:', error);
        setEngineVersion(sampleEngine.version);
      }
    };
    loadCombo();
  }, [selectedComboId]);

  // Update volumes when sliders change
  useEffect(() => {
    sampleEngine.setBlockChordVolume(blockChordVolume);
  }, [blockChordVolume]);

  useEffect(() => {
    sampleEngine.setArpeggioVolume(arpeggioVolume);
  }, [arpeggioVolume]);

  // Helper function to generate unique notes
  const generateUniqueNotes = useCallback((count: number, baseNote?: string): string[] => {
    // Use diatonic notes if provided, otherwise use all chromatic notes
    const availableNotes = diatonicNotes && diatonicNotes.length > 0
      ? diatonicNotes
      : ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

    // Musical intervals from base note (all unique intervals ensure unique notes)
    const intervals = [0, 4, -3, 7, 5, 2, -5, 1, 6, -1, 3, -4]; // Extended for safety

    // Use provided base or pick random from available notes
    const base = baseNote || availableNotes[Math.floor(Math.random() * availableNotes.length)];
    const baseIndex = availableNotes.indexOf(base);

    const usedNotes = new Set<string>();
    const newNotes: string[] = [];

    // If using diatonic notes, just pick randomly from available notes
    if (diatonicNotes && diatonicNotes.length > 0) {
      const shuffled = [...availableNotes].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    // For chromatic notes, use the musical interval approach
    // First, try to use the musical intervals
    for (let i = 0; i < count && i < intervals.length; i++) {
      const interval = intervals[i];
      const noteIndex = (baseIndex + interval + 12) % 12;
      const note = availableNotes[noteIndex];

      if (!usedNotes.has(note)) {
        usedNotes.add(note);
        newNotes.push(note);
      }
    }

    // If we still need more unique notes, pick randomly from remaining
    if (newNotes.length < count) {
      const remainingNotes = availableNotes.filter(n => !usedNotes.has(n));
      while (newNotes.length < count && remainingNotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingNotes.length);
        const note = remainingNotes.splice(randomIndex, 1)[0];
        newNotes.push(note);
      }
    }

    return newNotes;
  }, [diatonicNotes]);

  // Regenerate notes when noteCount changes
  useEffect(() => {
    // Only regenerate if we're in random mode
    if (inputMode === 'random') {
      const baseNote = notes[0] || undefined;
      const newNotes = generateUniqueNotes(noteCount, baseNote);

      setNotes(newNotes);
      onNotesChange?.(newNotes);
      onChordsChange?.(Array(noteCount).fill(null));
      logger.log(`🔄 Note count changed to ${noteCount}, regenerated unique notes:`, newNotes);
    }
  }, [noteCount]); // Only depend on noteCount

  const generateNew = useCallback(() => {
    const newNotes = generateUniqueNotes(noteCount);

    setNotes(newNotes);
    onNotesChange?.(newNotes);

    // Clear all chord selections when generating new notes
    const clearedChords: (Chord | null)[] = Array(noteCount).fill(null);
    onChordsChange?.(clearedChords);
    logger.log(`🧹 Generated ${noteCount} unique notes:`, newNotes);
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
    logger.log('🔄 Updated currentChordsRef:', selectedChords.map(c => c?.name || 'Note'));
  }, [selectedChords]);

  // Store skillLevel in a ref for access in callbacks
  const skillLevelRef = useRef(skillLevel);
  const prevSkillLevelRef = useRef(skillLevel);

  // Stop playback and reset when skill level changes
  useEffect(() => {
    if (prevSkillLevelRef.current !== skillLevel) {
      logger.log(`🔄 Skill level changed from ${prevSkillLevelRef.current} to ${skillLevel}, resetting playback and regenerating notes`);
      
      // Stop any ongoing playback
      isSequenceActiveRef.current = false;
      setIsPlaying(false);
      
      // Clear all scheduled timeouts
      if (loopSchedulerRef.current) {
        cancelAnimationFrame(loopSchedulerRef.current);
        loopSchedulerRef.current = null;
      }
      playingIndexTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      playingIndexTimeoutsRef.current.clear();
      activeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      activeTimeoutsRef.current.clear();
      scheduledTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      scheduledTimeoutsRef.current.clear();
      
      // Stop all audio
      sampleEngine.stopAll();
      audioEngine.stopAll();
      
      // Reset playing index
      onPlayingIndexChangeRef.current?.(null);
      
      // Clear all chord refs to prevent stale data
      prevChordsRef.current = Array(noteCount).fill(null);
      randomChordsRef.current = Array(noteCount).fill(null);
      currentChordsRef.current = Array(noteCount).fill(null);
      
      // Auto-regenerate new notes for the new skill level
      const newNotes = generateUniqueNotes(noteCount);
      setNotes(newNotes);
      onNotesChange?.(newNotes);
      onChordsChange?.(Array(noteCount).fill(null));
      logger.log(`🎲 Auto-regenerated notes for ${skillLevel} mode:`, newNotes);
      
      // Update engine version to trigger re-render with correct loading state
      comboLoadedRef.current = sampleEngine.loaded && sampleEngine.loadedComboId === selectedComboId;
      setEngineVersion(sampleEngine.version);
      
      prevSkillLevelRef.current = skillLevel;
    }
    skillLevelRef.current = skillLevel;
  }, [skillLevel, selectedComboId, noteCount, generateUniqueNotes, onNotesChange, onChordsChange]);

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
    logger.log('🚨 EMERGENCY RESET - Clearing all audio');

    // Set flags to prevent new sequences
    isSequenceActiveRef.current = false;
    setIsPlaying(false);

    // Clear playing index
    onPlayingIndexChangeRef.current?.(null);
    playingIndexTimeoutsRef.current.forEach(t => clearTimeout(t));
    playingIndexTimeoutsRef.current.clear();

    // Cancel seamless loop scheduler (requestAnimationFrame)
    if (loopSchedulerRef.current) {
      cancelAnimationFrame(loopSchedulerRef.current);
      loopSchedulerRef.current = null;
      logger.log('🔄 Cancelled seamless loop scheduler');
    }

    // Clear all intervals/timeouts
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
      logger.log('🔄 Cleared loop interval');
    }

    // Cancel all scheduled timeouts immediately
    activeTimeoutsRef.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    activeTimeoutsRef.current.clear();
    logger.log('🔄 Cancelled all scheduled audio');

    // Stop all oscillators and samples immediately
    audioEngine.stopAll();
    sampleEngine.stopAll();

    logger.log('✅ Emergency reset complete');
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

    logger.log(`🥁 Scheduled ${totalClicks} metronome clicks over ${totalBeats} beats`);
  }, []);

  // DAW-STYLE PRE-SCHEDULED SEQUENCE PLAYER - schedules all audio upfront
  const scheduleSequence = useCallback((startTime: number, chordsToUse: (Chord | null)[]): number => {
    const currentNoteCount = notes.length;
    const baseChordDurations = BEAT_PATTERNS[currentNoteCount] || BEAT_PATTERNS[4];
    const cycles = chordCyclesRef.current; // 1, 2, or 4 cycles per chord
    const chordDurations = baseChordDurations.map(d => d * cycles);
    const totalBeats = 8 * cycles;
    const currentTempo = tempoRef.current;
    const beatDuration = 60 / currentTempo;

    // Clear any stale highlight timeouts from previous cycle
    playingIndexTimeoutsRef.current.forEach(t => clearTimeout(t));
    playingIndexTimeoutsRef.current.clear();

    let currentTime = startTime;
    const audioContextStartTime = sampleEngine.audioContext?.currentTime || audioEngine.audioContext?.currentTime || 0;

    for (let i = 0; i < currentNoteCount; i++) {
      const durationBeats = chordDurations[i];
      const durationMs = durationBeats * beatDuration * 1000;
      const selectedChord = chordsToUse[i];

      const delayMs = (currentTime - audioContextStartTime) * 1000;
      const indexToSet = i;
      const timeout = setTimeout(() => {
        playingIndexTimeoutsRef.current.delete(timeout);
        if (isSequenceActiveRef.current) {
          onPlayingIndexChangeRef.current?.(indexToSet);
        }
      }, Math.max(0, delayMs));
      playingIndexTimeoutsRef.current.add(timeout);

      if (selectedChord) {
        const baseNotes = selectedChord.notes.slice(0, 3);
        if (baseNotes.length === 3) {
          // Use sample engine for real instrument playback
          sampleEngine.playChordWithArpeggio(
            baseNotes,
            durationMs,
            currentTime,
            currentTempo,
            selectedChord.rootNote,
            selectedChord.octaves
          ).catch(err => {
            console.error('Error playing chord:', err);
          });
        }
      } else {
        // For single notes (no chord selected), just play arpeggio note
        const octave = i === 2 ? 3 : 4;
        sampleEngine.playArpeggioNote(notes[i], durationMs, octave, currentTime).catch(err => {
          console.error('Error playing note:', err);
        });
      }

      currentTime += durationBeats * beatDuration;
    }

    scheduleMetronomeClicks(startTime, totalBeats, currentTempo);

    const sequenceEndTime = startTime + (totalBeats * beatDuration);
    logger.log(`🎵 Scheduled sequence: ${currentNoteCount} positions, ${totalBeats} beats (${cycles}x cycles), ends at ${sequenceEndTime.toFixed(3)}`);

    return sequenceEndTime;
  }, [notes, scheduleMetronomeClicks]);

  // SEAMLESS LOOP SCHEDULER - schedules next iteration before current ends
  const startSeamlessLoop = useCallback(async (chordsToUse: (Chord | null)[]) => {
    // Initialize both engines
    if (!sampleEngine.audioContext) {
      await sampleEngine.initialize();
    }
    if (!audioEngine.audioContext || !audioEngine.masterGainNode) {
      await audioEngine.initialize();
    }

    if (sampleEngine.audioContext?.state === 'suspended') {
      await sampleEngine.audioContext.resume();
    }
    if (audioEngine.audioContext?.state === 'suspended') {
      await audioEngine.audioContext.resume();
    }

    isSequenceActiveRef.current = true;
    const lookAheadTime = 0.1; // Schedule 100ms ahead
    const ctx = sampleEngine.audioContext || audioEngine.audioContext!;
    let nextStartTime = ctx.currentTime + 0.05;

    // Schedule first iteration
    let endTime = scheduleSequence(nextStartTime, chordsToUse);
    scheduledEndTimeRef.current = endTime;

    // Continuous scheduling loop
    const scheduleAhead = () => {
      if (!isSequenceActiveRef.current) {
        logger.log('🛑 Loop scheduler stopped');
        return;
      }

      const currentTime = (sampleEngine.audioContext || audioEngine.audioContext!).currentTime;
      const timeUntilEnd = scheduledEndTimeRef.current - currentTime;

      // If we're within lookAhead time of the end, schedule next iteration
      if (isLoopingRef.current && timeUntilEnd < lookAheadTime) {
        nextStartTime = scheduledEndTimeRef.current;
        endTime = scheduleSequence(nextStartTime, currentChordsRef.current);
        scheduledEndTimeRef.current = endTime;
        logger.log(`🔄 Seamless loop: scheduled next at ${nextStartTime.toFixed(3)}`);
      }

      // Check if we should stop (non-looping mode and sequence ended)
      if (!isLoopingRef.current && currentTime >= scheduledEndTimeRef.current) {
        isSequenceActiveRef.current = false;
        setIsPlaying(false);
        onPlayingIndexChangeRef.current?.(null);
        playingIndexTimeoutsRef.current.forEach(t => clearTimeout(t));
        playingIndexTimeoutsRef.current.clear();
        logger.log('✅ Sequence complete (non-looping)');
        return;
      }

      // Continue the scheduler
      loopSchedulerRef.current = requestAnimationFrame(scheduleAhead);
    };

    // Start the scheduling loop
    loopSchedulerRef.current = requestAnimationFrame(scheduleAhead);
  }, [scheduleSequence]);

  // PLAY FUNCTION WITH SPECIFIC CHORDS - Uses DAW-style seamless pre-scheduling
  const handlePlayWithChords = useCallback(async (chordsToUse: (Chord | null)[]) => {
    logger.log('▶️ PLAY WITH CHORDS - Using provided chords:', chordsToUse.map(c => c?.name || 'Note'));

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
    logger.log('▶️ PLAY PRESSED - Starting seamless sequence');

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
        
        logger.log(`🥁 Metronome click scheduled at ${time.toFixed(3)}`);
      }
    } catch (error) {
      console.error('Metronome scheduling error:', error);
    }
  };

  // Add generate function
  const handleGenerate = useCallback(() => {
    logger.log('🎲 GENERATE PRESSED');
    
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
      logger.log('🔄 Post-generate chord state check:', selectedChords);
    }, 50);
  }, [generateNew, emergencyReset, selectedChords]);

  const handleStop = useCallback(() => {
    logger.log('⏹️ STOP PRESSED');
    // Resetting the sequence active flag
    isSequenceActiveRef.current = false; // Prevents any new sequences from starting
    
    // Exit auto loop when stopping
    if (isFeatureEnabled('AUTO_LOOP') && isLooping) {
      setIsLooping(false);
      logger.log('🔄 Exiting Auto Loop mode');
    }
    
    emergencyReset();
  }, [emergencyReset, isLooping]);

  // Auto Loop toggle function - only works if feature enabled
  const toggleLoop = useCallback(() => {
    if (!isFeatureEnabled('AUTO_LOOP')) {
      logger.log('🚫 Auto Loop feature disabled');
      return;
    }
    
    const newLoopState = !isLooping;
    setIsLooping(newLoopState);
    logger.log(`🔄 Auto Loop ${newLoopState ? 'ENABLED' : 'DISABLED'}`);
  }, [isLooping]);





  // RANDOM HARMONIZER - Select random chords from available options for each note
  // Prevents duplicate chords when 4 or fewer notes are selected
  const handleRandomHarmonize = useCallback(() => {
    logger.log('🎭 RANDOM HARMONIZER PRESSED');

    const randomChords: (Chord | null)[] = [];
    const usedChordNames = new Set<string>();
    const allowDuplicates = notes.length >= 5;

    // For each note position, get its available chords and pick one randomly
    for (let i = 0; i < notes.length; i++) {
      const noteForPosition = notes[i];
      let availableChords: Chord[];

      // In diatonic mode, get only diatonic triads
      if (skillLevel === 'diatonic' && diatonicKey && diatonicScale) {
        const mode = diatonicMode || 1;
        const diatonicChords = getDiatonicChordsContainingNote(noteForPosition, diatonicKey, diatonicScale as ScaleType, mode);
        // Convert DiatonicChord[] to Chord[] - ONLY include triads
        availableChords = diatonicChords.triads.map(dc => ({
          name: dc.name,
          notes: dc.notes,
          type: dc.type,
          rootNote: dc.rootNote,
          category: 'triad' as const,
          romanNumeral: dc.romanNumeral
        }));
      } else {
        availableChords = getChordsForNoteBySkill(noteForPosition, skillLevel);
      }

      if (availableChords.length > 0) {
        // Filter out already used chords (unless 5+ notes or no unique options left)
        let candidateChords = allowDuplicates
          ? availableChords
          : availableChords.filter(c => !usedChordNames.has(c.name));

        // Fallback to all chords if no unique options available
        if (candidateChords.length === 0) {
          candidateChords = availableChords;
          logger.log(`⚠️ Position ${i + 1}: No unique chords left, allowing duplicate`);
        }

        // Pick a random chord from the candidates
        const randomIndex = Math.floor(Math.random() * candidateChords.length);
        const selectedChord = candidateChords[randomIndex];
        randomChords.push(selectedChord);
        usedChordNames.add(selectedChord.name);
        logger.log(`🎯 Position ${i + 1} (${noteForPosition}): Selected "${selectedChord.name}" from ${candidateChords.length} options`);
      } else {
        randomChords.push(null);
        logger.log(`❌ Position ${i + 1} (${noteForPosition}): No chords available`);
      }
    }

    logger.log('🎯 Random chords selected:', randomChords.map(c => c?.name || 'None'));

    // Update the chord selections
    onChordsChange?.(randomChords);

    // Store the random chords in the ref to avoid prop timing issues
    randomChordsRef.current = randomChords;

    // Always start playing after selecting random chords
    setTimeout(() => {
      emergencyReset(); // Always reset first to clear any existing audio
      setTimeout(() => {
        // Use the stored random chords directly instead of relying on prop updates
        logger.log('🎯 Playing with stored random chords:', randomChordsRef.current.map(c => c?.name || 'None'));
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
    
    logger.log('🔄 Tempo/Metronome effect triggered:', {
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

    logger.log(`🎹 Manual note ${noteIndex + 1} changed to: ${newNote}`);
  }, [notes, selectedChords, onNotesChange, onChordsChange]);

  // Toggle between random and manual mode
  const handleModeToggle = useCallback((mode: 'random' | 'manual') => {
    setInputMode(mode);
    logger.log(`🔄 Input mode changed to: ${mode}`);
  }, []);

  // Derive compact mode from panelMode prop
  const isCompact = panelMode === 'compact';

  // Icon mode - minimal essential controls
  if (panelMode === 'icon') {
    return (
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-col items-center gap-1.5">
          {/* Play Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handlePlay}
                size="sm"
                disabled={isLoadingInstruments}
                className={`w-9 h-9 p-0 ${
                  isPlaying
                    ? 'bg-destructive hover:bg-destructive/90'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isLoadingInstruments ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{isPlaying ? 'Stop' : 'Play'}</TooltipContent>
          </Tooltip>

          {/* Random Notes Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGenerate}
                variant="outline"
                size="sm"
                className="w-9 h-9 p-0 bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Random Notes</TooltipContent>
          </Tooltip>

          {/* Random Chords Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRandomHarmonize}
                variant="outline"
                size="sm"
                className="w-9 h-9 p-0 bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50"
              >
                <Dices className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Random Chords</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  // Normal (expanded) view
  if (panelMode === 'normal') {
    return (
      <TooltipProvider delayDuration={300}>
      <div className="space-y-3">
        {/* Header with status indicator */}
        <div className="flex items-center gap-1.5 pb-2 border-b border-border">
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Settings</span>
        </div>

        {/* === NOTES SECTION === */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Notes</label>
            <div className="flex rounded-md overflow-hidden border border-border">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => onNoteCountChange?.(count)}
                  className={`px-2 py-1 text-xs min-w-[28px] font-semibold transition-colors ${
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

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Mode</label>
            <div className="flex rounded-md overflow-hidden border border-border">
              <button
                onClick={() => handleModeToggle('random')}
                className={`px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
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
                className={`px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
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

          {/* Manual Note Selection */}
          {inputMode === 'manual' && (
            <div className="bg-muted/30 rounded-md p-2 border border-border">
              <div className={`grid gap-1 ${
                noteCount <= 3 ? 'grid-cols-3' : noteCount === 4 ? 'grid-cols-4' : 'grid-cols-5'
              }`}>
                {Array.from({ length: noteCount }, (_, index) => (
                  <Select
                    key={index}
                    value={notes[index] || 'C'}
                    onValueChange={(value) => handleManualNoteChange(index, value)}
                  >
                    <SelectTrigger className="w-full h-7 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNotesForSelection.map((note) => (
                        <SelectItem key={note.value} value={note.value} className="font-mono text-xs">
                          {note.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          {inputMode === 'random' && (
            <Button
              onClick={handleGenerate}
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
              data-testid="button-generate"
            >
              <Shuffle className="w-3.5 h-3.5 mr-2" />
              Generate
            </Button>
          )}
        </div>

        {/* === PLAYBACK SECTION === */}
        <div className="pt-3 space-y-2 border-t border-border">
          <div className="flex gap-1.5">
            <Button
              onClick={handlePlay}
              size="sm"
              disabled={isLoadingInstruments}
              className={`flex-1 h-9 text-sm font-semibold ${
                isPlaying
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {isLoadingInstruments ? (
                <span className="animate-pulse">Loading...</span>
              ) : isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 mr-1.5" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Play
                </>
              )}
            </Button>

            {isFeatureEnabled('AUTO_LOOP') && (
              <Button
                onClick={toggleLoop}
                variant={isLooping ? "default" : "outline"}
                size="sm"
                className="h-9 px-4 text-sm"
                data-testid="button-auto-loop"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <Button
            onClick={handleRandomHarmonize}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            data-testid="button-random-chords"
          >
            <Shuffle className="w-3.5 h-3.5 mr-2" />
            Random Chords
          </Button>
        </div>

        {/* === SOUND SECTION === */}
        <div className="pt-3 space-y-2 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              Sound
            </label>
            <Select value={selectedComboId} onValueChange={setSelectedComboId}>
              <SelectTrigger className="w-[120px] h-7 text-xs" data-testid="select-instrument-combo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTRUMENT_COMBOS.map((combo) => (
                  <SelectItem key={combo.id} value={combo.id} className="text-xs">
                    {combo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground w-12">Chords</span>
              <Slider
                value={[blockChordVolume * 100]}
                onValueChange={(value) => setBlockChordVolume(value[0] / 100)}
                min={0} max={100} step={5}
                className="flex-1"
                data-testid="slider-block-chord-volume"
              />
              <span className="text-[10px] text-muted-foreground w-7 text-right">{Math.round(blockChordVolume * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground w-12">Arpeggio</span>
              <Slider
                value={[arpeggioVolume * 100]}
                onValueChange={(value) => setArpeggioVolume(value[0] / 100)}
                min={0} max={100} step={5}
                className="flex-1"
                data-testid="slider-arpeggio-volume"
              />
              <span className="text-[10px] text-muted-foreground w-7 text-right">{Math.round(arpeggioVolume * 100)}%</span>
            </div>
          </div>
        </div>

        {/* === TEMPO SECTION === */}
        <div className="pt-3 space-y-2 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Tempo</label>
            <span className="text-sm font-bold text-primary">{tempo}</span>
          </div>
          <Slider
            value={[tempo]}
            onValueChange={(value) => setTempo(value[0])}
            min={60} max={200} step={10}
            className="w-full"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Checkbox
                id="metronome"
                checked={withMetronome}
                onCheckedChange={(checked) => setWithMetronome(checked === true)}
                className="h-3.5 w-3.5"
              />
              <label htmlFor="metronome" className="text-xs text-foreground">
                Metronome
              </label>
            </div>

            {withMetronome && (
              <div className="flex gap-0.5">
                {[{ value: 1, label: '♩' }, { value: 2, label: '♫' }, { value: 3, label: '♬' }].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setMetronomeMultiplier(value)}
                    className={`w-7 h-6 text-xs rounded transition-colors ${
                      metronomeMultiplier === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs text-foreground">Arpeggio</label>
            <div className="flex rounded-md overflow-hidden border border-border">
              <button
                onClick={() => setArpeggioSpeed(1)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
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
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
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

          <div className="flex items-center justify-between">
            <label className="text-xs text-foreground">Cycles</label>
            <div className="flex rounded-md overflow-hidden border border-border">
              {[1, 2, 4].map((cycles) => (
                <button
                  key={cycles}
                  onClick={() => setChordCycles(cycles)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    chordCycles === cycles
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                  data-testid={`button-cycles-${cycles}`}
                >
                  {cycles}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* === KEYBOARD SHORTCUTS === */}
        <div className="pt-3 border-t border-border">
          <div className="flex flex-wrap gap-1.5 justify-center text-[10px] text-muted-foreground">
            <span><kbd className="px-1 py-0.5 bg-muted rounded font-mono text-foreground">Space</kbd> Play</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded font-mono text-foreground">M</kbd> Metro</span>
            {isFeatureEnabled('AUTO_LOOP') && (
              <span><kbd className="px-1 py-0.5 bg-muted rounded font-mono text-foreground">L</kbd> Loop</span>
            )}
            <span><kbd className="px-1 py-0.5 bg-muted rounded font-mono text-foreground">R</kbd> Gen</span>
          </div>
        </div>
      </div>
      </TooltipProvider>
    );
  }

  // ========== COMPACT VIEW - Vertical with icons, no sliders ==========
  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-2">
        {/* Play Controls Row */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handlePlay}
                size="sm"
                disabled={isLoadingInstruments}
                className={`flex-1 h-7 text-[10px] font-semibold ${
                  isPlaying
                    ? 'bg-destructive hover:bg-destructive/90'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isLoadingInstruments ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Square className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPlaying ? 'Stop (Space)' : 'Play (Space)'}</TooltipContent>
          </Tooltip>

          {isFeatureEnabled('AUTO_LOOP') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleLoop}
                  variant={isLooping ? "default" : "outline"}
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <Repeat className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isLooping ? 'Loop On' : 'Loop Off'}</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Notes Row */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((count) => (
            <Tooltip key={count}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onNoteCountChange?.(count)}
                  className={`flex-1 h-6 text-[10px] font-bold rounded transition-colors ${
                    noteCount === count
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {count}
                </button>
              </TooltipTrigger>
              <TooltipContent>{count} note{count > 1 ? 's' : ''}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Mode + Generate Row */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleModeToggle('random')}
                className={`flex-1 h-6 text-[9px] font-medium rounded flex items-center justify-center gap-0.5 transition-colors ${
                  inputMode === 'random'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Dices className="w-2.5 h-2.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Random mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleModeToggle('manual')}
                className={`flex-1 h-6 text-[9px] font-medium rounded flex items-center justify-center gap-0.5 transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Edit3 className="w-2.5 h-2.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Manual mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={inputMode === 'random' ? handleGenerate : handleRandomHarmonize}
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Shuffle className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{inputMode === 'random' ? 'Generate (R)' : 'Random Chords'}</TooltipContent>
          </Tooltip>
        </div>

        {/* Manual Note Selection */}
        {inputMode === 'manual' && (
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: noteCount }, (_, index) => (
              <Select
                key={index}
                value={notes[index] || 'C'}
                onValueChange={(value) => handleManualNoteChange(index, value)}
              >
                <SelectTrigger className="w-full h-5 text-[9px] font-semibold px-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableNotesForSelection.map((note) => (
                    <SelectItem key={note.value} value={note.value} className="font-mono text-xs">
                      {note.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}

        {/* Sound Row */}
        <div className="flex items-center gap-1 pt-1 border-t border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Music className="w-3 h-3 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Instrument</TooltipContent>
          </Tooltip>
          <Select value={selectedComboId} onValueChange={setSelectedComboId}>
            <SelectTrigger className="flex-1 h-5 text-[9px] px-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INSTRUMENT_COMBOS.map((combo) => (
                <SelectItem key={combo.id} value={combo.id} className="text-xs">
                  {combo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tempo Row - buttons instead of slider */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTempo(Math.max(60, tempo - 10))}
                className="h-5 w-5 text-[10px] font-bold rounded bg-muted text-muted-foreground hover:bg-muted/80"
              >
                -
              </button>
            </TooltipTrigger>
            <TooltipContent>Slower</TooltipContent>
          </Tooltip>

          <div className="flex-1 text-center">
            <span className="text-[10px] font-mono font-bold text-primary">{tempo}</span>
            <span className="text-[8px] text-muted-foreground ml-0.5">BPM</span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTempo(Math.min(200, tempo + 10))}
                className="h-5 w-5 text-[10px] font-bold rounded bg-muted text-muted-foreground hover:bg-muted/80"
              >
                +
              </button>
            </TooltipTrigger>
            <TooltipContent>Faster</TooltipContent>
          </Tooltip>
        </div>

        {/* Metronome + Arpeggio Row */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setWithMetronome(!withMetronome)}
                className={`h-5 px-1.5 text-[9px] font-medium rounded flex items-center transition-colors ${
                  withMetronome
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                ♩
              </button>
            </TooltipTrigger>
            <TooltipContent>Metronome (M)</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setArpeggioSpeed(1)}
                className={`px-1.5 h-5 text-[8px] font-medium rounded-l transition-colors ${
                  arpeggioSpeed === 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                8th
              </button>
            </TooltipTrigger>
            <TooltipContent>Eighth notes</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setArpeggioSpeed(2)}
                className={`px-1.5 h-5 text-[8px] font-medium rounded-r transition-colors ${
                  arpeggioSpeed === 2
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                16th
              </button>
            </TooltipTrigger>
            <TooltipContent>Sixteenth notes</TooltipContent>
          </Tooltip>
        </div>

        {/* Cycles Row */}
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-muted-foreground">Cycles</span>
          <div className="flex-1" />
          {[1, 2, 4].map((cycles) => (
            <Tooltip key={cycles}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setChordCycles(cycles)}
                  className={`w-5 h-5 text-[8px] font-medium rounded transition-colors ${
                    chordCycles === cycles
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {cycles}x
                </button>
              </TooltipTrigger>
              <TooltipContent>{cycles} cycle{cycles > 1 ? 's' : ''}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}