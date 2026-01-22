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
  
  // Parallax background offset - simplified
  const bgParallaxX = -(cameraX * 0.1) % 800;
  
  // PERFORMANCE: Minimal environmental elements - reduced for smoother gameplay
  const environmentalElements = useMemo(() => {
    const elements: JSX.Element[] = [];
    
    // Only 3-4 foreground structures for performance
    for (let x = 0; x < cameraX + 1500; x += 700) {
      const parallaxX = x - (cameraX * 0.9);
      if (parallaxX >= -100 && parallaxX <= 1100) {
        const height = 40 + ((x * 7) % 50);
        elements.push(
          <div
            key={`structure-${x}`}
            className="absolute"
            style={{
              left: parallaxX,
              bottom: 78,
              width: 60 + ((x * 3) % 50),
              height,
              background: `linear-gradient(180deg, ${currentZone.color}15, transparent)`,
              borderLeft: `2px solid ${currentZone.color}22`,
            }}
          />
        );
      }
    }
    
    return elements;
  }, [cameraX, currentZone.color]);
  
  // PERFORMANCE: Simplified ground tiles - fewer, no animation
  const groundTiles = useMemo(() => {
    const tiles: JSX.Element[] = [];
    const startX = Math.floor((cameraX - 100) / 150) * 150;
    const endX = Math.min(cameraX + 1200, startX + 1200);
    
    for (let x = startX; x < endX; x += 150) {
      const screenX = x - cameraX;
      const tileZone = getZone(x).zone;
      
      tiles.push(
        <div
          key={`ground-${x}`}
          className="absolute"
          style={{
            left: screenX,
            bottom: 0,
            width: 155,
            height: 80,
          }}
        >
          <div 
            className={`w-full h-full bg-gradient-to-b ${tileZone.groundColor}`}
            style={{
              borderTop: `3px solid ${tileZone.color}`,
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
            }}
          />
        </div>
      );
    }
    return tiles;
  }, [cameraX]);
  
  // PERFORMANCE: Minimal decorations - only a few particles, no cables
  const decorations = useMemo(() => {
    const items: JSX.Element[] = [];
    
    // Just 5 floating particles for ambiance
    for (let i = 0; i < 5; i++) {
      const x = (cameraX + (i * 150) % 700) - cameraX;
      const y = 100 + (i * 40) % 120;
      items.push(
        <div
          key={`float-particle-${i}`}
          className="absolute w-1 h-1 rounded-full opacity-50"
          style={{
            left: x,
            top: y,
            background: currentZone.color,
            boxShadow: `0 0 4px ${currentZone.color}`,
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
          <div
            key={obstacle.id}
            className="absolute"
            style={{
              left: screenX,
              bottom: 78,
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
                boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        );
      }
      
      return null;
    });
  }, [obstacles, cameraX]);
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background - static, no breathing effect for performance */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${currentZone.bg})`,
            opacity: 1 - Math.min(zoneProgress * 0.5, 0.5),
            backgroundPosition: `${bgParallaxX}px center`,
          }}
        />
        {zoneProgress > 0.5 && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${nextZone.bg})`,
              opacity: (zoneProgress - 0.5) * 2,
              backgroundPosition: `${bgParallaxX}px center`,
            }}
          />
        )}
        
        {/* Simple overlay gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>
      
      {/* Zone name indicator - small, simple */}
      <div className="absolute top-2 right-2 z-20">
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
      </div>
      
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
