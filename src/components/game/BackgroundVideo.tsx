import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Import zone background images
import bgZone1 from '@/assets/bg-zone1-city.jpg';
import bgZone2 from '@/assets/bg-zone2-factory.jpg';
import bgZone3 from '@/assets/bg-zone3-datacore.jpg';
import bgZone4 from '@/assets/bg-zone4-rooftop.jpg';
import bgZone5 from '@/assets/bg-zone5-boss.jpg';

interface BackgroundVideoProps {
  distance: number;
  cameraX: number;
  isUltraMode: boolean;
  isBossFight: boolean;
}

const ZONES = [
  { name: 'NEON CITY', bg: bgZone1, start: 0, color: '#00ffff' },
  { name: 'FACTORY', bg: bgZone2, start: 2000, color: '#ff6600' },
  { name: 'DATA CORE', bg: bgZone3, start: 4000, color: '#8800ff' },
  { name: 'ROOFTOPS', bg: bgZone4, start: 6000, color: '#ff0088' },
  { name: 'BOSS LAIR', bg: bgZone5, start: 8000, color: '#ff0000' },
];

const getZone = (distance: number) => {
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (distance >= ZONES[i].start) return { zone: ZONES[i], index: i };
  }
  return { zone: ZONES[0], index: 0 };
};

export const BackgroundVideo = ({ distance, cameraX, isUltraMode, isBossFight }: BackgroundVideoProps) => {
  const { zone: currentZone, index: zoneIndex } = getZone(distance);
  const nextZone = ZONES[Math.min(zoneIndex + 1, ZONES.length - 1)];
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
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base background image with parallax */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${currentZone.bg})`,
          backgroundPosition: `${parallaxX}px center`,
          filter: isBossFight ? 'brightness(0.6) saturate(1.4)' : 'brightness(0.8)',
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
      
      {/* Next zone crossfade */}
      {zoneProgress > 0.6 && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${nextZone.bg})`,
            backgroundPosition: `${parallaxX}px center`,
            opacity: (zoneProgress - 0.6) * 2.5,
          }}
        />
      )}
      
      {/* Animated video-like overlay */}
      {animatedElements}
      
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
