import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getChordsForNoteBySkill, formatChordNotes, type Chord, type SkillLevel, getAllChordsContainingNote, type ChordMembership } from '@/lib/chord-theory';
import { getDiatonicChordsContainingNote, type ScaleType, type DiatonicChord } from '@/lib/scale-theory';
import { useAudio } from '@/hooks/use-audio';
import PianoKeyboard from './piano-keyboard';
import GuitarFretboard from './guitar-fretboard';
import { Piano, Guitar, ChevronDown, ChevronUp } from 'lucide-react';
import { CHORD_SYMBOLS, CHORD_NAMES } from '@/lib/music-constants';
import { useMascot, EnvironmentLayer, type ChordAnchor } from './animated-mascot';
import { COLOR_PRESETS, getChordColorScheme, getBranchGradient, type ColorPreset } from '@/lib/color-presets';

// Format chord with jazz symbols (e.g., "C°7" instead of "C Diminished 7th")
function formatJazzChord(rootNote: string, chordType: string): string {
  const symbol = CHORD_SYMBOLS[chordType] ?? '';
  return `${rootNote}${symbol}`;
}

// Priority chord types for prominent display
const PRIORITY_CHORD_TYPES = ['major', 'minor', 'diminished', 'dominant7', 'augmented'];

function getChromaticPosition(note: string): number {
  const normalizations: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  const normalized = normalizations[note] || note;
  const positions: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  return positions[normalized] ?? 0;
}

function sortNotesByPitch(notes: string[], octaves?: number[]): string[] {
  const notesWithOctave = notes.map((note, i) => ({
    note,
    octave: octaves?.[i] ?? 0,
    chromatic: getChromaticPosition(note)
  }));
  notesWithOctave.sort((a, b) => {
    if (a.octave !== b.octave) return a.octave - b.octave;
    return a.chromatic - b.chromatic;
  });
  return notesWithOctave.map(n => n.note);
}

function getPianoStartNote(bassNote: string): string {
  const lowNotes = ['C', 'C#', 'Db', 'D#', 'Eb'];
  const normalizedBass = bassNote.replace('♯', '#').replace('♭', 'b');
  if (lowNotes.includes(normalizedBass)) {
    return bassNote;
  }
  return 'C';
}

// ColorPreset type is now imported from @/lib/color-presets
export type { ColorPreset } from '@/lib/color-presets';

interface ChordSkillSelectorProps {
  baseNote: string;
  noteIndex: number;
  selectedChord?: Chord | null;
  onChordSelect: (chord: Chord | null, noteIndex: number) => void;
  inversionMode?: 'auto' | 'root' | 'first' | 'second';
  onInversionChange?: (mode: 'auto' | 'root' | 'first' | 'second') => void;
  skillLevel?: SkillLevel;
  treeLayout?: boolean;
  isPlaying?: boolean;
  colorPreset?: ColorPreset;
  expandedView?: boolean;
  showPiano?: boolean;
  showGuitar?: boolean;
  onAnchorUpdate?: (anchor: ChordAnchor) => void;
  diatonicKey?: string;
  diatonicScale?: ScaleType;
  diatonicMode?: number;
}

