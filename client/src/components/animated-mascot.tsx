import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

export type AnimalType = 'monkey' | 'bird' | 'frog' | 'squirrel' | 'cat';
export type MovementStyle = 'swing' | 'hop' | 'fly' | 'climb' | 'bounce';

interface ChordAnchor {
  id: string;
  noteIndex: number;
  chordId: string | null;
  x: number;
  y: number;
  element?: HTMLElement;
}

interface MascotContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  animal: AnimalType;
  setAnimal: (animal: AnimalType) => void;
  movementStyle: MovementStyle;
  setMovementStyle: (style: MovementStyle) => void;
  currentAnchor: ChordAnchor | null;
  setCurrentAnchor: (anchor: ChordAnchor | null) => void;
  anchors: Map<string, ChordAnchor>;
  registerAnchor: (anchor: ChordAnchor) => void;
  unregisterAnchor: (id: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement> | null;
  setContainerRef: (ref: React.RefObject<HTMLDivElement>) => void;
  tempo: number;
  setTempo: (tempo: number) => void;
}

const MascotContext = createContext<MascotContextType | null>(null);

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [animal, setAnimal] = useState<AnimalType>('monkey');
  const [movementStyle, setMovementStyle] = useState<MovementStyle>('swing');
  const [currentAnchor, setCurrentAnchor] = useState<ChordAnchor | null>(null);
  const [anchors] = useState<Map<string, ChordAnchor>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [containerRef, setContainerRef] = useState<React.RefObject<HTMLDivElement> | null>(null);
  const [tempo, setTempo] = useState(120);

  const registerAnchor = useCallback((anchor: ChordAnchor) => {
    anchors.set(anchor.id, anchor);
  }, [anchors]);

  const unregisterAnchor = useCallback((id: string) => {
    anchors.delete(id);
  }, [anchors]);

  return (
    <MascotContext.Provider value={{
      enabled,
      setEnabled,
      animal,
      setAnimal,
      movementStyle,
      setMovementStyle,
      currentAnchor,
      setCurrentAnchor,
      anchors,
      registerAnchor,
      unregisterAnchor,
      isPlaying,
      setIsPlaying,
      containerRef,
      setContainerRef,
      tempo,
      setTempo,
    }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error('useMascot must be used within a MascotProvider');
  }
  return context;
}

const ANIMAL_EMOJIS: Record<AnimalType, string> = {
  monkey: '🐒',
  bird: '🐦',
  frog: '🐸',
  squirrel: '🐿️',
  cat: '🐱',
};

const ANIMAL_NAMES: Record<AnimalType, string> = {
  monkey: 'Melody Monkey',
  bird: 'Beatbox Bird',
  frog: 'Funky Frog',
  squirrel: 'Swing Squirrel',
  cat: 'Cool Cat',
};

const MOVEMENT_NAMES: Record<MovementStyle, string> = {
  swing: 'Swing on Vines',
  hop: 'Hop & Jump',
  fly: 'Fly & Glide',
  climb: 'Climb & Scramble',
  bounce: 'Bouncy Ball',
};

interface AnimalHabit {
  travelEase: number[];
  arcHeight: number;
  bobAmplitude: number;
  bobFrequency: number;
  speedMultiplier: number;
  rotationRange: number;
  squashStretch: { x: number; y: number };
  trailEffect: string;
  idleAnimation: {
    y?: number[];
    rotate?: number[];
    scale?: number[];
    scaleX?: number[];
    scaleY?: number[];
  };
  idleDuration: number;
  travelStyle: 'arc' | 'zigzag' | 'parabola' | 'glide' | 'prowl';
}

