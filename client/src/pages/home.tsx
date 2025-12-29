import { useState, useRef, useEffect } from 'react';
import RandomNotesGenerator from '@/components/random-notes-generator';
import ChordSkillSelector, { type ColorPreset } from '@/components/chord-skill-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { HelpCircle, Palette, PanelLeftClose, PanelLeft, Settings2, Piano, Guitar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Chord } from '@/lib/chord-theory';
import nsmLogo from '@assets/NSM_LOGO_White_1767023126559.png';
import { MascotProvider, GlobalMascot, MascotControls, useMascot, type ChordAnchor } from '@/components/animated-mascot';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

function HomeContent() {
  const [selectedNote, setSelectedNote] = useState('C');
  const [noteCount, setNoteCount] = useState(4);
  const [activeNotes, setActiveNotes] = useState<string[]>(['C', 'E', 'A', 'G']);
  const [selectedChords, setSelectedChords] = useState<(Chord | null)[]>([null, null, null, null]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [inversionModes, setInversionModes] = useState<('auto' | 'root' | 'first' | 'second')[]>(['auto', 'auto', 'auto', 'auto']);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [colorPreset, setColorPreset] = useState<ColorPreset>('earth');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showPiano, setShowPiano] = useState(false);
  const [showGuitar, setShowGuitar] = useState(false);

  const chordGridRef = useRef<HTMLDivElement>(null);
  const mascotContext = useMascot();

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
            <div className="flex items-center space-x-3">
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
            <div className="flex items-center space-x-1.5">
              {/* Panel toggle for desktop */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
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
      <main className="flex-1 flex flex-col lg:flex-row gap-2 p-2 lg:p-3 min-h-0 overflow-hidden">
        {/* Control Panel - Collapsible sidebar on desktop, top section on mobile */}
        <div 
          className={`flex-shrink-0 lg:h-full transition-all duration-300 ease-in-out ${
            isPanelCollapsed 
              ? 'lg:w-12' 
              : 'lg:w-56 xl:w-64 2xl:w-72'
          }`}
        >
          <div className={`bg-card rounded-lg border border-border h-full transition-all duration-300 ${
            isPanelCollapsed ? 'p-1.5' : 'p-2.5'
          }`}>
            {isPanelCollapsed ? (
              /* Collapsed state - icons only */
              <div className="flex flex-col items-center gap-2 h-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setIsPanelCollapsed(false)}
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

                {/* Compact mascot toggle */}
                <MascotControls compact={true} />
              </div>
            ) : (
              /* Expanded state - full controls */
              <div className="h-full lg:overflow-y-auto space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-border">
                  <label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Level</label>
                  <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                    <SelectTrigger className="w-[90px] h-6 text-xs" data-testid="select-skill-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner" data-testid="option-beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate" data-testid="option-intermediate">Intermediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mascot Controls in Settings Panel */}
                {skillLevel === 'beginner' && (
                  <MascotControls compact={false} />
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
                  compact={isPanelCollapsed}
                />
              </div>
            )}
          </div>
        </div>

        {/* Chord Visualization Area - Expands when sidebar collapses */}
        <div className="flex-1 min-h-0 min-w-0">
          <div className="bg-card rounded-lg border border-border h-full flex flex-col p-2 lg:p-3 relative">
            {/* Minimal instruction - hidden on smaller screens */}
            <div className="text-center mb-1.5 hidden xl:block">
              <p className="text-[11px] text-muted-foreground">
                Select a chord to add it to your progression • Click the root note again to deselect
              </p>
            </div>

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
