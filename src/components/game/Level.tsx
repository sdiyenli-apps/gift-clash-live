import { motion, AnimatePresence } from 'framer-motion';
import { Obstacle } from '@/types/game';
import { useMemo } from 'react';

// Import all zone backgrounds
import bgZone1 from '@/assets/bg-zone1-city.jpg';
import bgZone2 from '@/assets/bg-zone2-factory.jpg';
import bgZone3 from '@/assets/bg-zone3-datacore.jpg';
import bgZone4 from '@/assets/bg-zone4-rooftop.jpg';
import bgZone5 from '@/assets/bg-zone5-boss.jpg';
import princessSprite from '@/assets/princess-sprite.png';

interface LevelProps {
  obstacles: Obstacle[];
  cameraX: number;
  distance: number;
  levelLength: number;
  isUltraMode: boolean;
}

// Zone configurations
const ZONES = [
  { name: 'NEON CITY', bg: bgZone1, start: 0, color: '#00ffff', groundColor: 'from-cyan-900 to-cyan-950' },
  { name: 'ROBOT FACTORY', bg: bgZone2, start: 1600, color: '#ff6600', groundColor: 'from-orange-900 to-orange-950' },
  { name: 'DATA CORE', bg: bgZone3, start: 3200, color: '#8800ff', groundColor: 'from-purple-900 to-purple-950' },
  { name: 'ROOFTOPS', bg: bgZone4, start: 4800, color: '#ff0088', groundColor: 'from-pink-900 to-pink-950' },
  { name: 'BOSS LAIR', bg: bgZone5, start: 6400, color: '#ff0000', groundColor: 'from-red-900 to-red-950' },
];

const getZone = (distance: number) => {
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (distance >= ZONES[i].start) return { zone: ZONES[i], index: i };
  }
  return { zone: ZONES[0], index: 0 };
};

