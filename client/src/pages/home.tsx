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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-full mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <img
                src={nsmLogo}
                alt="Nathaniel School of Music"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Cadenza
                </h1>
                <p className="text-[11px] text-muted-foreground -mt-0.5 hidden sm:block">
                  See chords. Hear them. Master them.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={colorPreset} onValueChange={(value: ColorPreset) => setColorPreset(value)}>
                <SelectTrigger className="w-[100px] h-8 text-xs" data-testid="select-color-preset">
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
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-help">
                <HelpCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-3 lg:px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-90px)]">
          <div className="lg:col-span-2 xl:col-span-2 space-y-3">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Skill Level</label>
                <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                  <SelectTrigger className="w-[120px] h-9 text-sm" data-testid="select-skill-level">
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

            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">Tip:</span> Click center note to clear chord
              </p>
            </div>
          </div>

          <div className="lg:col-span-10 xl:col-span-10">
            <div className="bg-card rounded-lg p-4 border border-border h-full">
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold text-foreground">Chord Trees</h3>
                <p className="text-sm text-muted-foreground">Click chord branches to hear harmonies</p>
              </div>

              <div className={`grid grid-cols-1 gap-2 h-[calc(100%-60px)] overflow-y-auto ${
                noteCount === 1 ? 'xl:grid-cols-1' :
                noteCount === 2 ? 'xl:grid-cols-2' :
                noteCount === 3 ? 'xl:grid-cols-3' :
                noteCount === 4 ? 'xl:grid-cols-4' :
                'xl:grid-cols-5'
              }`}>
                {activeNotes.map((note, index) => {
                  const isPlaying = currentPlayingIndex === index;
                  return (
                    <div key={`${note}-${index}`} className="relative flex justify-center items-start pt-2">
                      <div className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                        isPlaying ? 'scale-102' : ''
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
        </div>
      </main>
    </div>
  );
}