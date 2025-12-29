import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Music, Piano, Guitar } from 'lucide-react';
import { 
  harmonizeScale, 
  AVAILABLE_KEYS, 
  AVAILABLE_SCALES, 
  type ScaleType, 
  type DiatonicChord,
  type HarmonizedScale,
  formatJazzSymbol,
  getNormalizedKey
} from '@/lib/scale-theory';
import { CHORD_SYMBOLS, CHORD_NAMES } from '@/lib/music-constants';
import { useAudio } from '@/hooks/use-audio';
import PianoKeyboard from './piano-keyboard';
import GuitarFretboard from './guitar-fretboard';

interface DiatonicModeProps {
  onChordSelect?: (chord: DiatonicChord | null) => void;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

const FUNCTION_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  tonic: {
    bg: 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90',
    border: 'border-emerald-400/60',
    text: 'text-white',
    glow: 'shadow-emerald-500/40'
  },
  subdominant: {
    bg: 'bg-gradient-to-br from-amber-500/90 to-orange-600/90',
    border: 'border-amber-400/60',
    text: 'text-white',
    glow: 'shadow-amber-500/40'
  },
  dominant: {
    bg: 'bg-gradient-to-br from-rose-500/90 to-red-600/90',
    border: 'border-rose-400/60',
    text: 'text-white',
    glow: 'shadow-rose-500/40'
  },
  other: {
    bg: 'bg-gradient-to-br from-slate-500/90 to-slate-600/90',
    border: 'border-slate-400/60',
    text: 'text-white',
    glow: 'shadow-slate-500/40'
  }
};

const QUALITY_COLORS: Record<string, { bg: string; border: string }> = {
  major: { bg: 'from-emerald-500/90 to-teal-600/90', border: 'border-emerald-400/60' },
  minor: { bg: 'from-blue-500/90 to-indigo-600/90', border: 'border-blue-400/60' },
  diminished: { bg: 'from-purple-500/90 to-violet-600/90', border: 'border-purple-400/60' },
  augmented: { bg: 'from-amber-500/90 to-orange-600/90', border: 'border-amber-400/60' },
  major7: { bg: 'from-emerald-500/90 to-teal-600/90', border: 'border-emerald-400/60' },
  minor7: { bg: 'from-blue-500/90 to-indigo-600/90', border: 'border-blue-400/60' },
  dominant7: { bg: 'from-rose-500/90 to-red-600/90', border: 'border-rose-400/60' },
  minor7b5: { bg: 'from-purple-500/90 to-violet-600/90', border: 'border-purple-400/60' },
  diminished7: { bg: 'from-fuchsia-500/90 to-pink-600/90', border: 'border-fuchsia-400/60' },
  minorMajor7: { bg: 'from-cyan-500/90 to-teal-600/90', border: 'border-cyan-400/60' },
  sus2: { bg: 'from-sky-500/90 to-cyan-600/90', border: 'border-sky-400/60' },
  sus4: { bg: 'from-sky-500/90 to-cyan-600/90', border: 'border-sky-400/60' },
  '7sus4': { bg: 'from-sky-500/90 to-cyan-600/90', border: 'border-sky-400/60' },
};

