import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import RandomNotesGenerator from '@/components/random-notes-generator';
import ChordSkillSelector, { type ColorPreset } from '@/components/chord-skill-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { HelpCircle, Palette, PanelLeftClose, PanelLeft, Settings2, Piano, Guitar, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Chord } from '@/lib/chord-theory';
import { AVAILABLE_KEYS, AVAILABLE_SCALES, MODE_NAMES, type ScaleType, harmonizeScaleWithMode } from '@/lib/scale-theory';
import nsmLogo from '@assets/NSM_LOGO_White_1767023126559.png';
import { MascotProvider, GlobalMascot, MascotControls, useMascot, type ChordAnchor } from '@/components/animated-mascot';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'diatonic';

// Panel width breakpoints for progressive UI modes
const PANEL_MIN_WIDTH = 48;  // Icon-only mode
const PANEL_COMPACT_WIDTH = 140;  // Compact mode - icons + minimal text
const PANEL_DEFAULT_WIDTH = 240;  // Normal mode
const PANEL_MAX_WIDTH = 320;  // Maximum width

// Get UI density mode based on panel width
function getPanelMode(width: number): 'icon' | 'compact' | 'normal' {
  if (width <= PANEL_MIN_WIDTH + 20) return 'icon';
  if (width <= PANEL_COMPACT_WIDTH + 20) return 'compact';
  return 'normal';
}

