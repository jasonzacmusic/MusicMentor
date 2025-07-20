import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, SkipForward } from 'lucide-react';
import { INTERVALS, CHROMATIC_NOTES } from '@/lib/music-constants';
import { getNoteFromSemitones } from '@/lib/chord-theory';
import { useAudio } from '@/hooks/use-audio';

export default function IntervalTraining() {
  const [currentInterval, setCurrentInterval] = useState('perfect5');
  const [baseNote, setBaseNote] = useState('C');
  const [practiceStats, setPracticeStats] = useState({
    sessionsToday: 0,
    totalTime: 0,
    favoriteKey: 'C Major'
  });
  
  const { playNote, isPlaying } = useAudio();

  const nextInterval = useCallback(() => {
    const intervalKeys = Object.keys(INTERVALS);
    const currentIndex = intervalKeys.indexOf(currentInterval);
    const nextIndex = (currentIndex + 1) % intervalKeys.length;
    setCurrentInterval(intervalKeys[nextIndex]);
    
    // Generate new base note
    const randomIndex = Math.floor(Math.random() * CHROMATIC_NOTES.length);
    setBaseNote(CHROMATIC_NOTES[randomIndex]);
  }, [currentInterval]);

  const playInterval = useCallback(async () => {
    const interval = INTERVALS[currentInterval];
    const secondNote = getNoteFromSemitones(baseNote, interval.semitones);
    
    // Play base note first
    await playNote(baseNote, 1000);
    // Small pause
    await new Promise(resolve => setTimeout(resolve, 200));
    // Play interval note
    await playNote(secondNote, 1000);
  }, [currentInterval, baseNote, playNote]);

  useEffect(() => {
    // Initialize with random interval and base note
    nextInterval();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Interval Training */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interval Training</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Current Interval:</span>
              <span className="font-mono font-medium text-lg">
                {INTERVALS[currentInterval]?.name || 'Perfect 5th'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Base Note:</span>
              <span className="font-mono font-medium text-lg">{baseNote}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={playInterval}
                disabled={isPlaying}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Interval
              </Button>
              <Button
                onClick={nextInterval}
                variant="outline"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Practice Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sessions Today:</span>
              <span className="font-medium">{practiceStats.sessionsToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Practice Time:</span>
              <span className="font-medium">{practiceStats.totalTime} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Favorite Key:</span>
              <span className="font-medium font-mono">{practiceStats.favoriteKey}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
