import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getChordsForNoteBySkill, formatChordNotes, type Chord, type SkillLevel } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import PianoKeyboard from './piano-keyboard';

// Premium color palette for chord types - sophisticated and harmonious
const CHORD_COLORS: Record<string, { bg: string; border: string; text: string; glow: string; gradient: string }> = {
  // Major chords - warm teal/emerald
  'major': {
    bg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    border: 'border-emerald-300',
    text: 'text-white',
    glow: 'shadow-emerald-500/40',
    gradient: 'from-emerald-400 to-teal-500'
  },
  // Minor chords - rich purple/violet
  'minor': {
    bg: 'bg-gradient-to-br from-violet-400 to-purple-600',
    border: 'border-violet-300',
    text: 'text-white',
    glow: 'shadow-purple-500/40',
    gradient: 'from-violet-400 to-purple-600'
  },
  // Dominant 7th - warm orange/amber
  'dominant7': {
    bg: 'bg-gradient-to-br from-orange-400 to-amber-500',
    border: 'border-orange-300',
    text: 'text-white',
    glow: 'shadow-orange-500/40',
    gradient: 'from-orange-400 to-amber-500'
  },
  // Major 7th - soft pink/rose
  'major7': {
    bg: 'bg-gradient-to-br from-pink-400 to-rose-500',
    border: 'border-pink-300',
    text: 'text-white',
    glow: 'shadow-pink-500/40',
    gradient: 'from-pink-400 to-rose-500'
  },
  // Minor 7th - deep blue/indigo
  'minor7': {
    bg: 'bg-gradient-to-br from-blue-400 to-indigo-600',
    border: 'border-blue-300',
    text: 'text-white',
    glow: 'shadow-blue-500/40',
    gradient: 'from-blue-400 to-indigo-600'
  },
  // Diminished - warm red/crimson
  'diminished': {
    bg: 'bg-gradient-to-br from-red-400 to-rose-600',
    border: 'border-red-300',
    text: 'text-white',
    glow: 'shadow-red-500/40',
    gradient: 'from-red-400 to-rose-600'
  },
  // Augmented - golden yellow
  'augmented': {
    bg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    border: 'border-yellow-300',
    text: 'text-gray-900',
    glow: 'shadow-yellow-500/40',
    gradient: 'from-yellow-400 to-amber-500'
  },
  // Sus4 - sky blue/cyan
  'sus4': {
    bg: 'bg-gradient-to-br from-cyan-400 to-sky-500',
    border: 'border-cyan-300',
    text: 'text-white',
    glow: 'shadow-cyan-500/40',
    gradient: 'from-cyan-400 to-sky-500'
  },
  // Sus2 - lime/green
  'sus2': {
    bg: 'bg-gradient-to-br from-lime-400 to-green-500',
    border: 'border-lime-300',
    text: 'text-white',
    glow: 'shadow-lime-500/40',
    gradient: 'from-lime-400 to-green-500'
  },
  // Default fallback
  'default': {
    bg: 'bg-gradient-to-br from-slate-400 to-gray-500',
    border: 'border-slate-300',
    text: 'text-white',
    glow: 'shadow-slate-500/40',
    gradient: 'from-slate-400 to-gray-500'
  }
};

// Get color scheme for a chord based on its type
function getChordColorScheme(chordType: string) {
  return CHORD_COLORS[chordType] || CHORD_COLORS['default'];
}

