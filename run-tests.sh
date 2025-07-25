#!/bin/bash

echo "🧪 ChordCraft Music App - Test Runner"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run unit tests
run_unit_tests() {
    echo -e "\n${BLUE}Running Unit Tests (Vitest)${NC}"
    echo "-----------------------------"
    npx vitest run tests/automated-tests/
    UNIT_EXIT_CODE=$?
    return $UNIT_EXIT_CODE
}

# Function to run E2E tests
run_e2e_tests() {
    echo -e "\n${BLUE}Running End-to-End Tests (Playwright)${NC}"
    echo "-------------------------------------"
    
    # Check if Playwright browsers are installed
    if ! npx playwright --version > /dev/null 2>&1; then
        echo "Installing Playwright browsers..."
        npx playwright install
    fi
    
    # Start the server in background for E2E tests
    echo "Starting server for E2E tests..."
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to start on port 5000..."
    for i in {1..30}; do
        if curl -s http://localhost:5000 > /dev/null; then
            echo "Server is ready!"
            break
        fi
        sleep 1
    done
    
    # Run E2E tests
    npx playwright test tests/e2e/
    E2E_EXIT_CODE=$?
    
    # Stop the server
    kill $SERVER_PID 2>/dev/null
    
    return $E2E_EXIT_CODE
}

# Function to run all tests
run_all_tests() {
    echo -e "\n${BLUE}Running All Tests${NC}"
    echo "=================="
    
    run_unit_tests
    UNIT_RESULT=$?
    
    run_e2e_tests
    E2E_RESULT=$?
    
    echo -e "\n${BLUE}Test Results Summary${NC}"
    echo "===================="
    
    if [ $UNIT_RESULT -eq 0 ]; then
        echo -e "Unit Tests: ${GREEN}PASSED${NC}"
    else
        echo -e "Unit Tests: ${RED}FAILED${NC}"
    fi
    
    if [ $E2E_RESULT -eq 0 ]; then
        echo -e "E2E Tests: ${GREEN}PASSED${NC}"
    else
        echo -e "E2E Tests: ${RED}FAILED${NC}"
    fi
    
    if [ $UNIT_RESULT -eq 0 ] && [ $E2E_RESULT -eq 0 ]; then
        echo -e "\n${GREEN}All tests passed! 🎉${NC}"
        return 0
    else
        echo -e "\n${RED}Some tests failed! ❌${NC}"
        return 1
    fi
}

# Function to show manual test checklist
show_manual_tests() {
    echo -e "\n${BLUE}Manual Test Checklist${NC}"
    echo "====================="
    echo "□ Fresh page load - Random Chords works first click"
    echo "□ Auto Loop runs 5+ iterations without delay"
    echo "□ All metronome speeds function correctly"
    echo "□ Generate New clears selections properly"
    echo "□ Emergency stop clears all audio"
    echo "□ Keyboard shortcuts respond correctly"
    echo "□ Browser audio context recovery works"
    echo ""
    echo "Run these tests manually by visiting http://localhost:5000"
}

# Main menu
case "${1:-menu}" in
    "unit" | "u")
        run_unit_tests
        ;;
    "e2e" | "e")
        run_e2e_tests
        ;;
    "all" | "a")
        run_all_tests
        ;;
    "manual" | "m")
        show_manual_tests
        ;;
    "menu" | *)
        echo "Usage: ./run-tests.sh [option]"
        echo ""
        echo "Options:"
        echo "  unit, u     - Run unit tests only"
        echo "  e2e, e      - Run end-to-end tests only"
        echo "  all, a      - Run all automated tests"
        echo "  manual, m   - Show manual test checklist"
        echo ""
        echo "Examples:"
        echo "  ./run-tests.sh all     # Run all tests"
        echo "  ./run-tests.sh unit    # Run unit tests only"
        echo "  ./run-tests.sh e2e     # Run E2E tests only"
        echo "  ./run-tests.sh manual  # Show manual checklist"
        ;;
esac