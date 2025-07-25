# Stable Version Snapshots

This file tracks stable, working versions of key components for easy rollback.

## Current Stable Version: 2025-07-25-afternoon
**Status**: ✅ STABLE - Core functionality working, metronome timing fixed
**Features**: 
- Single-play sequences (no auto-loop)
- Chord trees with 6 harmonizing options per note
- Metronome with 1x, 2x, 3x speeds (timing precise)
- Random chord harmonizer
- Keyboard shortcuts (Space, M, R)
- Web Audio API scheduling for precise timing

**Key Files Snapshot**:
- `random-notes-generator.tsx` - Main component (stable)
- `audio-engine.ts` - Web Audio implementation (stable)
- `chord-theory.ts` - Chord calculation logic (stable)
- `use-audio.ts` - Audio state management (stable)

**To Rollback**: Copy files from `backups/stable-2025-07-25/` directory

---

## Previous Versions

### 2025-07-25-morning
**Status**: ⚠️ HAD ISSUES - Auto loop state management conflicts
**Issues**: Auto loop would stop after first sequence due to state conflicts

### 2025-07-20-evening  
**Status**: ✅ STABLE - Major UI improvements
**Features**: Tree branch visual design, centered orange notes, instruction text updates

### 2025-07-20-afternoon
**Status**: ✅ STABLE - Random harmonizer functionality working
**Features**: Random chord selection from available options, automatic playback triggering