// Get CSS gradient string for branch lines
function getBranchGradient(chordType: string, isSelected: boolean): string {
  if (!isSelected) {
    return 'linear-gradient(90deg, rgba(100, 116, 139, 0.3), rgba(100, 116, 139, 0.6))';
  }
  
  const colorMap: Record<string, string> = {
    'major': 'linear-gradient(90deg, rgba(52, 211, 153, 0.4), rgba(20, 184, 166, 1))',
    'minor': 'linear-gradient(90deg, rgba(167, 139, 250, 0.4), rgba(147, 51, 234, 1))',
    'dominant7': 'linear-gradient(90deg, rgba(251, 146, 60, 0.4), rgba(245, 158, 11, 1))',
    'major7': 'linear-gradient(90deg, rgba(244, 114, 182, 0.4), rgba(244, 63, 94, 1))',
    'minor7': 'linear-gradient(90deg, rgba(96, 165, 250, 0.4), rgba(79, 70, 229, 1))',
    'diminished': 'linear-gradient(90deg, rgba(248, 113, 113, 0.4), rgba(225, 29, 72, 1))',
    'augmented': 'linear-gradient(90deg, rgba(250, 204, 21, 0.4), rgba(245, 158, 11, 1))',
    'sus4': 'linear-gradient(90deg, rgba(34, 211, 238, 0.4), rgba(14, 165, 233, 1))',
    'sus2': 'linear-gradient(90deg, rgba(163, 230, 53, 0.4), rgba(34, 197, 94, 1))',
  };
  
  return colorMap[chordType] || 'linear-gradient(90deg, rgba(148, 163, 184, 0.4), rgba(100, 116, 139, 1))';
}

interface ChordSkillSelectorProps {
  baseNote: string;
  noteIndex: number;
  selectedChord?: Chord | null;
  onChordSelect: (chord: Chord | null, noteIndex: number) => void;
  inversionMode?: 'auto' | 'root' | 'first' | 'second';
  onInversionChange?: (mode: 'auto' | 'root' | 'first' | 'second') => void;
  skillLevel?: SkillLevel;
  treeLayout?: boolean;
}

