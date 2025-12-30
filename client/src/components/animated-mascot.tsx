import { useState, useEffect, createContext, useContext, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, animate } from 'framer-motion';

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

interface AnimalEnvironment {
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  decorations: string[];
  particles: string[];
  pathStyle: 'vine' | 'cloud' | 'water' | 'branch' | 'yarn';
  ambientAnimation: 'sway' | 'float' | 'ripple' | 'rustle' | 'drift';
}

const ANIMAL_ENVIRONMENTS: Record<AnimalType, AnimalEnvironment> = {
  monkey: {
    primaryColor: '#22c55e',
    secondaryColor: '#4ade80',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    decorations: ['🌿', '🍌', '🌴', '🍃'],
    particles: ['🍃', '✨'],
    pathStyle: 'vine',
    ambientAnimation: 'sway',
  },
  bird: {
    primaryColor: '#38bdf8',
    secondaryColor: '#7dd3fc',
    glowColor: 'rgba(56, 189, 248, 0.3)',
    decorations: ['☁️', '🌤️', '🪶', '💨'],
    particles: ['🪶', '✨', '💫'],
    pathStyle: 'cloud',
    ambientAnimation: 'float',
  },
  frog: {
    primaryColor: '#a3e635',
    secondaryColor: '#84cc16',
    glowColor: 'rgba(163, 230, 53, 0.3)',
    decorations: ['🪷', '💧', '🌸', '🍀'],
    particles: ['💧', '✨', '🫧'],
    pathStyle: 'water',
    ambientAnimation: 'ripple',
  },
  squirrel: {
    primaryColor: '#f97316',
    secondaryColor: '#fb923c',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    decorations: ['🌰', '🍂', '🍁', '🌳'],
    particles: ['🍂', '🍁', '✨'],
    pathStyle: 'branch',
    ambientAnimation: 'rustle',
  },
  cat: {
    primaryColor: '#a855f7',
    secondaryColor: '#c084fc',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    decorations: ['🧶', '🐾', '⭐', '🌙'],
    particles: ['🐾', '✨', '💜'],
    pathStyle: 'yarn',
    ambientAnimation: 'drift',
  },
};

interface AnimalHabit {
  travelEase: number[];
  arcHeight: number;
  bobAmplitude: number;
  speedMultiplier: number;
  rotationRange: number;
  squashStretch: { x: number; y: number };
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
    travelEase: [0.34, 1.56, 0.64, 1],
    arcHeight: 60,
    bobAmplitude: 12,
    speedMultiplier: 0.85,
    rotationRange: 20,
    squashStretch: { x: 1.08, y: 0.92 },
    idleAnimation: {
      y: [0, -6, 0, -3, 0],
      rotate: [-5, 5, -3, 3, 0],
      scale: [1, 1.03, 1, 1.02, 1],
    },
    idleDuration: 1.5,
    travelStyle: 'arc',
  },
  bird: {
    travelEase: [0.25, 0.1, 0.25, 1],
    arcHeight: 80,
    bobAmplitude: 15,
    speedMultiplier: 1.1,
    rotationRange: 12,
    squashStretch: { x: 1.12, y: 0.88 },
    idleAnimation: {
      y: [0, -8, 0, -4, 0],
      rotate: [0, -3, 0, 3, 0],
      scaleX: [1, 1.05, 1, 1.03, 1],
    },
    idleDuration: 0.9,
    travelStyle: 'glide',
  },
  frog: {
    travelEase: [0.34, 1.8, 0.64, 1],
    arcHeight: 90,
    bobAmplitude: 0,
    speedMultiplier: 0.75,
    rotationRange: 8,
    squashStretch: { x: 0.85, y: 1.2 },
    idleAnimation: {
      y: [0, 0, -20, 0],
      scaleY: [1, 0.75, 1.15, 1],
      scaleX: [1, 1.15, 0.9, 1],
    },
    idleDuration: 1.8,
    travelStyle: 'parabola',
  },
  squirrel: {
    travelEase: [0.5, 0, 0.2, 1],
    arcHeight: 35,
    bobAmplitude: 6,
    speedMultiplier: 1.3,
    rotationRange: 25,
    squashStretch: { x: 1.04, y: 0.96 },
    idleAnimation: {
      rotate: [0, 12, -12, 8, -8, 0],
      y: [0, -2, 0, -1, 0],
      scale: [1, 1.05, 1, 1.03, 1],
    },
    idleDuration: 0.7,
    travelStyle: 'zigzag',
  },
  cat: {
    travelEase: [0.4, 0, 0.2, 1],
    arcHeight: 15,
    bobAmplitude: 4,
    speedMultiplier: 0.95,
    rotationRange: 6,
    squashStretch: { x: 1.15, y: 0.92 },
    idleAnimation: {
      scaleX: [1, 1.08, 0.96, 1.04, 1],
      y: [0, -2, 0, -1, 0],
      rotate: [0, -2, 2, 0],
    },
    idleDuration: 2.2,
    travelStyle: 'prowl',
  },
};

