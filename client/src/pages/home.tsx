import { useState } from 'react';
import RandomNotesGenerator from '@/components/random-notes-generator';
import ChordSkillSelector from '@/components/chord-skill-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { Music, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Chord } from '@/lib/chord-theory';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export default function Home() {
  const [selectedNote, setSelectedNote] = useState('C');
  const [noteCount, setNoteCount] = useState(4); // Default to 4 notes
  const [activeNotes, setActiveNotes] = useState<string[]>(['C', 'E', 'A', 'G']);
  const [selectedChords, setSelectedChords] = useState<(Chord | null)[]>([null, null, null, null]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [inversionModes, setInversionModes] = useState<('auto' | 'root' | 'first' | 'second')[]>(['auto', 'auto', 'auto', 'auto']);

  // Update arrays when note count changes
  const handleNoteCountChange = (count: number) => {
    setNoteCount(count);
    // Resize arrays to match new count
    setActiveNotes(prev => {
      if (prev.length >= count) return prev.slice(0, count);
      // Pad with placeholder notes if needed (will be replaced on generate)
      const padded = [...prev];
      while (padded.length < count) padded.push('C');
      return padded;
    });
    setSelectedChords(Array(count).fill(null));
    setInversionModes(Array(count).fill('auto'));
  };

  const handleNotesChange = (notes: string[]) => {
    setActiveNotes(notes);
    setSelectedNote(notes[0]); // Use the first note (base note) for chord harmonization
    setSelectedChords(Array(notes.length).fill(null)); // Reset selected chords when notes change
    setInversionModes(Array(notes.length).fill('auto')); // Reset inversion modes
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-full mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Music Mentor
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-help">
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-settings">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-3 lg:px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-90px)]">
          {/* Left Panel - Controls (Compact) */}
          <div className="lg:col-span-3 space-y-2 overflow-y-auto">
            {/* Combined Settings & Controls */}
            <div className="bg-card rounded-lg p-3 border border-border">
              {/* Skill Level - Inline */}
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skill</label>
                <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-skill-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner" data-testid="option-beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate" disabled data-testid="option-intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced" disabled data-testid="option-advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Controls */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <RandomNotesGenerator
                  onNotesChange={handleNotesChange}
                  onChordsChange={setSelectedChords}
                  selectedChords={selectedChords}
                  inversionModes={inversionModes}
                  skillLevel={skillLevel}
                  noteCount={noteCount}
                  onNoteCountChange={handleNoteCountChange}
                />
              </div>
            </div>

            {/* Compact Instructions */}
            <div className="bg-muted/30 rounded-lg p-2 border border-border">
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p><span className="text-primary font-medium">Tip:</span> Click center note to clear chord</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Chord Trees */}
          <div className="lg:col-span-9">
            <div className="bg-card rounded-lg p-4 border border-border h-full">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Chord Trees</h3>
                <p className="text-sm text-muted-foreground">Click chord branches to hear harmonies</p>
              </div>

              {/* Selected Chords Display */}
              <div className="mb-4 flex justify-center items-center gap-3">
                {selectedChords.map((chord, index) => (
                  <div
                    key={index}
                    className={`flex-1 max-w-[180px] rounded-lg p-3 text-center border transition-colors ${
                      chord
                        ? 'bg-primary/5 dark:bg-primary/10 border-primary'
                        : 'bg-muted/30 border-border'
                    }`}
                    data-testid={`text-selected-chord-${index}`}
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Position {index + 1}
                    </div>
                    <div className={`text-xl font-bold ${
                      chord ? 'text-foreground' : 'text-muted-foreground/30'
                    }`}>
                      {chord ? chord.name : '—'}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`grid grid-cols-1 gap-4 h-[calc(100%-140px)] overflow-y-auto ${
                noteCount === 1 ? 'xl:grid-cols-1' :
                noteCount === 2 ? 'xl:grid-cols-2' :
                noteCount === 3 ? 'xl:grid-cols-3' :
                noteCount === 4 ? 'xl:grid-cols-4' :
                'xl:grid-cols-5'
              }`}>
                {activeNotes.map((note, index) => {
                  return (
                    <div key={`${note}-${index}`} className="relative flex justify-center items-center">
                      <div className="relative flex flex-col items-center justify-center">
                        {/* Note Label */}
                        <div className="mb-2">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                            Note {index + 1}
                          </span>
                        </div>

                        {/* Chord Selector with Tree Layout - NO SCALE TRANSFORM */}
                        <ChordSkillSelector
                          baseNote={note}
                          noteIndex={index}
                          selectedChord={selectedChords[index]}
                          onChordSelect={handleChordSelect}
                          inversionMode={inversionModes[index]}
                          onInversionChange={(mode) => handleInversionChange(mode, index)}
                          skillLevel={skillLevel}
                          treeLayout={true}
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
