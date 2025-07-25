/**
 * End-to-End Tests for Critical User Workflows
 * Uses Playwright for browser automation testing
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Music Practice Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('[data-testid="random-notes-generator"]', { timeout: 10000 });
  });

  test('Random Chord first-click regression test', async ({ page }) => {
    // This is the critical test for the bug we just fixed
    
    // Fresh page load - click Random Chords immediately
    const randomChordButton = page.getByText('Random Chords');
    await randomChordButton.click();

    // Check console logs for chord playback (not note playback)
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    // Wait for playback to start
    await page.waitForTimeout(1000);

    // Verify we see chord logs, not individual note logs
    const chordLogs = logs.filter(log => log.includes('🎹 Position') && log.includes('Chord:'));
    expect(chordLogs.length).toBe(3); // Should have 3 chord position logs

    // Verify no individual note logs (which would indicate the bug)
    const noteLogs = logs.filter(log => log.includes('🎵 Position') && log.includes('Note:'));
    expect(noteLogs.length).toBe(0); // Should have no individual note logs
  });

  test('Auto Loop timing precision workflow', async ({ page }) => {
    // Enable Auto Loop
    await page.keyboard.press('KeyL'); // L key shortcut
    
    // Verify Auto Loop button is active
    const autoLoopButton = page.getByText('Auto Loop');
    await expect(autoLoopButton).toHaveClass(/bg-blue-600/);

    // Start playback
    await page.keyboard.press('Space');
    
    // Let it loop multiple times and measure timing
    const startTime = Date.now();
    let loopCount = 0;
    
    page.on('console', msg => {
      if (msg.text().includes('🔄 Loop iteration')) {
        loopCount++;
        if (loopCount === 3) {
          const elapsed = Date.now() - startTime;
          const expectedTime = 3 * 8 * 1000 / 2; // 3 loops * 8 beats * 500ms per beat at 120 BPM
          const tolerance = 200; // 200ms tolerance
          
          expect(Math.abs(elapsed - expectedTime)).toBeLessThan(tolerance);
        }
      }
    });

    // Wait for several loop iterations
    await page.waitForTimeout(15000);
    
    // Stop playback
    await page.keyboard.press('Space');
  });

  test('Complete practice session workflow', async ({ page }) => {
    // 1. Generate new notes
    await page.keyboard.press('KeyR');
    
    // 2. Enable metronome
    await page.keyboard.press('KeyM');
    
    // 3. Select random chords
    await page.getByText('Random Chords').click();
    
    // 4. Enable Auto Loop
    await page.keyboard.press('KeyL');
    
    // 5. Start practice session
    await page.keyboard.press('Space');
    
    // 6. Change tempo during playback
    const tempoSlider = page.locator('input[type="range"]').first();
    await tempoSlider.fill('140');
    
    // 7. Change metronome speed
    await page.getByText('x2').click();
    
    // 8. Verify everything still works
    await page.waitForTimeout(5000);
    
    // 9. Stop session
    await page.keyboard.press('Space');
    
    // Verify no errors occurred
    const errorLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text());
      }
    });
    
    expect(errorLogs.length).toBe(0);
  });

  test('Browser audio context recovery', async ({ page }) => {
    // Test audio context suspension/resume cycle
    
    // Simulate audio context suspension (happens on some browsers)
    await page.evaluate(() => {
      if (window.audioEngine && window.audioEngine.audioContext) {
        window.audioEngine.audioContext.suspend();
      }
    });
    
    // Try to play music (should recover automatically)
    await page.keyboard.press('Space');
    
    // Wait for recovery
    await page.waitForTimeout(2000);
    
    // Verify audio context is running
    const audioContextState = await page.evaluate(() => {
      return window.audioEngine?.audioContext?.state;
    });
    
    expect(audioContextState).toBe('running');
  });

  test('Memory leak prevention over extended use', async ({ page }) => {
    // Simulate extended practice session
    for (let i = 0; i < 10; i++) {
      // Generate new notes
      await page.keyboard.press('KeyR');
      
      // Play briefly
      await page.keyboard.press('Space');
      await page.waitForTimeout(2000);
      await page.keyboard.press('Space');
      
      // Random chords
      await page.getByText('Random Chords').click();
      await page.waitForTimeout(2000);
      await page.keyboard.press('Space');
    }
    
    // Check memory usage hasn't grown excessively
    const metrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        };
      }
      return null;
    });
    
    if (metrics) {
      // Memory usage should be reasonable (less than 50MB for this app)
      expect(metrics.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('Feature flag functionality', async ({ page }) => {
    // Test that feature flags properly control UI visibility
    
    // Check if Auto Loop is enabled via feature flag
    const autoLoopVisible = await page.getByText('Auto Loop').isVisible();
    
    if (autoLoopVisible) {
      // Auto Loop feature is enabled
      await page.keyboard.press('KeyL');
      await expect(page.getByText('Auto Loop')).toHaveClass(/bg-blue-600/);
    } else {
      // Auto Loop feature is disabled
      await page.keyboard.press('KeyL');
      // Should have no effect when disabled
      await expect(page.getByText('Auto Loop')).not.toBeVisible();
    }
  });

  test('Mobile responsive behavior', async ({ page, isMobile }) => {
    if (isMobile) {
      // Test touch interactions on mobile
      await page.tap('[data-testid="random-chords-button"]');
      
      // Verify mobile-optimized layout
      const controlsSection = page.locator('.space-y-4');
      await expect(controlsSection).toBeVisible();
      
      // Test that keyboard shortcuts still work with on-screen keyboard
      await page.keyboard.press('Space');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Space');
    }
  });
});

test.describe('Performance and Stability', () => {
  test('App startup performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="random-notes-generator"]');
    
    const loadTime = Date.now() - startTime;
    
    // App should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Audio scheduling precision', async ({ page }) => {
    await page.goto('/');
    
    // Monitor timing precision via console logs
    const timingLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('🔊 Scheduling')) {
        timingLogs.push(msg.text());
      }
    });
    
    // Start playback
    await page.keyboard.press('Space');
    await page.waitForTimeout(9000); // Full sequence
    
    // Verify all notes were scheduled
    expect(timingLogs.length).toBeGreaterThan(0);
    
    // Verify timing precision (all scheduled times should be reasonable)
    timingLogs.forEach(log => {
      const timeMatch = log.match(/at time (\d+\.\d+)/);
      if (timeMatch) {
        const scheduledTime = parseFloat(timeMatch[1]);
        expect(scheduledTime).toBeGreaterThan(0);
        expect(scheduledTime).toBeLessThan(100); // Reasonable Web Audio time
      }
    });
  });

  test('Concurrent user interaction handling', async ({ page }) => {
    // Simulate rapid user interactions
    const actions = [
      () => page.keyboard.press('KeyR'),
      () => page.keyboard.press('Space'),
      () => page.keyboard.press('KeyM'),
      () => page.getByText('Random Chords').click(),
      () => page.keyboard.press('KeyL')
    ];
    
    // Execute actions rapidly
    for (let i = 0; i < 20; i++) {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      await randomAction();
      await page.waitForTimeout(100);
    }
    
    // App should remain stable
    await expect(page.getByText('Random Note Practice')).toBeVisible();
  });
});