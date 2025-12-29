import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Volume2 } from 'lucide-react';
import { getBeginnerChordsForNote, formatChordNotes, type Chord } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';

interface ChordTreePanelProps {
  selectedNote: string;
}

export default function ChordTreePanel({ selectedNote }: ChordTreePanelProps) {
  const [availableChords, setAvailableChords] = useState<Chord[]>([]);
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const { playChord, isPlaying } = useAudio();

  useEffect(() => {
    const chords = getBeginnerChordsForNote(selectedNote);
    setAvailableChords(chords);
    setSelectedChord(chords[0] || null);
  }, [selectedNote]);

  const handlePlayChord = useCallback(async (chord: Chord) => {
    await playChord(chord.notes, 2000);
  }, [playChord]);

  const handleSelectChord = useCallback((chord: Chord) => {
    setSelectedChord(chord);
  }, []);

  const handlePlaySelectedChord = useCallback(async () => {
    if (selectedChord) {
      await playChord(selectedChord.notes, 2000);
    }
  }, [selectedChord, playChord]);

  return (
    <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-8">
        <h3 className="text-2xl font-display font-semibold text-foreground mb-6 text-center">
          Chord Tree
        </h3>

        {/* Base Note as Root of Tree */}
        <div className="mb-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 dark:from-amber-500 dark:via-yellow-600 dark:to-orange-600 text-white rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center shadow-2xl border-4 border-white/30 dark:border-amber-300/20 glow-gold">
              <span className="text-4xl font-display font-bold drop-shadow-lg">{selectedNote}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-3 font-medium tracking-wide uppercase">Root Note</div>
          </div>
        </div>

        {/* Tree Branches */}
        <div className="space-y-6">
          <h4 className="text-lg font-display font-medium text-foreground text-center mb-6">
            Harmonizing Chords
          </h4>

          {/* Tree Structure */}
          <div className="relative">
            {/* Connecting Lines */}
            <div className="absolute left-1/2 top-0 w-1 h-10 bg-gradient-to-b from-amber-400 to-amber-300 dark:from-amber-500 dark:to-amber-600 transform -translate-x-0.5 rounded-full"></div>
            <div className="absolute left-1/2 top-10 w-4/5 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-600 transform -translate-x-1/2 rounded-full"></div>

            {/* Chord Options in Tree Layout */}
            <div className="grid grid-cols-2 gap-4 pt-16">
              {availableChords.map((chord, index) => (
                <div key={index} className="relative">
                  {/* Branch Line */}
                  <div className="absolute -top-6 left-1/2 w-1 h-6 bg-amber-300 dark:bg-amber-600 transform -translate-x-0.5 rounded-full"></div>

                  <div
                    onClick={() => handleSelectChord(chord)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 text-center ${
                      selectedChord?.name === chord.name
                        ? 'border-amber-500 dark:border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30'
                        : 'border-border hover:border-amber-300 dark:hover:border-amber-600 hover:bg-gradient-to-br hover:from-amber-50/50 hover:to-orange-50/50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="font-display font-semibold text-foreground text-xl leading-tight">
                        {chord.name}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono tracking-wide">
                        {formatChordNotes(chord.notes)}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayChord(chord);
                        }}
                        disabled={isPlaying}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 p-2 h-8 w-full rounded-lg"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Play Selected Chord */}
        <Button
          onClick={handlePlaySelectedChord}
          disabled={!selectedChord || isPlaying}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-600 dark:to-orange-600 dark:hover:from-amber-500 dark:hover:to-orange-500 text-white font-semibold mt-6 h-12 text-base shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Volume2 className="w-5 h-5 mr-2" />
          Play Selected Chord
        </Button>
      </CardContent>
    </Card>
  );
}