export const Level = ({ obstacles, cameraX, distance, levelLength, isUltraMode }: LevelProps) => {
  const { zone: currentZone, index: zoneIndex } = getZone(distance);
  const nextZone = ZONES[Math.min(zoneIndex + 1, ZONES.length - 1)];
  const zoneProgress = (distance - currentZone.start) / 1600;
  
  // Memoize environmental elements
  const environmentalElements = useMemo(() => {
    const elements: JSX.Element[] = [];
    
    // Foreground structures (parallax fast)
    for (let x = 0; x < cameraX + 1500; x += 400) {
      const parallaxX = x - (cameraX * 0.9);
      if (parallaxX >= -200 && parallaxX <= 1200) {
        const height = 60 + ((x * 7) % 80);
        elements.push(
          <motion.div
            key={`structure-${x}`}
            className="absolute"
            style={{
              left: parallaxX,
              bottom: 100,
              width: 80 + ((x * 3) % 60),
              height,
              background: `linear-gradient(180deg, ${currentZone.color}22, transparent)`,
              borderLeft: `2px solid ${currentZone.color}33`,
              borderRight: `2px solid ${currentZone.color}33`,
            }}
            animate={isUltraMode ? { opacity: [0.5, 0.8, 0.5] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        );
      }
    }
    
    return elements;
  }, [cameraX, currentZone.color, isUltraMode]);
  
  // Generate ground tiles with zone-specific styling
  const groundTiles = useMemo(() => {
    const tiles: JSX.Element[] = [];
    for (let x = Math.floor((cameraX - 100) / 80) * 80; x < cameraX + 1200; x += 80) {
      const screenX = x - cameraX;
      const tileZone = getZone(x).zone;
      
      tiles.push(
        <div
          key={`ground-${x}`}
          className="absolute"
          style={{
            left: screenX,
            bottom: 0,
            width: 82,
            height: 100,
          }}
        >
          {/* Main ground */}
          <div 
            className={`w-full h-full bg-gradient-to-b ${tileZone.groundColor}`}
            style={{
              borderTop: `4px solid ${tileZone.color}`,
              boxShadow: isUltraMode 
                ? `inset 0 0 30px ${currentZone.color}66, 0 -5px 20px ${currentZone.color}44` 
                : `inset 0 0 30px rgba(0,0,0,0.5)`,
            }}
          />
          {/* Cyber grid */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                repeating-linear-gradient(0deg, transparent, transparent 19px, ${tileZone.color}22 20px),
                repeating-linear-gradient(90deg, transparent, transparent 19px, ${tileZone.color}11 20px)
              `,
            }}
          />
          {/* Edge glow */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: tileZone.color }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: (x % 400) / 400 }}
          />
        </div>
      );
    }
    return tiles;
  }, [cameraX, currentZone.color, isUltraMode]);
  
  // Hazards and decorations
  const decorations = useMemo(() => {
    const items: JSX.Element[] = [];
    
    // Energy cables
    for (let x = 200; x < cameraX + 1500; x += 600) {
      const screenX = x - cameraX;
      if (screenX >= -100 && screenX <= 1100) {
        items.push(
          <motion.div
            key={`cable-${x}`}
            className="absolute"
            style={{
              left: screenX,
              top: 50,
              width: 2,
              height: 200,
              background: `linear-gradient(180deg, ${currentZone.color}, transparent)`,
            }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        );
      }
    }
    
    // Warning signs
    for (let x = 500; x < cameraX + 1500; x += 800) {
      const screenX = x - cameraX;
      if (screenX >= -50 && screenX <= 1100) {
        items.push(
          <motion.div
            key={`sign-${x}`}
            className="absolute flex items-center justify-center"
            style={{
              left: screenX,
              bottom: 120,
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #ff8800, #ff4400)',
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            }}
            animate={{ 
              opacity: [0.8, 1, 0.8],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-black font-bold text-xs mt-2">!</span>
          </motion.div>
        );
      }
    }
    
    // Floating particles
    for (let i = 0; i < 20; i++) {
      const x = (cameraX + (i * 73) % 800) - cameraX;
      const y = 100 + (i * 31) % 300;
      items.push(
        <motion.div
          key={`float-particle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: x,
            top: y,
            background: currentZone.color,
            boxShadow: `0 0 6px ${currentZone.color}`,
          }}
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ 
            duration: 2 + (i % 3),
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      );
    }
    
    return items;
  }, [cameraX, currentZone.color]);
  
  // Princess at the end!
  const princessX = levelLength - 200 - cameraX;
  const showPrincess = princessX > -150 && princessX < 1200;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background with zone transition */}
      <div className="absolute inset-0">
        {/* Current zone background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${currentZone.bg})`,
            opacity: 1 - Math.min(zoneProgress * 0.5, 0.5),
          }}
        />
        {/* Next zone background (fading in) */}
        {zoneProgress > 0.5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: (zoneProgress - 0.5) * 2 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${nextZone.bg})` }}
          />
        )}
        {/* Overlay gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: isUltraMode 
              ? `linear-gradient(180deg, ${currentZone.color}44 0%, transparent 30%, transparent 70%, ${currentZone.color}66 100%)`
              : 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)',
          }}
        />
      </div>
      
      {/* Zone name indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentZone.name}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
        >
          <div 
            className="px-6 py-2 rounded-lg backdrop-blur-sm border"
            style={{
              background: `${currentZone.color}22`,
              borderColor: `${currentZone.color}66`,
            }}
          >
            <span 
              className="font-bold text-sm tracking-widest"
              style={{ color: currentZone.color }}
            >
              ZONE {zoneIndex + 1}: {currentZone.name}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Environmental elements */}
      {environmentalElements}
      
      {/* Decorations */}
      {decorations}
      
      {/* Ground tiles */}
      {groundTiles}
      
      {/* Platforms with zone styling */}
      {obstacles.filter(o => o.type === 'platform').map(platform => {
        const screenX = platform.x - cameraX;
        if (screenX < -150 || screenX > 1100) return null;
        const platZone = getZone(platform.x).zone;
        
        return (
          <motion.div
            key={platform.id}
            className="absolute"
            style={{
              left: screenX,
              bottom: 480 - platform.y,
              width: platform.width,
              height: platform.height,
            }}
          >
            {/* Platform main */}
            <div 
              className="w-full h-full rounded-sm"
              style={{
                background: `linear-gradient(180deg, #4a4a6a, #2a2a4a)`,
                borderTop: `3px solid ${platZone.color}`,
                boxShadow: isUltraMode 
                  ? `0 0 20px ${currentZone.color}66, 0 4px 8px rgba(0,0,0,0.5)` 
                  : '0 4px 8px rgba(0,0,0,0.3)',
              }}
            />
            {/* Platform glow */}
            <motion.div
              className="absolute inset-x-0 -top-1 h-1 rounded-full"
              style={{ background: platZone.color }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        );
      })}
      
      {/* Princess Goal */}
      {showPrincess && (
        <motion.div
          className="absolute z-10"
          style={{ left: princessX, bottom: 100 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Castle/Tower structure */}
          <div 
            className="relative w-32 h-48 rounded-t-lg overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #4a1a6a, #2a0a3a)',
              boxShadow: '0 0 50px #ff00ff66, 0 0 100px #ff00ff33',
            }}
          >
            {/* Tower spire */}
            <div 
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '24px solid transparent',
                borderRight: '24px solid transparent',
                borderBottom: '40px solid #ff00ff',
              }}
            />
            
            {/* Princess window */}
            <div 
              className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-24 rounded-t-full overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #ffaaff, #ff66ff)',
                boxShadow: 'inset 0 0 20px #ff00ff',
              }}
            >
              {/* Princess sprite */}
              <motion.img
                src={princessSprite}
                alt="Princess"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 object-cover object-top"
                animate={{ x: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute bottom-4 left-4 w-8 h-12 bg-purple-800 rounded-t" />
            <div className="absolute bottom-4 right-4 w-8 h-12 bg-purple-800 rounded-t" />
          </div>
          
          {/* Help text */}
          <motion.div
            className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
            animate={{ 
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span 
              className="text-lg font-bold"
              style={{ 
                color: '#ff66ff',
                textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
              }}
            >
              💕 SAVE ME! 💕
            </span>
          </motion.div>
          
          {/* Sparkles around princess */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: 60 + Math.cos(i * Math.PI / 4) * 50,
                top: 60 + Math.sin(i * Math.PI / 4) * 50,
                background: '#ff00ff',
                boxShadow: '0 0 10px #ff00ff',
              }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
              }}
            />
          ))}
        </motion.div>
      )}
      
      {/* Progress bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-72 z-30">
        <div className="text-center text-xs mb-1 font-bold" style={{ color: currentZone.color }}>
          PROGRESS TO PRINCESS
        </div>
        <div 
          className="h-4 rounded-full overflow-hidden border-2"
          style={{ 
            background: 'rgba(0,0,0,0.5)',
            borderColor: `${currentZone.color}66`,
          }}
        >
          <motion.div
            className="h-full"
            style={{ 
              width: `${Math.min(100, (distance / levelLength) * 100)}%`,
              background: `linear-gradient(90deg, ${currentZone.color}, #ff00ff)`,
              boxShadow: `0 0 10px ${currentZone.color}`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
          <span>🏃 {Math.floor(distance)}m</span>
          <span>{Math.floor((distance / levelLength) * 100)}%</span>
          <span>👸 {levelLength}m</span>
        </div>
      </div>
      
      {/* Ultra mode screen effects */}
      {isUltraMode && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, transparent 40%, ${currentZone.color}44 100%)`,
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
          {/* Speed lines */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`speed-line-${i}`}
              className="absolute h-0.5"
              style={{
                top: `${10 + i * 8}%`,
                left: 0,
                right: 0,
                background: `linear-gradient(90deg, transparent, ${currentZone.color}88, transparent)`,
              }}
              animate={{ 
                x: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: 0.3,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
