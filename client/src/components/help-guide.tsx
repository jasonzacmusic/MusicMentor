import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, Sparkles, Music, Zap, BookOpen, Piano, Guitar, Volume2, Shuffle, Play } from 'lucide-react';

export function HelpGuide() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
          data-testid="button-help"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Chord Trees Reference Guide
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="modes" className="text-xs">Skill Modes</TabsTrigger>
              <TabsTrigger value="controls" className="text-xs">Controls</TabsTrigger>
              <TabsTrigger value="tips" className="text-xs">Tips</TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="h-[60vh] px-6 pb-6">
            <TabsContent value="overview" className="mt-4 space-y-4">
              <Section title="What is Chord Trees?">
                <p>
                  Chord Trees is an interactive music learning tool that helps you understand 
                  how notes connect to chords. Instead of memorizing chord names, you can 
                  <strong> see and hear</strong> the relationships visually.
                </p>
              </Section>
              
              <Section title="How It Works">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Notes appear</strong> — Random or manual notes are displayed</li>
                  <li><strong>Explore chords</strong> — Click on chord "branches" around each note</li>
                  <li><strong>Hear the sound</strong> — Selected chords play with real instruments</li>
                  <li><strong>Build progressions</strong> — Combine multiple notes and chords</li>
                </ol>
              </Section>
              
              <Section title="The Chord Tree">
                <p>
                  Each note sits at the center of a "tree." The branches around it show all the 
                  chords that contain that note. Click any branch to select that chord and hear it play.
                </p>
                <div className="bg-muted/50 rounded-lg p-3 mt-2 text-sm">
                  <strong>Example:</strong> The note "C" can be found in C Major, A Minor, F Major, 
                  and many more chords. The tree shows you all these options at once!
                </div>
              </Section>
            </TabsContent>
            
            <TabsContent value="modes" className="mt-4 space-y-4">
              <Section title="Beginner Mode" icon={<Sparkles className="h-4 w-4 text-emerald-500" />}>
                <p>Perfect for starting out!</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Shows <strong>6 basic chord types</strong>: Major, Minor, Diminished, Augmented, Dominant 7th, Major 7th</li>
                  <li>Friendly animal mascots guide your learning</li>
                  <li>Visual tree layout makes relationships clear</li>
                  <li>Best for: First-time learners, young students</li>
                </ul>
              </Section>
              
              <Section title="Intermediate Mode" icon={<Music className="h-4 w-4 text-blue-500" />}>
                <p>Explore chord membership!</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Shows <strong>all chords containing your note</strong> (not just chords rooted on it)</li>
                  <li>Discover that "G" appears in G Major, C Major, E Minor, and more</li>
                  <li>Organized by chord category (triads, sevenths, extended)</li>
                  <li>Best for: Students learning harmony, songwriters</li>
                </ul>
              </Section>
              
              <Section title="Diatonic Mode" icon={<BookOpen className="h-4 w-4 text-amber-500" />}>
                <p>Scale-based harmony with theory notation!</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Select a <strong>key and scale</strong> (Major, Minor, Modes)</li>
                  <li>See only chords that belong to that scale</li>
                  <li>Roman numeral notation (I, ii, iii, IV, V, vi, vii°)</li>
                  <li>Triads in tree + seventh chords below</li>
                  <li><strong>Extended Harmony</strong> — Secondary Dominants (V/V), Borrowed chords (bVII), Secondary Diminished, Tritone Subs</li>
                  <li>Best for: Theory exams, classical training, advanced songwriting</li>
                </ul>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-2 text-sm">
                  <strong>Tip:</strong> Tap "Extended Harmony" below the seventh chords panel to reveal chromatic chords like V/V (secondary dominant) and bVII (borrowed from parallel minor).
                </div>
              </Section>
            </TabsContent>
            
            <TabsContent value="controls" className="mt-4 space-y-4">
              <Section title="Playback Controls" icon={<Play className="h-4 w-4" />}>
                <div className="space-y-3">
                  <ControlItem icon="▶️" name="Play" description="Play your chord progression with real instruments" />
                  <ControlItem icon="⏹️" name="Stop" description="Stop playback immediately" />
                  <ControlItem icon="🔄" name="Loop" description="Continuously repeat your progression" />
                  <ControlItem icon="🎲" name="Generate" description="Create random notes to harmonize" />
                  <ControlItem icon="🎯" name="Harmonize" description="Auto-select chords for all notes" />
                </div>
              </Section>
              
              <Section title="Instrument Sounds" icon={<Volume2 className="h-4 w-4" />}>
                <p>Choose from 5 instrument combinations:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li><strong>Orchestral Piano</strong> — Strings + Grand Piano</li>
                  <li><strong>Brass & Guitar</strong> — Brass pads + Nylon Guitar</li>
                  <li><strong>Rock Organ</strong> — Organ + Electric Guitar</li>
                  <li><strong>80's Synth</strong> — Warm pads + Synth Lead</li>
                  <li><strong>Harp & Marimba</strong> — Harp + Vibraphone</li>
                </ul>
              </Section>
              
              <Section title="Visual Options" icon={<Piano className="h-4 w-4" />}>
                <div className="space-y-2">
                  <ControlItem icon="🎹" name="Piano" description="Show keyboard diagram for selected chords" />
                  <ControlItem icon="🎸" name="Guitar" description="Show fretboard diagram with fingerings" />
                  <ControlItem icon="🎨" name="Color Theme" description="Change chord colors (Earth, Ocean, Sunset, Forest, Galaxy)" />
                </div>
              </Section>
              
              <Section title="Settings Panel">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Tempo</strong> — Adjust playback speed (40-200 BPM)</li>
                  <li><strong>Note Count</strong> — Choose 1-5 notes to work with</li>
                  <li><strong>Metronome</strong> — Add click track with adjustable volume</li>
                  <li><strong>Arpeggio Speed</strong> — Change how chords are broken up</li>
                  <li><strong>Download MIDI</strong> — Export progression as a .mid file for your DAW</li>
                  <li><strong>Record Audio</strong> — Capture and download as WebM audio (choose 1×, 2×, or 4× loops)</li>
                </ul>
              </Section>
            </TabsContent>
            
            <TabsContent value="tips" className="mt-4 space-y-4">
              <Section title="Getting Started">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Start in <strong>Beginner mode</strong> with 2-3 notes</li>
                  <li>Click "Generate" to get random notes</li>
                  <li>Click chord branches to hear different options</li>
                  <li>Press Play to hear your progression</li>
                </ol>
              </Section>
              
              <Section title="Practice Tips">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Use Loop mode</strong> — Let progressions repeat while you play along</li>
                  <li><strong>Try all inversions</strong> — Click Auto/Root/1st/2nd to hear voice leading</li>
                  <li><strong>Compare modes</strong> — Switch between Beginner and Intermediate to see the difference</li>
                  <li><strong>Slow down</strong> — Lower tempo when learning new progressions</li>
                </ul>
              </Section>
              
              <Section title="For Theory Students">
                <ul className="list-disc list-inside space-y-2">
                  <li>Use <strong>Diatonic mode</strong> to practice Roman numeral analysis</li>
                  <li>Try all 7 modes of major and minor scales</li>
                  <li>Notice which chords share common tones</li>
                  <li>Listen for resolution (V → I, vii° → I)</li>
                </ul>
              </Section>
              
              <Section title="Keyboard Shortcuts">
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground">
                    Currently, all controls are mouse/touch based. 
                    Keyboard shortcuts coming in a future update!
                  </p>
                </div>
              </Section>
              
              <Section title="Need More Help?">
                <p>
                  Chord Trees is developed by <strong>Nathaniel School of Music</strong>. 
                  For questions, feedback, or lesson inquiries, reach out through our website.
                </p>
              </Section>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function ControlItem({ icon, name, description }: { icon: string; name: string; description: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base">{icon}</span>
      <div>
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground"> — {description}</span>
      </div>
    </div>
  );
}
