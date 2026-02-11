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

const LEVEL_BACKGROUNDS = [
  level1Bg, level2Bg, level3Bg, level4Bg, level5Bg,
  level6Bg, level7Bg, level8Bg, level9Bg, level10Bg,
];

const ZONE_COLORS = [
  { name: 'NEON STREETS', color: '#00ffff' },
  { name: 'ROBOT FACTORY', color: '#ff6600' },
  { name: 'DATA CORE', color: '#ff00ff' },
  { name: 'ROOFTOPS', color: '#ff0088' },
  { name: 'BUNKER', color: '#ff0000' },
  { name: 'HIGHWAY', color: '#00ff00' },
  { name: 'MEGA MALL', color: '#ffaa00' },
  { name: 'POWER PLANT', color: '#00ffaa' },
  { name: 'SPACEPORT', color: '#ff00aa' },
  { name: 'BOSS LAIR', color: '#ff0000' },
];

const LAYER_SPEEDS = {
  far: 0.1,
  mid: 0.25,
  near: 0.5,
};

export const ParallaxBackground = ({ cameraX, currentWave, isBossFight }: ParallaxBackgroundProps) => {
  const waveIndex = Math.min(currentWave - 1, 9);
  const currentBg = LEVEL_BACKGROUNDS[waveIndex] || LEVEL_BACKGROUNDS[0];
  const zoneData = ZONE_COLORS[waveIndex] || ZONE_COLORS[0];
  
  const parallaxFar = useMemo(() => -(cameraX * LAYER_SPEEDS.far) % 1920, [cameraX]);
  const parallaxMid = useMemo(() => -(cameraX * LAYER_SPEEDS.mid) % 1920, [cameraX]);

  // Far skyline - pure CSS, no state
  const farSkyline = useMemo(() => {
    const skyline: JSX.Element[] = [];
    const startX = Math.floor((cameraX - 600) / 250) * 250;
    for (let i = 0; i < 8; i++) {
      const x = startX + i * 250;
      const screenX = (x - cameraX * LAYER_SPEEDS.far);
      const height = 120 + (x % 150);
      const width = 60 + (x % 80);
      skyline.push(
        <div
          key={`far-${i}`}
          className="absolute"
          style={{
            left: ((screenX % 2500) + 2500) % 2500,
            bottom: 60,
            width,
            height,
            background: '#0a0a15cc',
            opacity: 0.5,
          }}
        />
      );
    }
    return skyline;
  }, [cameraX]);

  // Mid buildings - simplified, no window lights
  const midBuildings = useMemo(() => {
    const buildings: JSX.Element[] = [];
    const startX = Math.floor((cameraX - 400) / 200) * 200;
    for (let i = 0; i < 6; i++) {
      const x = startX + i * 200;
      const screenX = (x - cameraX * LAYER_SPEEDS.mid);
      const height = 80 + (x % 100);
      const width = 40 + (x % 60);
      buildings.push(
        <div
          key={`mid-${i}`}
          className="absolute"
          style={{
            left: ((screenX % 1600) + 1600) % 1600,
            bottom: 60,
            width,
            height,
            background: '#0a0a1599',
            borderTop: `1px solid ${zoneData.color}22`,
          }}
        />
      );
    }
    return buildings;
  }, [cameraX, zoneData.color]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${currentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: `${parallaxFar}px center`,
          backgroundRepeat: 'repeat-x',
          filter: isBossFight ? 'brightness(0.6) saturate(1.4)' : 'brightness(0.85)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Far skyline */}
      <div className="absolute inset-0 pointer-events-none">{farSkyline}</div>
      
      {/* Mid buildings */}
      <div className="absolute inset-0 pointer-events-none">{midBuildings}</div>
      
      {/* Atmospheric gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      
      {/* Zone tint */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${zoneData.color}08, transparent 70%)` }}
      />
      
      {/* Boss red pulse */}
      {isBossFight && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse-glow"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,0,0,0.3) 100%)' }}
        />
      )}
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
      />
      
      {/* Zone name */}
      <div
        className="absolute top-2 left-2 px-2 py-0.5 rounded z-20"
        style={{
          background: `${zoneData.color}22`,
          border: `1px solid ${zoneData.color}66`,
        }}
      >
        <span 
          className="font-bold text-[10px] tracking-wider"
          style={{ color: zoneData.color, textShadow: `0 0 8px ${zoneData.color}` }}
        >
          W{currentWave}: {zoneData.name}
        </span>
      </div>
    </div>
  );
};
