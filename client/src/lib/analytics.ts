import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

// Analytics helper functions for tracking user interactions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, parameters);
    } catch (error) {
      console.warn('Analytics event failed:', error);
    }
  }
};

// Track music learning interactions
export const trackMusicEvent = {
  playSequence: () => trackEvent('play_sequence'),
  generateChords: () => trackEvent('generate_chords'),
  selectChord: (chordName: string) => trackEvent('select_chord', { chord_name: chordName }),
  toggleMetronome: (enabled: boolean) => trackEvent('toggle_metronome', { enabled }),
  changeSkillLevel: (level: string) => trackEvent('change_skill_level', { skill_level: level }),
  toggleAutoLoop: (enabled: boolean) => trackEvent('toggle_auto_loop', { enabled })
};