const ANIMAL_HABITS: Record<AnimalType, AnimalHabit> = {
  monkey: {
    travelEase: [0.68, -0.55, 0.27, 1.55],
    arcHeight: 80,
    bobAmplitude: 15,
    bobFrequency: 3,
    speedMultiplier: 0.9,
    rotationRange: 25,
    squashStretch: { x: 1.1, y: 0.9 },
    trailEffect: '🍌',
    idleAnimation: {
      y: [0, -8, 0, -4, 0],
      rotate: [-8, 8, -5, 5, 0],
      scale: [1, 1.05, 1, 1.02, 1],
    },
    idleDuration: 1.2,
    travelStyle: 'arc',
  },
  bird: {
    travelEase: [0.25, 0.1, 0.25, 1],
    arcHeight: 120,
    bobAmplitude: 20,
    bobFrequency: 5,
    speedMultiplier: 1.2,
    rotationRange: 15,
    squashStretch: { x: 1.15, y: 0.85 },
    trailEffect: '✨',
    idleAnimation: {
      y: [0, -6, 0, -12, 0, -3, 0],
      rotate: [0, -5, 0, 5, 0],
      scaleX: [1, 1.1, 1, 1.05, 1],
    },
    idleDuration: 0.8,
    travelStyle: 'glide',
  },
  frog: {
    travelEase: [0.34, 1.56, 0.64, 1],
    arcHeight: 100,
    bobAmplitude: 0,
    bobFrequency: 1,
    speedMultiplier: 0.7,
    rotationRange: 10,
    squashStretch: { x: 0.8, y: 1.3 },
    trailEffect: '💧',
    idleAnimation: {
      y: [0, 0, 0, -25, 0],
      scaleY: [1, 0.7, 1, 1.3, 1],
      scaleX: [1, 1.2, 1, 0.85, 1],
    },
    idleDuration: 1.5,
    travelStyle: 'parabola',
  },
  squirrel: {
    travelEase: [0.5, 0, 0.2, 1],
    arcHeight: 40,
    bobAmplitude: 8,
    bobFrequency: 8,
    speedMultiplier: 1.4,
    rotationRange: 30,
    squashStretch: { x: 1.05, y: 0.95 },
    trailEffect: '🌰',
    idleAnimation: {
      rotate: [0, 15, -15, 10, -10, 0],
      y: [0, -3, 0, -2, 0],
      scale: [1, 1.08, 1, 1.05, 1],
    },
    idleDuration: 0.6,
    travelStyle: 'zigzag',
  },
  cat: {
    travelEase: [0.4, 0, 0.2, 1],
    arcHeight: 20,
    bobAmplitude: 5,
    bobFrequency: 2,
    speedMultiplier: 1.0,
    rotationRange: 8,
    squashStretch: { x: 1.2, y: 0.9 },
    trailEffect: '🐾',
    idleAnimation: {
      scaleX: [1, 1.1, 0.95, 1.05, 1],
      y: [0, -2, 0, -1, 0],
      rotate: [0, -3, 3, 0],
    },
    idleDuration: 2.0,
    travelStyle: 'prowl',
  },
};

interface GlobalMascotProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function GlobalMascot({ containerRef }: GlobalMascotProps) {
  const { enabled, animal, currentAnchor, isPlaying, tempo } = useMascot();
  const [position, setPosition] = useState({ x: 200, y: 200 });
  const [prevPosition, setPrevPosition] = useState({ x: 200, y: 200 });
  const [isMoving, setIsMoving] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const trailIdRef = useRef(0);
  const controls = useAnimation();
  const lastAnchorRef = useRef<string | null>(null);

  const habit = ANIMAL_HABITS[animal];
  const beatDuration = 60 / tempo;

  useEffect(() => {
    if (!currentAnchor || !containerRef.current || !isPlaying) return;
    if (lastAnchorRef.current === currentAnchor.id) return;
    
    lastAnchorRef.current = currentAnchor.id;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = currentAnchor.x - containerRect.left;
    const newY = currentAnchor.y - containerRect.top - 30;

    const dx = newX - position.x;
    if (Math.abs(dx) > 10) {
      setFacingRight(dx > 0);
    }

    setPrevPosition(position);
    setIsMoving(true);
    
    trailIdRef.current++;
    setTrail(prev => [...prev.slice(-6), { 
      x: position.x, 
      y: position.y, 
      id: trailIdRef.current 
    }]);

    setPosition({ x: newX, y: newY });

    const moveDuration = beatDuration * habit.speedMultiplier;
    const timeout = setTimeout(() => setIsMoving(false), moveDuration * 1000);
    return () => clearTimeout(timeout);
  }, [currentAnchor, containerRef, isPlaying, beatDuration, habit.speedMultiplier, position]);

  if (!enabled) return null;

  const emoji = ANIMAL_EMOJIS[animal];
  const moveDuration = beatDuration * habit.speedMultiplier;
  