export default function ChordSkillSelector({
  baseNote,
  noteIndex,
  selectedChord: parentSelectedChord,
  onChordSelect,
  inversionMode = 'auto',
  onInversionChange,
  skillLevel = 'beginner',
  treeLayout = false,
  isPlaying = false,
  colorPreset = 'earth',
  expandedView = false,
  showPiano = false,
  showGuitar = false,
  onAnchorUpdate,
  diatonicKey,
  diatonicScale,
  diatonicMode
}: ChordSkillSelectorProps) {
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const [diatonicSeventhChords, setDiatonicSeventhChords] = useState<DiatonicChord[]>([]);
  const { playChord } = useAudio();
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const centerButtonRef = useRef<HTMLButtonElement>(null);
  const chordButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const selectedChord = parentSelectedChord;

  // Track if a seventh chord is selected (for diatonic mode display)
  // Use only the category to avoid re-renders on every chord selection
  const selectedSeventhChordName = selectedChord?.category === 'seventh' ? selectedChord.name : null;

  useEffect(() => {
    if (skillLevel === 'diatonic' && diatonicKey && diatonicScale) {
      const mode = diatonicMode || 1;
      const diatonicChords = getDiatonicChordsContainingNote(baseNote, diatonicKey, diatonicScale, mode);
      const triadsAsChords: Chord[] = diatonicChords.triads.map(dc => ({
        name: dc.name,
        notes: dc.notes,
        type: dc.type,
        rootNote: dc.rootNote,
        category: 'triad' as const,
        romanNumeral: dc.romanNumeral
      }));

      // If a seventh chord is selected, add it to the tree display
      if (selectedSeventhChordName) {
        // Check if this seventh chord is in the diatonic seventh chords
        const matchingSeventh = diatonicChords.seventhChords.find(sc => sc.name === selectedSeventhChordName);
        if (matchingSeventh && !triadsAsChords.find(tc => tc.name === matchingSeventh.name)) {
          // Add the selected seventh chord to the display
          triadsAsChords.push({
            name: matchingSeventh.name,
            notes: matchingSeventh.notes,
            type: matchingSeventh.type,
            rootNote: matchingSeventh.rootNote,
            category: 'seventh' as const,
            romanNumeral: matchingSeventh.romanNumeral
          });
        }
      }

      console.log(`🌳 Diatonic chords for ${baseNote} in ${diatonicKey} ${diatonicScale}: ${triadsAsChords.length} triads`, triadsAsChords.map(c => c.name));
      setAvailableChords(triadsAsChords);
      setDiatonicSeventhChords(diatonicChords.seventhChords);
    } else {
      const chords = getChordsForNoteBySkill(baseNote, skillLevel);
      console.log(`🌳 Chords for ${baseNote} in ${skillLevel} mode: ${chords.length} chords`, chords.map(c => c.name));
      setAvailableChords(chords);
      setDiatonicSeventhChords([]);
    }
    // NOTE: Only depend on selectedSeventhChordName (not full selectedChord) to prevent
    // re-renders when selecting triads - only seventh chord changes matter for tree display
  }, [baseNote, skillLevel, diatonicKey, diatonicScale, diatonicMode, selectedSeventhChordName]);

  const handleSelectChord = useCallback((chord: Chord, buttonElement?: HTMLButtonElement) => {
    onChordSelect(chord, noteIndex);
    
    const targetElement = buttonElement || chordButtonRefs.current.get(chord.name);
    if (onAnchorUpdate && targetElement) {
      const rect = targetElement.getBoundingClientRect();
      onAnchorUpdate({
        id: `tree-${noteIndex}`,
        noteIndex,
        chordId: chord.name,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        element: targetElement,
      });
    }
  }, [onChordSelect, noteIndex, onAnchorUpdate]);

  const handleDeselectChord = () => {
    onChordSelect(null, noteIndex);
    if (onAnchorUpdate && centerButtonRef.current) {
      const rect = centerButtonRef.current.getBoundingClientRect();
      onAnchorUpdate({
        id: `tree-${noteIndex}`,
        noteIndex,
        chordId: null,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        element: centerButtonRef.current,
      });
    }
  };

  useEffect(() => {
    if (isPlaying && selectedChord && onAnchorUpdate) {
      const chordButton = chordButtonRefs.current.get(selectedChord.name);
      if (chordButton) {
        const rect = chordButton.getBoundingClientRect();
        onAnchorUpdate({
          id: `tree-${noteIndex}`,
          noteIndex,
          chordId: selectedChord.name,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          element: chordButton,
        });
      }
    } else if (!selectedChord && onAnchorUpdate && centerButtonRef.current) {
      const rect = centerButtonRef.current.getBoundingClientRect();
      onAnchorUpdate({
        id: `tree-${noteIndex}`,
        noteIndex,
        chordId: null,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        element: centerButtonRef.current,
      });
    }
  }, [isPlaying, selectedChord, noteIndex, onAnchorUpdate]);

  const [showPianoView, setShowPianoView] = useState(false);
  const [showGuitarView, setShowGuitarView] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Major': true, 'Minor': true, 'Dominant 7th': true, 'Major 7th': true, 'Minor 7th': true,
    'Diminished': true, 'Diminished 7th': true, 'Augmented': true, 'sus2': false, 'sus4': false,
    '7sus4': false, 'Minor(Maj7)': false, 'Minor 7b5': false, 'Add 9': false, 'Minor Add 9': false
  });

  // Must be at top level - cannot be inside if(treeLayout) conditional
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const mascotContext = useMascot();
  const currentAnimal = mascotContext.animal;

  const isIntermediateMode = skillLevel === 'intermediate';
  const triads = availableChords.filter(c => c.category === 'triad' || !c.parentType);
  const majorBranches = availableChords.filter(c => c.parentType === 'major');
  const minorBranches = availableChords.filter(c => c.parentType === 'minor');

  const chordsByType = useMemo(() => {
    if (!isIntermediateMode) return {};
    const grouped: Record<string, Chord[]> = {};
    const typeOrder = ['Major', 'Minor', 'Dominant 7th', 'Major 7th', 'Minor 7th', 'Diminished', 'Diminished 7th', 
                       'Augmented', 'sus2', 'sus4', '7sus4', 'Minor(Maj7)', 'Minor 7b5', 'Add 9', 'Minor Add 9'];
    const typeMap: Record<string, string> = {
      'major': 'Major', 'minor': 'Minor', 'dominant7': 'Dominant 7th', 'major7': 'Major 7th', 
      'minor7': 'Minor 7th', 'diminished': 'Diminished', 'diminished7': 'Diminished 7th',
      'augmented': 'Augmented', 'sus2': 'sus2', 'sus4': 'sus4', '7sus4': '7sus4',
      'minorMajor7': 'Minor(Maj7)', 'minor7b5': 'Minor 7b5', 'add9': 'Add 9', 'minorAdd9': 'Minor Add 9'
    };
    for (const chord of availableChords) {
      const typeName = typeMap[chord.type] || chord.type;
      if (!grouped[typeName]) grouped[typeName] = [];
      grouped[typeName].push(chord);
    }
    const sorted: Record<string, Chord[]> = {};
    for (const type of typeOrder) {
      if (grouped[type]) sorted[type] = grouped[type];
    }
    return sorted;
  }, [availableChords, isIntermediateMode]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  if (treeLayout) {
    if (isIntermediateMode && availableChords.length > 6) {
      return (
        <div className={`flex flex-col h-full w-full overflow-hidden transition-all duration-300 ${
          expandedView ? 'max-w-sm' : 'max-w-xs'
        }`}>
          {/* Header with base note */}
          <div className="flex items-center justify-center mb-1 px-1">
            <button
              onClick={handleDeselectChord}
              className={`px-3 py-1 rounded-full flex items-center gap-1 transition-all duration-300
                ${isPlaying
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-300 shadow-md'
                  : selectedChord
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-500/50 ring-1 ring-emerald-400/60'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50'
                }`}
              title={selectedChord ? 'Click to clear selection' : baseNote}
            >
              <span className="text-sm font-bold text-white">{baseNote}</span>
              {selectedChord && (
                <span className="text-[10px] text-slate-300">• {selectedChord.name}</span>
              )}
            </button>
          </div>

          {/* Scrollable chord categories */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-1 scrollbar-thin">
            {Object.entries(chordsByType).map(([typeName, chords]) => {
              const isExpanded = expandedCategories[typeName] ?? false;
              const hasSelection = chords.some(c => c.name === selectedChord?.name);
              
              return (
                <div key={typeName} className="border border-slate-700/30 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(typeName)}
                    className={`w-full flex items-center justify-between px-2 py-1 text-left transition-all ${
                      hasSelection ? 'bg-emerald-900/30' : 'bg-slate-800/40 hover:bg-slate-800/60'
                    }`}
                    data-testid={`category-${typeName.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${hasSelection ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {typeName} <span className="text-slate-500">({chords.length})</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="p-1.5 flex flex-wrap gap-1 bg-slate-900/30">
                      {chords.map((chord) => {
                        const isSelected = selectedChord?.name === chord.name;
                        const colorScheme = getChordColorScheme(chord.type, colorPreset);
                        const roleLabel = chord.noteRole || 'Root';
                        const isPriority = PRIORITY_CHORD_TYPES.includes(chord.type);
                        const jazzName = formatJazzChord(chord.rootNote, chord.type);
                        
                        return (
                          <button
                            key={`${chord.name}-${chord.noteRole}`}
                            onClick={() => handleSelectChord(chord)}
                            title={`${chord.rootNote} ${CHORD_NAMES[chord.type] || chord.type} - ${baseNote} is ${roleLabel}`}
                            className={`group relative rounded font-medium transition-all border
                              ${isPriority ? 'px-2 py-1.5' : 'px-1.5 py-1'}
                              ${isSelected
                                ? `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-md scale-105`
                                : isPriority
                                  ? `bg-slate-700/80 border-slate-500/50 text-white hover:bg-slate-600/80 hover:scale-105`
                                  : `bg-slate-800/60 border-slate-600/40 text-slate-300 hover:bg-slate-700/60 hover:scale-102`
                              }
                              ${isPlaying && isSelected ? 'animate-pulse' : ''}`}
                            data-testid={`chord-chip-${chord.rootNote}-${chord.type}`}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`text-[7px] font-mono tracking-tight leading-none ${
                                isSelected ? 'text-white/80' : 'text-slate-400'
                              }`}>
                                {chord.notes.join(' ')}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <span className={`font-bold ${isPriority ? 'text-[11px]' : 'text-[9px]'}`}>{jazzName}</span>
                                <span className={`px-0.5 rounded text-[6px] ${
                                  isSelected ? 'bg-white/25' : 'bg-slate-600/60'
                                }`}>
                                  {roleLabel}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected chord info and instruments (optional) */}
          {selectedChord && (
            <div className="mt-1 pt-1 border-t border-slate-700/30">
              <div className={`px-2 py-1.5 rounded text-center transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-emerald-600/60 to-teal-600/60 border border-emerald-400/30'
                  : 'bg-slate-800/60 border border-slate-600/20'
              }`}>
                <div className="text-sm font-bold text-white">
                  {formatJazzChord(selectedChord.rootNote, selectedChord.type)}
                </div>
                <div className="text-[8px] text-slate-400 uppercase tracking-wide">
                  {CHORD_NAMES[selectedChord.type] || selectedChord.type}
                </div>
                <div className="text-[9px] text-slate-300 mt-0.5">
                  {sortNotesByPitch(selectedChord.notes, selectedChord.octaves).join(' → ')}
                  {selectedChord.noteRole && (
                    <span className="ml-1 px-1 py-0 rounded bg-amber-500/30 text-amber-200 text-[8px]">
                      {baseNote} is {selectedChord.noteRole}
                    </span>
                  )}
                </div>
              </div>
              
              {showPiano && (
                <div className="mt-1">
                  <PianoKeyboard
                    highlightedNotes={selectedChord.notes}
                    startNote={getPianoStartNote(selectedChord.notes[0])}
                    compact={true}
                    onKeyPress={(note) => {}}
                  />
                </div>
              )}
              
              {showGuitar && (
                <div className="mt-1">
                  <GuitarFretboard
                    root={selectedChord.rootNote}
                    quality={selectedChord.type}
                    compact={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Mobile-responsive sizing: smaller on mobile, normal on desktop
    const treeSize = expandedView ? 'w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72' : 'w-36 h-36 sm:w-52 sm:h-52 lg:w-64 lg:h-64';
    const centerSize = expandedView ? 'w-14 h-14 sm:w-18 sm:h-18 lg:w-24 lg:h-24' : 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20';
    const chordButtonSize = expandedView ? 'w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16' : 'w-9 h-9 sm:w-11 sm:h-11 lg:w-14 lg:h-14';

    const treeRadius = isMobile ? 55 : (expandedView ? 100 : 90);

    return (
      <div className="flex flex-col items-center w-full">
        <div 
          ref={treeContainerRef}
          className={`relative ${treeSize} mx-auto flex items-center justify-center transition-all duration-300 ${
            isPlaying ? 'scale-105' : ''
          }`}
        >
          {skillLevel !== 'diatonic' && (
            <EnvironmentLayer 
              animal={currentAnimal} 
              noteIndex={noteIndex} 
              isPlaying={isPlaying}
              enabled={mascotContext.enabled}
            />
          )}

          <div className={`absolute w-32 h-32 sm:w-44 sm:h-44 lg:w-56 lg:h-56 rounded-full border transition-all duration-300 ${
            isPlaying ? 'border-emerald-400/50 shadow-lg shadow-emerald-500/20' : 'border-slate-700/30'
          }`} style={{ zIndex: 2 }} />
          <div className={`absolute w-28 h-28 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-full border transition-all duration-300 ${
            isPlaying ? 'border-emerald-400/30' : 'border-slate-700/20'
          }`} style={{ zIndex: 2 }} />
          
          <div className="absolute z-20 flex items-center justify-center">
            <button
              ref={centerButtonRef}
              onClick={handleDeselectChord}
              className={`${centerSize} rounded-full flex items-center justify-center transition-all duration-300 
                ${isPlaying 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-emerald-300 shadow-xl shadow-emerald-500/50 scale-110 animate-pulse'
                  : selectedChord
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-500/50 shadow-xl ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-background hover:scale-105'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600/50 shadow-xl hover:border-slate-500/70'
                }`}
              title={selectedChord ? 'Click to clear selection' : baseNote}
            >
              <span className={`${isMobile ? 'text-lg' : (expandedView ? 'text-3xl' : 'text-2xl')} font-bold tracking-tight drop-shadow-md ${
                isPlaying ? 'text-white' : 'text-white'
              }`}>{baseNote}</span>
            </button>
          </div>

          {/* Single SVG with all branch lines - dynamically sized */}
          {(() => {
            const svgSize = treeRadius * 2.5;
            const center = svgSize / 2;
            return (
              <svg 
                className="absolute pointer-events-none overflow-visible"
                style={{ 
                  left: '50%', 
                  top: '50%', 
                  width: `${svgSize}px`, 
                  height: `${svgSize}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5
                }}
              >
                <defs>
                  <linearGradient id={`vineGrad-${noteIndex}-default`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4b5563" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#6b7280" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4b5563" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id={`vineGrad-${noteIndex}-selected`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#4ade80" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {availableChords.map((chord, index) => {
                  const numChords = availableChords.length;
                  let angle: number;
                  if (numChords <= 3) {
                    angle = 270 + (index * 120);
                  } else if (numChords === 4) {
                    const angles = [270, 0, 90, 180];
                    angle = angles[index] || 0;
                  } else if (numChords === 5) {
                    angle = 270 + (index * 72);
                  } else {
                    angle = 270 + (index * (360 / numChords));
                  }
                  const x = Math.cos(angle * Math.PI / 180) * treeRadius;
                  const y = Math.sin(angle * Math.PI / 180) * treeRadius;
                  const isSelected = selectedChord?.name === chord.name;
                  return (
                    <path
                      key={index}
                      d={`M ${center} ${center} Q ${center + x * 0.5} ${center + y * 0.5 + 4} ${center + x * 0.65} ${center + y * 0.65}`}
                      fill="none"
                      stroke={`url(#vineGrad-${noteIndex}-${isSelected ? 'selected' : 'default'})`}
                      strokeWidth={isSelected ? (isMobile ? 2 : 4) : (isMobile ? 1.5 : 3)}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            );
          })()}

          {availableChords.map((chord, index) => {
            // Calculate angles based on number of chords for better spacing
            let angle: number;
            const numChords = availableChords.length;

            if (numChords <= 3) {
              const angleStep = 120;
              angle = 270 + (index * angleStep);
            } else if (numChords === 4) {
              const angles = [270, 0, 90, 180];
              angle = angles[index] || 0;
            } else if (numChords === 5) {
              const angleStep = 72;
              angle = 270 + (index * angleStep);
            } else {
              const angleStep = 360 / numChords;
              angle = 270 + (index * angleStep);
            }

            const x = Math.cos(angle * Math.PI / 180) * treeRadius;
            const y = Math.sin(angle * Math.PI / 180) * treeRadius;

            const isSelected = selectedChord?.name === chord.name;
            const colorScheme = getChordColorScheme(chord.type, colorPreset);

            return (
              <div
                key={index}
                className="absolute z-30"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-r from-emerald-400/40 via-teal-300/50 to-emerald-400/40 animate-spin" style={{ animationDuration: '3s' }} />
                      <div className="absolute inset-0 -m-1 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                    </>
                  )}
                  <button
                    ref={(el) => {
                      if (el) chordButtonRefs.current.set(chord.name, el);
                    }}
                    className={`relative ${chordButtonSize} rounded-full flex flex-col items-center justify-center cursor-pointer
                      transition-all duration-200 font-semibold backdrop-blur-sm
                      ${chord.category === 'seventh'
                        ? 'border-[3px] border-double'
                        : 'border-2'
                      }
                      ${isSelected
                        ? `${colorScheme.bg} border-emerald-300 ${colorScheme.text} shadow-xl shadow-emerald-500/50 scale-115 ring-4 ring-emerald-400/60 ring-offset-2 ring-offset-slate-900`
                        : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-md ${colorScheme.glow} opacity-50 hover:opacity-90 hover:scale-105 grayscale-[30%] hover:grayscale-0`
                      }
                      ${isPlaying && isSelected ? 'animate-pulse' : ''}`}
                    onClick={(e) => handleSelectChord(chord, e.currentTarget)}
                    title={`${chord.rootNote} ${CHORD_NAMES[chord.type] || chord.type}`}
                    data-testid={`chord-button-${chord.type}-${index}`}
                  >
                    {chord.romanNumeral ? (
                      <div className="flex flex-col items-center gap-0">
                        <span className={`${isMobile ? 'text-[7px]' : (expandedView ? 'text-[11px]' : 'text-[10px]')} font-bold text-center leading-tight drop-shadow-md opacity-80`}>
                          {chord.romanNumeral}
                        </span>
                        <span className={`${isMobile ? 'text-[8px]' : (expandedView ? 'text-[13px]' : 'text-[12px]')} font-bold text-center leading-tight drop-shadow-md`}>
                          {formatJazzChord(chord.rootNote, chord.type)}
                        </span>
                      </div>
                    ) : (
                      <span className={`${isMobile ? 'text-[9px]' : (expandedView ? 'text-[14px]' : 'text-[13px]')} font-bold text-center leading-tight drop-shadow-md`}>
                        {formatJazzChord(chord.rootNote, chord.type)}
                      </span>
                    )}
                    {chord.category === 'seventh' && !isSelected && (
                      <span className="absolute -top-1 -left-1 w-4 h-4 bg-purple-500/90 rounded-full border-2 border-purple-300 shadow-lg flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">7</span>
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <span className="text-[6px] text-emerald-900 font-bold">✓</span>
                      </span>
                    )}
                  </button>
              </div>
            );
          })}
        </div>

        {/* Info card and piano - hidden on mobile to save space */}
        <div className="mt-1 sm:mt-2 flex flex-col items-center">
          {selectedChord ? (
            <>
              <div className={`mb-1 sm:mb-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-emerald-600/80 to-teal-600/80 border border-emerald-400/50 shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-600/30 shadow-md'
              }`}>
                <h4 className="text-xs sm:text-base font-bold text-white text-center tracking-wide">
                  {formatJazzChord(selectedChord.rootNote, selectedChord.type)}
                  {selectedChord.inversion !== undefined && selectedChord.inversion > 0 && (
                    <span className="ml-1 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[8px] sm:text-[10px] font-bold">
                      {selectedChord.inversion === 1 ? '1st' : '2nd'}
                    </span>
                  )}
                </h4>
                <div className="hidden sm:block text-[9px] text-slate-400 text-center uppercase tracking-wide">
                  {CHORD_NAMES[selectedChord.type] || selectedChord.type}
                </div>
                <div className="hidden sm:block text-xs text-slate-300 text-center font-medium mt-0.5">
                  {sortNotesByPitch(selectedChord.notes, selectedChord.octaves).join(' → ')}
                </div>
              </div>
              {/* Piano hidden on mobile */}
              <div className="hidden sm:block">
                <PianoKeyboard
                  highlightedNotes={selectedChord.notes}
                  startNote={getPianoStartNote(selectedChord.notes[0])}
                  compact={true}
                  onKeyPress={(note) => {}}
                />
              </div>
            </>
          ) : (
            <>
              <div className={`mb-1 sm:mb-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-slate-700/80 to-slate-800/80 border border-slate-500/50 shadow-lg shadow-slate-500/20'
                  : 'bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/30 shadow-md'
              }`}>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-300 text-center tracking-wide">
                  {baseNote}
                </h4>
                <div className="hidden sm:block text-xs text-slate-500 text-center">
                  Single note
                </div>
              </div>
              {/* Piano hidden on mobile */}
              <div className="hidden sm:block">
                <PianoKeyboard
                  highlightedNotes={[baseNote]}
                  startNote={getPianoStartNote(baseNote)}
                  compact={true}
                  onKeyPress={(note) => {}}
                />
              </div>
            </>
          )}
        </div>

        {skillLevel === 'diatonic' && diatonicSeventhChords.length > 0 && (
          <div className="mt-3 w-full">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider text-center mb-2 font-semibold">
              Seventh Chords
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {diatonicSeventhChords.map((chord, index) => {
                const colorScheme = getChordColorScheme(chord.type, colorPreset);
                const isSelected = selectedChord?.name === chord.name;
                const chordAsRegular: Chord = {
                  name: chord.name,
                  notes: chord.notes,
                  type: chord.type,
                  rootNote: chord.rootNote,
                  category: 'seventh' as const,
                  romanNumeral: chord.romanNumeral
                };

                return (
                  <button
                    key={index}
                    ref={(el) => {
                      if (el) chordButtonRefs.current.set(chord.name, el);
                    }}
                    onClick={() => handleSelectChord(chordAsRegular)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border
                      ${isSelected
                        ? `${colorScheme.bg} border-emerald-300 ${colorScheme.text} shadow-md scale-105`
                        : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} opacity-60 hover:opacity-90 hover:scale-105`
                      }`}
                    title={chord.romanNumeral ? `${chord.romanNumeral} - ${chord.function}` : chord.name}
                    data-testid={`seventh-chord-${chord.rootNote}-${chord.type}`}
                  >
                    {formatJazzChord(chord.rootNote, chord.type)}
                    {chord.romanNumeral && (
                      <span className="ml-1 text-[9px] opacity-70">({chord.romanNumeral})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedChord && (
          <div className="mt-4">
            <GuitarFretboard
              root={selectedChord.rootNote}
              quality={selectedChord.type}
              compact={true}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Chord Options for <span className="text-primary">{baseNote}</span>
        </h2>
        <div className="text-sm text-muted-foreground">
          Select a harmonizing chord
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {selectedChord && (
              <div className="flex justify-center">
                <Button
                  onClick={handleDeselectChord}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                >
                  Clear Selection
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {availableChords.map((chord, index) => {
                const colorScheme = getChordColorScheme(chord.type, colorPreset);
                const isSelected = selectedChord?.name === chord.name;
                
                return (
                <div
                  key={index}
                  onClick={() => handleSelectChord(chord)}
                  className={`rounded-xl p-3 cursor-pointer transition-all duration-200 border-2 backdrop-blur-sm ${
                    isSelected
                      ? `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-lg ${colorScheme.glow} scale-[1.02]`
                      : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-md ${colorScheme.glow} opacity-80 hover:opacity-100 hover:scale-[1.02]`
                  }`}
                  title={`${chord.rootNote} ${CHORD_NAMES[chord.type] || chord.type}`}
                  data-testid={`chord-grid-${chord.type}-${index}`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-lg text-center drop-shadow-md">
                      {formatJazzChord(chord.rootNote, chord.type)}
                    </div>
                    <div className="text-[9px] text-center opacity-75 uppercase tracking-wide">
                      {CHORD_NAMES[chord.type] || chord.type}
                    </div>

                    {selectedChord?.name === chord.name && onInversionChange && (
                      <div className="flex justify-center space-x-1 mt-2">
                        {[
                          { value: 'auto', label: 'Auto' },
                          { value: 'root', label: 'Root' },
                          { value: 'first', label: '1st' },
                          { value: 'second', label: '2nd' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              onInversionChange(option.value as any);
                            }}
                            className={`px-2 py-1 text-xs rounded border transition-colors font-medium ${
                              inversionMode === option.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'text-muted-foreground border-border bg-background hover:bg-muted'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedChord && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-lg font-bold text-primary">{formatJazzChord(selectedChord.rootNote, selectedChord.type)}</span>
                <span className="text-xs text-muted-foreground ml-2">{CHORD_NAMES[selectedChord.type] || selectedChord.type}</span>
              </div>
              <div className="flex justify-center">
                <PianoKeyboard
                  highlightedNotes={selectedChord.notes}
                  startNote={getPianoStartNote(selectedChord.notes[0])}
                  compact={true}
                  onKeyPress={(note) => {}}
                />
              </div>
              <div className="flex justify-center">
                <GuitarFretboard
                  root={selectedChord.rootNote}
                  quality={selectedChord.type}
                  compact={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}