interface EnvironmentLayerProps {
  animal: AnimalType;
  noteIndex: number;
  isPlaying: boolean;
  enabled?: boolean;
}

export function EnvironmentLayer({ animal, noteIndex, isPlaying, enabled = true }: EnvironmentLayerProps) {
  if (!enabled) return null;
  
  const env = ANIMAL_ENVIRONMENTS[animal];
  
  const getAmbientKeyframes = () => {
    switch (env.ambientAnimation) {
      case 'sway':
        return { rotate: [-3, 3, -3] };
      case 'float':
        return { y: [-5, 5, -5], opacity: [0.6, 1, 0.6] };
      case 'ripple':
        return { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] };
      case 'rustle':
        return { x: [-2, 2, -2], rotate: [-5, 5, -5] };
      case 'drift':
        return { x: [-3, 3, -3], y: [-2, 2, -2] };
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animal}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`envGrad-${animal}-${noteIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={env.primaryColor} stopOpacity="0.15" />
              <stop offset="50%" stopColor={env.secondaryColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={env.primaryColor} stopOpacity="0.15" />
            </linearGradient>
            <filter id={`glow-${animal}-${noteIndex}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <motion.circle 
            cx="128" cy="128" r="115" 
            fill="none" 
            stroke={`url(#envGrad-${animal}-${noteIndex})`}
            strokeWidth="6"
            strokeDasharray={env.pathStyle === 'vine' ? '12 6' : env.pathStyle === 'water' ? '4 8' : '8 4'}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '128px', originY: '128px' }}
            filter={`url(#glow-${animal}-${noteIndex})`}
          />
          
          <motion.circle 
            cx="128" cy="128" r="105" 
            fill="none" 
            stroke={env.primaryColor}
            strokeOpacity="0.1"
            strokeWidth="2"
            initial={{ rotate: 0 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '128px', originY: '128px' }}
          />
        </svg>

        {env.decorations.slice(0, 4).map((deco, i) => {
          const angle = (i * 90 + 45) * (Math.PI / 180);
          const radius = 118;
          const x = 128 + Math.cos(angle) * radius;
          const y = 128 + Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={i}
              className="absolute text-lg"
              style={{ 
                left: x, 
                top: y, 
                transform: 'translate(-50%, -50%)',
              }}
              animate={getAmbientKeyframes()}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            >
              {deco}
            </motion.div>
          );
        })}

        {isPlaying && env.particles.slice(0, 3).map((particle, i) => {
          const startAngle = (i * 120) * (Math.PI / 180);
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute text-sm opacity-60"
              style={{ left: 128, top: 128 }}
              animate={{
                x: [0, Math.cos(startAngle) * 80, Math.cos(startAngle) * 120],
                y: [0, Math.sin(startAngle) * 80 - 30, Math.sin(startAngle) * 120],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.2, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: 'easeOut',
              }}
            >
              {particle}
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

// Artistic path segment for travel animations
interface PathSegment {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
  duration: number;
  animal: AnimalType;
}

// Monkey Vine Path Component
function MonkeyVinePath({ segment }: { segment: PathSegment }) {
  const { startX, startY, endX, endY, controlX, controlY, duration } = segment;
  
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main vine */}
      <motion.path
        d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
        fill="none"
        stroke="#22c55e"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.8 }}
        animate={{ pathLength: 1, opacity: [0.8, 0.6, 0] }}
        transition={{ duration: duration * 1.5, ease: "easeOut" }}
      />
      {/* Vine spiral detail */}
      <motion.path
        d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
        fill="none"
        stroke="#4ade80"
        strokeWidth="2"
        strokeDasharray="8 12"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1, opacity: [0.6, 0.4, 0] }}
        transition={{ duration: duration * 1.5, delay: 0.1, ease: "easeOut" }}
      />
      {/* Leaves along the vine */}
      {[0.2, 0.5, 0.8].map((t, i) => {
        const px = startX + (endX - startX) * t + (controlX - (startX + endX) / 2) * 4 * t * (1 - t);
        const py = startY + (endY - startY) * t + (controlY - (startY + endY) / 2) * 4 * t * (1 - t);
        return (
          <motion.g key={i} style={{ transformOrigin: `${px}px ${py}px` }}>
            <motion.text
              x={px}
              y={py}
              fontSize="16"
              textAnchor="middle"
              dominantBaseline="middle"
              initial={{ opacity: 0, scale: 0, rotate: -30 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                scale: [0.3, 1.2, 1, 0.5],
                rotate: [-30, 10, -5, 20],
              }}
              transition={{ 
                duration: duration * 1.2, 
                delay: t * duration * 0.3,
                ease: "easeOut" 
              }}
            >
              {i % 2 === 0 ? '🍃' : '🌿'}
            </motion.text>
          </motion.g>
        );
      })}
    </motion.g>
  );
}

