# ChordCraft - Music Practice Application

## Overview

ChordCraft is a web-based music practice application designed to help users learn and practice musical concepts including chord theory, interval training, and note recognition. The application features an interactive piano keyboard, random note generation, chord harmonization tools, and practice session tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest)

**July 25, 2025 - Early Morning Session:**
- Fixed critical DOMException errors in audio engine:
  - Removed duplicate audio node connections in playNote method 
  - Fixed Web Audio API graph where oscillator was connected to both gainNode directly AND through filter
  - Corrected audio chain to: oscillator → filter → gainNode → masterGain
  - Added comprehensive promise rejection handling throughout audio system
  - Made audioContext and masterGainNode public properties for proper access
  - Fixed TypeScript errors in checkbox handlers and ref types
- Enhanced chord tree layout:
  - Organized Major chords on right side, Minor chords on left side of orange notes
  - Fixed branch line positioning to properly connect center to chord circles
  - Removed duplicate interval labels (p5, M3, m3) for cleaner interface
  - Applied consistent angle positioning: Major (30°, 90°, 150°), Minor (-30°, -90°, -150°)
- Final attempt to fix 1-2-4 timing issue with individual notes:
  - Completely replaced setTimeout scheduling with Web Audio API scheduling
  - Individual notes now use audioEngine.playNote() with startTime parameter
  - Chords also converted to Web Audio scheduling for consistency
  - Reduced envelope attack to 20ms and release to 10% for immediate onset
  - This eliminates JavaScript timing delays that caused the 1-beat offset

**July 20, 2025 - Evening Session:**
- Major UI cleanup and visual improvements:
  - Removed redundant timing info boxes ("G 2 beats, B 2 beats, E 4 beats")
  - Centered orange root notes perfectly in each chord tree
  - Replaced "Chord Trees" title with student-friendly instructions
  - Updated instruction text: "Click on any of the Chord Branches and see how they sound with the Melody Note"
- Enhanced tree branch design:
  - Replaced straight lines with curved SVG tree branches for organic look
  - Added color gradients flowing from orange center to each chord color
  - Improved visual hierarchy and spacing between elements
- Improved chord tree layout:
  - Larger orange center notes (24x24) and chord buttons (20x20)
  - Better proportioned branches and increased spacing between trees
  - Enhanced z-index layering for proper visual stacking

**July 20, 2025 - Afternoon Session:**
- Fixed Random Harmonizer to properly select from existing chord options:
  - Now picks from the 6 available chord options for each note position (not completely random chords)
  - Each note gets a random selection from its own beginner chord tree
  - Added detailed logging: "Position 1 (C): Selected 'F Major (C is the P5)' from 6 options"
- Enhanced Random Harmonizer workflow:
  - Button now automatically triggers playback after chord selection
  - Smart behavior: restarts if playing, starts if stopped
  - Provides seamless practice workflow without manual Play button
- Fixed Auto Loop toggle functionality:
  - Toggle now properly controls whether music loops continuously or plays once
  - Shows "Auto Loop disabled - playing once only" when turned off
  - Resolved issue where music always looped regardless of setting

**July 20, 2025 - Morning Session:**
- Fixed critical control responsiveness bugs:
  - Metronome toggle now works seamlessly during playback without requiring "Generate New"
  - Tempo and metronome speed changes apply instantly while music plays
  - Chord selection changes now update immediately without delay
  - All control changes restart playback smoothly for real-time responsiveness
- Implemented strict chord audio constraints:
  - All chords limited to exactly 3 notes (root, 3rd, 5th) 
  - All chord notes constrained within 1 octave below to 1 octave above middle C
  - Removed complex voice leading that was adding extra notes
- Added comprehensive keyboard shortcuts:
  - Space: Play/Stop toggle
  - M: Metronome toggle  
  - L: Loop toggle
  - R: Generate new notes
  - Keyboard shortcuts include visual indicators and help panel

**July 20, 2025 - Earlier:**
- Updated random note generation to use specific interval relationships:
  - Note 1: Any of the 12 chromatic notes (base note)
  - Note 2: Major 3rd up from Note 1 (4 semitones)
  - Note 3: Minor 3rd down from Note 1 (3 semitones)
- Changed audio engine from violin to viola sound:
  - Lower cutoff frequency (1600Hz vs 2000Hz) for warmer tone
  - Increased resonance (Q=1.5) and slower attack/release for viola characteristics
  - Updated envelope timing for viola's deeper response
- Implemented beginner chord tree with 6 harmonizing chord options:
  - Root Major/Minor (unison)
  - Perfect 4th Major/Minor (where base note is the P5)
  - Major 6th Major (where base note is the M3)
  - Minor 6th Minor (where base note is the m3)
