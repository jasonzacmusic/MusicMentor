import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AnimalType = 'monkey' | 'bird' | 'frog' | 'squirrel' | 'cat';

interface AnimatedMascotProps {
  animal: AnimalType;
  position: { x: number; y: number };
  isPlaying: boolean;
  isJumping: boolean;
  direction: 'left' | 'right';
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

export function AnimatedMascot({ 
  animal, 
  position, 
  isPlaying, 
  isJumping,
  direction 
}: AnimatedMascotProps) {
  const [bounce, setBounce] = useState(0);
  
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setBounce(prev => (prev + 1) % 4);
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const emoji = ANIMAL_EMOJIS[animal];
  
  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      initial={false}
      animate={{
        x: position.x,
        y: position.y,
        scale: isJumping ? 1.3 : 1,
        rotate: isJumping ? (direction === 'right' ? 15 : -15) : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        mass: 0.8,
      }}
      style={{
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        animate={{
          y: isPlaying ? [0, -8, 0, -4, 0][bounce] : 0,
          rotate: isPlaying ? [-5, 5, -5, 0][bounce] : 0,
        }}
        transition={{ duration: 0.15 }}
        className="relative"
      >
        <span 
          className="text-3xl drop-shadow-lg select-none"
          style={{
            filter: isJumping ? 'brightness(1.2)' : 'none',
            transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        >
          {emoji}
        </span>
        
        {isJumping && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <span className="text-lg">✨</span>
          </motion.div>
        )}
        
        {isPlaying && !isJumping && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.5, 1, 0.5] }}
                transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.1 }}
                className="w-0.5 h-2 bg-primary/60 rounded-full"
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

interface VineRopeProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isActive: boolean;
}

export function VineRope({ startX, startY, endX, endY, isActive }: VineRopeProps) {
  const midX = (startX + endX) / 2;
  const midY = Math.max(startY, endY) + 15;
  
  const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
  
  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 5 }}
    >
      <defs>
        <linearGradient id="vineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#22c55e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      
      <motion.path
        d={path}
        fill="none"
        stroke="url(#vineGradient)"
        strokeWidth={isActive ? 4 : 3}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ 
          pathLength: 1,
          strokeWidth: isActive ? 4 : 3,
        }}
        transition={{ duration: 0.5 }}
      />
      
      {[0.2, 0.5, 0.8].map((t, i) => {
        const leafX = startX + (endX - startX) * t;
        const leafY = startY + (endY - startY) * t + 8;
        return (
          <motion.text
            key={i}
            x={leafX}
            y={leafY}
            fontSize="10"
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              y: [leafY, leafY - 2, leafY],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.3,
            }}
            style={{ transformOrigin: `${leafX}px ${leafY}px` }}
          >
            🍃
          </motion.text>
        );
      })}
    </svg>
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
          {animals.map((animal) => (
            <button
              key={animal}
              onClick={() => onSelectAnimal(animal)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                selectedAnimal === animal
                  ? 'bg-primary/20 border-2 border-primary scale-110 shadow-lg'
                  : 'bg-slate-700/50 border border-slate-600/30 hover:bg-slate-600/50 hover:scale-105'
              }`}
              title={ANIMAL_NAMES[animal]}
              data-testid={`select-animal-${animal}`}
            >
              <span className="text-lg">{ANIMAL_EMOJIS[animal]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ANIMAL_EMOJIS, ANIMAL_NAMES };
