import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getChordsForNoteBySkill, formatChordNotes, type Chord, type SkillLevel } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';
import PianoKeyboard from './piano-keyboard';

export type ColorPreset = 'neon' | 'pastel' | 'earth';

const COLOR_PRESETS: Record<ColorPreset, Record<string, { bg: string; border: string; text: string; glow: string }>> = {
  neon: {
    'major': {
      bg: 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90',
      border: 'border-emerald-400/60',
      text: 'text-white',
      glow: 'shadow-emerald-500/50'
    },
    'minor': {
      bg: 'bg-gradient-to-br from-violet-500/90 to-purple-700/90',
      border: 'border-violet-400/60',
      text: 'text-white',
      glow: 'shadow-purple-500/50'
    },
    'dominant7': {
      bg: 'bg-gradient-to-br from-orange-500/90 to-amber-600/90',
      border: 'border-orange-400/60',
      text: 'text-white',
      glow: 'shadow-orange-500/50'
    },
    'major7': {
      bg: 'bg-gradient-to-br from-pink-500/90 to-rose-600/90',
      border: 'border-pink-400/60',
      text: 'text-white',
      glow: 'shadow-pink-500/50'
    },
    'minor7': {
      bg: 'bg-gradient-to-br from-blue-500/90 to-indigo-700/90',
      border: 'border-blue-400/60',
      text: 'text-white',
      glow: 'shadow-blue-500/50'
    },
    'diminished': {
      bg: 'bg-gradient-to-br from-red-500/90 to-rose-700/90',
      border: 'border-red-400/60',
      text: 'text-white',
      glow: 'shadow-red-500/50'
    },
    'augmented': {
      bg: 'bg-gradient-to-br from-yellow-500/90 to-amber-600/90',
      border: 'border-yellow-400/60',
      text: 'text-gray-900',
      glow: 'shadow-yellow-500/50'
    },
    'sus4': {
      bg: 'bg-gradient-to-br from-cyan-500/90 to-sky-600/90',
      border: 'border-cyan-400/60',
      text: 'text-white',
      glow: 'shadow-cyan-500/50'
    },
    'sus2': {
      bg: 'bg-gradient-to-br from-lime-500/90 to-green-600/90',
      border: 'border-lime-400/60',
      text: 'text-white',
      glow: 'shadow-lime-500/50'
    },
    'default': {
      bg: 'bg-gradient-to-br from-slate-500/90 to-gray-600/90',
      border: 'border-slate-400/60',
      text: 'text-white',
      glow: 'shadow-slate-500/50'
    }
  },
  pastel: {
    'major': {
      bg: 'bg-gradient-to-br from-green-300/80 to-emerald-400/80',
      border: 'border-green-200/70',
      text: 'text-gray-800',
      glow: 'shadow-green-400/40'
    },
    'minor': {
      bg: 'bg-gradient-to-br from-purple-300/80 to-violet-400/80',
      border: 'border-purple-200/70',
      text: 'text-gray-800',
      glow: 'shadow-purple-400/40'
    },
    'dominant7': {
      bg: 'bg-gradient-to-br from-orange-300/80 to-amber-400/80',
      border: 'border-orange-200/70',
      text: 'text-gray-800',
      glow: 'shadow-orange-400/40'
    },
    'major7': {
      bg: 'bg-gradient-to-br from-pink-300/80 to-rose-400/80',
      border: 'border-pink-200/70',
      text: 'text-gray-800',
      glow: 'shadow-pink-400/40'
    },
    'minor7': {
      bg: 'bg-gradient-to-br from-blue-300/80 to-indigo-400/80',
      border: 'border-blue-200/70',
      text: 'text-gray-800',
      glow: 'shadow-blue-400/40'
    },
    'diminished': {
      bg: 'bg-gradient-to-br from-red-300/80 to-rose-400/80',
      border: 'border-red-200/70',
      text: 'text-gray-800',
      glow: 'shadow-red-400/40'
    },
    'augmented': {
      bg: 'bg-gradient-to-br from-yellow-300/80 to-amber-400/80',
      border: 'border-yellow-200/70',
      text: 'text-gray-800',
      glow: 'shadow-yellow-400/40'
    },
    'sus4': {
      bg: 'bg-gradient-to-br from-cyan-300/80 to-sky-400/80',
      border: 'border-cyan-200/70',
      text: 'text-gray-800',
      glow: 'shadow-cyan-400/40'
    },
    'sus2': {
      bg: 'bg-gradient-to-br from-lime-300/80 to-green-400/80',
      border: 'border-lime-200/70',
      text: 'text-gray-800',
      glow: 'shadow-lime-400/40'
    },
    'default': {
      bg: 'bg-gradient-to-br from-slate-300/80 to-gray-400/80',
      border: 'border-slate-200/70',
      text: 'text-gray-800',
      glow: 'shadow-slate-400/40'
    }
  },
  earth: {
    'major': {
      bg: 'bg-gradient-to-br from-teal-600/85 to-emerald-700/85',
      border: 'border-teal-400/50',
      text: 'text-white',
      glow: 'shadow-teal-600/40'
    },
    'minor': {
      bg: 'bg-gradient-to-br from-indigo-600/85 to-purple-700/85',
      border: 'border-indigo-400/50',
      text: 'text-white',
      glow: 'shadow-indigo-600/40'
    },
    'dominant7': {
      bg: 'bg-gradient-to-br from-amber-600/85 to-orange-700/85',
      border: 'border-amber-400/50',
      text: 'text-white',
      glow: 'shadow-amber-600/40'
    },
    'major7': {
      bg: 'bg-gradient-to-br from-rose-600/85 to-pink-700/85',
      border: 'border-rose-400/50',
      text: 'text-white',
      glow: 'shadow-rose-600/40'
    },
    'minor7': {
      bg: 'bg-gradient-to-br from-blue-600/85 to-indigo-700/85',
      border: 'border-blue-400/50',
      text: 'text-white',
      glow: 'shadow-blue-600/40'
    },
    'diminished': {
      bg: 'bg-gradient-to-br from-red-600/85 to-rose-700/85',
      border: 'border-red-400/50',
      text: 'text-white',
      glow: 'shadow-red-600/40'
    },
    'augmented': {
      bg: 'bg-gradient-to-br from-yellow-600/85 to-amber-700/85',
      border: 'border-yellow-400/50',
      text: 'text-white',
      glow: 'shadow-yellow-600/40'
    },
    'sus4': {
      bg: 'bg-gradient-to-br from-cyan-600/85 to-sky-700/85',
      border: 'border-cyan-400/50',
      text: 'text-white',
      glow: 'shadow-cyan-600/40'
    },
    'sus2': {
      bg: 'bg-gradient-to-br from-green-600/85 to-lime-700/85',
      border: 'border-green-400/50',
      text: 'text-white',
      glow: 'shadow-green-600/40'
    },
    'default': {
      bg: 'bg-gradient-to-br from-stone-600/85 to-gray-700/85',
      border: 'border-stone-400/50',
      text: 'text-white',
      glow: 'shadow-stone-600/40'
    }
  }
};