// Bird Cloud Path Component
function BirdCloudPath({ segment }: { segment: PathSegment }) {
  const { startX, startY, endX, endY, controlX, controlY, duration } = segment;
  
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Swooping flight trail */}
      <motion.path
        d={`M ${startX} ${startY} Q ${controlX} ${controlY - 40} ${endX} ${endY}`}
        fill="none"
        stroke="url(#skyGradient)"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1, opacity: [0.4, 0.2, 0] }}
        transition={{ duration: duration * 1.3, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Cloud puffs along path */}
      {[0.15, 0.4, 0.65, 0.9].map((t, i) => {
        const px = startX + (endX - startX) * t + (controlX - (startX + endX) / 2) * 4 * t * (1 - t);
        const py = startY + (endY - startY) * t + (controlY - 40 - (startY + endY) / 2) * 4 * t * (1 - t);
        return (
          <motion.text
            key={i}
            x={px}
            y={py + i * 3}
            fontSize={14 + i * 2}
            textAnchor="middle"
            dominantBaseline="middle"
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0.6, 0], 
              scale: [0.5, 1.3, 1.1, 0.8],
              y: [0, -8, -15, -25],
            }}
            transition={{ 
              duration: duration * 1.5, 
              delay: t * duration * 0.2,
              ease: "easeOut" 
            }}
          >
            {i % 2 === 0 ? '☁️' : '🪶'}
          </motion.text>
        );
      })}
      {/* Wind whoosh effect */}
      <motion.text
        x={startX + (endX - startX) * 0.5}
        y={controlY - 60}
        fontSize="18"
        textAnchor="middle"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: [0, 0.7, 0], x: [0, 30, 60] }}
        transition={{ duration: duration * 0.8, ease: "easeOut" }}
      >
        💨
      </motion.text>
    </motion.g>
  );
}

