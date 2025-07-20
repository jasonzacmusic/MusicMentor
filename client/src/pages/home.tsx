import { useState } from 'react';
import RandomNotesGenerator from '@/components/random-notes-generator';
import ChordTreePanel from '@/components/chord-tree-panel';
import PianoKeyboard from '@/components/piano-keyboard';
import IntervalTraining from '@/components/interval-training';
import { Music, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [selectedNote, setSelectedNote] = useState('C');
  const [activeNotes, setActiveNotes] = useState<string[]>(['C', 'E', 'G']);
  const [chordNotes, setChordNotes] = useState<string[]>([]);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Random Notes Generator */}
          <div className="lg:col-span-2">
            <RandomNotesGenerator />
          </div>

          {/* Chord Tree Panel */}
          <div>
            <ChordTreePanel selectedNote={selectedNote} />
          </div>
        </div>

        {/* Piano Keyboard */}
        <div className="mt-8">
          <PianoKeyboard 
            activeNotes={activeNotes}
            chordNotes={chordNotes}
          />
        </div>

        {/* Interval Training */}
        <div className="mt-8">
          <IntervalTraining />
        </div>
      </main>
    </div>
  );
}