export default function DiatonicMode({ onChordSelect, isPlaying = false, onPlayStateChange }: DiatonicModeProps) {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [selectedScale, setSelectedScale] = useState<ScaleType>('major');
  const [showRomanNumerals, setShowRomanNumerals] = useState(true);
  const [selectedChord, setSelectedChord] = useState<DiatonicChord | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    triads: true,
    sevenths: true,
    suspended: false
  });
  const [showPiano, setShowPiano] = useState(true);
  const [showGuitar, setShowGuitar] = useState(false);
  
  const { playChord } = useAudio();

  const normalizedKey = useMemo(() => {
    return getNormalizedKey(selectedKey, selectedScale);
  }, [selectedKey, selectedScale]);

  const harmonizedScale = useMemo(() => {
    return harmonizeScale(selectedKey, selectedScale);
  }, [selectedKey, selectedScale]);

  const handleChordClick = useCallback((chord: DiatonicChord) => {
    setSelectedChord(chord);
    onChordSelect?.(chord);
    playChord(chord.notes, 1.5);
  }, [onChordSelect, playChord]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getChordColor = (chord: DiatonicChord) => {
    const colors = QUALITY_COLORS[chord.type] || QUALITY_COLORS.major;
    return colors;
  };

  const scalesByCategory = useMemo(() => {
    const grouped: Record<string, typeof AVAILABLE_SCALES> = {};
    AVAILABLE_SCALES.forEach(scale => {
      if (!grouped[scale.category]) grouped[scale.category] = [];
      grouped[scale.category].push(scale);
    });
    return grouped;
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-slate-300 text-sm font-medium">Key:</Label>
              <Select value={selectedKey} onValueChange={setSelectedKey}>
                <SelectTrigger className="w-28 bg-slate-800/80 border-slate-600/50 text-white" data-testid="select-key">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {AVAILABLE_KEYS.map(key => (
                    <SelectItem key={key.value} value={key.value} className="text-white hover:bg-slate-700">
                      {key.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-slate-300 text-sm font-medium">Scale:</Label>
              <Select value={selectedScale} onValueChange={(v) => setSelectedScale(v as ScaleType)}>
                <SelectTrigger className="w-48 bg-slate-800/80 border-slate-600/50 text-white" data-testid="select-scale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-80">
                  {Object.entries(scalesByCategory).map(([category, scales]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {category}
                      </div>
                      {scales.map(scale => (
                        <SelectItem key={scale.value} value={scale.value} className="text-white hover:bg-slate-700">
                          {scale.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Label htmlFor="roman-toggle" className="text-slate-400 text-xs">Roman Numerals</Label>
              <Switch 
                id="roman-toggle"
                checked={showRomanNumerals} 
                onCheckedChange={setShowRomanNumerals}
                data-testid="toggle-roman-numerals"
              />
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700/40">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">
                {normalizedKey} {harmonizedScale.scaleName}
                {normalizedKey !== selectedKey && (
                  <span className="text-xs text-slate-500 ml-2">(enharmonic of {selectedKey})</span>
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {harmonizedScale.notes.map((note, i) => (
                <div 
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/40"
                >
                  <span className="text-white font-semibold">{note}</span>
                  {showRomanNumerals && (
                    <span className="ml-1.5 text-xs text-slate-400">
                      ({['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <button 
            onClick={() => toggleSection('triads')}
            className="w-full flex items-center justify-between mb-3"
            data-testid="toggle-triads-section"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Diatonic Triads
            </h3>
            {expandedSections.triads ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          <AnimatePresence>
            {expandedSections.triads && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="relative w-72 h-72 mx-auto">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <linearGradient id="triadCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#4ade80" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    <circle 
                      cx="144" cy="144" r="130" 
                      fill="none" 
                      stroke="url(#triadCircleGrad)"
                      strokeWidth="3"
                      strokeDasharray="8 4"
                    />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-500/50 flex items-center justify-center shadow-xl">
                      <span className="text-xl font-bold text-white">{selectedKey}</span>
                    </div>
                  </div>

                  {harmonizedScale.triads.map((chord, index) => {
                    const angle = (index * (360 / 7) - 90) * (Math.PI / 180);
                    const radius = 100;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const colors = getChordColor(chord);
                    const isSelected = selectedChord?.name === chord.name;

                    return (
                      <div
                        key={chord.name}
                        className="absolute"
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
                          onClick={() => handleChordClick(chord)}
                          className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer
                            transition-all duration-200 border-2 font-semibold backdrop-blur-sm
                            bg-gradient-to-br ${colors.bg} ${colors.border} text-white shadow-lg
                            ${isSelected ? 'scale-110 ring-4 ring-emerald-400/60 ring-offset-2 ring-offset-slate-900' : 'hover:scale-105 opacity-80 hover:opacity-100'}
                          `}
                          title={`${chord.rootNote} ${CHORD_NAMES[chord.type] || chord.type}`}
                          data-testid={`triad-${chord.scaleDegree}`}
                        >
                          <span className="text-sm font-bold leading-tight">
                            {formatJazzSymbol(chord.rootNote, chord.type)}
                          </span>
                          {showRomanNumerals && (
                            <span className="text-[9px] opacity-80 mt-0.5">
                              {chord.romanNumeral}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedChord && selectedChord.category === 'triad' && (
                  <div className="mt-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700/40">
                    <div className="text-center mb-2">
                      <span className="text-lg font-bold text-white">
                        {formatJazzSymbol(selectedChord.rootNote, selectedChord.type)}
                      </span>
                      {showRomanNumerals && (
                        <span className="ml-2 text-sm text-emerald-400">
                          ({selectedChord.romanNumeral})
                        </span>
                      )}
                      <div className="text-xs text-slate-400 mt-0.5">
                        {CHORD_NAMES[selectedChord.type]} • Scale Degree {selectedChord.scaleDegree}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 text-center">
                      Notes: {selectedChord.notes.join(' • ')}
                    </div>
                    {showPiano && (
                      <div className="mt-2">
                        <PianoKeyboard highlightedNotes={selectedChord.notes} compact={true} onKeyPress={() => {}} />
                      </div>
                    )}
                    {showGuitar && (
                      <div className="mt-2">
                        <GuitarFretboard root={selectedChord.rootNote} quality={selectedChord.type} compact={true} />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <button 
            onClick={() => toggleSection('sevenths')}
            className="w-full flex items-center justify-between mb-3"
            data-testid="toggle-sevenths-section"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Diatonic Seventh Chords
            </h3>
            {expandedSections.sevenths ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          <AnimatePresence>
            {expandedSections.sevenths && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {harmonizedScale.seventhChords.map((chord) => {
                    const colors = getChordColor(chord);
                    const isSelected = selectedChord?.name === chord.name;

                    return (
                      <button
                        key={chord.name}
                        onClick={() => handleChordClick(chord)}
                        className={`p-3 rounded-lg transition-all duration-200 border-2 backdrop-blur-sm
                          bg-gradient-to-br ${colors.bg} ${colors.border} text-white
                          ${isSelected ? 'scale-105 ring-2 ring-emerald-400/60' : 'hover:scale-102 opacity-80 hover:opacity-100'}
                        `}
                        data-testid={`seventh-${chord.scaleDegree}`}
                      >
                        <div className="text-sm font-bold">
                          {formatJazzSymbol(chord.rootNote, chord.type)}
                        </div>
                        {showRomanNumerals && (
                          <div className="text-[10px] opacity-80 mt-0.5">
                            {chord.romanNumeral}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedChord && selectedChord.category === 'seventh' && (
                  <div className="mt-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700/40">
                    <div className="text-center mb-2">
                      <span className="text-lg font-bold text-white">
                        {formatJazzSymbol(selectedChord.rootNote, selectedChord.type)}
                      </span>
                      {showRomanNumerals && (
                        <span className="ml-2 text-sm text-blue-400">
                          ({selectedChord.romanNumeral})
                        </span>
                      )}
                      <div className="text-xs text-slate-400 mt-0.5">
                        {CHORD_NAMES[selectedChord.type]} • Scale Degree {selectedChord.scaleDegree}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 text-center">
                      Notes: {selectedChord.notes.join(' • ')}
                    </div>
                    {showPiano && (
                      <div className="mt-2">
                        <PianoKeyboard highlightedNotes={selectedChord.notes} compact={true} onKeyPress={() => {}} />
                      </div>
                    )}
                    {showGuitar && (
                      <div className="mt-2">
                        <GuitarFretboard root={selectedChord.rootNote} quality={selectedChord.type} compact={true} />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {harmonizedScale.suspendedChords.length > 0 && (
        <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <button 
              onClick={() => toggleSection('suspended')}
              className="w-full flex items-center justify-between mb-3"
              data-testid="toggle-suspended-section"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Suspended Chords
                <span className="text-xs text-slate-400 font-normal">({harmonizedScale.suspendedChords.length} available)</span>
              </h3>
              {expandedSections.suspended ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            <AnimatePresence>
              {expandedSections.suspended && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2">
                    {harmonizedScale.suspendedChords.map((chord, i) => {
                      const colors = getChordColor(chord);
                      const isSelected = selectedChord?.name === chord.name;

                      return (
                        <button
                          key={`${chord.name}-${i}`}
                          onClick={() => handleChordClick(chord)}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 border-2 backdrop-blur-sm
                            bg-gradient-to-br ${colors.bg} ${colors.border} text-white
                            ${isSelected ? 'scale-105 ring-2 ring-emerald-400/60' : 'hover:scale-102 opacity-80 hover:opacity-100'}
                          `}
                          data-testid={`suspended-${chord.type}-${chord.scaleDegree}`}
                        >
                          <div className="text-sm font-bold">
                            {formatJazzSymbol(chord.rootNote, chord.type)}
                          </div>
                          {showRomanNumerals && (
                            <div className="text-[10px] opacity-80">
                              {chord.romanNumeral}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-center gap-4 p-2">
        <button
          onClick={() => setShowPiano(!showPiano)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm ${
            showPiano ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'
          }`}
          data-testid="toggle-piano-diatonic"
        >
          <Piano className="w-4 h-4" />
          Piano
        </button>
        <button
          onClick={() => setShowGuitar(!showGuitar)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm ${
            showGuitar ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'
          }`}
          data-testid="toggle-guitar-diatonic"
        >
          <Guitar className="w-4 h-4" />
          Guitar
        </button>
      </div>
    </div>
  );
}