  const getPathKeyframes = () => {
    const dx = position.x - prevPosition.x;
    const dy = position.y - prevPosition.y;
    const midX = (prevPosition.x + position.x) / 2;
    
    switch (habit.travelStyle) {
      case 'arc':
        return {
          x: [prevPosition.x, midX, position.x],
          y: [prevPosition.y, Math.min(prevPosition.y, position.y) - habit.arcHeight, position.y],
        };
      case 'parabola':
        return {
          x: [prevPosition.x, midX - 20, midX + 20, position.x],
          y: [prevPosition.y, prevPosition.y - habit.arcHeight * 0.8, position.y - habit.arcHeight, position.y],
        };
      case 'zigzag':
        const quarterX = prevPosition.x + dx * 0.25;
        const threeQuarterX = prevPosition.x + dx * 0.75;
        return {
          x: [prevPosition.x, quarterX, midX, threeQuarterX, position.x],
          y: [prevPosition.y, prevPosition.y - 30, prevPosition.y - 15, position.y - 25, position.y],
        };
      case 'glide':
        return {
          x: [prevPosition.x, midX, position.x],
          y: [prevPosition.y, Math.min(prevPosition.y, position.y) - habit.arcHeight, position.y],
        };
      case 'prowl':
        return {
          x: [prevPosition.x, prevPosition.x + dx * 0.3, midX, prevPosition.x + dx * 0.7, position.x],
          y: [prevPosition.y, prevPosition.y - 10, prevPosition.y - habit.arcHeight, position.y - 8, position.y],
        };
      default:
        return { x: position.x, y: position.y };
    }
  };

  const getTravelAnimation = () => {
    if (!isMoving) {
      return { 
        x: position.x, 
        y: position.y,
        rotate: 0,
        scaleX: facingRight ? 1 : -1,
        scaleY: 1,
      };
    }

    const path = getPathKeyframes();
    const rotateAmount = facingRight ? habit.rotationRange : -habit.rotationRange;
    
    return {
      ...path,
      rotate: isMoving ? [0, rotateAmount, -rotateAmount * 0.5, rotateAmount * 0.3, 0] : 0,
      scaleX: facingRight ? [1, habit.squashStretch.x, 1] : [-1, -habit.squashStretch.x, -1],
      scaleY: isMoving ? [1, habit.squashStretch.y, 1.1, 1] : 1,
    };
  };

  const getTravelTransition = () => ({
    duration: moveDuration,
    ease: habit.travelEase,
    times: habit.travelStyle === 'zigzag' ? [0, 0.25, 0.5, 0.75, 1] : undefined,
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 100 }}>
      <AnimatePresence>
        {trail.map((point, i) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.7, scale: 0.8 }}
            animate={{ opacity: 0, scale: 0.2, y: 10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, delay: i * 0.05 }}
            className="absolute"
            style={{ left: point.x, top: point.y, transform: 'translate(-50%, -50%)' }}
          >
            <span className="text-lg">{habit.trailEffect}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {isMoving && habit.travelStyle === 'arc' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="vinePathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.path
            d={`M ${prevPosition.x} ${prevPosition.y} Q ${(prevPosition.x + position.x) / 2} ${Math.min(prevPosition.y, position.y) - habit.arcHeight} ${position.x} ${position.y}`}
            fill="none"
            stroke="url(#vinePathGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: moveDuration * 0.8 }}
          />
        </svg>
      )}

      {isMoving && habit.travelStyle === 'parabola' && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ left: position.x, top: position.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], y: [0, -30, 0] }}
          transition={{ duration: moveDuration }}
        >
          <span className="text-2xl">💫</span>
        </motion.div>
      )}

      <motion.div
        className="absolute"
        initial={false}
        animate={getTravelAnimation()}
        transition={getTravelTransition()}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <motion.div
          animate={!isMoving && !isPlaying ? habit.idleAnimation : {}}
          transition={{ 
            duration: habit.idleDuration, 
            repeat: Infinity, 
            repeatType: 'loop',
            ease: 'easeInOut'
          }}
          className="relative"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <motion.span 
            className="text-4xl drop-shadow-xl select-none block"
            animate={{
              filter: isMoving 
                ? 'brightness(1.3) drop-shadow(0 0 12px rgba(74, 222, 128, 0.6))' 
                : isPlaying
                  ? 'brightness(1.1) drop-shadow(0 0 6px rgba(74, 222, 128, 0.3))'
                  : 'brightness(1)',
            }}
          >
            {emoji}
          </motion.span>
          
          {isMoving && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 10 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.8], y: [-5, -25, -35] }}
              transition={{ duration: moveDuration * 0.6 }}
              className="absolute top-0 left-1/2 -translate-x-1/2"
            >
              <span className="text-xl">
                {habit.travelStyle === 'arc' ? '🌿' : 
                 habit.travelStyle === 'parabola' ? '💨' :
                 habit.travelStyle === 'glide' ? '🌟' :
                 habit.travelStyle === 'zigzag' ? '⚡' : '🐾'}
              </span>
            </motion.div>
          )}
          
          {isPlaying && !isMoving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-0.5"
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scaleY: [0.4, 1, 0.4], 
                    backgroundColor: ['#4ade80', '#22c55e', '#4ade80'] 
                  }}
                  transition={{ 
                    duration: 0.3, 
                    repeat: Infinity, 
                    delay: i * 0.1,
                    ease: 'easeInOut'
                  }}
                  className="w-1 h-3 bg-emerald-400 rounded-full origin-bottom"
                />
              ))}
            </motion.div>
          )}

          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ 
                opacity: [0.5, 1, 0.5], 
                y: [-8, -15, -8],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap"
            >
              💤
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

