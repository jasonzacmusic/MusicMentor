import { NOTE_FREQUENCIES } from './music-constants';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private isInitialized = false;

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

  async playNote(note: string, duration: number = 1000): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext || !this.masterGainNode) {
      throw new Error('Audio context not initialized');
    }

    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) {
      throw new Error(`Unknown note: ${note}`);
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sawtooth'; // Viola-like sawtooth wave

    // Create a filter for viola-like timbre (deeper and warmer than violin)
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, this.audioContext.currentTime); // Lower cutoff for warmer sound
    filter.Q.setValueAtTime(1.5, this.audioContext.currentTime); // Slightly higher resonance

    oscillator.connect(filter);
    filter.connect(gainNode);

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

    oscillator.start(now);
    oscillator.stop(now + (duration / 1000));

    return new Promise((resolve) => {
      oscillator.onended = () => resolve();
    });
  }

  async playChord(notes: string[], duration: number = 2000): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const promises = notes.map(note => this.playNote(note, duration));
    await Promise.all(promises);
  }

  async playSequence(notes: string[], tempo: number = 120): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const beatDuration = (60 / tempo) * 1000; // ms per beat
    
    // Play notes according to the timing: 2-2-4 beats
    const timings = [2, 2, 4];
    
    for (let i = 0; i < notes.length && i < timings.length; i++) {
      const duration = beatDuration * timings[i];
      await this.playNote(notes[i], duration);
      
      // Small gap between notes (except for the last one)
      if (i < notes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  setMasterVolume(volume: number): void {
    if (this.masterGainNode) {
      this.masterGainNode.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)), 
        this.audioContext?.currentTime || 0
      );
    }
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