export default function ChordSkillSelector({ baseNote, noteIndex, selectedChord: parentSelectedChord, onChordSelect, inversionMode = 'auto', onInversionChange, skillLevel = 'beginner', treeLayout = false }: ChordSkillSelectorProps) {
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const { playChord, isPlaying } = useAudio();

  // Use the parent's selected chord if provided, otherwise use local state
  const selectedChord = parentSelectedChord;

  useEffect(() => {
    // Use chords based on skill level
    const chords = getChordsForNoteBySkill(baseNote, skillLevel);
    setAvailableChords(chords);
  }, [baseNote, skillLevel]);

  const handleSelectChord = (chord: Chord) => {
    onChordSelect(chord, noteIndex);
  };

  const handleDeselectChord = () => {
    onChordSelect(null, noteIndex);
  };

  if (treeLayout) {
    // Tree layout with chords arranged in a circle around the central note
    return (
      <div className="flex flex-col items-center">
        {/* Chord Tree */}
        <div className="relative w-80 h-80 mx-auto flex items-center justify-center">
          {/* Decorative outer ring */}
          <div className="absolute w-72 h-72 rounded-full border border-slate-700/30 dark:border-slate-600/20" />
          <div className="absolute w-64 h-64 rounded-full border border-slate-700/20 dark:border-slate-500/10" />
          
          {/* Central Root Note - Premium design with glow */}
          <div className="absolute z-20 flex items-center justify-center">
            <button
              onClick={handleDeselectChord}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 
                bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800
                border-2 border-slate-600/50 dark:border-slate-500/50
                shadow-xl shadow-black/30 dark:shadow-black/50
                ${selectedChord 
                  ? 'hover:scale-105 cursor-pointer ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-background' 
                  : 'hover:border-slate-500/70'
                }`}
              title={selectedChord ? 'Click to clear selection' : baseNote}
            >
              <span className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{baseNote}</span>
            </button>
          </div>

          {/* Chord branches arranged in hexagonal pattern */}
          {availableChords.map((chord, index) => {
            const angles = [270, 330, 30, 90, 150, 210]; // Start from top, go clockwise
            const angle = angles[index] || 0;

            const radius = 115;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;

            const isSelected = selectedChord?.name === chord.name;
            const colorScheme = getChordColorScheme(chord.type);

            return (
              <div key={index} className="absolute">
                {/* Branch line with gradient */}
                <div
                  className={`absolute z-10 transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${radius - 48}px`,
                    height: isSelected ? '3px' : '2px',
                    background: getBranchGradient(chord.type, isSelected),
                    transform: `translate(0, -50%) rotate(${angle}deg)`,
                    transformOrigin: 'left center',
                    borderRadius: '2px',
                    boxShadow: isSelected ? '0 0 8px rgba(80, 220, 185, 0.3)' : 'none'
                  }}
                />

                {/* Chord button with type-specific colors */}
                <button
                  className={`absolute w-16 h-16 rounded-full flex items-center justify-center cursor-pointer 
                    transition-all duration-200 border-2 z-30 font-semibold
                    ${isSelected 
                      ? `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-lg ${colorScheme.glow} scale-110 ring-2 ring-white/30` 
                      : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-md ${colorScheme.glow} opacity-85 hover:opacity-100 hover:scale-105`
                    }`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => handleSelectChord(chord)}
                  data-testid={`chord-button-${chord.type}-${index}`}
                >
                  <span className="text-xs font-bold text-center leading-tight px-1 drop-shadow-sm">
                    {chord.name.replace(` (${chord.inversion === 1 ? '1st Inv' : chord.inversion === 2 ? '2nd Inv' : ''})`, '')}
                  </span>
                </button>
              </div>
            );
          })}

        </div>

        {/* Piano Keyboard showing selected chord with proper voice leading inversion */}
        {selectedChord && (
          <div className="mt-12 flex flex-col items-center">
            {/* Premium chord info card */}
            <div className="mb-4 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-600/30 shadow-lg">
              <h4 className="text-lg font-semibold text-white text-center mb-1 tracking-wide">
                {selectedChord.name.replace(` (${selectedChord.inversion === 1 ? '1st Inv' : selectedChord.inversion === 2 ? '2nd Inv' : ''})`, '')}
              </h4>
              <div className="text-sm text-slate-300 text-center font-medium">
                {selectedChord.notes.join(' \u2022 ')}
                {selectedChord.inversion !== undefined && selectedChord.inversion > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    {selectedChord.inversion === 1 ? '1st Inv' : '2nd Inv'}
                  </span>
                )}
              </div>
            </div>
            <PianoKeyboard
              highlightedNotes={selectedChord.notes}
              onKeyPress={(note) => {
                // Could add individual note playback here
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Original grid layout for non-tree mode
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

      {/* Chord Options */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Clear button */}
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
                const colorScheme = getChordColorScheme(chord.type);
                const isSelected = selectedChord?.name === chord.name;
                
                return (
                <div
                  key={index}
                  onClick={() => handleSelectChord(chord)}
                  className={`rounded-xl p-3 cursor-pointer transition-all duration-200 border-2 ${
                    isSelected
                      ? `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-lg ${colorScheme.glow} scale-[1.02]`
                      : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-md ${colorScheme.glow} opacity-80 hover:opacity-100 hover:scale-[1.02]`
                  }`}
                  data-testid={`chord-grid-${chord.type}-${index}`}
                >
                  <div className="space-y-2">
                    <div className="font-bold text-base text-center drop-shadow-sm">
                      {chord.name.replace(` (${chord.inversion === 1 ? '1st Inv' : chord.inversion === 2 ? '2nd Inv' : ''})`, '')}
                    </div>

                    {/* Show inversion controls only when this chord is selected */}
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

      {/* Piano Keyboard Visualization */}
      {selectedChord && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground text-center">
                <span className="text-primary">{selectedChord.name}</span> on Piano
              </h4>
              <div className="flex justify-center">
                <PianoKeyboard
                  highlightedNotes={selectedChord.notes}
                  onKeyPress={(note) => {
                    // Could add individual note playback here
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}