// Frog Lily Pad Path Component
function FrogLilyPadPath({ segment }: { segment: PathSegment }) {
  const { startX, startY, endX, endY, controlX, controlY, duration } = segment;
  
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Water ripple arc */}
      <motion.ellipse
        cx={(startX + endX) / 2}
        cy={Math.max(startY, endY) + 10}
        rx={Math.abs(endX - startX) / 2 + 20}
        ry={15}
        fill="none"
        stroke="#a3e635"
        strokeWidth="2"
        strokeDasharray="6 4"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.2, 1.5], opacity: [0, 0.5, 0] }}
        transition={{ duration: duration * 1.2, ease: "easeOut" }}
      />
      {/* Lily pads as stepping stones */}
      {[0.15, 0.5, 0.85].map((t, i) => {
        const hopHeight = Math.sin(t * Math.PI) * 50;
        const px = startX + (endX - startX) * t;
        const py = Math.max(startY, endY) + 15 - hopHeight * 0.2;
        return (
          <motion.g key={i}>
            {/* Lily pad */}
            <motion.text
              x={px}
              y={py}
              fontSize="22"
              textAnchor="middle"
              dominantBaseline="middle"
              initial={{ opacity: 0, scale: 0, rotate: -20 }}
              animate={{ 
                opacity: [0, 1, 0.8, 0], 
                scale: [0.3, 1.1, 1, 0.6],
                rotate: [-20, 5, 0, 10],
              }}
              transition={{ 
                duration: duration * 1.3, 
                delay: t * duration * 0.4,
                ease: "easeOut" 
              }}
            >
              🪷
            </motion.text>
            {/* Water splash */}
            <motion.text
              x={px}
              y={py + 15}
              fontSize="14"
              textAnchor="middle"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ 
                opacity: [0, 0.9, 0], 
                scale: [0.3, 1.5, 2],
                y: [0, 5, 15],
              }}
              transition={{ 
                duration: duration * 0.6, 
                delay: t * duration * 0.4 + 0.15,
                ease: "easeOut" 
              }}
            >
              💧
            </motion.text>
          </motion.g>
        );
      })}
      {/* Bubble trail */}
      {[0.3, 0.6].map((t, i) => {
        const px = startX + (endX - startX) * t + (Math.random() - 0.5) * 30;
        const py = startY + (endY - startY) * t;
        return (
          <motion.text
            key={`bubble-${i}`}
            x={px}
            y={py}
            fontSize="12"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.7, 0], y: [0, -30, -50] }}
            transition={{ 
              duration: duration * 1.2, 
              delay: t * duration * 0.3,
              ease: "easeOut" 
            }}
          >
            🫧
          </motion.text>
        );
      })}
    </motion.g>
  );
}

// Squirrel Branch Path Component
function SquirrelBranchPath({ segment }: { segment: PathSegment }) {
  const { startX, startY, endX, endY, controlX, controlY, duration } = segment;
  
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Main branch */}
      <motion.path
        d={`M ${startX} ${startY} Q ${controlX} ${controlY + 15} ${endX} ${endY}`}
        fill="none"
        stroke="#92400e"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.7 }}
        animate={{ pathLength: 1, opacity: [0.7, 0.5, 0] }}
        transition={{ duration: duration * 1.2, ease: "easeOut" }}
      />
      {/* Branch texture */}
      <motion.path
        d={`M ${startX} ${startY} Q ${controlX} ${controlY + 15} ${endX} ${endY}`}
        fill="none"
        stroke="#78350f"
        strokeWidth="2"
        strokeDasharray="4 8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1, opacity: [0.5, 0.3, 0] }}
        transition={{ duration: duration * 1.2, delay: 0.05, ease: "easeOut" }}
      />
      {/* Leaves and acorns along branch */}
      {[0.2, 0.45, 0.7, 0.95].map((t, i) => {
        const px = startX + (endX - startX) * t + (controlX - (startX + endX) / 2) * 4 * t * (1 - t);
        const py = startY + (endY - startY) * t + (controlY + 15 - (startY + endY) / 2) * 4 * t * (1 - t);
        const isAcorn = i % 2 === 1;
        return (
          <motion.text
            key={i}
            x={px + (isAcorn ? 0 : (i % 2 === 0 ? -8 : 8))}
            y={py + (isAcorn ? 12 : -8)}
            fontSize={isAcorn ? "14" : "16"}
            textAnchor="middle"
            dominantBaseline="middle"
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 0.8, 0], 
              scale: [0.3, 1.2, 1, 0.5],
              rotate: isAcorn ? [0, 0, 0] : [-10, 15, -5, 25],
            }}
            transition={{ 
              duration: duration * 1.1, 
              delay: t * duration * 0.25,
              ease: "easeOut" 
            }}
          >
            {isAcorn ? '🌰' : (i === 0 ? '🍂' : '🍁')}
          </motion.text>
        );
      })}
      {/* Quick scamper dust */}
      <motion.text
        x={startX + 15}
        y={startY + 10}
        fontSize="14"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0], x: [-10, 0, 10], scale: [0.5, 1, 1.5] }}
        transition={{ duration: duration * 0.4, ease: "easeOut" }}
      >
        ✨
      </motion.text>
    </motion.g>
  );
}

