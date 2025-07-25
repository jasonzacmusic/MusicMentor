# How to Run All Tests for ChordCraft Music App

## Quick Start - Run All Tests

```bash
# Make script executable (first time only)
chmod +x run-tests.sh

# Run all automated tests
./run-tests.sh all
```

## Individual Test Commands

### 1. Unit Tests (Fast - 30 seconds)
```bash
# Using the test runner
./run-tests.sh unit

# Or directly with npx
npx vitest run tests/automated-tests/
```

### 2. End-to-End Tests (Slower - 2-3 minutes)
```bash
# Using the test runner (handles server startup)
./run-tests.sh e2e

# Or manually
npm run dev &          # Start server in background
npx playwright test tests/e2e/
kill %1                 # Stop background server
```

### 3. Manual Test Checklist
```bash
# View the checklist
./run-tests.sh manual
```

## Test Menu (Interactive)
```bash
# Show all options
./run-tests.sh
```

## What Each Test Type Covers

### Unit Tests (`tests/automated-tests/chord-functionality.test.js`)
- ✅ Random Chord first-click bug prevention
- ✅ State management consistency
- ✅ Audio engine integration
- ✅ Emergency reset functionality
- ✅ Octave offset calculations

### E2E Tests (`tests/e2e/critical-workflows.spec.js`)
- ✅ Complete user workflows in real browser
- ✅ Auto Loop timing precision
- ✅ Audio context recovery
- ✅ Memory leak prevention
- ✅ Performance validation

### Manual Tests (`tests/regression-tests.md`)
- ✅ Fresh page load scenarios
- ✅ Extended use sessions
- ✅ Browser compatibility
- ✅ Audio functionality

## Test Results Interpretation

### ✅ Success Output
```
Unit Tests: PASSED
E2E Tests: PASSED

All tests passed! 🎉
```

### ❌ Failure Output
```
Unit Tests: FAILED
E2E Tests: PASSED

Some tests failed! ❌
```

## Troubleshooting

### Common Issues

1. **Server not running for E2E tests**
   ```bash
   # Check if port 5000 is available
   curl http://localhost:5000
   # Kill any existing processes
   pkill -f "tsx server"
   ```

2. **Playwright browser issues**
   ```bash
   # Reinstall browsers
   npx playwright install
   ```

3. **Import path errors in unit tests**
   ```bash
   # Check vitest.config.ts has correct paths
   # Verify test files use relative imports
   ```

## Continuous Integration

To run tests in CI/CD:

```bash
# Install dependencies
npm install

# Run all tests
npx vitest run tests/automated-tests/ && npx playwright test tests/e2e/
```

## Test Coverage

The tests specifically prevent regression of these critical bugs:
- Random Chord first-click issue (state timing)
- Auto Loop timing drift (audio scheduling)
- Memory leaks from audio resources
- React Hook violations
- Audio context suspension issues

## Performance Benchmarks

Expected test times:
- Unit tests: ~30 seconds
- E2E tests: ~2-3 minutes
- Manual tests: ~10 minutes (thorough)

Run `./run-tests.sh all` before every release to ensure stability!