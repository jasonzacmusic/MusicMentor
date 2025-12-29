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
  const [activeNotes, setActiveNotes] = useState<string[]>(['C', 'E', 'A']);
  const [selectedChords, setSelectedChords] = useState<(Chord | null)[]>([null, null, null]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [inversionModes, setInversionModes] = useState<('auto' | 'root' | 'first' | 'second')[]>(['auto', 'auto', 'auto']);

  const handleNotesChange = (notes: string[]) => {
    setActiveNotes(notes);
    setSelectedNote(notes[0]); // Use the first note (base note) for chord harmonization
    setSelectedChords([null, null, null]); // Reset selected chords when notes change
    setInversionModes(['auto', 'auto', 'auto']); // Reset inversion modes
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

      <main className="max-w-full mx-auto px-4 lg:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-100px)]">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-4 space-y-4 overflow-y-auto">
            {/* Practice Session Info & Skill Level */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Practice Session</h2>
                <p className="text-sm text-muted-foreground">Master chord relationships</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Skill Level</label>
                <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                  <SelectTrigger className="w-full" data-testid="select-skill-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner" data-testid="option-beginner">Beginner — Major & Minor</SelectItem>
                    <SelectItem value="intermediate" disabled data-testid="option-intermediate">Intermediate — Coming soon</SelectItem>
                    <SelectItem value="advanced" disabled data-testid="option-advanced">Advanced — Coming soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="bg-card rounded-lg p-4 border border-border flex-1">
              <h3 className="text-base font-semibold text-foreground mb-3">Controls</h3>
              <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                <RandomNotesGenerator
                  onNotesChange={handleNotesChange}
                  onChordsChange={setSelectedChords}
                  selectedChords={selectedChords}
                  inversionModes={inversionModes}
                  skillLevel={skillLevel}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2">How to Practice</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="text-primary font-semibold font-mono">1.</span>
                  <span>Generate new note sequences</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary font-semibold font-mono">2.</span>
                  <span>Explore 6 chord branches per note</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary font-semibold font-mono">3.</span>
                  <span>Use Random for auto selection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary font-semibold font-mono">4.</span>
                  <span>Adjust tempo and skill levels</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Chord Trees */}
          <div className="lg:col-span-8">
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

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[calc(100%-140px)] overflow-y-auto">
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
