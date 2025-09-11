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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border-b border-blue-200/50 dark:border-gray-700/50">
        <div className="max-w-full mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Music Mentor
                </h1>
                <p className="text-xs text-blue-600 dark:text-blue-400 -mt-1">Interactive Music Learning</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800" data-testid="button-help">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800" data-testid="button-settings">
                <Settings className="w-4 h-4" />
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
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50 dark:border-gray-700/50">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">Practice Session</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Master chord relationships</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Skill Level</label>
                <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                  <SelectTrigger className="w-full bg-blue-50/80 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/60 transition-all text-blue-800 dark:text-blue-200 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">🌱 Beginner - Major & Minor</SelectItem>
                    <SelectItem value="intermediate">🌿 Intermediate - Sus & 7ths</SelectItem>
                    <SelectItem value="advanced">🌳 Advanced - Extended Chords</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50 dark:border-gray-700/50 flex-1">
              <h3 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-3">Controls</h3>
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
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-200/50 dark:border-gray-600/50">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">How to Practice</h3>
              <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <span>Generate new note sequences</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>Explore 6 chord branches per note</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <span>Use Random for auto selection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">4.</span>
                  <span>Adjust tempo and skill levels</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Chord Trees */}
          <div className="lg:col-span-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50 h-full">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Chord Trees</h3>
                <p className="text-sm text-gray-600">Click chord branches to hear harmonies</p>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[calc(100%-80px)] overflow-y-auto">
                {activeNotes.map((note, index) => {
                  return (
                    <div key={`${note}-${index}`} className="relative flex justify-center items-center">
                      <div className="relative flex flex-col items-center justify-center">
                        {/* Note Label */}
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            Note {index + 1}
                          </span>
                        </div>
                        
                        {/* Chord Selector with Tree Layout - Smaller size */}
                        <div className="scale-75 origin-center">
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
