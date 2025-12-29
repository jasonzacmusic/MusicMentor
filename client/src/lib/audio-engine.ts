import { NOTE_FREQUENCIES } from './music-constants';

export class AudioEngine {
  public audioContext: AudioContext | null = null;
  public masterGainNode: GainNode | null = null;
  private isInitialized = false;
  public activeOscillators: Set<OscillatorNode> = new Set();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if it's suspended (required for user interaction)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.masterGainNode = this.audioContext.createGain();
      
      // Piano-like master compression and limiting
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
      compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
      compressor.ratio.setValueAtTime(3, this.audioContext.currentTime);
      compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
      compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
      
      this.masterGainNode.connect(compressor);
      compressor.connect(this.audioContext.destination);
      this.masterGainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime); // Slightly louder for piano
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Web Audio API not supported');
    }
  }

  async playNote(note: string, duration: number = 1000, octaveOffset: number = 0, startTime?: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext || !this.masterGainNode) {
      throw new Error('Audio context not initialized');
    }

    // Always ensure audio context is running before playing notes
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Use the original NOTE_FREQUENCIES for correct pitches
    let frequency = NOTE_FREQUENCIES[note];
    if (!frequency) {
      throw new Error(`Unknown note: ${note}`);
    }

    // Apply octave offset (each octave is double/half the frequency)
    if (octaveOffset !== 0) {
      frequency = frequency * Math.pow(2, octaveOffset);
    }

    // Create piano-like sound using multiple oscillators for harmonic richness
    const fundamentalOsc = this.audioContext.createOscillator();
    const harmonic2Osc = this.audioContext.createOscillator();
    const harmonic3Osc = this.audioContext.createOscillator();
    const subOsc = this.audioContext.createOscillator();
    
    const gainNode = this.audioContext.createGain();
    const harmonic2Gain = this.audioContext.createGain();
    const harmonic3Gain = this.audioContext.createGain();
    const subGain = this.audioContext.createGain();

    // Piano frequency setup with harmonics
    fundamentalOsc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    harmonic2Osc.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime); // Second harmonic
    harmonic3Osc.frequency.setValueAtTime(frequency * 3, this.audioContext.currentTime); // Third harmonic
    subOsc.frequency.setValueAtTime(frequency * 0.5, this.audioContext.currentTime); // Sub-harmonic for bass

    // Piano-like waveforms - mix of sine and triangle for realistic timbre
    fundamentalOsc.type = 'triangle'; // Main body of piano sound
    harmonic2Osc.type = 'sine'; // Clean second harmonic
    harmonic3Osc.type = 'sine'; // Subtle third harmonic
    subOsc.type = 'sine'; // Bass foundation

    // Piano harmonic balance - lower frequencies have more harmonics
    const bassBoost = frequency < 200 ? 1.5 : 1.0;
    const trebleAttenuate = frequency > 1000 ? 0.7 : 1.0;
    
    harmonic2Gain.gain.setValueAtTime(0.3 * bassBoost, this.audioContext.currentTime);
    harmonic3Gain.gain.setValueAtTime(0.15 * bassBoost, this.audioContext.currentTime);
    subGain.gain.setValueAtTime(0.4 * bassBoost * trebleAttenuate, this.audioContext.currentTime);

    // Piano-like filtering - warm but clear
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000 + (frequency * 0.5), this.audioContext.currentTime); // Dynamic cutoff
    filter.Q.setValueAtTime(0.8, this.audioContext.currentTime); // Gentle resonance

    // Piano resonance simulation with slight reverb
    const convolver = this.audioContext.createConvolver();
    const reverbGain = this.audioContext.createGain();
    reverbGain.gain.setValueAtTime(0.15, this.audioContext.currentTime); // Subtle reverb

    // Create simple impulse response for piano-like resonance
    const impulseLength = Math.round(this.audioContext.sampleRate * 0.8); // 0.8 second reverb
    const impulseBuffer = this.audioContext.createBuffer(2, impulseLength, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulseBuffer.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i / impulseLength), 2);
      }
    }
    convolver.buffer = impulseBuffer;

    // Connect piano sound chain: oscillators -> gains -> filter -> master + reverb
    fundamentalOsc.connect(gainNode);
    harmonic2Osc.connect(harmonic2Gain);
    harmonic3Osc.connect(harmonic3Gain);
    subOsc.connect(subGain);
    
    harmonic2Gain.connect(gainNode);
    harmonic3Gain.connect(gainNode);
    subGain.connect(gainNode);
    
    gainNode.connect(filter);
    filter.connect(this.masterGainNode);
    
    // Add subtle reverb
    filter.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(this.masterGainNode);

    // Track all oscillators
    this.activeOscillators.add(fundamentalOsc);
    this.activeOscillators.add(harmonic2Osc);
    this.activeOscillators.add(harmonic3Osc);
    this.activeOscillators.add(subOsc);

    // Piano-like ADSR envelope - quick attack, gradual decay, natural release
    const now = startTime || this.audioContext.currentTime;
    const attackTime = 0.005; // Very fast piano attack
    const decayTime = 0.3; // Longer decay for piano resonance
    const sustainLevel = 0.4; // Lower sustain level like real piano
    const releaseTime = Math.min(1.0, (duration / 1000) * 0.3); // Natural piano release

    // Piano dynamics - louder for bass notes, softer for treble
    const velocityGain = frequency < 300 ? 0.9 : frequency > 1000 ? 0.6 : 0.75;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.exponentialRampToValueAtTime(velocityGain, now + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(sustainLevel * velocityGain, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel * velocityGain, now + (duration / 1000) - releaseTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (duration / 1000)); // Exponential release for piano

    // Remove oscillators from tracking when they end
    const removeOscillators = () => {
      this.activeOscillators.delete(fundamentalOsc);
      this.activeOscillators.delete(harmonic2Osc);
      this.activeOscillators.delete(harmonic3Osc);
      this.activeOscillators.delete(subOsc);
    };

    fundamentalOsc.addEventListener('ended', removeOscillators);

    return new Promise<void>((resolve) => {
      // Set a timeout to ensure promise resolves even if onended fails
      const timeout = setTimeout(() => {
        resolve();
      }, duration + 1000); // Resolve after duration + 1 second buffer

      fundamentalOsc.onended = () => {
        clearTimeout(timeout);
        resolve();
      };

      try {
        // Start all piano oscillators simultaneously
        fundamentalOsc.start(now);
        harmonic2Osc.start(now);
        harmonic3Osc.start(now);
        subOsc.start(now);
        
        // Stop all oscillators at the same time
        fundamentalOsc.stop(now + (duration / 1000));
        harmonic2Osc.stop(now + (duration / 1000));
        harmonic3Osc.stop(now + (duration / 1000));
        subOsc.stop(now + (duration / 1000));
      } catch (error) {
        console.error('Error starting/stopping piano oscillators:', error);
        clearTimeout(timeout);
        removeOscillators();
        resolve(); // Resolve even on error to prevent hanging
      }
    });
  }

  async playChord(notes: string[], duration: number = 2000, startTime?: number, tempo: number = 120, rootNote?: string, octaves?: number[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (notes.length !== 3) {
        // Fallback to simultaneous playback if not a triad
        const promises = notes.map(note => 
          this.playNote(note, duration, 0, startTime).catch(error => {
            console.error('Error playing chord note:', note, error);
            return Promise.resolve();
          })
        );
        await Promise.all(promises);
        return;
      }

      // DETERMINE ROOT POSITION NOTES USING INTERVAL CALCULATION
      // If rootNote is provided, use chromatic intervals to identify the true root, third, and fifth
      // regardless of what inversion the notes are in
      let root: string, third: string, fifth: string;
      
      if (rootNote) {
        root = rootNote;
        
        // Import CHROMATIC_NOTES for interval calculation
        const CHROMATIC_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
        
        // Normalize note names to handle enharmonic equivalents
        const normalizeNote = (note: string): number => {
          const noteMap: Record<string, number> = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
            'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
          };
          return noteMap[note] ?? -1;
        };
        
        const rootChromaticIndex = normalizeNote(rootNote);
        
        // Calculate semitone intervals from root for each note in the chord
        const noteIntervals = notes.map(note => {
          const noteIndex = normalizeNote(note);
          if (noteIndex === -1 || rootChromaticIndex === -1) return { note, interval: -1 };
          
          // Calculate interval, handling wrap-around
          let interval = (noteIndex - rootChromaticIndex + 12) % 12;
          return { note, interval };
        });
        
        console.log(`🔍 Analyzing chord intervals from root ${rootNote}:`, noteIntervals);
        
        // Identify third and fifth by their intervals from the root
        // Third: 3 semitones (minor 3rd) or 4 semitones (major 3rd)
        // Fifth: 7 semitones (perfect 5th), 6 semitones (diminished 5th), or 8 semitones (augmented 5th)
        const thirdCandidate = noteIntervals.find(n => n.interval === 3 || n.interval === 4);
        const fifthCandidate = noteIntervals.find(n => n.interval === 6 || n.interval === 7 || n.interval === 8);
        
        if (thirdCandidate && fifthCandidate) {
          third = thirdCandidate.note;
          fifth = fifthCandidate.note;
          console.log(`✅ Identified by intervals: Root=${root}, Third=${third} (${thirdCandidate.interval}st), Fifth=${fifth} (${fifthCandidate.interval}st)`);
        } else {
          // Fallback: use positional order
          console.warn(`⚠️ Could not identify intervals, falling back to positional order`);
          third = notes[1];
          fifth = notes[2];
        }
      } else {
        // No rootNote provided - assume notes are in root position order
        root = notes[0];
        third = notes[1];
        fifth = notes[2];
      }

      // ARPEGGIO ALWAYS USES ROOT POSITION (all notes at octave 0)
      // This ensures the arpeggio sounds IDENTICAL regardless of chord inversion

      // Arpeggio pattern: 5-1-3-1 played TWICE = 8 notes total
      const arpeggioPattern = [
        { note: fifth, octave: 0 },
        { note: root, octave: 0 },
        { note: third, octave: 0 },
        { note: root, octave: 0 },
        { note: fifth, octave: 0 },
        { note: root, octave: 0 },
        { note: third, octave: 0 },
        { note: root, octave: 0 }
      ];

      // BEAT-ALIGNED ARPEGGIO TIMING - notes always land exactly on beat subdivisions
      // arpeggioSpeed: 1 = eighth notes (2 per beat), 2 = sixteenth notes (4 per beat)
      const arpeggioSpeed = (window as any).__arpeggioSpeed || 1;
      const beatDuration = 60 / tempo; // seconds per beat
      const notesPerBeat = arpeggioSpeed === 2 ? 4 : 2; // 4 for sixteenth, 2 for eighth
      const noteDurationSec = beatDuration / notesPerBeat; // Exact beat subdivision
      const noteDurationMs = noteDurationSec * 1000;
      const baseStartTime = startTime || this.audioContext!.currentTime;
      
      // Calculate how many notes fit in the allocated duration (truncate pattern if needed)
      const chordDurationSec = duration / 1000;
      const maxNotesForDuration = Math.floor(chordDurationSec / noteDurationSec);
      const notesToPlay = Math.min(arpeggioPattern.length, maxNotesForDuration);
      const truncatedPattern = arpeggioPattern.slice(0, notesToPlay);

      console.log(`🎸 Arpeggio: ${root}-${third}-${fifth} at ${tempo} BPM, ${arpeggioSpeed === 2 ? '16th' : '8th'} notes, ${notesToPlay}/${arpeggioPattern.length} notes`);

      // Schedule notes with EXACT beat-aligned timing - no drift possible
      const promises = truncatedPattern.map((item, index) => {
        const noteStartTime = baseStartTime + (index * noteDurationSec);
        return this.playNote(item.note, noteDurationMs, item.octave, noteStartTime).catch(error => {
          console.error('Error playing arpeggio note:', item.note, error);
          return Promise.resolve();
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error in playChord:', error);
      // Don't re-throw to prevent unhandled rejection
    }
  }

  async playSequence(notes: string[], tempo: number = 120, withMetronome: boolean = false, metronomeMultiplier: number = 1): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const beatDuration = 60 / tempo; // seconds per beat
    
    // Calculate metronome interval based on multiplier
    // x1 = quarter notes (same as beat), x2 = eighth notes, x3 = triplets
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
    
    // Play notes according to the timing: 2-2-4 beats (total 8 beats)
    const timings = [2, 2, 4];
    const startTime = this.audioContext!.currentTime;
    let currentTime = startTime;
    
    // Schedule all metronome clicks first if needed
    if (withMetronome) {
      this.scheduleMetronomeClicks(startTime, 8 * beatDuration, metronomeInterval);
    }
    
    for (let i = 0; i < notes.length && i < timings.length; i++) {
      const duration = beatDuration * timings[i];
      // Note 3 plays an octave lower to make it clearly lower than Note 1
      const octaveOffset = i === 2 ? -1 : 0;
      
      // Schedule the note to play at precise time
      this.scheduleNote(notes[i], currentTime, duration, octaveOffset);
      
      currentTime += duration;
      // NO gaps between notes - beat-aligned timing for DAW-accurate playback
    }
    
    // Wait for the entire sequence to complete with proper error handling
    const totalDuration = (currentTime - startTime + 0.1) * 1000; // Convert to ms
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve();
      }, totalDuration);
      
      // Ensure cleanup happens
      setTimeout(() => {
        clearTimeout(timeout);
      }, totalDuration + 1000);
    });
  }

  private scheduleNote(note: string, startTime: number, duration: number, octaveOffset: number = 0): void {
    if (!this.audioContext || !this.masterGainNode) return;

    let frequency = NOTE_FREQUENCIES[note];
    if (!frequency) {
      console.warn(`Unknown note: ${note}`);
      return;
    }

    // Apply octave offset (each octave is double/half the frequency)
    if (octaveOffset !== 0) {
      frequency = frequency * Math.pow(2, octaveOffset);
    }
    
    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    // Connect nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Configure oscillator
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = 'sawtooth';

    // Configure filter for viola-like sound
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1600, startTime);
    filterNode.Q.setValueAtTime(1.5, startTime);

    // Configure envelope
    const attackTime = 0.1;
    const releaseTime = 0.3;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + attackTime);
    gainNode.gain.setValueAtTime(0.3, startTime + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    // Track oscillator
    this.activeOscillators.add(oscillator);
    
    // Start and stop with error handling
    try {
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    } catch (error) {
      console.error('Error with scheduled note:', error);
      this.activeOscillators.delete(oscillator);
    }
    
    // Remove from tracking when it ends
    oscillator.addEventListener('ended', () => {
      this.activeOscillators.delete(oscillator);
    });
  }

  private scheduleMetronomeClicks(startTime: number, totalDuration: number, interval: number): void {
    if (!this.audioContext) return;

    let clickTime = startTime;
    while (clickTime < startTime + totalDuration) {
      this.scheduleMetronomeClick(clickTime);
      clickTime += interval;
    }
  }

  private scheduleMetronomeClick(time: number): void {
    if (!this.audioContext || !this.masterGainNode) return;

    // Create piano-like metronome click using multiple components
    const clickOsc1 = this.audioContext.createOscillator();
    const clickOsc2 = this.audioContext.createOscillator(); 
    const noiseOsc = this.audioContext.createOscillator();
    
    const clickGain1 = this.audioContext.createGain();
    const clickGain2 = this.audioContext.createGain();
    const noiseGain = this.audioContext.createGain();
    const masterClickGain = this.audioContext.createGain();

    // Piano-like click frequencies (like striking a high piano key)
    clickOsc1.frequency.setValueAtTime(2200, time); // Bright fundamental
    clickOsc2.frequency.setValueAtTime(4400, time); // High harmonic
    noiseOsc.frequency.setValueAtTime(8000, time); // Attack transient

    clickOsc1.type = 'triangle'; // Soft piano-like tone
    clickOsc2.type = 'sine'; // Clean harmonic
    noiseOsc.type = 'square'; // Sharp attack

    // Connect piano click chain
    clickOsc1.connect(clickGain1);
    clickOsc2.connect(clickGain2);
    noiseOsc.connect(noiseGain);
    
    clickGain1.connect(masterClickGain);
    clickGain2.connect(masterClickGain);
    noiseGain.connect(masterClickGain);
    
    masterClickGain.connect(this.masterGainNode);

    // Piano metronome envelope - sharp attack, quick decay like piano hammer
    const attackTime = 0.002; // Very sharp attack
    const decayTime = 0.08; // Quick decay like piano

    // Balance the components
    clickGain1.gain.setValueAtTime(0, time);
    clickGain1.gain.exponentialRampToValueAtTime(0.15, time + attackTime);
    clickGain1.gain.exponentialRampToValueAtTime(0.001, time + decayTime);

    clickGain2.gain.setValueAtTime(0, time);
    clickGain2.gain.exponentialRampToValueAtTime(0.08, time + attackTime);
    clickGain2.gain.exponentialRampToValueAtTime(0.001, time + decayTime);

    noiseGain.gain.setValueAtTime(0, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.12, time + attackTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + attackTime * 3);

    masterClickGain.gain.setValueAtTime(0.4, time); // Piano click volume

    // Track all oscillators
    this.activeOscillators.add(clickOsc1);
    this.activeOscillators.add(clickOsc2);
    this.activeOscillators.add(noiseOsc);

    try {
      // Start and stop all components
      clickOsc1.start(time);
      clickOsc2.start(time);
      noiseOsc.start(time);
      
      clickOsc1.stop(time + decayTime);
      clickOsc2.stop(time + decayTime);
      noiseOsc.stop(time + attackTime * 3);
    } catch (error) {
      console.error('Error with piano metronome click:', error);
      this.activeOscillators.delete(clickOsc1);
      this.activeOscillators.delete(clickOsc2);
      this.activeOscillators.delete(noiseOsc);
    }

    // Clean up tracking
    const cleanup = () => {
      this.activeOscillators.delete(clickOsc1);
      this.activeOscillators.delete(clickOsc2);
      this.activeOscillators.delete(noiseOsc);
    };

    clickOsc1.addEventListener('ended', cleanup);
  }

  playMetronomeClick(): void {
    if (!this.audioContext || !this.masterGainNode) return;

    // Use the same piano-like metronome sound as scheduled clicks
    this.scheduleMetronomeClick(this.audioContext.currentTime);
  }

  stopAll(): void {
    console.log('AudioEngine.stopAll() called - stopping', this.activeOscillators.size, 'oscillators');
    
    // Stop all active oscillators immediately
    this.activeOscillators.forEach(oscillator => {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch (error) {
        // Oscillator might already be stopped - ignore error
      }
    });
    this.activeOscillators.clear();
    
    // Reset master gain to ensure silence
    if (this.masterGainNode) {
      try {
        this.masterGainNode.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
        setTimeout(() => {
          if (this.masterGainNode) {
            this.masterGainNode.gain.setValueAtTime(0.4, this.audioContext?.currentTime || 0); // Piano volume
          }
        }, 100);
      } catch (error) {
        console.error('Error resetting master gain:', error);
      }
    }
    
    console.log('AudioEngine.stopAll() complete');
  }

  setMasterVolume(volume: number): void {
    if (this.masterGainNode) {
      this.masterGainNode.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)), 
        this.audioContext?.currentTime || 0
      );
    }
  }

  getFrequency(note: string, octaveOffset: number = 0): number {
    const baseOctave = 4;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Handle flats by converting to sharps
    const flatToSharp: Record<string, string> = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    
    const normalizedNote = flatToSharp[note] || note;
    const noteIndex = notes.indexOf(normalizedNote);
    
    if (noteIndex === -1) {
      console.warn(`Unknown note: ${note}`);
      return 440; // Default to A4
    }
    
    const octave = baseOctave + octaveOffset;
    const semitones = (octave - 4) * 12 + noteIndex;
    
    return 440 * Math.pow(2, semitones / 12);
  }

  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGainNode = null;
      this.isInitialized = false;
    }
  }
}

export const audioEngine = new AudioEngine();