function getChordColorScheme(chordType: string, preset: ColorPreset = 'neon') {
  const presetColors = COLOR_PRESETS[preset];
  return presetColors[chordType] || presetColors['default'];
}

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
  isPlaying?: boolean;
  colorPreset?: ColorPreset;
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
  colorPreset = 'neon'
}: ChordSkillSelectorProps) {
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const { playChord } = useAudio();

  const selectedChord = parentSelectedChord;

  useEffect(() => {
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
    return (
      <div className="flex flex-col items-center">
        <div className={`relative w-64 h-64 mx-auto flex items-center justify-center transition-all duration-300 ${
          isPlaying ? 'scale-105' : ''
        }`}>
          <div className={`absolute w-56 h-56 rounded-full border transition-all duration-300 ${
            isPlaying ? 'border-emerald-400/50 shadow-lg shadow-emerald-500/20' : 'border-slate-700/30'
          }`} />
          <div className={`absolute w-48 h-48 rounded-full border transition-all duration-300 ${
            isPlaying ? 'border-emerald-400/30' : 'border-slate-700/20'
          }`} />
          
          <div className="absolute z-20 flex items-center justify-center">
            <button
              onClick={handleDeselectChord}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 
                ${isPlaying 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-emerald-300 shadow-xl shadow-emerald-500/50 scale-110 animate-pulse'
                  : selectedChord
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-500/50 shadow-xl ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-background hover:scale-105'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600/50 shadow-xl hover:border-slate-500/70'
                }`}
              title={selectedChord ? 'Click to clear selection' : baseNote}
            >
              <span className={`text-2xl font-bold tracking-tight drop-shadow-md ${
                isPlaying ? 'text-white' : 'text-white'
              }`}>{baseNote}</span>
            </button>
          </div>

          {availableChords.map((chord, index) => {
            const angles = [270, 330, 30, 90, 150, 210];
            const angle = angles[index] || 0;
            const radius = 90;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;

            const isSelected = selectedChord?.name === chord.name;
            const colorScheme = getChordColorScheme(chord.type, colorPreset);

            return (
              <div key={index} className="absolute">
                <div
                  className={`absolute z-10 transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${radius - 40}px`,
                    height: isSelected ? '3px' : '2px',
                    background: getBranchGradient(chord.type, isSelected),
                    transform: `translate(0, -50%) rotate(${angle}deg)`,
                    transformOrigin: 'left center',
                    borderRadius: '2px',
                    boxShadow: isSelected ? '0 0 8px rgba(80, 220, 185, 0.3)' : 'none'
                  }}
                />

                <button
                  className={`absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer 
                    transition-all duration-200 border-2 z-30 font-semibold backdrop-blur-sm
                    ${isSelected 
                      ? `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-lg ${colorScheme.glow} scale-110 ring-2 ring-white/40` 
                      : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-md ${colorScheme.glow} opacity-80 hover:opacity-100 hover:scale-105`
                    }
                    ${isPlaying && isSelected ? 'animate-pulse' : ''}`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => handleSelectChord(chord)}
                  data-testid={`chord-button-${chord.type}-${index}`}
                >
                  <span className="text-[11px] font-bold text-center leading-tight px-1 drop-shadow-md">
                    {chord.name.replace(` (${chord.inversion === 1 ? '1st Inv' : chord.inversion === 2 ? '2nd Inv' : ''})`, '')}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex flex-col items-center">
          {selectedChord ? (
            <>
              <div className={`mb-2 px-4 py-1.5 rounded-lg transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-emerald-600/80 to-teal-600/80 border border-emerald-400/50 shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-600/30 shadow-md'
              }`}>
                <h4 className="text-sm font-semibold text-white text-center tracking-wide">
                  {selectedChord.name.replace(` (${selectedChord.inversion === 1 ? '1st Inv' : selectedChord.inversion === 2 ? '2nd Inv' : ''})`, '')}
                  {selectedChord.inversion !== undefined && selectedChord.inversion > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">
                      {selectedChord.inversion === 1 ? '1st' : '2nd'}
                    </span>
                  )}
                </h4>
                <div className="text-xs text-slate-300 text-center font-medium">
                  {selectedChord.notes.join(' \u2022 ')}
                </div>
              </div>
              <PianoKeyboard
                highlightedNotes={selectedChord.notes}
                compact={true}
                onKeyPress={(note) => {}}
              />
            </>
          ) : (
            <>
              <div className={`mb-2 px-4 py-1.5 rounded-lg transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-slate-700/80 to-slate-800/80 border border-slate-500/50 shadow-lg shadow-slate-500/20'
                  : 'bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/30 shadow-md'
              }`}>
                <h4 className="text-sm font-semibold text-slate-300 text-center tracking-wide">
                  {baseNote}
                </h4>
                <div className="text-xs text-slate-500 text-center">
                  Single note
                </div>
              </div>
              <PianoKeyboard
                highlightedNotes={[baseNote]}
                compact={true}
                onKeyPress={(note) => {}}
              />
            </>
          )}
        </div>
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
                  data-testid={`chord-grid-${chord.type}-${index}`}
                >
                  <div className="space-y-2">
                    <div className="font-bold text-base text-center drop-shadow-md">
                      {chord.name.replace(` (${chord.inversion === 1 ? '1st Inv' : chord.inversion === 2 ? '2nd Inv' : ''})`, '')}
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
              <h4 className="text-sm font-medium text-foreground text-center">
                <span className="text-primary">{selectedChord.name}</span> on Piano
              </h4>
              <div className="flex justify-center">
                <PianoKeyboard
                  highlightedNotes={selectedChord.notes}
                  compact={true}
                  onKeyPress={(note) => {}}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}