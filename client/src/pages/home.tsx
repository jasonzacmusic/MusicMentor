import { useState } from 'react';
import RandomNotesGenerator from '@/components/random-notes-generator';
import ChordSkillSelector from '@/components/chord-skill-selector';
import { Music, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Chord } from '@/lib/chord-theory';

export default function Home() {
  const [selectedNote, setSelectedNote] = useState('C');
  const [activeNotes, setActiveNotes] = useState<string[]>(['C', 'E', 'A']);
  const [selectedChords, setSelectedChords] = useState<(Chord | null)[]>([null, null, null]);

  const handleNotesChange = (notes: string[]) => {
    setActiveNotes(notes);
    setSelectedNote(notes[0]); // Use the first note (base note) for chord harmonization
    setSelectedChords([null, null, null]); // Reset selected chords when notes change
  };

  const handleChordSelect = (chord: Chord, noteIndex: number) => {
    const newSelectedChords = [...selectedChords];
    newSelectedChords[noteIndex] = chord;
    setSelectedChords(newSelectedChords);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-medium text-gray-900">ChordCraft</h1>
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
          {/* Random Notes Generator */}
          <div>
            <RandomNotesGenerator 
              onNotesChange={handleNotesChange}
              selectedChords={selectedChords}
            />
          </div>

          {/* Chord Skill Level Selectors for each note */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeNotes.map((note, index) => {
              const noteLabels = ['Note 1 (Base)', 'Note 2 (Major 3rd)', 'Note 3 (Minor 3rd)'];
              const timings = ['2 beats', '2 beats', '4 beats'];
              
              return (
                <div key={`${note}-${index}`} className="space-y-3">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">{noteLabels[index]}</h3>
                    <p className="text-sm text-gray-600">{note} • {timings[index]}</p>
                  </div>
                  <ChordSkillSelector
                    baseNote={note}
                    noteIndex={index}
                    onChordSelect={handleChordSelect}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
