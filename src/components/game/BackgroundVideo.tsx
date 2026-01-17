import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

// Import zone background images
import zone1City from '@/assets/bg-zone1-city.jpg';
import zone2Factory from '@/assets/bg-zone2-factory.jpg';
import zone3Datacore from '@/assets/bg-zone3-datacore.jpg';
import zone4Rooftop from '@/assets/bg-zone4-rooftop.jpg';
import zone5Boss from '@/assets/bg-zone5-boss.jpg';
import arenaBg from '@/assets/arena-bg.jpg';

interface BackgroundVideoProps {
  distance: number;
  cameraX: number;
  isUltraMode: boolean;
  isBossFight: boolean;
}

// Zones progress from neon city to dark evil fortress
const ZONES = [
  { name: 'NEON CITY', start: 0, image: zone1City, color: '#00ffff', tint: 'rgba(0,255,255,0.1)' },
  { name: 'TOXIC FACTORY', start: 2000, image: zone2Factory, color: '#44ff44', tint: 'rgba(0,255,0,0.15)' },
  { name: 'DATA CORE', start: 4000, image: zone3Datacore, color: '#ff44ff', tint: 'rgba(255,0,255,0.15)' },
  { name: 'INFERNO ROOFTOP', start: 6000, image: zone4Rooftop, color: '#ff4444', tint: 'rgba(255,0,0,0.2)' },
  { name: 'DEMON FORTRESS', start: 8000, image: zone5Boss, color: '#ff0000', tint: 'rgba(100,0,0,0.3)' },
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
  
  // Parallax offset - background scrolls left as hero moves right
  const parallaxX = -(cameraX * 0.15);
  
  // Planes fly every 10 seconds cycle
  const [planeKey, setPlaneKey] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaneKey(k => k + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate transition progress between zones
  const nextZone = ZONES[Math.min(zoneIndex + 1, ZONES.length - 1)];
  const transitionProgress = Math.min(1, Math.max(0, (zoneProgress - 0.6) / 0.4));
  
  // Animated overlay elements
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
    
    // Scanning line
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
    
    return elements;
  }, [currentZone.color]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Current zone background image with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${currentZone.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          x: parallaxX,
          width: '120%',
          left: '-10%',
          filter: isBossFight ? 'brightness(0.6) saturate(1.4)' : 'brightness(0.85)',
        }}
      />
      
      {/* Next zone crossfade for smooth transition */}
      {transitionProgress > 0 && zoneIndex < ZONES.length - 1 && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${nextZone.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            x: parallaxX,
            width: '120%',
            left: '-10%',
            opacity: transitionProgress,
            filter: isBossFight ? 'brightness(0.6) saturate(1.4)' : 'brightness(0.85)',
          }}
        />
      )}
      
      {/* Zone color tint overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: currentZone.tint,
          transition: 'background 1s ease',
        }}
      />
      
      {/* Animated overlay effects */}
      {animatedElements}
      
      {/* Flying planes - every 10 seconds */}
      <motion.div
        key={`plane-${planeKey}`}
        className="absolute pointer-events-none"
        style={{
          top: '12%',
          width: 80,
          height: 25,
        }}
        initial={{ x: '110vw' }}
        animate={{ x: '-120px' }}
        transition={{ 
          duration: 4,
          ease: 'linear',
        }}
      >
        {/* Jet body */}
        <div 
          className="absolute w-full h-4"
          style={{
            background: 'linear-gradient(90deg, #444 0%, #666 50%, #444 100%)',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
        {/* Jet nose */}
        <div 
          className="absolute w-5 h-3"
          style={{
            background: '#777',
            left: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            borderRadius: '50% 0 0 50%',
          }}
        />
        {/* Tail fin */}
        <div 
          className="absolute"
          style={{
            right: 0,
            top: -8,
            width: 0,
            height: 0,
            borderLeft: '15px solid transparent',
            borderRight: '15px solid #555',
            borderBottom: '12px solid transparent',
          }}
        />
        {/* Burning afterburner */}
        <motion.div
          className="absolute"
          style={{
            right: -50,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 60,
            height: 10,
            background: 'linear-gradient(90deg, #ff6600, #ff4400, #ff2200, transparent)',
            filter: 'blur(3px)',
            borderRadius: '0 50% 50% 0',
          }}
          animate={{
            scaleX: [1, 1.4, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.08,
            repeat: Infinity,
          }}
        />
        {/* Smoke trail */}
        <motion.div
          className="absolute"
          style={{
            right: -100,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 80,
            height: 15,
            background: 'linear-gradient(90deg, rgba(100,100,100,0.6), transparent)',
            filter: 'blur(5px)',
          }}
          animate={{
            scaleY: [1, 1.6, 1],
          }}
          transition={{
            duration: 0.15,
            repeat: Infinity,
          }}
        />
      </motion.div>
      
      {/* Second plane staggered */}
      <motion.div
        key={`plane2-${planeKey}`}
        className="absolute pointer-events-none"
        style={{
          top: '25%',
          width: 60,
          height: 20,
        }}
        initial={{ x: '110vw' }}
        animate={{ x: '-100px' }}
        transition={{ 
          duration: 5,
          ease: 'linear',
          delay: 2,
        }}
      >
        <div 
          className="absolute w-full h-3"
          style={{
            background: 'linear-gradient(90deg, #333 0%, #555 50%, #333 100%)',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
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
      </motion.div>
      
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
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,0,0,0.4) 100%)',
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
      
      {/* Zone name indicator */}
      <motion.div
        key={currentZone.name}
        className="absolute top-4 left-4 px-3 py-1 rounded text-xs font-bold"
        style={{
          background: `${currentZone.color}33`,
          border: `1px solid ${currentZone.color}`,
          color: currentZone.color,
          textShadow: `0 0 10px ${currentZone.color}`,
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {currentZone.name}
      </motion.div>
    </div>
  );
};
