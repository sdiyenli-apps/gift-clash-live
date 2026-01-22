import { useMemo } from 'react';

// Import all level backgrounds
import level1Bg from '@/assets/parallax/level-1-bg.jpg';
import level2Bg from '@/assets/parallax/level-2-bg.jpg';
import level3Bg from '@/assets/parallax/level-3-bg.jpg';
import level4Bg from '@/assets/parallax/level-4-bg.jpg';
import level5Bg from '@/assets/parallax/level-5-bg.jpg';
import level6Bg from '@/assets/parallax/level-6-bg.jpg';
import level7Bg from '@/assets/parallax/level-7-bg.jpg';
import level8Bg from '@/assets/parallax/level-8-bg.jpg';
import level9Bg from '@/assets/parallax/level-9-bg.jpg';
import level10Bg from '@/assets/parallax/level-10-bg.jpg';

interface ParallaxBackgroundProps {
  cameraX: number;
  currentWave: number;
  isBossFight: boolean;
}

// Map wave number to background
const LEVEL_BACKGROUNDS = [
  level1Bg,  // Wave 1
  level2Bg,  // Wave 2
  level3Bg,  // Wave 3
  level4Bg,  // Wave 4
  level5Bg,  // Wave 5
  level6Bg,  // Wave 6
  level7Bg,  // Wave 7
  level8Bg,  // Wave 8
  level9Bg,  // Wave 9
  level10Bg, // Wave 10
];

// Zone colors for tint overlay
const ZONE_COLORS = [
  { name: 'NEON STREETS', color: '#00ffff', tint: 'rgba(0,255,255,0.08)' },
  { name: 'ROBOT FACTORY', color: '#ff6600', tint: 'rgba(255,100,0,0.08)' },
  { name: 'DATA CORE', color: '#ff00ff', tint: 'rgba(255,0,255,0.08)' },
  { name: 'ROOFTOPS', color: '#ff0088', tint: 'rgba(255,0,136,0.08)' },
  { name: 'BUNKER', color: '#ff0000', tint: 'rgba(255,0,0,0.08)' },
  { name: 'HIGHWAY', color: '#00ff00', tint: 'rgba(0,255,0,0.08)' },
  { name: 'MEGA MALL', color: '#ffaa00', tint: 'rgba(255,170,0,0.08)' },
  { name: 'POWER PLANT', color: '#00ffaa', tint: 'rgba(0,255,170,0.08)' },
  { name: 'SPACEPORT', color: '#ff00aa', tint: 'rgba(255,0,170,0.08)' },
  { name: 'BOSS LAIR', color: '#ff0000', tint: 'rgba(255,0,0,0.12)' },
];

export const ParallaxBackground = ({ cameraX, currentWave, isBossFight }: ParallaxBackgroundProps) => {
  const waveIndex = Math.min(currentWave - 1, 9);
  const currentBg = LEVEL_BACKGROUNDS[waveIndex] || LEVEL_BACKGROUNDS[0];
  const zoneData = ZONE_COLORS[waveIndex] || ZONE_COLORS[0];
  
  // Parallax calculation - background scrolls slower than foreground
  // Image is 1920px wide, we want seamless looping
  const parallaxSpeed = 0.3; // Background moves at 30% of camera speed
  const bgWidth = 1920;
  
  // Calculate background offset for seamless scrolling
  const parallaxOffset = useMemo(() => {
    const offset = -(cameraX * parallaxSpeed) % bgWidth;
    return offset;
  }, [cameraX]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary background layer - tiles seamlessly */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${currentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: `${parallaxOffset}px center`,
          backgroundRepeat: 'repeat-x',
          filter: isBossFight ? 'brightness(0.7) saturate(1.3)' : 'brightness(0.9)',
          transition: 'filter 0.5s ease',
        }}
      />
      
      {/* Duplicate layer for seamless scroll */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${currentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: `${parallaxOffset + bgWidth}px center`,
          backgroundRepeat: 'repeat-x',
          filter: isBossFight ? 'brightness(0.7) saturate(1.3)' : 'brightness(0.9)',
          transition: 'filter 0.5s ease',
        }}
      />
      
      {/* Zone color tint */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: zoneData.tint,
          transition: 'background 0.5s ease',
        }}
      />
      
      {/* Atmospheric gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      
      {/* Boss fight red pulse overlay */}
      {isBossFight && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255,0,0,0.3) 100%)',
          }}
        />
      )}
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      
      {/* Zone name indicator - small, top-left */}
      <div
        className="absolute top-2 left-2 px-2 py-0.5 rounded backdrop-blur-sm border z-20"
        style={{
          background: `${zoneData.color}22`,
          borderColor: `${zoneData.color}66`,
        }}
      >
        <span 
          className="font-bold text-[10px] tracking-wider"
          style={{ 
            color: zoneData.color,
            textShadow: `0 0 8px ${zoneData.color}`,
          }}
        >
          W{currentWave}: {zoneData.name}
        </span>
      </div>
    </div>
  );
};
