import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface BackgroundVideoProps {
  distance: number;
  cameraX: number;
  isUltraMode: boolean;
  isBossFight: boolean;
}

// Zones progress from peaceful green to dark evil
const ZONES = [
  { name: 'GREEN PASTURES', start: 0, color: '#88cc44', skyGradient: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 40%, #228B22 100%)', groundColor: '#4a7c23' },
  { name: 'TWILIGHT WOODS', start: 2000, color: '#cc8844', skyGradient: 'linear-gradient(180deg, #FF8C00 0%, #8B4513 50%, #2F1810 100%)', groundColor: '#3d2817' },
  { name: 'DARK MARSHES', start: 4000, color: '#6644aa', skyGradient: 'linear-gradient(180deg, #4B0082 0%, #2E0854 50%, #1a0a2e 100%)', groundColor: '#1a1a2e' },
  { name: 'CURSED LANDS', start: 6000, color: '#aa2255', skyGradient: 'linear-gradient(180deg, #4a0a0a 0%, #2a0505 50%, #0a0202 100%)', groundColor: '#1a0505' },
  { name: 'DEMON FORTRESS', start: 8000, color: '#ff0000', skyGradient: 'linear-gradient(180deg, #330000 0%, #1a0000 40%, #0a0000 100%)', groundColor: '#0a0000' },
];

const getZone = (distance: number) => {
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (distance >= ZONES[i].start) return { zone: ZONES[i], index: i };
  }
  return { zone: ZONES[0], index: 0 };
};

export const BackgroundVideo = ({ distance, cameraX, isUltraMode, isBossFight }: BackgroundVideoProps) => {
  const { zone: currentZone, index: zoneIndex } = getZone(distance);
  const zoneProgress = (distance - currentZone.start) / 2000;
  
  // Parallax offset
  const parallaxX = -(cameraX * 0.08) % 400;
  
  // Animated elements to simulate video
  const animatedElements = useMemo(() => {
    const elements: JSX.Element[] = [];
    
    // Floating particles
    for (let i = 0; i < 8; i++) {
      elements.push(
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i * 7) % 60}%`,
            background: currentZone.color,
            boxShadow: `0 0 8px ${currentZone.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      );
    }
    
    // Scanning lines
    elements.push(
      <motion.div
        key="scan-line"
        className="absolute left-0 right-0 h-1 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${currentZone.color}44, transparent)`,
        }}
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    );
    
    // Glowing orbs
    for (let i = 0; i < 3; i++) {
      elements.push(
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 50 + i * 20,
            height: 50 + i * 20,
            left: `${20 + i * 25}%`,
            top: `${30 + i * 15}%`,
            background: `radial-gradient(circle, ${currentZone.color}33, transparent)`,
            filter: 'blur(10px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      );
    }
    
    return elements;
  }, [currentZone.color]);
  
  // Burning jets flying past
  const burningJets = useMemo(() => {
    const jets: JSX.Element[] = [];
    for (let i = 0; i < 3; i++) {
      jets.push(
        <motion.div
          key={`jet-${i}`}
          className="absolute pointer-events-none"
          style={{
            top: `${10 + i * 15}%`,
            width: 60,
            height: 20,
          }}
          animate={{
            x: ['120%', '-120%'],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 3,
            ease: 'linear',
          }}
        >
          {/* Jet body - flat */}
          <div 
            className="absolute w-full h-3"
            style={{
              background: 'linear-gradient(90deg, #333 0%, #555 50%, #333 100%)',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          {/* Jet nose */}
          <div 
            className="absolute w-4 h-2"
            style={{
              background: '#666',
              left: -4,
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: '50% 0 0 50%',
            }}
          />
          {/* Burning trail */}
          <motion.div
            className="absolute"
            style={{
              right: -40,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 50,
              height: 8,
              background: 'linear-gradient(90deg, #ff6600, #ff4400, #ff2200, transparent)',
              filter: 'blur(2px)',
              borderRadius: '0 50% 50% 0',
            }}
            animate={{
              scaleX: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
            }}
          />
          {/* Smoke trail */}
          <motion.div
            className="absolute"
            style={{
              right: -80,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 60,
              height: 12,
              background: 'linear-gradient(90deg, rgba(100,100,100,0.5), transparent)',
              filter: 'blur(4px)',
            }}
            animate={{
              scaleY: [1, 1.5, 1],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
            }}
          />
        </motion.div>
      );
    }
    return jets;
  }, []);

  // Calculate transition progress between zones
  const nextZone = ZONES[Math.min(zoneIndex + 1, ZONES.length - 1)];
  const transitionProgress = Math.min(1, Math.max(0, (zoneProgress - 0.7) / 0.3));
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base sky gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: currentZone.skyGradient,
          filter: isBossFight ? 'brightness(0.6) saturate(1.4)' : 'brightness(0.9)',
        }}
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Next zone crossfade for smooth transition */}
      {transitionProgress > 0 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: nextZone.skyGradient,
            opacity: transitionProgress,
          }}
        />
      )}
      
      {/* Animated video-like overlay */}
      {animatedElements}
      
      {/* Burning jets flying past */}
      {burningJets}
      
      {/* Color overlay based on zone */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${currentZone.color}44, transparent 60%)`,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      
      {/* Ultra mode overlay */}
      {isUltraMode && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,0,255,0.3), transparent 50%)',
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      )}
      
      {/* Boss fight red overlay */}
      {isBossFight && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,0,0,0.3) 100%)',
          }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
};