// Cat Yarn Path Component
function CatYarnPath({ segment }: { segment: PathSegment }) {
  const { startX, startY, endX, endY, controlX, controlY, duration } = segment;
  
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Yarn trail - wavy line */}
      <motion.path
        d={`M ${startX} ${startY} 
            C ${startX + 20} ${startY - 10}, ${startX + 40} ${startY + 10}, ${(startX + endX) / 2 - 20} ${(startY + endY) / 2}
            S ${endX - 30} ${endY + 8}, ${endX} ${endY}`}
        fill="none"
        stroke="#a855f7"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.8 }}
        animate={{ pathLength: 1, opacity: [0.8, 0.6, 0] }}
        transition={{ duration: duration * 1.4, ease: "easeInOut" }}
      />
      {/* Yarn texture (dashed overlay) */}
      <motion.path
        d={`M ${startX} ${startY} 
            C ${startX + 20} ${startY - 10}, ${startX + 40} ${startY + 10}, ${(startX + endX) / 2 - 20} ${(startY + endY) / 2}
            S ${endX - 30} ${endY + 8}, ${endX} ${endY}`}
        fill="none"
        stroke="#c084fc"
        strokeWidth="2"
        strokeDasharray="3 6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1, opacity: [0.6, 0.4, 0] }}
        transition={{ duration: duration * 1.4, delay: 0.1, ease: "easeInOut" }}
      />
      {/* Yarn ball at start */}
      <motion.text
        x={startX}
        y={startY}
        fontSize="18"
        textAnchor="middle"
        dominantBaseline="middle"
        initial={{ opacity: 0.8, scale: 1, rotate: 0 }}
        animate={{ 
          opacity: [0.8, 0.6, 0], 
          scale: [1, 0.8, 0.5],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: duration * 1.2, ease: "easeOut" }}
      >
        🧶
      </motion.text>
      {/* Paw prints along path */}
      {[0.25, 0.5, 0.75].map((t, i) => {
        const px = startX + (endX - startX) * t;
        const py = startY + (endY - startY) * t + (i % 2 === 0 ? -5 : 5);
        return (
          <motion.text
            key={i}
            x={px}
            y={py + 20}
            fontSize="14"
            textAnchor="middle"
            style={{ transform: `rotate(${(endX > startX ? 1 : -1) * 15}deg)` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.9, 0.7, 0], 
              scale: [0.3, 1.1, 1, 0.6],
            }}
            transition={{ 
              duration: duration * 1.3, 
              delay: t * duration * 0.35,
              ease: "easeOut" 
            }}
          >
            🐾
          </motion.text>
        );
      })}
      {/* Sparkle effect */}
      {[0.3, 0.7].map((t, i) => {
        const px = startX + (endX - startX) * t + (i === 0 ? -15 : 15);
        const py = startY + (endY - startY) * t - 10;
        return (
          <motion.text
            key={`star-${i}`}
            x={px}
            y={py}
            fontSize="12"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0.3, 1.2, 0.5],
              rotate: [0, 180],
            }}
            transition={{ 
              duration: duration * 0.8, 
              delay: t * duration * 0.3,
              ease: "easeOut" 
            }}
          >
            {i === 0 ? '⭐' : '💜'}
          </motion.text>
        );
      })}
    </motion.g>
  );
}

// Route to correct animal path renderer
function ArtisticPath({ segment }: { segment: PathSegment }) {
  switch (segment.animal) {
    case 'monkey':
      return <MonkeyVinePath segment={segment} />;
    case 'bird':
      return <BirdCloudPath segment={segment} />;
    case 'frog':
      return <FrogLilyPadPath segment={segment} />;
    case 'squirrel':
      return <SquirrelBranchPath segment={segment} />;
    case 'cat':
      return <CatYarnPath segment={segment} />;
    default:
      return null;
  }
}

