import { useState } from 'react';
import RandomNotesGenerator from '@/components/random-notes-generator';
import ChordSkillSelector, { type ColorPreset } from '@/components/chord-skill-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { HelpCircle, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Chord } from '@/lib/chord-theory';
import nsmLogo from '@assets/NSM_LOGO_White_1767023126559.png';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export default function Home() {
  const [selectedNote, setSelectedNote] = useState('C');
  const [noteCount, setNoteCount] = useState(4);
  const [activeNotes, setActiveNotes] = useState<string[]>(['C', 'E', 'A', 'G']);
  const [selectedChords, setSelectedChords] = useState<(Chord | null)[]>([null, null, null, null]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [inversionModes, setInversionModes] = useState<('auto' | 'root' | 'first' | 'second')[]>(['auto', 'auto', 'auto', 'auto']);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [colorPreset, setColorPreset] = useState<ColorPreset>('earth');

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
                  Cadenza
                </h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:block leading-tight">
                  See chords. Hear them. Master them.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
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
        {/* Control Panel - Sidebar on desktop, top section on mobile */}
        <div className="lg:w-72 xl:w-80 2xl:w-96 flex-shrink-0 lg:h-full lg:overflow-y-auto">
          <div className="bg-card rounded-lg p-3 border border-border h-full">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Level</label>
              <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                <SelectTrigger className="w-[100px] h-7 text-xs" data-testid="select-skill-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner" data-testid="option-beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate" disabled data-testid="option-intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced" disabled data-testid="option-advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <RandomNotesGenerator
              onNotesChange={handleNotesChange}
              onChordsChange={setSelectedChords}
              selectedChords={selectedChords}
              inversionModes={inversionModes}
              skillLevel={skillLevel}
              noteCount={noteCount}
              onNoteCountChange={handleNoteCountChange}
              onPlayingIndexChange={handlePlayingIndexChange}
            />
          </div>
        </div>

        {/* Chord Visualization Area - No scrolling on desktop */}
        <div className="flex-1 min-h-0 min-w-0">
          <div className="bg-card rounded-lg border border-border h-full flex flex-col p-2 lg:p-3">
            {/* Minimal instruction - hidden on smaller screens */}
            <div className="text-center mb-2 hidden xl:block">
              <p className="text-xs text-muted-foreground">
                Click chords to select • Tap center note to clear
              </p>
            </div>

            {/* Chord Grid - Responsive, no scroll on desktop */}
            <div className={`flex-1 grid gap-1 lg:gap-2 min-h-0 auto-rows-fr ${
              noteCount === 1 ? 'grid-cols-1' :
              noteCount === 2 ? 'grid-cols-2' :
              noteCount === 3 ? 'grid-cols-3' :
              noteCount === 4 ? 'grid-cols-2 lg:grid-cols-4' :
              'grid-cols-3 lg:grid-cols-5'
            }`}>
              {activeNotes.map((note, index) => {
                const isPlaying = currentPlayingIndex === index;
                return (
                  <div 
                    key={`${note}-${index}`} 
                    className="flex justify-center items-start min-h-0 overflow-hidden"
                  >
                    <div className={`flex flex-col items-center justify-start transition-all duration-300 h-full ${
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