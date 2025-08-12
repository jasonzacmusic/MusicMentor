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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-emerald-200/50">
        <div className="max-w-full mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Music className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Chord Trees
                </h1>
                <p className="text-sm text-emerald-600 -mt-1">Interactive Music Learning</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50">
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-120px)]">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Practice Session Info & Skill Level */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-emerald-800 mb-2">Practice Session</h2>
                <p className="text-emerald-600">Master chord relationships through interactive exploration</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-700 mb-2">Skill Level</label>
                  <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                    <SelectTrigger className="w-full bg-emerald-50/80 border-emerald-200 hover:bg-emerald-50 transition-all text-emerald-800">
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
            </div>

            {/* Controls Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30">
              <h3 className="text-xl font-bold text-emerald-800 mb-4">Controls</h3>
              <RandomNotesGenerator 
                onNotesChange={handleNotesChange}
                onChordsChange={setSelectedChords}
                selectedChords={selectedChords}
                inversionModes={inversionModes}
                skillLevel={skillLevel}
              />
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-emerald-100/80 to-teal-100/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-200/50">
              <h3 className="text-lg font-bold text-emerald-800 mb-3">How to Practice</h3>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">1.</span>
                  <span>Click "Generate" to create new note sequences</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">2.</span>
                  <span>Explore the 6 chord branches around each note</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">3.</span>
                  <span>Use "Random" for automatic chord selection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">4.</span>
                  <span>Adjust tempo and try different skill levels</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Chord Trees */}
          <div className="lg:col-span-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 h-full">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-emerald-800 mb-2">Chord Trees</h3>
                <p className="text-emerald-600">Click any chord branch to hear how it harmonizes with the melody</p>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 justify-items-center h-[calc(100%-120px)] overflow-y-auto">
                {activeNotes.map((note, index) => {
                  return (
                    <div key={`${note}-${index}`} className="relative flex justify-center items-center min-h-[450px]">
                      {/* Tree Container - centered */}
                      <div className="relative flex flex-col items-center justify-center">
                        {/* Note Label */}
                        <div className="mb-4">
                          <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            Note {index + 1}
                          </span>
                        </div>
                        
                        {/* Chord Selector with Tree Layout */}
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