function HomeContent() {
  const [selectedNote, setSelectedNote] = useState('C');
  const [noteCount, setNoteCount] = useState(4);
  const [activeNotes, setActiveNotes] = useState<string[]>(['C', 'E', 'A', 'G']);
  const [selectedChords, setSelectedChords] = useState<(Chord | null)[]>([null, null, null, null]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [inversionModes, setInversionModes] = useState<('auto' | 'root' | 'first' | 'second')[]>(['auto', 'auto', 'auto', 'auto']);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [colorPreset, setColorPreset] = useState<ColorPreset>('earth');
  const [showPiano, setShowPiano] = useState(false);
  const [showGuitar, setShowGuitar] = useState(false);

  // Diatonic mode settings
  const [diatonicKey, setDiatonicKey] = useState<string>('A');
  const [diatonicScale, setDiatonicScale] = useState<ScaleType>('major');
  const [diatonicMode, setDiatonicMode] = useState<number>(1); // 1-7 for modes

  // Panel width state for resizable sidebar
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const chordGridRef = useRef<HTMLDivElement>(null);
  const mascotContext = useMascot();

  // Compute scale notes for diatonic mode
  const diatonicScaleInfo = useMemo(() => {
    if (skillLevel === 'diatonic') {
      return harmonizeScaleWithMode(diatonicKey, diatonicScale, diatonicMode);
    }
    return null;
  }, [skillLevel, diatonicKey, diatonicScale, diatonicMode]);

  // Reset notes when switching between modes to ensure independence
  useEffect(() => {
    if (skillLevel === 'diatonic' && diatonicScaleInfo) {
      // When in diatonic mode, use notes from the diatonic scale
      const diatonicNotes = diatonicScaleInfo.notes.slice(0, noteCount);
      // Pad with additional scale notes if needed
      while (diatonicNotes.length < noteCount) {
        diatonicNotes.push(diatonicScaleInfo.notes[diatonicNotes.length % diatonicScaleInfo.notes.length]);
      }
      setActiveNotes(diatonicNotes);
      setSelectedNote(diatonicNotes[0]);
      setSelectedChords(Array(noteCount).fill(null));
      setInversionModes(Array(noteCount).fill('auto'));
    } else {
      // When in other modes, use default notes
      const defaultNotes = ['C', 'E', 'A', 'G'];
      const paddedNotes = [...defaultNotes];
      while (paddedNotes.length < noteCount) {
        paddedNotes.push(defaultNotes[paddedNotes.length % defaultNotes.length]);
      }
      setActiveNotes(paddedNotes.slice(0, noteCount));
      setSelectedNote(paddedNotes[0]);
      setSelectedChords(Array(noteCount).fill(null));
      setInversionModes(Array(noteCount).fill('auto'));
    }
  }, [skillLevel, diatonicScaleInfo, noteCount]);

  // Derive panel mode from width
  const panelMode = getPanelMode(panelWidth);
  const isPanelCollapsed = panelMode === 'icon';

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_MAX_WIDTH, e.clientX - 8));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (chordGridRef.current) {
      mascotContext.setContainerRef(chordGridRef as React.RefObject<HTMLDivElement>);
    }
  }, []);

  useEffect(() => {
    mascotContext.setIsPlaying(currentPlayingIndex !== null);
  }, [currentPlayingIndex]);

  const handleNoteCountChange = (count: number) => {
    setNoteCount(count);
    setActiveNotes(prev => {
      if (prev.length >= count) return prev.slice(0, count);
      const padded = [...prev];
      while (padded.length < count) padded.push('C');
      return padded;
    });
    setSelectedChords(Array(count).fill(null));
    setInversionModes(Array(count).fill('auto'));
  };

  const handleNotesChange = (notes: string[]) => {
    setActiveNotes(notes);
    setSelectedNote(notes[0]);
    setSelectedChords(Array(notes.length).fill(null));
    setInversionModes(Array(notes.length).fill('auto'));
  };

  const handleInversionChange = (mode: 'auto' | 'root' | 'first' | 'second', noteIndex: number) => {
    const newModes = [...inversionModes];
    newModes[noteIndex] = mode;
    setInversionModes(newModes);
  };

  const handleChordSelect = (chord: Chord | null, noteIndex: number) => {
    const newSelectedChords = [...selectedChords];
    newSelectedChords[noteIndex] = chord;
    setSelectedChords(newSelectedChords);
  };

  const handlePlayingIndexChange = (index: number | null) => {
    setCurrentPlayingIndex(index);
  };

  const handleAnchorUpdate = (anchor: ChordAnchor) => {
    mascotContext.registerAnchor(anchor);
    if (anchor.chordId) {
      mascotContext.setCurrentAnchor(anchor);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Compact Header */}
      <header className="bg-card border-b border-border flex-shrink-0">
        <div className="max-w-full mx-auto px-3 lg:px-4">
          <div className="flex justify-between items-center h-12 lg:h-11">
            {/* Left Section - Logo */}
            <div className="flex items-center space-x-3 flex-1">
              <img
                src={nsmLogo}
                alt="Nathaniel School of Music"
                className="w-8 h-8 lg:w-7 lg:h-7 object-contain"
              />
              <div>
                <h1 className="text-lg lg:text-base font-bold text-foreground tracking-tight leading-tight">
                  Chord Trees
                </h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:block leading-tight">
                  Visualize harmony. Play real instruments. Build your ear.
                </p>
              </div>
            </div>

            {/* Center Section - Marketing Copy */}
            <div className="hidden xl:flex flex-col items-center justify-center text-center px-6 flex-1">
              <div className="text-xs font-bold text-foreground tracking-wide mb-0.5">
                ✦ LEARN CHORDS VISUALLY ✦
              </div>
              <div className="text-[10px] text-muted-foreground leading-relaxed max-w-md">
                See how notes connect to chords in beautiful, interactive trees
              </div>
              <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                <span>▸ 3 Skill Levels</span>
                <span>▸ Real Instruments</span>
                <span>▸ Works on Any Device</span>
              </div>
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center space-x-1.5 flex-1 justify-end">
              {/* Panel toggle for desktop */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                onClick={() => setPanelWidth(isPanelCollapsed ? PANEL_DEFAULT_WIDTH : PANEL_MIN_WIDTH)}
                data-testid="button-toggle-panel"
                title={isPanelCollapsed ? "Expand settings" : "Collapse settings"}
              >
                {isPanelCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </Button>
              <Select value={colorPreset} onValueChange={(value: ColorPreset) => setColorPreset(value)}>
                <SelectTrigger className="w-[90px] h-7 text-xs" data-testid="select-color-preset">
                  <Palette className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earth" data-testid="option-earth">Earth</SelectItem>
                  <SelectItem value="sunset" data-testid="option-sunset">Sunset</SelectItem>
                  <SelectItem value="ocean" data-testid="option-ocean">Ocean</SelectItem>
                  <SelectItem value="neon" data-testid="option-neon">Neon</SelectItem>
                  <SelectItem value="pastel" data-testid="option-pastel">Pastel</SelectItem>
                </SelectContent>
              </Select>
              {skillLevel === 'intermediate' && (
                <div className="flex gap-0.5 border border-border rounded-md p-0.5">
                  <Button
                    variant={showPiano ? "default" : "ghost"}
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowPiano(!showPiano)}
                    title={showPiano ? "Hide Piano" : "Show Piano"}
                    data-testid="toggle-piano-global"
                  >
                    <Piano className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={showGuitar ? "default" : "ghost"}
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowGuitar(!showGuitar)}
                    title={showGuitar ? "Hide Guitar" : "Show Guitar"}
                    data-testid="toggle-guitar-global"
                  >
                    <Guitar className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-7 w-7 p-0" data-testid="button-help">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Flex layout for no scrolling on desktop */}
      <main className="flex-1 flex flex-col lg:flex-row p-2 lg:p-3 min-h-0 overflow-hidden">
        {/* Control Panel - Resizable sidebar on desktop */}
        <div
          ref={panelRef}
          className="flex-shrink-0 lg:h-full hidden lg:block"
          style={{ width: panelWidth }}
        >
          <div className={`bg-card rounded-lg border border-border h-full ${
            panelMode === 'icon' ? 'p-1.5' : panelMode === 'compact' ? 'p-2' : 'p-2.5'
          }`}>
            {panelMode === 'icon' ? (
              /* Icon-only state */
              <div className="flex flex-col items-center gap-2 h-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setPanelWidth(PANEL_DEFAULT_WIDTH)}
                  title="Expand settings"
                  data-testid="button-expand-panel"
                >
                  <Settings2 className="w-4 h-4" />
                </Button>

                {/* Quick level indicator */}
                <div className="text-[9px] font-bold text-center uppercase tracking-wide text-muted-foreground px-1">
                  {skillLevel.charAt(0).toUpperCase()}
                </div>

                {/* Note count indicator */}
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {noteCount}
                </div>

                {/* Compact mascot toggle - only for beginner mode */}
                {skillLevel === 'beginner' && (
                  <MascotControls compact={true} />
                )}
              </div>
            ) : (
              /* Compact or Normal state - full controls with density adaptation */
              <div className="h-full lg:overflow-y-auto space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-border">
                  {panelMode === 'normal' && (
                    <label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Level</label>
                  )}
                  <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                    <SelectTrigger className={`h-6 text-xs ${panelMode === 'compact' ? 'w-full' : 'w-[100px]'}`} data-testid="select-skill-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner" data-testid="option-beginner">Beginner</SelectItem>
                      <SelectItem value="diatonic" data-testid="option-diatonic">Diatonic</SelectItem>
                      <SelectItem value="intermediate" data-testid="option-intermediate">Intermediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {skillLevel === 'diatonic' && (
                  <div className={`pb-2 border-b border-border ${panelMode === 'compact' ? 'space-y-1' : 'space-y-1.5'}`}>
                    <div className="flex items-center gap-2">
                      {panelMode === 'normal' && (
                        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide min-w-[32px]">Key:</Label>
                      )}
                      <Select value={diatonicKey} onValueChange={setDiatonicKey}>
                        <SelectTrigger className={`h-6 text-xs ${panelMode === 'compact' ? 'w-full' : 'flex-1'}`} data-testid="select-diatonic-key">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_KEYS.map(key => (
                            <SelectItem key={key.value} value={key.value}>{key.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      {panelMode === 'normal' && (
                        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide min-w-[32px]">Scale:</Label>
                      )}
                      <Select value={diatonicScale} onValueChange={(v) => setDiatonicScale(v as ScaleType)}>
                        <SelectTrigger className={`h-6 text-xs ${panelMode === 'compact' ? 'w-full' : 'flex-1'}`} data-testid="select-diatonic-scale">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {AVAILABLE_SCALES.map(scale => (
                            <SelectItem key={scale.value} value={scale.value}>{scale.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      {panelMode === 'normal' && (
                        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide min-w-[32px]">Mode:</Label>
                      )}
                      <Select value={diatonicMode.toString()} onValueChange={(v) => setDiatonicMode(parseInt(v))}>
                        <SelectTrigger className={`h-6 text-xs ${panelMode === 'compact' ? 'w-full' : 'flex-1'}`} data-testid="select-diatonic-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MODE_NAMES[diatonicScale]?.map((modeName, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {index + 1}{['st', 'nd', 'rd', 'th', 'th', 'th', 'th'][index]} ({modeName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <RandomNotesGenerator
                  onNotesChange={handleNotesChange}
                  onChordsChange={setSelectedChords}
                  selectedChords={selectedChords}
                  inversionModes={inversionModes}
                  skillLevel={skillLevel}
                  noteCount={noteCount}
                  onNoteCountChange={handleNoteCountChange}
                  onPlayingIndexChange={handlePlayingIndexChange}
                  panelMode={panelMode}
                  diatonicNotes={skillLevel === 'diatonic' && diatonicScaleInfo ? diatonicScaleInfo.notes : undefined}
                  diatonicKey={skillLevel === 'diatonic' ? diatonicKey : undefined}
                  diatonicScale={skillLevel === 'diatonic' ? diatonicScale : undefined}
                  diatonicMode={skillLevel === 'diatonic' ? diatonicMode : undefined}
                />

                {skillLevel === 'beginner' && (
                  <MascotControls compact={panelMode === 'compact'} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Draggable Divider */}
        <div
          className={`hidden lg:flex items-center justify-center w-2 cursor-col-resize group hover:bg-primary/10 transition-colors ${
            isDragging ? 'bg-primary/20' : ''
          }`}
          onMouseDown={handleDragStart}
        >
          <div className={`w-1 h-12 rounded-full transition-colors ${
            isDragging ? 'bg-primary' : 'bg-border group-hover:bg-primary/50'
          }`} />
        </div>

        {/* Mobile settings panel */}
        <div className="lg:hidden mb-2">
          <div className="bg-card rounded-lg border border-border p-2.5">
            <RandomNotesGenerator
              onNotesChange={handleNotesChange}
              onChordsChange={setSelectedChords}
              selectedChords={selectedChords}
              inversionModes={inversionModes}
              skillLevel={skillLevel}
              noteCount={noteCount}
              onNoteCountChange={handleNoteCountChange}
              onPlayingIndexChange={handlePlayingIndexChange}
              panelMode="normal"
              diatonicNotes={skillLevel === 'diatonic' && diatonicScaleInfo ? diatonicScaleInfo.notes : undefined}
              diatonicKey={skillLevel === 'diatonic' ? diatonicKey : undefined}
              diatonicScale={skillLevel === 'diatonic' ? diatonicScale : undefined}
              diatonicMode={skillLevel === 'diatonic' ? diatonicMode : undefined}
            />
          </div>
        </div>

        {/* Chord Visualization Area - Expands when sidebar shrinks */}
        <div className="flex-1 min-h-0 min-w-0">
          <div className="bg-card rounded-lg border border-border h-full flex flex-col p-2 lg:p-3 relative overflow-y-auto">
            {/* Minimal instruction - hidden on smaller screens */}
            <div className="text-center mb-1.5 hidden xl:block">
              <p className="text-[11px] text-muted-foreground">
                {skillLevel === 'diatonic'
                  ? `Diatonic chords in ${diatonicKey} ${AVAILABLE_SCALES.find(s => s.value === diatonicScale)?.label || diatonicScale}`
                  : 'Select a chord to add it to your progression • Click the root note again to deselect'
                }
              </p>
            </div>

            {/* Scale Notes Display for Diatonic Mode */}
            {skillLevel === 'diatonic' && diatonicScaleInfo && (
              <div className="mb-3 bg-slate-900/50 rounded-lg border border-slate-700/50 p-3">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-sm font-semibold text-emerald-400">
                    {diatonicScaleInfo.scaleName}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {diatonicScaleInfo.notes.map((note, index) => {
                    const triad = diatonicScaleInfo.triads[index];
                    const isRoot = index === 0;
                    return (
                      <div
                        key={index}
                        className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
                          isRoot
                            ? 'bg-gradient-to-br from-emerald-600/90 to-teal-700/90 border-2 border-emerald-400/60 scale-110'
                            : 'bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/40'
                        }`}
                      >
                        <span className={`text-base font-bold ${isRoot ? 'text-white' : 'text-slate-200'}`}>
                          {note}
                        </span>
                        <span className={`text-[10px] mt-0.5 ${isRoot ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {triad?.romanNumeral || ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chord Grid - Responsive, no scroll on desktop, dynamic sizing based on panel state */}
            <div
              ref={chordGridRef}
              className={`flex-1 grid gap-1 min-h-0 auto-rows-fr relative ${
                noteCount === 1 ? 'grid-cols-1' :
                noteCount === 2 ? 'grid-cols-2' :
                noteCount === 3 ? 'grid-cols-3' :
                noteCount === 4 ? 'grid-cols-2 lg:grid-cols-4' :
                'grid-cols-3 lg:grid-cols-5'
              } ${isPanelCollapsed ? 'lg:gap-3' : 'lg:gap-2'}`}
            >
              {/* Global Mascot Overlay */}
              {skillLevel === 'beginner' && chordGridRef.current && (
                <GlobalMascot containerRef={chordGridRef as React.RefObject<HTMLDivElement>} />
              )}

              {activeNotes.map((note, index) => {
                const isPlaying = currentPlayingIndex === index;
                return (
                  <div
                    key={`${note}-${index}`}
                    className="flex justify-center items-start min-h-0 overflow-visible"
                  >
                    <div className={`flex flex-col items-center justify-start transition-all duration-300 h-full w-full ${
                      isPlaying ? 'scale-[1.02]' : ''
                    }`}>
                      <ChordSkillSelector
                        baseNote={note}
                        noteIndex={index}
                        selectedChord={selectedChords[index]}
                        onChordSelect={handleChordSelect}
                        inversionMode={inversionModes[index]}
                        onInversionChange={(mode) => handleInversionChange(mode, index)}
                        skillLevel={skillLevel}
                        treeLayout={true}
                        isPlaying={isPlaying}
                        colorPreset={colorPreset}
                        expandedView={isPanelCollapsed}
                        onAnchorUpdate={handleAnchorUpdate}
                        showPiano={showPiano}
                        showGuitar={showGuitar}
                        diatonicKey={skillLevel === 'diatonic' ? diatonicKey : undefined}
                        diatonicScale={skillLevel === 'diatonic' ? diatonicScale : undefined}
                        diatonicMode={skillLevel === 'diatonic' ? diatonicMode : undefined}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <MascotProvider>
      <HomeContent />
    </MascotProvider>
  );
}