interface MascotControlsProps {
  compact?: boolean;
}

export function MascotControls({ compact = false }: MascotControlsProps) {
  const { enabled, setEnabled, animal, setAnimal, movementStyle, setMovementStyle } = useMascot();
  const animals: AnimalType[] = ['monkey', 'bird', 'frog', 'squirrel', 'cat'];
  const movements: MovementStyle[] = ['swing', 'hop', 'fly', 'climb', 'bounce'];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEnabled(!enabled)}
          className={`p-1.5 rounded transition-all ${
            enabled 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
          }`}
          title={enabled ? 'Disable mascot' : 'Enable mascot'}
          data-testid="toggle-mascot-compact"
        >
          <span className="text-lg">{enabled ? ANIMAL_EMOJIS[animal] : '🎭'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2 bg-slate-800/40 rounded-lg border border-slate-700/30">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Mascot</span>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
            enabled 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
          }`}
          data-testid="toggle-mascot"
        >
          {enabled ? 'On' : 'Off'}
        </button>
      </div>
      
      {enabled && (
        <>
          <div className="flex gap-1 flex-wrap">
            {animals.map((a) => (
              <button
                key={a}
                onClick={() => setAnimal(a)}
                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                  animal === a
                    ? 'bg-primary/20 border border-primary scale-105 shadow-md'
                    : 'bg-slate-700/50 border border-slate-600/30 hover:bg-slate-600/50'
                }`}
                title={ANIMAL_NAMES[a]}
                data-testid={`select-animal-${a}`}
              >
                <span className="text-base">{ANIMAL_EMOJIS[a]}</span>
              </button>
            ))}
          </div>
          
          <div className="text-[9px] text-slate-500 mt-1">
            {ANIMAL_NAMES[animal]}: {
              animal === 'monkey' ? 'Swings through vines' :
              animal === 'bird' ? 'Glides gracefully' :
              animal === 'frog' ? 'Leaps high' :
              animal === 'squirrel' ? 'Darts quickly' :
              'Prowls smoothly'
            }
          </div>
        </>
      )}
    </div>
  );
}

interface AnimalSelectorProps {
  selectedAnimal: AnimalType;
  onSelectAnimal: (animal: AnimalType) => void;
  enabled: boolean;
  onToggleEnabled: () => void;
}

export function AnimalSelector({ 
  selectedAnimal, 
  onSelectAnimal, 
  enabled, 
  onToggleEnabled 
}: AnimalSelectorProps) {
  const animals: AnimalType[] = ['monkey', 'bird', 'frog', 'squirrel', 'cat'];
  
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
      <button
        onClick={onToggleEnabled}
        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
          enabled 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
            : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
        }`}
        data-testid="toggle-mascot"
      >
        {enabled ? '🎭 On' : '🎭 Off'}
      </button>
      
      {enabled && (
        <div className="flex gap-1">
          {animals.map((a) => (
            <button
              key={a}
              onClick={() => onSelectAnimal(a)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                selectedAnimal === a
                  ? 'bg-primary/20 border-2 border-primary scale-110 shadow-lg'
                  : 'bg-slate-700/50 border border-slate-600/30 hover:bg-slate-600/50 hover:scale-105'
              }`}
              title={ANIMAL_NAMES[a]}
              data-testid={`select-animal-${a}`}
            >
              <span className="text-lg">{ANIMAL_EMOJIS[a]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ANIMAL_EMOJIS, ANIMAL_NAMES, MOVEMENT_NAMES, ANIMAL_HABITS };
export type { ChordAnchor };
