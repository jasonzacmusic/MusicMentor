# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chord Trees is a web-based music education application by Nathaniel School of Music. It teaches chord theory, intervals, scales, and note recognition through interactive piano/guitar visualization and real instrument sample playback.

## Commands

```bash
npm run dev      # Start development server (port 5000)
npm run build    # Build client (Vite) and server (esbuild)
npm run start    # Run production server
npm run check    # TypeScript type checking
npm run db:push  # Push Drizzle ORM migrations to PostgreSQL
```

## Architecture

**Three-layer TypeScript stack:**

```
client/           React 18 + Vite + Tailwind + Radix UI
  └── src/
      ├── components/    UI components (shadcn/ui in ui/)
      ├── lib/           Music theory engines, audio, utilities
      ├── hooks/         useAudio, useMobile
      └── pages/         Route components

server/           Express.js API
  ├── routes.ts   REST endpoints (practice sessions, preferences)
  └── storage.ts  In-memory (dev) or PostgreSQL (prod)

shared/           Drizzle ORM schema + Zod validation
```

**Key client modules:**
- `lib/audio-engine.ts` - Web Audio API synthesizer
- `lib/chord-theory.ts` - Chord construction and harmonization
- `lib/scale-theory.ts` - Scale modes and diatonic analysis
- `lib/guitar-chords.ts` - 324 chord shapes (12 roots × 9 types × 3 voicings)
- `lib/sample-engine.ts` - Instrument sample loading (smplr, soundfont-player)

**Data flow:** UI components → useAudio hook → Web Audio API / sample engine → API calls via TanStack Query → Express routes → PostgreSQL (Drizzle ORM)

## Path Aliases

Configured in tsconfig.json and vite.config.ts:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## Tech Stack

- **Frontend:** React 18, Wouter routing, TanStack Query, Radix UI/shadcn, Tailwind CSS, Framer Motion
- **Backend:** Express.js, Drizzle ORM, Zod validation
- **Audio:** Web Audio API, smplr (Splendid Grand Piano), soundfont-player
- **Database:** PostgreSQL via Neon serverless (requires DATABASE_URL env var)
- **Build:** Vite (client), esbuild (server), tsx (dev)

## Music Domain Context

The app implements comprehensive music theory:
- **Chromatic scale** with enharmonic equivalents (C#/Db)
- **Interval-based chord construction** (major, minor, dim, aug, 7ths, sus)
- **Diatonic harmonization** in all 7 modes (Ionian through Locrian)
- **Guitar voicings:** Open, Barre, Alternative positions for each chord
- **Audio:** Polyphonic synthesis + sampled instruments (piano, guitar, strings, brass)
