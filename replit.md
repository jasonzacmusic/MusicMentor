# ChordCraft - Music Practice Application

## Overview

ChordCraft is a web-based music practice application designed to help users learn and practice musical concepts including chord theory, interval training, and note recognition. The application features an interactive piano keyboard, random note generation, chord harmonization tools, and practice session tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest)

**July 20, 2025:**
- Updated random note generation to use specific interval relationships:
  - Note 1: Any of the 12 chromatic notes (base note)
  - Note 2: Major 3rd up from Note 1 (4 semitones)
  - Note 3: Minor 3rd down from Note 1 (3 semitones)
- Changed audio engine to use legato violin sound with sawtooth wave and low-pass filter
- Implemented beginner chord tree with 6 harmonizing chord options:
  - Root Major/Minor (unison)
  - Perfect 4th Major/Minor (where base note is the P5)
  - Major 6th Major (where base note is the M3)
  - Minor 6th Minor (where base note is the m3)
- Created visual tree structure for chord harmonization panel
- Connected random notes generator to chord tree for integrated practice
- Removed individual play buttons from chord trees
- Added single Play/Stop button for chord progressions
- Fixed Perfect 4th chord calculation (was generating P5 instead of P4)

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