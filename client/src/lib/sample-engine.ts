import { logger } from './logger';
import { SplendidGrandPiano } from 'smplr';
import Soundfont from 'soundfont-player';
import { NOTE_FREQUENCIES } from './music-constants';

type SoundfontInstrument = Soundfont.Player;

export interface InstrumentCombo {
  id: string;
  name: string;
  blockChordInstrument: string;
  arpeggioInstrument: string;
  blockChordLabel: string;
  arpeggioLabel: string;
}

export const INSTRUMENT_COMBOS: InstrumentCombo[] = [
  {
    id: 'orchestral-piano',
    name: 'Orchestral Piano',
    blockChordInstrument: 'string_ensemble_1',
    arpeggioInstrument: 'splendid_grand_piano',
    blockChordLabel: 'String Legato Orchestra',
    arpeggioLabel: 'Grand Piano'
  },
  {
    id: 'brass-guitar',
    name: 'Brass & Guitar',
    blockChordInstrument: 'synth_brass_1',
    arpeggioInstrument: 'acoustic_guitar_nylon',
    blockChordLabel: 'Bright Brassy Pads',
    arpeggioLabel: 'Nylon Guitar'
  },
  {
    id: 'rock-organ',
    name: 'Rock Organ',
    blockChordInstrument: 'rock_organ',
    arpeggioInstrument: 'electric_guitar_clean',
    blockChordLabel: 'Rock Organ',
    arpeggioLabel: 'Electric Guitar'
  },
  {
    id: 'synth-80s',
    name: "80's Synth",
    blockChordInstrument: 'pad_2_warm',
    arpeggioInstrument: 'lead_1_square',
    blockChordLabel: "80's Poly Synth",
    arpeggioLabel: 'Synth Lead'
  },
  {
    id: 'harp-marimba',
    name: 'Harp & Marimba',
    blockChordInstrument: 'orchestral_harp',
    arpeggioInstrument: 'vibraphone',
    blockChordLabel: 'Orchestral Harp',
    arpeggioLabel: 'Vibraphone'
  }
];

export class SampleEngine {
  public audioContext: AudioContext | null = null;
  public masterGainNode: GainNode | null = null;
  private blockChordGainNode: GainNode | null = null;
  private arpeggioGainNode: GainNode | null = null;
  private isInitialized = false;
  
  private grandPiano: SplendidGrandPiano | null = null;
  private loadedInstruments: Map<string, SoundfontInstrument> = new Map();
  private loadingPromises: Map<string, Promise<SoundfontInstrument | null>> = new Map();
  
  private currentComboId: string = 'orchestral-piano';
  private blockChordVolume: number = 0.5;
  private arpeggioVolume: number = 0.7;
  
