# Easy Rollback Guide

## Quick Rollback Commands

### Restore to Current Stable Version (July 25, 2025)
```bash
# Restore main component
cp backups/stable-2025-07-25/random-notes-generator.tsx.backup client/src/components/random-notes-generator.tsx

# Restore audio engine
cp backups/stable-2025-07-25/audio-engine.ts client/src/lib/

# Restore audio hooks
cp backups/stable-2025-07-25/use-audio.ts client/src/hooks/

# Restore chord theory
cp backups/stable-2025-07-25/chord-theory.ts client/src/lib/
```

### Disable All New Features (Feature Flags)
Edit `client/src/lib/feature-flags.ts` and set all flags to `false`:
```typescript
export const FEATURE_FLAGS = {
  AUTO_LOOP: false,
  ADVANCED_CHORD_INVERSIONS: false,
  CHORD_PROGRESSION_ANALYSIS: false,
  PRACTICE_SESSION_TRACKING: false,
  CUSTOM_CHORD_LIBRARY: false,
} as const;
```

## What Each Rollback Point Contains

### Current Stable (2025-07-25-afternoon)
- ✅ Single-play sequences work perfectly
- ✅ Metronome timing precise (1x/2x/3x speeds)
- ✅ Chord trees with 6 harmonizing options
- ✅ Random chord harmonizer
- ✅ Keyboard shortcuts (Space, M, R)
- ❌ No Auto Loop (removed for stability)

### Previous Points
See `backups/stable-versions.md` for full version history.

## How to Use Going Forward

1. **Before any new feature**: I'll create a backup in `backups/stable-YYYY-MM-DD/`
2. **New features**: Will use feature flags so you can disable them instantly
3. **If something breaks**: Use commands above to restore working state
4. **Feature toggles**: Edit `feature-flags.ts` to enable/disable without code changes

This way you always have a safe fallback to the last working version!