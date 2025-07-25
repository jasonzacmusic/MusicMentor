# Regression Test Suite for ChordCraft Music Learning App

## Overview
This document outlines critical test scenarios to prevent regressions in core functionality. These tests should be performed after any significant code changes.

## Critical Bug Prevention Tests

### 1. Random Chord First-Click Bug (Fixed July 25, 2025)
**Issue**: Random Chord button played notes instead of chords on first click
**Root Cause**: State initialization timing - selectedChords prop not updated before playback

**Test Steps**:
1. Load fresh page (hard refresh)
2. Click "Random Chords" button immediately
3. **Expected**: Should play 3 chords (not individual notes)
4. **Verification**: Console should log "🎹 Position X - Chord: [ChordName]" for all 3 positions

### 2. Auto Loop Timing Precision (Fixed July 25, 2025)
**Issue**: Delay accumulation after 2nd loop iteration
**Root Cause**: Floating-point timing calculation vs exact beat-based calculation

**Test Steps**:
1. Enable Auto Loop (L key or button)
2. Generate new notes and play
3. Let loop run for 5+ iterations
4. **Expected**: No noticeable delay between loops
5. **Verification**: Console timing logs should remain consistent

### 3. Syntax Error Prevention
**Issue**: Stray characters breaking app startup
**Prevention**: Always validate syntax before deployment

**Test Steps**:
1. Check app starts without errors
2. **Expected**: Server runs on port 5000 without compilation errors
3. **Verification**: No LSP diagnostics, clean console

## Functional Regression Tests

### Audio Engine Tests
1. **Note Playback**
   - Individual notes play correctly
   - Octave offsets work (Note 3 plays lower)
   - No audio cutting or DOMExceptions

2. **Chord Playback**
   - All chord types play 3 notes exactly
   - No extra notes from voice leading
   - Proper staggered timing (50ms between notes)

3. **Metronome Integration**
   - All speeds (1x, 2x, 3x) work correctly
   - No extra beats at 3x speed
   - Precise click timing aligned with beats

### State Management Tests
1. **Chord Selection Persistence**
   - Manual chord selections persist after tempo changes
   - Random chord selections properly update UI
   - Generate New properly clears all selections

2. **Audio Control States**
   - Play/Stop toggle works correctly
   - Emergency reset clears all audio
   - Auto Loop toggle functions properly

### UI Interaction Tests
1. **Keyboard Shortcuts**
   - Space: Play/Stop
   - M: Metronome toggle
   - L: Auto Loop (when feature enabled)
   - R: Generate New

2. **Control Responsiveness**
   - Tempo changes apply immediately during playback
   - Metronome toggles work during playback
   - All buttons respond without delay

## Performance Tests

### Memory Leak Prevention
1. **Audio Cleanup**
   - All oscillators properly stopped and garbage collected
   - No accumulating setTimeout/setInterval references
   - activeTimeoutsRef properly cleared

2. **State Cleanup**
   - Component unmount cleanup works
   - No memory leaks in refs or event listeners

### Timing Precision
1. **Web Audio Scheduling**
   - Notes scheduled with Web Audio API (not setTimeout)
   - Consistent timing across all playback modes
   - No drift over extended play sessions

## Browser Compatibility Tests

### Audio Context Handling
1. **Suspended State Recovery**
   - App handles suspended audio context properly
   - User interaction properly resumes audio
   - No errors on first audio interaction

2. **Cross-Browser Audio**
   - Chrome: Full functionality
   - Firefox: Verify Web Audio API compatibility
   - Safari: Test iOS audio constraints

## Feature Flag Tests

### Auto Loop Feature (FEATURE_FLAGS.AUTO_LOOP)
1. **When Enabled (true)**
   - Auto Loop button visible
   - L keyboard shortcut active
   - Loop functionality works

2. **When Disabled (false)**
   - Auto Loop button hidden
   - L keyboard shortcut inactive
   - Single play mode only

## Test Automation Recommendations

### Unit Tests (Jest/Vitest)
```javascript
// Example test structure
describe('Random Chord Generator', () => {
  test('should play chords on first click', async () => {
    // Test the first-click bug scenario
  });
  
  test('should maintain precise timing in loops', () => {
    // Test loop timing precision  
  });
});
```

### Integration Tests (Playwright/Cypress)
```javascript
// Example E2E test
test('complete music practice workflow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="random-chords"]');
  // Verify audio plays correctly
});
```

### Manual Testing Checklist
- [ ] Fresh page load - Random Chords works first click
- [ ] Auto Loop runs 5+ iterations without delay
- [ ] All metronome speeds function correctly
- [ ] Generate New clears selections properly
- [ ] Emergency stop clears all audio
- [ ] Keyboard shortcuts respond correctly
- [ ] Browser audio context recovery works

## Test Data Management

### Known Good States
- Default notes: ['Bb', 'D', 'G']
- Default tempo: 120 BPM
- Default metronome: disabled
- Default Auto Loop: varies by feature flag

### Edge Cases to Test
- Very fast tempo (200 BPM)
- Very slow tempo (60 BPM)  
- Rapid button clicking
- Audio context suspension/resume
- Component mount/unmount cycles

## Reporting Issues

### Bug Report Template
```
**Issue**: Brief description
**Steps to Reproduce**: 
1. Step one
2. Step two
**Expected**: What should happen
**Actual**: What actually happens
**Console Logs**: Relevant log entries
**Browser**: Chrome/Firefox/Safari version
**Feature Flags**: Current flag settings
```

### Performance Issue Template
```
**Performance Issue**: Description
**Measurement**: Timing/memory measurements
**Environment**: Browser, device specs
**Reproduction**: Consistent steps to reproduce
**Impact**: User experience impact
```

This regression test suite should be run before any major releases or after significant code changes to prevent issues like the Random Chord first-click bug from recurring.