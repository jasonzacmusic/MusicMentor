import { useState } from 'react';
import RandomNotesGenerator from '@/components/random-notes-generator';
import ChordSkillSelector from '@/components/chord-skill-selector';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chord Trees
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Music Theory Practice</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-5 h-5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Practice Session Header */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Practice Session</h2>
                <p className="text-gray-600 text-lg">Explore chord relationships through interactive note sequences</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Skill Level:</span>
                <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                  <SelectTrigger className="w-40 bg-white/80 border-gray-200 hover:bg-white transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">🌱 Beginner</SelectItem>
                    <SelectItem value="intermediate">🌿 Intermediate</SelectItem>
                    <SelectItem value="advanced">🌳 Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Random Notes Generator */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <RandomNotesGenerator 
              onNotesChange={handleNotesChange}
              onChordsChange={setSelectedChords}
              selectedChords={selectedChords}
              inversionModes={inversionModes}
            />
          </div>

          {/* Chord Trees - Visual tree structure for each note */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Chord Trees</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {activeNotes.map((note, index) => {
                const noteLabels = ['Note 1 (Base)', 'Note 2 (Major 3rd)', 'Note 3 (Minor 3rd)'];
                const timings = ['2 beats', '2 beats', '4 beats'];
                
                return (
                  <div key={`${note}-${index}`} className="relative">
                    {/* Tree Container */}
                    <div className="relative flex flex-col items-center">
                      {/* Chord Selector with Tree Layout - includes center note */}
                      <div className="relative">
                        <ChordSkillSelector
                          baseNote={note}
                          noteIndex={index}
                          selectedChord={selectedChords[index]}
                          onChordSelect={handleChordSelect}
                          inversionMode={inversionModes[index]}
                          onInversionChange={(mode) => handleInversionChange(mode, index)}
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
      </main>
    </div>
  );
}
