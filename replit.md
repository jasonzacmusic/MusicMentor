# ChordCraft - Music Practice Application

## Overview
ChordCraft is a web-based music practice application designed to help users learn and practice musical concepts including chord theory, interval training, and note recognition. The application features an interactive piano keyboard, random note generation, chord harmonization tools, and practice session tracking.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables
- **State Management**: React hooks with TanStack Query
- **Audio Engine**: Custom Web Audio API implementation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development**: tsx
- **Production Build**: esbuild for server bundling, Vite for client bundling

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless connection
- **Schema Management**: Drizzle Kit
- **Development Storage**: In-memory storage

### Key Components
- **Audio System**: Custom Web Audio API wrapper for note synthesis, single note/chord playback, ADSR envelope control.
- **Music Theory Engine**: Chromatic scale implementation, interval-based chord construction and harmonization, interval recognition, random note generation.
- **UI Components**: Interactive virtual piano, modular practice panels, responsive design with a mobile-first approach.
- **Practice Session Management**: Session tracking (duration, notes played, chords practiced), user preferences (tempo, keys, goals), progress analytics.

### Data Flow
User interaction -> Audio processing (via `useAudio` hook) -> Web Audio API synthesis -> Practice data collection and API submission -> PostgreSQL storage -> State management (TanStack Query).

### Key Architectural Decisions
- **Database Choice**: PostgreSQL with Drizzle ORM was chosen for its strong typing, excellent migration system, and reliability.
- **Audio Implementation**: Web Audio API with a custom wrapper was selected for full control over audio synthesis and no external dependencies.
- **UI Framework Choice**: Radix UI with shadcn/ui and Tailwind CSS was chosen for its accessibility-first approach, customizability, and modern design.
- **State Management Strategy**: TanStack Query with React hooks was selected for excellent server state management, built-in caching, and minimal boilerplate.

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Query
- **UI Libraries**: Radix UI primitives, Lucide React icons
- **Audio**: Web Audio API (browser native)
- **Styling**: Tailwind CSS, class-variance-authority

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod
- **Session Management**: `connect-pg-simple`
- **Utilities**: `date-fns`

### Development Tools
- **Build Tools**: Vite (client), esbuild (server)
- **TypeScript**: Full TypeScript support
- **Development**: Replit-specific plugins