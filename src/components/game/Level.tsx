import { motion, AnimatePresence } from 'framer-motion';
import { Obstacle } from '@/types/game';
import { useMemo } from 'react';

// Import all zone backgrounds
import bgZone1 from '@/assets/bg-zone1-city.jpg';
import bgZone2 from '@/assets/bg-zone2-factory.jpg';
import bgZone3 from '@/assets/bg-zone3-datacore.jpg';
import bgZone4 from '@/assets/bg-zone4-rooftop.jpg';
import bgZone5 from '@/assets/bg-zone5-boss.jpg';

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
  
  // Parallax background offset
  const bgParallaxX = -(cameraX * 0.1) % 800;
  const bgScale = 1 + Math.sin(Date.now() / 2000) * 0.02; // Subtle breathing effect
  
  // Memoize environmental elements - reduced for performance
  const environmentalElements = useMemo(() => {
    const elements: JSX.Element[] = [];
    
    // Foreground structures (parallax fast) - aligned with floor
    for (let x = 0; x < cameraX + 1500; x += 500) {
      const parallaxX = x - (cameraX * 0.9);
      if (parallaxX >= -200 && parallaxX <= 1200) {
        const height = 40 + ((x * 7) % 60);
        elements.push(
          <motion.div
            key={`structure-${x}`}
            className="absolute"
            style={{
              left: parallaxX,
              bottom: 78, // Original floor level
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
  
  // Generate ground tiles with zone-specific styling - optimized
  const groundTiles = useMemo(() => {
    const tiles: JSX.Element[] = [];
    const startX = Math.floor((cameraX - 100) / 100) * 100;
    const endX = Math.min(cameraX + 1200, startX + 1400); // Limit tiles
    
    for (let x = startX; x < endX; x += 100) {
      const screenX = x - cameraX;
      const tileZone = getZone(x).zone;
      
      tiles.push(
        <div
          key={`ground-${x}`}
          className="absolute"
          style={{
            left: screenX,
            bottom: 0,
            width: 102,
            height: 80, // Original ground tile height
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
  
  // Hazards and decorations - reduced for performance
  const decorations = useMemo(() => {
    const items: JSX.Element[] = [];
    
    // Energy cables - fewer
    for (let x = 200; x < cameraX + 1500; x += 800) {
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
    
    // Floating particles - fewer
    for (let i = 0; i < 10; i++) {
      const x = (cameraX + (i * 73) % 800) - cameraX;
      const y = 80 + (i * 31) % 150;
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
  
  // Render obstacles
  const obstacleElements = useMemo(() => {
    return obstacles.slice(0, 20).map(obstacle => { // Limit obstacles rendered
      const screenX = obstacle.x - cameraX;
      if (screenX < -150 || screenX > 1100) return null;
      const obstZone = getZone(obstacle.x).zone;
      
      if (obstacle.type === 'crate' || obstacle.type === 'barrel') {
        return (
          <motion.div
            key={obstacle.id}
            className="absolute"
            style={{
              left: screenX,
              bottom: 78, // Original floor level
              width: obstacle.width,
              height: obstacle.height,
            }}
          >
            <div 
              className={`w-full h-full ${obstacle.type === 'barrel' ? 'rounded-lg' : 'rounded-sm'}`}
              style={{
                background: obstacle.type === 'barrel' 
                  ? 'linear-gradient(135deg, #8B4513, #654321)'
                  : 'linear-gradient(135deg, #8B7355, #6B5344)',
                border: '2px solid #5a4a3a',
                boxShadow: 'inset -3px -3px 10px rgba(0,0,0,0.4), inset 3px 3px 10px rgba(255,255,255,0.1)',
              }}
            >
              {obstacle.type === 'barrel' && (
                <>
                  <div className="absolute top-2 left-1 right-1 h-1 bg-gray-600 rounded" />
                  <div className="absolute bottom-2 left-1 right-1 h-1 bg-gray-600 rounded" />
                </>
              )}
            </div>
          </motion.div>
        );
      }
      
      return null;
    });
  }, [obstacles, cameraX]);
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background with zone transition - moving and scaling */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${currentZone.bg})`,
            opacity: 1 - Math.min(zoneProgress * 0.5, 0.5),
            backgroundPosition: `${bgParallaxX}px center`,
            transform: `scale(${bgScale})`,
          }}
        />
        {zoneProgress > 0.5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: (zoneProgress - 0.5) * 2 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${nextZone.bg})`,
              backgroundPosition: `${bgParallaxX}px center`,
            }}
          />
        )}
        
        {/* Flashing neon overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${50 + Math.sin(Date.now() / 500) * 20}% ${50 + Math.cos(Date.now() / 700) * 20}%, ${currentZone.color}22, transparent 50%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        
        <div 
          className="absolute inset-0"
          style={{
            background: isUltraMode 
              ? `linear-gradient(180deg, ${currentZone.color}44 0%, transparent 30%, transparent 70%, ${currentZone.color}66 100%)`
              : 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)',
          }}
        />
      </div>
      
      {/* Zone name indicator - HALF SIZE, TOP RIGHT CORNER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentZone.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-2 right-2 z-20"
        >
          <div 
            className="px-2 py-0.5 rounded backdrop-blur-sm border"
            style={{
              background: `${currentZone.color}22`,
              borderColor: `${currentZone.color}66`,
            }}
          >
            <span 
              className="font-bold text-[8px] tracking-wide"
              style={{ color: currentZone.color }}
            >
              Z{zoneIndex + 1}: {currentZone.name}
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
      
      {/* Obstacles */}
      {obstacleElements}
    </div>
  );
};
