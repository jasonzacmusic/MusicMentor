import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface GlobalMascotProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function GlobalMascot({ containerRef }: GlobalMascotProps) {
  const { enabled, animal, movementStyle, currentAnchor, isPlaying } = useMascot();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [bounce, setBounce] = useState(0);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const trailIdRef = useRef(0);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setBounce(prev => (prev + 1) % 8);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!currentAnchor || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = currentAnchor.x - containerRect.left;
    const newY = currentAnchor.y - containerRect.top - 40;

    setPrevPosition(position);
    setDirection(newX > position.x ? 'right' : 'left');
    setIsMoving(true);
    
    trailIdRef.current++;
    setTrail(prev => [...prev.slice(-5), { x: position.x, y: position.y, id: trailIdRef.current }]);

    setPosition({ x: newX, y: newY });

    const timeout = setTimeout(() => setIsMoving(false), 600);
    return () => clearTimeout(timeout);
  }, [currentAnchor, containerRef]);

  if (!enabled) return null;

  const emoji = ANIMAL_EMOJIS[animal];
  
  const getMovementAnimation = () => {
    const dx = position.x - prevPosition.x;
    const dy = position.y - prevPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    switch (movementStyle) {
      case 'swing':
        return {
          x: position.x,
          y: position.y,
          rotate: isMoving ? [0, -30, 30, -15, 0] : 0,
          scale: isMoving ? [1, 1.2, 0.9, 1.1, 1] : 1,
        };
      case 'hop':
        return {
          x: position.x,
          y: isMoving ? [prevPosition.y, position.y - 60, position.y - 30, position.y] : position.y,
          rotate: isMoving ? [0, 15, -15, 0] : 0,
          scale: isMoving ? [1, 1.3, 1.1, 1] : 1,
        };
      case 'fly':
        return {
          x: position.x,
          y: position.y,
          rotate: isMoving ? (direction === 'right' ? [0, -20, -10, 0] : [0, 20, 10, 0]) : 0,
          scale: isMoving ? [1, 0.8, 1.1, 1] : 1,
        };
      case 'climb':
        return {
          x: position.x,
          y: position.y,
          rotate: isMoving ? [0, 45, -45, 30, -30, 0] : 0,
          scale: isMoving ? [1, 0.9, 1.1, 0.95, 1.05, 1] : 1,
        };
      case 'bounce':
        return {
          x: position.x,
          y: isMoving ? [prevPosition.y, position.y - 80, position.y + 20, position.y - 40, position.y] : position.y,
          rotate: isMoving ? [0, 360, 720] : 0,
          scale: isMoving ? [1, 0.7, 1.4, 0.9, 1] : 1,
        };
      default:
        return { x: position.x, y: position.y, rotate: 0, scale: 1 };
    }
  };

  const getTransition = () => {
    switch (movementStyle) {
      case 'swing':
        return { type: 'spring', stiffness: 120, damping: 12, mass: 1 };
      case 'hop':
        return { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] };
      case 'fly':
        return { duration: 0.8, ease: 'easeInOut' };
      case 'climb':
        return { duration: 0.6, ease: [0.45, 0, 0.55, 1] };
      case 'bounce':
        return { duration: 0.7, ease: [0.36, 0, 0.66, -0.56] };
      default:
        return { type: 'spring', stiffness: 200, damping: 20 };
    }
  };

  const getIdleAnimation = () => {
    if (!isPlaying) return {};
    
    switch (animal) {
      case 'monkey':
        return { y: [0, -10, 0], rotate: [-5, 5, -5] };
      case 'bird':
        return { y: [0, -15, 0, -8, 0], scale: [1, 1.1, 1, 1.05, 1] };
      case 'frog':
        return { y: [0, -20, 0], scaleY: [1, 0.8, 1.2, 1] };
      case 'squirrel':
        return { rotate: [0, 10, -10, 5, 0], x: [0, 3, -3, 0] };
      case 'cat':
        return { scaleX: [1, 1.1, 0.9, 1], y: [0, -5, 0] };
      default:
        return {};
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 100 }}>
      <AnimatePresence>
        {trail.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.6, scale: 0.8 }}
            animate={{ opacity: 0, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute"
            style={{ left: point.x, top: point.y, transform: 'translate(-50%, -50%)' }}
          >
            <span className="text-xl opacity-40">✨</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {isMoving && movementStyle === 'swing' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.path
            d={`M ${prevPosition.x} ${prevPosition.y - 50} Q ${(prevPosition.x + position.x) / 2} ${Math.min(prevPosition.y, position.y) - 100} ${position.x} ${position.y - 50}`}
            fill="none"
            stroke="url(#vineSwingGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <defs>
            <linearGradient id="vineSwingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      )}

      <motion.div
        className="absolute"
        initial={false}
        animate={getMovementAnimation()}
        transition={getTransition()}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <motion.div
          animate={getIdleAnimation()}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.1 }}
          className="relative"
        >
          <motion.span 
            className="text-4xl drop-shadow-xl select-none block"
            style={{
              filter: isMoving ? 'brightness(1.3) drop-shadow(0 0 10px rgba(74, 222, 128, 0.5))' : 'none',
              transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            }}
            animate={{
              scale: isPlaying ? [1, 1.1, 1][bounce % 3] : 1,
            }}
          >
            {emoji}
          </motion.span>
          
          {isMoving && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: [0, 1.5, 1] }}
              exit={{ opacity: 0 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2"
            >
              <span className="text-2xl">
                {movementStyle === 'swing' ? '🌿' : 
                 movementStyle === 'hop' ? '💫' :
                 movementStyle === 'fly' ? '🌟' :
                 movementStyle === 'climb' ? '🍃' : '⭐'}
              </span>
            </motion.div>
          )}
          
          {isPlaying && !isMoving && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1"
            >
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [0.3, 1, 0.3], backgroundColor: ['#4ade80', '#22c55e', '#4ade80'] }}
                  transition={{ duration: 0.25, repeat: Infinity, delay: i * 0.08 }}
                  className="w-1 h-3 bg-emerald-400 rounded-full"
                />
              ))}
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
          
          <div className="flex gap-1 flex-wrap">
            {movements.map((m) => (
              <button
                key={m}
                onClick={() => setMovementStyle(m)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all ${
                  movementStyle === m
                    ? 'bg-primary/20 text-primary border border-primary/50'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-600/50'
                }`}
                title={MOVEMENT_NAMES[m]}
                data-testid={`select-movement-${m}`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
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

export { ANIMAL_EMOJIS, ANIMAL_NAMES, MOVEMENT_NAMES };
export type { ChordAnchor };