- Major UI restructuring and functionality improvements:
  - Consolidated controls: single Play, Stop, and Loop buttons to left of Generate New
  - Moved tempo control to top left area with metronome checkbox option
  - Added metronome functionality for practice with consistent beat sounds
  - Implemented conditional playback: plays chords if selected, otherwise plays single notes
  - Made Note 3 always play an octave below Note 1 (-1 octave offset)
  - Updated note naming preferences: Bb, Ab, Eb for black keys (instead of sharps)
  - Fixed chord selection callback dependency issues that were resetting selections
  - Removed individual note play buttons for cleaner interface
- Audio engine enhancements:
  - Added octave offset parameter to playNote function
  - Added metronome click sound generation (800Hz square wave, 50ms duration)
  - Updated playSequence to support metronome and octave adjustments
- Fixed chord selection functionality to properly maintain selections without auto-reset

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks with TanStack Query for server state
- **Audio Engine**: Custom Web Audio API implementation for musical note synthesis

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling, Vite for client bundling

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless connection (@neondatabase/serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing

## Key Components

### Audio System
- **Audio Engine**: Custom Web Audio API wrapper for note synthesis
- **Features**: Single note playback, chord progression playback, ADSR envelope control
- **Integration**: React hooks for audio state management and playback control

### Music Theory Engine
- **Note System**: Chromatic scale implementation with frequency mapping
- **Chord Theory**: Interval-based chord construction and harmonization
- **Training Modules**: Interval recognition and random note generation

### UI Components
- **Piano Keyboard**: Interactive virtual piano with visual feedback
- **Practice Panels**: Modular components for different training exercises
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Practice Session Management
- **Session Tracking**: Duration, notes played, chords practiced
- **User Preferences**: Tempo settings, favorite keys, practice goals
- **Progress Analytics**: Daily practice time tracking and statistics

## Data Flow

1. **User Interaction**: User interacts with UI components (piano, buttons, controls)
2. **Audio Processing**: Audio requests processed through useAudio hook
3. **Web Audio API**: Browser's Web Audio API synthesizes musical notes
4. **Practice Data**: Session data collected and sent to backend via REST API
5. **Database Storage**: PostgreSQL stores user data and practice sessions
6. **State Management**: TanStack Query manages server state and caching

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Query for state management
- **UI Libraries**: Radix UI primitives, Lucide React icons
- **Audio**: Web Audio API (browser native)
- **Styling**: Tailwind CSS, class-variance-authority for component variants

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for schema validation and type safety
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Utilities**: date-fns for date manipulation

### Development Tools
- **Build Tools**: Vite for client bundling, esbuild for server bundling
- **TypeScript**: Full TypeScript support with strict configuration
- **Development**: Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- **Local Development**: tsx server with Vite middleware for hot module replacement
- **Database**: Environment variable-based PostgreSQL connection
- **Asset Serving**: Vite development server with proxy configuration

### Production Build
1. **Client Build**: Vite builds React application to `dist/public`
2. **Server Build**: esbuild bundles Express server to `dist/index.js`
3. **Static Assets**: Production server serves built client from `dist/public`
4. **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Key Architectural Decisions

#### Database Choice
- **Selected**: PostgreSQL with Drizzle ORM
- **Rationale**: Strong typing, excellent migration system, PostgreSQL's reliability
- **Alternative Considered**: Prisma ORM
- **Pros**: Type-safe queries, lightweight runtime, good TypeScript integration
- **Cons**: Smaller ecosystem compared to Prisma

#### Audio Implementation
- **Selected**: Web Audio API with custom wrapper
- **Rationale**: No external dependencies, full control over audio synthesis
- **Alternative Considered**: Audio libraries like Tone.js
- **Pros**: Lightweight, customizable, no licensing concerns
- **Cons**: More implementation complexity, browser compatibility considerations

#### UI Framework Choice
- **Selected**: Radix UI with shadcn/ui and Tailwind CSS
- **Rationale**: Accessibility-first, customizable, modern design system
- **Alternative Considered**: Material-UI, Ant Design
- **Pros**: Excellent accessibility, TypeScript support, design flexibility
- **Cons**: More setup complexity, learning curve for customization

#### State Management Strategy
- **Selected**: TanStack Query with React hooks
- **Rationale**: Excellent server state management, built-in caching
- **Alternative Considered**: Redux Toolkit, Zustand
- **Pros**: Automatic background refetching, optimistic updates, minimal boilerplate
- **Cons**: Learning curve, primarily focused on server state