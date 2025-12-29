import { useMemo, useState } from 'react';
import { GuitarChordShape, ChordShapeType, getGuitarChordShapes, getDefaultShape, getShapeByType } from '@/lib/guitar-chords';

interface GuitarFretboardProps {
  root: string;
  quality: string;
  compact?: boolean;
  className?: string;
  showShapeSelector?: boolean;
}

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
const SHAPE_LABELS: Record<ChordShapeType, string> = {
  'open': 'Open',
  'barre': 'Barre',
  'alternative': 'Alt'
};

export default function GuitarFretboard({ 
  root, 
  quality, 
  compact = true, 
  className = '',
  showShapeSelector = true
}: GuitarFretboardProps) {
  const [selectedShapeType, setSelectedShapeType] = useState<ChordShapeType>('open');
  
  const shapes = useMemo(() => getGuitarChordShapes(root, quality), [root, quality]);
  
  const currentShape = useMemo(() => {
    const shape = getShapeByType(shapes, selectedShapeType);
    return shape || getDefaultShape(shapes);
  }, [shapes, selectedShapeType]);

  if (!currentShape || shapes.length === 0) {
    return (
      <div className={`text-xs text-muted-foreground text-center py-2 ${className}`}>
        No guitar chord available
      </div>
    );
  }

  const frets = [...currentShape.frets].reverse();
  const fingers = [...currentShape.fingers].reverse();
  const barres = (currentShape.barres || []).map(b => ({
    ...b,
    fromString: 5 - b.toString,
    toString: 5 - b.fromString
  }));
  
  const playedFrets = frets.filter((f): f is number => f !== null && f > 0);
  const minFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 1;
  const maxFret = playedFrets.length > 0 ? Math.max(...playedFrets) : 4;
  
  const hasOpenStrings = frets.some(f => f === 0);
  const startFret = hasOpenStrings || minFret <= 2 ? 1 : minFret - 1;
  const numFrets = Math.max(4, maxFret - startFret + 2);
  
  const stringSpacing = compact ? 14 : 18;
  const fretSpacing = compact ? 28 : 32;
  const nutWidth = compact ? 5 : 7;
  const dotRadius = compact ? 8 : 10;
  const leftPadding = compact ? 20 : 28;
  const topPadding = compact ? 16 : 20;
  
  const width = leftPadding + nutWidth + (numFrets * fretSpacing) + 12;
  const height = topPadding + (5 * stringSpacing) + (compact ? 20 : 24);

  const getFingerColor = (finger: number | null): string => {
    if (!finger) return 'fill-primary';
    const colors: Record<number, string> = {
      1: 'fill-blue-500',
      2: 'fill-green-500',
      3: 'fill-yellow-500',
      4: 'fill-red-500'
    };
    return colors[finger] || 'fill-primary';
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {showShapeSelector && shapes.length > 1 && (
        <div className="flex rounded-md overflow-hidden border border-border" data-testid="guitar-shape-selector">
          {shapes.map((shape) => (
            <button
              key={shape.type}
              onClick={() => setSelectedShapeType(shape.type)}
              className={`px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                selectedShapeType === shape.type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
              data-testid={`button-guitar-shape-${shape.type}`}
            >
              {SHAPE_LABELS[shape.type]}
            </button>
          ))}
        </div>
      )}
      
      <svg 
        width={width} 
        height={height} 
        className="block"
        data-testid="guitar-fretboard-svg"
      >
        {STRING_NAMES.map((name, i) => (
          <text
            key={`string-label-${i}`}
            x={leftPadding - 4}
            y={topPadding + (i * stringSpacing) + 3}
            textAnchor="end"
            className="fill-muted-foreground text-[8px] font-mono"
          >
            {name}
          </text>
        ))}

        {startFret === 1 && (
          <rect
            x={leftPadding}
            y={topPadding - 2}
            width={nutWidth}
            height={(5 * stringSpacing) + 4}
            className="fill-slate-300 dark:fill-slate-600"
            rx={1}
          />
        )}
        
        {startFret > 1 && (
          <text
            x={leftPadding + nutWidth + fretSpacing / 2}
            y={topPadding - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px] font-semibold"
          >
            {startFret}fr
          </text>
        )}

        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={leftPadding + nutWidth + (i * fretSpacing)}
            y1={topPadding - 2}
            x2={leftPadding + nutWidth + (i * fretSpacing)}
            y2={topPadding + (5 * stringSpacing) + 2}
            className="stroke-slate-400 dark:stroke-slate-600"
            strokeWidth={i === 0 && startFret > 1 ? 2 : 1}
          />
        ))}

        {STRING_NAMES.map((_, i) => (
          <line
            key={`string-${i}`}
            x1={leftPadding + nutWidth}
            y1={topPadding + (i * stringSpacing)}
            x2={leftPadding + nutWidth + (numFrets * fretSpacing)}
            y2={topPadding + (i * stringSpacing)}
            className="stroke-slate-500 dark:stroke-slate-400"
            strokeWidth={1 + (i * 0.2)}
          />
        ))}

        {barres.map((barre, barreIndex) => {
          const fretPos = barre.fret - startFret + 1;
          const fromY = topPadding + (barre.fromString * stringSpacing);
          const toY = topPadding + (barre.toString * stringSpacing);
          return (
            <rect
              key={`barre-${barreIndex}`}
              x={leftPadding + nutWidth + ((fretPos - 0.5) * fretSpacing) - dotRadius}
              y={Math.min(fromY, toY) - dotRadius / 2}
              width={dotRadius * 2}
              height={Math.abs(toY - fromY) + dotRadius}
              rx={dotRadius / 2}
              className="fill-blue-500 opacity-80"
            />
          );
        })}

        {frets.map((fret, stringIndex) => {
          if (fret === null) {
            return (
              <text
                key={`muted-${stringIndex}`}
                x={leftPadding + nutWidth - 8}
                y={topPadding + (stringIndex * stringSpacing) + 3}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-bold"
              >
                ×
              </text>
            );
          }
          
          if (fret === 0) {
            return (
              <circle
                key={`open-${stringIndex}`}
                cx={leftPadding + nutWidth - 8}
                cy={topPadding + (stringIndex * stringSpacing)}
                r={dotRadius / 2}
                className="fill-none stroke-muted-foreground stroke-2"
              />
            );
          }
          
          const fretPos = fret - startFret + 1;
          const x = leftPadding + nutWidth + ((fretPos - 0.5) * fretSpacing);
          const y = topPadding + (stringIndex * stringSpacing);
          const finger = fingers[stringIndex];
          
          const isBarre = barres.some(b => 
            b.fret === fret && 
            stringIndex >= b.fromString && 
            stringIndex <= b.toString
          );
          
          if (isBarre && stringIndex !== barres[0]?.fromString) {
            return null;
          }
          
          return (
            <g key={`finger-${stringIndex}`}>
              <circle
                cx={x}
                cy={y}
                r={dotRadius}
                className={getFingerColor(finger)}
              />
              {finger && (
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  className="fill-white text-[8px] font-bold pointer-events-none"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      <div className="text-[9px] text-muted-foreground">
        {currentShape.name}
      </div>
    </div>
  );
}