  public activeNodes: Set<any> = new Set();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.masterGainNode = this.audioContext.createGain();
      this.blockChordGainNode = this.audioContext.createGain();
      this.arpeggioGainNode = this.audioContext.createGain();
      
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, this.audioContext.currentTime);
      compressor.knee.setValueAtTime(25, this.audioContext.currentTime);
      compressor.ratio.setValueAtTime(4, this.audioContext.currentTime);
      compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
      compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
      
      this.blockChordGainNode.connect(this.masterGainNode);
      this.arpeggioGainNode.connect(this.masterGainNode);
      this.masterGainNode.connect(compressor);
      compressor.connect(this.audioContext.destination);
      
      this.masterGainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
      this.blockChordGainNode.gain.setValueAtTime(this.blockChordVolume, this.audioContext.currentTime);
      this.arpeggioGainNode.gain.setValueAtTime(this.arpeggioVolume, this.audioContext.currentTime);
      
      this.isInitialized = true;
      logger.log('🎹 SampleEngine initialized');
    } catch (error) {
      console.error('Failed to initialize SampleEngine:', error);
      throw new Error('Web Audio API not supported');
    }
  }

  async loadCombo(comboId: string): Promise<void> {
    const combo = INSTRUMENT_COMBOS.find(c => c.id === comboId);
    if (!combo) {
      console.warn(`Unknown combo: ${comboId}`);
      return;
    }
    
    this.currentComboId = comboId;
    logger.log(`🎼 Loading combo: ${combo.name}`);
    
    await Promise.all([
      this.loadInstrument(combo.blockChordInstrument),
      this.loadInstrument(combo.arpeggioInstrument)
    ]);
    
    logger.log(`✅ Combo loaded: ${combo.name}`);
  }

  private async loadInstrument(instrumentName: string): Promise<SoundfontInstrument | null> {
    if (!this.audioContext) {
      await this.initialize();
    }
    
    if (instrumentName === 'splendid_grand_piano') {
      if (!this.grandPiano && this.audioContext) {
        logger.log('🎹 Loading Splendid Grand Piano...');
        this.grandPiano = new SplendidGrandPiano(this.audioContext, {
          volume: 100
        });
        await this.grandPiano.load;
        logger.log('✅ Splendid Grand Piano loaded');
      }
      return null;
    }
    
    if (this.loadedInstruments.has(instrumentName)) {
      return this.loadedInstruments.get(instrumentName)!;
    }
    
    if (this.loadingPromises.has(instrumentName)) {
      return this.loadingPromises.get(instrumentName)!;
    }
    
    const loadPromise = (async () => {
      logger.log(`🎵 Loading instrument: ${instrumentName}`);
      try {
        const instrument = await Soundfont.instrument(
          this.audioContext as AudioContext,
          instrumentName as any,
          {
            soundfont: 'MusyngKite',
            format: 'mp3',
            destination: this.audioContext!.destination
          }
        );
        this.loadedInstruments.set(instrumentName, instrument);
        logger.log(`✅ Instrument loaded: ${instrumentName}`);
        return instrument;
      } catch (error) {
        console.error(`Failed to load instrument ${instrumentName}:`, error);
        return null;
      }
    })();
    
    this.loadingPromises.set(instrumentName, loadPromise);
    return loadPromise;
  }

  private noteToMidi(note: string, octave: number = 4): number {
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    const semitone = noteMap[note] ?? 0;
    return (octave + 1) * 12 + semitone;
  }

  async playBlockChord(notes: string[], duration: number, startTime?: number, octave: number = 3): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.audioContext) return;
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    const combo = INSTRUMENT_COMBOS.find(c => c.id === this.currentComboId);
    if (!combo) return;
    
    const instrumentName = combo.blockChordInstrument;
    const time = startTime || this.audioContext.currentTime;
    const durationSec = duration / 1000;
    
    for (const note of notes) {
      const midi = this.noteToMidi(note, octave);
      
      if (instrumentName === 'splendid_grand_piano' && this.grandPiano) {
        this.grandPiano.start({
          note: midi,
          velocity: Math.round(this.blockChordVolume * 100),
          time,
          duration: durationSec
        });
      } else {
        const instrument = this.loadedInstruments.get(instrumentName);
        if (instrument) {
          const node = instrument.play(midi.toString(), time, {
            duration: durationSec,
            gain: this.blockChordVolume
          });
          if (node) this.activeNodes.add(node);
        }
      }
    }
  }

  async playArpeggioNote(note: string, duration: number, octave: number = 4, startTime?: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.audioContext) return;
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    const combo = INSTRUMENT_COMBOS.find(c => c.id === this.currentComboId);
    if (!combo) return;
    
    const instrumentName = combo.arpeggioInstrument;
    const time = startTime || this.audioContext.currentTime;
    const durationSec = duration / 1000;
    const midi = this.noteToMidi(note, octave);
    
    if (instrumentName === 'splendid_grand_piano' && this.grandPiano) {
      this.grandPiano.start({
        note: midi,
        velocity: Math.round(this.arpeggioVolume * 100),
        time,
        duration: durationSec
      });
    } else {
      const instrument = this.loadedInstruments.get(instrumentName);
      if (instrument) {
        const node = instrument.play(midi.toString(), time, {
          duration: durationSec,
          gain: this.arpeggioVolume
        });
        if (node) this.activeNodes.add(node);
      }
    }
  }

  async playChordWithArpeggio(
    notes: string[],
    duration: number,
    startTime?: number,
    tempo: number = 120,
    rootNote?: string,
    octaves?: number[]
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.audioContext || notes.length !== 3) return;
    
    let root: string, third: string, fifth: string;
    
    if (rootNote) {
      root = rootNote;
      const noteMap: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
        'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
      };
      
      const rootIndex = noteMap[rootNote] ?? 0;
      const noteIntervals = notes.map(note => {
        const noteIndex = noteMap[note] ?? 0;
        return { note, interval: (noteIndex - rootIndex + 12) % 12 };
      });
      
      const thirdCandidate = noteIntervals.find(n => n.interval === 3 || n.interval === 4);
      const fifthCandidate = noteIntervals.find(n => n.interval === 6 || n.interval === 7 || n.interval === 8);
      
      if (thirdCandidate && fifthCandidate) {
        third = thirdCandidate.note;
        fifth = fifthCandidate.note;
      } else {
        third = notes[1];
        fifth = notes[2];
      }
    } else {
      root = notes[0];
      third = notes[1];
      fifth = notes[2];
    }
    
    const baseStartTime = startTime || this.audioContext.currentTime;
    const durationSec = duration / 1000;
    const beatDuration = 60 / tempo;
    
    const beatsInDuration = Math.floor(durationSec / beatDuration);
    for (let beat = 0; beat < beatsInDuration; beat++) {
      const chordTime = baseStartTime + (beat * beatDuration);
      await this.playBlockChord([root, third, fifth], beatDuration * 1000 * 0.9, chordTime, 3);
    }
    
    const arpeggioPattern = [
      { note: fifth, octave: 4 },
      { note: root, octave: 4 },
      { note: third, octave: 4 },
      { note: root, octave: 4 },
      { note: fifth, octave: 4 },
      { note: root, octave: 4 },
      { note: third, octave: 4 },
      { note: root, octave: 4 }
    ];
    
    const arpeggioSpeed = (window as any).__arpeggioSpeed || 1;
    const notesPerBeat = arpeggioSpeed === 2 ? 4 : 2;
    const noteDurationSec = beatDuration / notesPerBeat;
    const noteDurationMs = noteDurationSec * 1000;
    
    const maxNotesForDuration = Math.floor(durationSec / noteDurationSec);
    const notesToPlay = Math.min(arpeggioPattern.length, maxNotesForDuration);
    
    for (let i = 0; i < notesToPlay; i++) {
      const item = arpeggioPattern[i];
      const noteStartTime = baseStartTime + (i * noteDurationSec);
      await this.playArpeggioNote(item.note, noteDurationMs, item.octave, noteStartTime);
    }
  }

  setBlockChordVolume(volume: number): void {
    this.blockChordVolume = Math.max(0, Math.min(1, volume));
    if (this.blockChordGainNode && this.audioContext) {
      this.blockChordGainNode.gain.setValueAtTime(this.blockChordVolume, this.audioContext.currentTime);
    }
  }

  setArpeggioVolume(volume: number): void {
    this.arpeggioVolume = Math.max(0, Math.min(1, volume));
    if (this.arpeggioGainNode && this.audioContext) {
      this.arpeggioGainNode.gain.setValueAtTime(this.arpeggioVolume, this.audioContext.currentTime);
    }
  }

  getBlockChordVolume(): number {
    return this.blockChordVolume;
  }

  getArpeggioVolume(): number {
    return this.arpeggioVolume;
  }

  getCurrentCombo(): InstrumentCombo | undefined {
    return INSTRUMENT_COMBOS.find(c => c.id === this.currentComboId);
  }

  stopAll(): void {
    logger.log('SampleEngine.stopAll() called');
    
    this.activeNodes.forEach(node => {
      try {
        if (node && typeof node.stop === 'function') {
          node.stop();
        }
      } catch (error) {
      }
    });
    this.activeNodes.clear();
    
    if (this.grandPiano) {
      try {
        this.grandPiano.stop();
      } catch (error) {
      }
    }
    
    logger.log('SampleEngine.stopAll() complete');
  }

  setMasterVolume(volume: number): void {
    if (this.masterGainNode && this.audioContext) {
      this.masterGainNode.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext.currentTime
      );
    }
  }

  dispose(): void {
    this.stopAll();
    this.loadedInstruments.clear();
    this.loadingPromises.clear();
    this.grandPiano = null;
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGainNode = null;
      this.blockChordGainNode = null;
      this.arpeggioGainNode = null;
      this.isInitialized = false;
    }
  }
}

export const sampleEngine = new SampleEngine();
