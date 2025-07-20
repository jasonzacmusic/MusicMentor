import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { getBeginnerChordsForNote, getChordsForNote, formatChordNotes, type Chord } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';

interface ChordSkillSelectorProps {
  baseNote: string;
  noteIndex: number;
  onChordSelect?: (chord: Chord, noteIndex: number) => void;
}

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export default function ChordSkillSelector({ baseNote, noteIndex, onChordSelect }: ChordSkillSelectorProps) {
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel>('beginner');
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const { playChord, isPlaying } = useAudio();

  const getAdvancedChords = (rootNote: string): Chord[] => {
    // Advanced level includes all chord types plus extensions
    const basicChords = getChordsForNote(rootNote);
    // Add some extended chords for advanced level
    const extendedChords = [
      // Add 9th, 11th, 13th chords, etc.
      // For now, just return the basic chords
    ];
    return basicChords;
  };

  const getIntermediateChords = (rootNote: string): Chord[] => {
    // Intermediate level includes basic triads plus 7th chords
    const allChords = getChordsForNote(rootNote);
    return allChords.filter(chord => 
      chord.type.includes('major') || 
      chord.type.includes('minor') || 
      chord.type.includes('7') ||
      chord.type.includes('diminished') ||
      chord.type.includes('augmented')
    );
  };

  const getChordsForSkillLevel = (skillLevel: SkillLevel): Chord[] => {
    switch (skillLevel) {
      case 'beginner':
        return getBeginnerChordsForNote(baseNote);
      case 'intermediate':
        return getIntermediateChords(baseNote);
      case 'advanced':
        return getAdvancedChords(baseNote);
      default:
        return getBeginnerChordsForNote(baseNote);
    }
  };

  const handleSelectChord = (chord: Chord) => {
    setSelectedChord(chord);
    onChordSelect?.(chord, noteIndex);
  };

  const skillLevels: { level: SkillLevel; title: string; description: string }[] = [
    {
      level: 'beginner',
      title: 'Beginner',
      description: '6 essential harmonizing chords'
    },
    {
      level: 'intermediate',
      title: 'Intermediate',
      description: 'Triads and 7th chords'
    },
    {
      level: 'advanced',
      title: 'Advanced',
      description: 'Extended and complex chords'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-medium text-gray-900 mb-2">What is your Chord Skill Level?</h2>
        <div className="text-sm text-gray-600 mb-4">
          Based on note: <span className="font-mono font-medium">{baseNote}</span>
        </div>
      </div>

      {/* Skill Level Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {skillLevels.map(({ level, title, description }) => (
          <Button
            key={level}
            onClick={() => setSelectedSkillLevel(level)}
            variant={selectedSkillLevel === level ? "default" : "outline"}
            className={`p-4 h-auto flex flex-col items-center space-y-2 ${
              selectedSkillLevel === level 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{title}</div>
            <div className="text-xs opacity-80 text-center">{description}</div>
          </Button>
        ))}
      </div>

      {/* Chord Options for Selected Level */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
            {skillLevels.find(s => s.level === selectedSkillLevel)?.title} Chords
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {getChordsForSkillLevel(selectedSkillLevel).map((chord, index) => (
              <div
                key={index}
                onClick={() => handleSelectChord(chord)}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedChord?.name === chord.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="space-y-2">
                  <div className="font-medium text-gray-900 text-sm text-center">
                    {chord.name}
                  </div>
                  <div className="text-xs text-gray-600 font-mono text-center">
                    {formatChordNotes(chord.notes)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}