interface GlobalMascotProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function GlobalMascot({ containerRef }: GlobalMascotProps) {
  const { enabled, animal, currentAnchor, isPlaying, tempo, anchors } = useMascot();
  const [facingRight, setFacingRight] = useState(true);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]);
  const trailIdRef = useRef(0);
  const pathIdRef = useRef(0);
  const lastAnchorRef = useRef<string | null>(null);
  const lastUpdateTimeRef = useRef(0);
  const idlePatrolIndexRef = useRef(0);
  const idlePatrolIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const x = useMotionValue(200);
  const y = useMotionValue(200);
  const smoothX = useSpring(x, { stiffness: 120, damping: 25, mass: 0.8 });
  const smoothY = useSpring(y, { stiffness: 120, damping: 25, mass: 0.8 });

  const habit = ANIMAL_HABITS[animal];
  const env = ANIMAL_ENVIRONMENTS[animal];
  const beatDuration = 60 / tempo;

  // Move mascot to a specific position with animation and artistic path
  const moveToPosition = useCallback((newX: number, newY: number, duration: number) => {
    const currentX = x.get();
    const currentY = y.get();
    const dx = newX - currentX;
    
    if (Math.abs(dx) > 15) {
      setFacingRight(dx > 0);
    }

    // Create artistic path segment
    pathIdRef.current++;
    const controlX = (currentX + newX) / 2;
    const controlY = Math.min(currentY, newY) - habit.arcHeight;
    
    const newPath: PathSegment = {
      id: pathIdRef.current,
      startX: currentX,
      startY: currentY,
      endX: newX,
      endY: newY,
      controlX,
      controlY,
      duration,
      animal,
    };
    
    setPathSegments(prev => [...prev.slice(-2), newPath]);
    
    // Clean up old paths after animation
    setTimeout(() => {
      setPathSegments(prev => prev.filter(p => p.id !== newPath.id));
    }, duration * 1500 + 500);

    trailIdRef.current++;
    setTrail(prev => [...prev.slice(-4), { 
      x: currentX, 
      y: currentY, 
      id: trailIdRef.current 
    }]);
    
    animate(x, newX, {
      duration,
      ease: habit.travelEase as any,
    });
    
    const midY = Math.min(currentY, newY) - habit.arcHeight;
    animate(y, [currentY, midY, newY], {
      duration,
      ease: habit.travelEase as any,
      times: [0, 0.4, 1],
    });
  }, [x, y, habit.travelEase, habit.arcHeight, animal]);

  // Active playback movement - follows current anchor
  useEffect(() => {
    if (!currentAnchor || !containerRef.current || !isPlaying) return;
    if (lastAnchorRef.current === currentAnchor.id) return;
    
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 100) return;
    lastUpdateTimeRef.current = now;
    
    lastAnchorRef.current = currentAnchor.id;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = Math.round(currentAnchor.x - containerRect.left);
    const newY = Math.round(currentAnchor.y - containerRect.top - 30);

    const duration = beatDuration * habit.speedMultiplier;
    moveToPosition(newX, newY, duration);

  }, [currentAnchor, containerRef, isPlaying, beatDuration, habit, moveToPosition]);

  // Idle patrol movement - mascot wanders between anchors when not playing
  useEffect(() => {
    if (isPlaying || !enabled || !containerRef.current) {
      // Clear patrol when playing starts
      if (idlePatrolIntervalRef.current) {
        clearInterval(idlePatrolIntervalRef.current);
        idlePatrolIntervalRef.current = null;
      }
      return;
    }

    const patrolToNextAnchor = () => {
      const anchorArray = Array.from(anchors.values());
      if (anchorArray.length === 0 || !containerRef.current) return;

      idlePatrolIndexRef.current = (idlePatrolIndexRef.current + 1) % anchorArray.length;
      const targetAnchor = anchorArray[idlePatrolIndexRef.current];
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = Math.round(targetAnchor.x - containerRect.left);
      const newY = Math.round(targetAnchor.y - containerRect.top - 30);

      // Slower, more leisurely movement when idle
      const duration = 1.5 * habit.speedMultiplier;
      moveToPosition(newX, newY, duration);
    };

    // Start patrol after a short delay
    const startDelay = setTimeout(() => {
      patrolToNextAnchor(); // Initial move
      // Then patrol every 3-4 seconds
      idlePatrolIntervalRef.current = setInterval(patrolToNextAnchor, 3000 + Math.random() * 1000);
    }, 500);

    return () => {
      clearTimeout(startDelay);
      if (idlePatrolIntervalRef.current) {
        clearInterval(idlePatrolIntervalRef.current);
        idlePatrolIntervalRef.current = null;
      }
    };
  }, [isPlaying, enabled, anchors, containerRef, habit.speedMultiplier, moveToPosition]);

  if (!enabled) return null;

  const emoji = ANIMAL_EMOJIS[animal];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 100 }}>
      {/* Artistic Path SVG Layer */}
      <svg 
        className="absolute inset-0 w-full h-full overflow-visible" 
        style={{ zIndex: 99 }}
      >
        <AnimatePresence>
          {pathSegments.map((segment) => (
            <ArtisticPath key={segment.id} segment={segment} />
          ))}
        </AnimatePresence>
      </svg>

      {/* Particle Trail */}
      <AnimatePresence>
        {trail.map((point, i) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.6, scale: 0.7 }}
            animate={{ opacity: 0, scale: 0.2, y: 8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: i * 0.03 }}
            className="absolute"
            style={{ left: point.x, top: point.y, transform: 'translate(-50%, -50%)' }}
          >
            <span className="text-base" style={{ color: env.primaryColor }}>{env.particles[0]}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        className="absolute"
        style={{ 
          x: smoothX, 
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          animate={!isPlaying ? habit.idleAnimation : {}}
          transition={{ 
            duration: habit.idleDuration, 
            repeat: Infinity, 
            repeatType: 'loop',
            ease: 'easeInOut'
          }}
          className="relative"
        >
          <motion.span 
            className="text-4xl drop-shadow-xl select-none block"
            animate={{
              scaleX: facingRight ? 1 : -1,
            }}
            transition={{ duration: 0.15 }}
            style={{
              filter: isPlaying 
                ? `brightness(1.15) drop-shadow(0 0 8px ${env.glowColor})` 
                : 'brightness(1)',
            }}
          >
            {emoji}
          </motion.span>
          
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-0.5"
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scaleY: [0.4, 1, 0.4], 
                  }}
                  transition={{ 
                    duration: 0.25, 
                    repeat: Infinity, 
                    delay: i * 0.08,
                    ease: 'easeInOut'
                  }}
                  className="w-1 h-3 rounded-full origin-bottom"
                  style={{ backgroundColor: env.primaryColor }}
                />
              ))}
            </motion.div>
          )}

          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ 
                opacity: [0.6, 1, 0.6], 
                y: [-4, -8, -4],
                x: [-3, 3, -3],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 left-1/2 -translate-x-1/2"
            >
              <span className="text-sm">👀</span>
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
  const { enabled, setEnabled, animal, setAnimal } = useMascot();
  const animals: AnimalType[] = ['monkey', 'bird', 'frog', 'squirrel', 'cat'];

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
            {animals.map((a) => {
              const env = ANIMAL_ENVIRONMENTS[a];
              return (
                <button
                  key={a}
                  onClick={() => setAnimal(a)}
                  className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                    animal === a
                      ? 'scale-105 shadow-md'
                      : 'bg-slate-700/50 border border-slate-600/30 hover:bg-slate-600/50'
                  }`}
                  style={animal === a ? { 
                    backgroundColor: `${env.primaryColor}20`,
                    borderColor: env.primaryColor,
                    borderWidth: '1px',
                  } : {}}
                  title={ANIMAL_NAMES[a]}
                  data-testid={`select-animal-${a}`}
                >
                  <span className="text-base">{ANIMAL_EMOJIS[a]}</span>
                </button>
              );
            })}
          </div>
          
          <div className="text-[9px] text-slate-500 mt-1">
            {ANIMAL_NAMES[animal]}: {
              animal === 'monkey' ? 'Jungle vines & bananas' :
              animal === 'bird' ? 'Sky clouds & feathers' :
              animal === 'frog' ? 'Lily pads & water' :
              animal === 'squirrel' ? 'Autumn leaves & acorns' :
              'Cozy yarn & paw prints'
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

export { ANIMAL_EMOJIS, ANIMAL_NAMES, MOVEMENT_NAMES, ANIMAL_HABITS, ANIMAL_ENVIRONMENTS };
export type { ChordAnchor };
