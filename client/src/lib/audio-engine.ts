import { NOTE_FREQUENCIES } from './music-constants';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private isInitialized = false;
  public activeOscillators: Set<OscillatorNode> = new Set();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      this.masterGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Web Audio API not supported');
    }
  }

  async playNote(note: string, duration: number = 1000, octaveOffset: number = 0): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext || !this.masterGainNode) {
      throw new Error('Audio context not initialized');
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

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sawtooth'; // Viola-like sawtooth wave

    // Create a filter for viola-like timbre (deeper and warmer than violin)
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, this.audioContext.currentTime); // Lower cutoff for warmer sound
    filter.Q.setValueAtTime(1.5, this.audioContext.currentTime); // Slightly higher resonance

    // Correct audio chain: oscillator -> filter -> gainNode -> masterGain
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Legato viola ADSR envelope - smoother attack and longer sustain with warmer tone
    const now = this.audioContext.currentTime;
    const attackTime = 0.25; // Slightly slower attack for viola's deeper response
    const decayTime = 0.2;
    const sustainLevel = 0.75; // Rich sustain for viola's warmth
    const releaseTime = 0.5; // Longer release for viola's resonance

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.8, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, now + (duration / 1000) - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + (duration / 1000));

    // Track active oscillators
    this.activeOscillators.add(oscillator);
    
    oscillator.start(now);
    oscillator.stop(now + (duration / 1000));
    
    // Remove from tracking when it ends
    oscillator.addEventListener('ended', () => {
      this.activeOscillators.delete(oscillator);
    });

    return new Promise((resolve) => {
      oscillator.onended = () => resolve();
    });
  }

  async playChord(notes: string[], duration: number = 2000): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Play all chord notes at their correct pitch
    const promises = notes.map(note => this.playNote(note, duration));
    await Promise.all(promises);
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
      
      // Small gap between notes (except for the last one)
      if (i < notes.length - 1) {
        currentTime += 0.1; // 100ms gap
      }
    }
    
    // Wait for the entire sequence to complete
    const totalDuration = (currentTime - startTime + 0.1) * 1000; // Convert to ms
    await new Promise(resolve => setTimeout(resolve, totalDuration));
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
    
    // Start and stop
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
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

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    oscillator.frequency.setValueAtTime(800, time);
    oscillator.type = 'square';

    const clickDuration = 0.05;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.3, time + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, time + clickDuration);

    // Track metronome oscillators
    this.activeOscillators.add(oscillator);
    
    oscillator.start(time);
    oscillator.stop(time + clickDuration);
    
    oscillator.addEventListener('ended', () => {
      this.activeOscillators.delete(oscillator);
    });
  }

  playMetronomeClick(): void {
    if (!this.audioContext || !this.masterGainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Simple click sound - higher frequency, short duration
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.type = 'square';

    const now = this.audioContext.currentTime;
    const clickDuration = 0.05; // 50ms click

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + clickDuration);

    // Track immediate metronome clicks too
    this.activeOscillators.add(oscillator);
    
    oscillator.start(now);
    oscillator.stop(now + clickDuration);
    
    oscillator.addEventListener('ended', () => {
      this.activeOscillators.delete(oscillator);
    });
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
            this.masterGainNode.gain.setValueAtTime(0.3, this.audioContext?.currentTime || 0);
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
