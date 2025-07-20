import { useState, useCallback, useEffect } from 'react';
import { audioEngine } from '@/lib/audio-engine';

export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    try {
      await audioEngine.initialize();
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize audio');
    }
  }, []);

  const playNote = useCallback(async (note: string, duration?: number) => {
    if (!isInitialized) {
      await initialize();
    }

    try {
      setIsPlaying(true);
      await audioEngine.playNote(note, duration);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play note');
    } finally {
      setIsPlaying(false);
    }
  }, [isInitialized, initialize]);

  const playChord = useCallback(async (notes: string[], duration?: number) => {
    if (!isInitialized) {
      await initialize();
    }

    try {
      setIsPlaying(true);
      await audioEngine.playChord(notes, duration);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play chord');
    } finally {
      setIsPlaying(false);
    }
  }, [isInitialized, initialize]);

  const playSequence = useCallback(async (notes: string[], tempo: number) => {
    if (!isInitialized) {
      await initialize();
    }

    try {
      setIsPlaying(true);
      await audioEngine.playSequence(notes, tempo);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play sequence');
    } finally {
      setIsPlaying(false);
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    return () => {
      audioEngine.destroy();
    };
  }, []);

  return {
    isInitialized,
    isPlaying,
    error,
    initialize,
    playNote,
    playChord,
    playSequence,
    setMasterVolume: audioEngine.setMasterVolume.bind(audioEngine)
  };
}
