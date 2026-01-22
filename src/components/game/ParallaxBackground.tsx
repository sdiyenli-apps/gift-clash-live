import { useMemo, useState, useEffect } from 'react';

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
  level1Bg, level2Bg, level3Bg, level4Bg, level5Bg,
  level6Bg, level7Bg, level8Bg, level9Bg, level10Bg,
];

// Zone colors for tint overlay
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

// Parallax layer speeds (lower = slower = further away)
const LAYER_SPEEDS = {
  far: 0.1,
  mid: 0.25,
  near: 0.5,
};

// Smoke particle configuration
const SMOKE_PARTICLES = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  baseX: i * 250 + Math.random() * 100,
  baseY: 80 + Math.random() * 120,
  size: 40 + Math.random() * 60,
  speed: 0.05 + Math.random() * 0.08,
  drift: Math.random() * 2 - 1,
}));

// Neon sign configuration
const NEON_SIGNS = [
  { x: 150, y: 140, text: 'CYBER', width: 60 },
  { x: 450, y: 160, text: 'ZONE', width: 50 },
  { x: 800, y: 130, text: 'NEON', width: 55 },
  { x: 1100, y: 150, text: 'BAR', width: 40 },
  { x: 1400, y: 145, text: 'HOTEL', width: 65 },
];

// Distant explosion configuration
const EXPLOSION_SPOTS = [
  { x: 300, y: 200 },
  { x: 700, y: 180 },
  { x: 1200, y: 210 },
  { x: 1600, y: 190 },
];

export const ParallaxBackground = ({ cameraX, currentWave, isBossFight }: ParallaxBackgroundProps) => {
  const waveIndex = Math.min(currentWave - 1, 9);
  const currentBg = LEVEL_BACKGROUNDS[waveIndex] || LEVEL_BACKGROUNDS[0];
  const zoneData = ZONE_COLORS[waveIndex] || ZONE_COLORS[0];
  
  // Calculate parallax offsets for each layer
  const parallaxLayers = useMemo(() => {
    return {
      far: -(cameraX * LAYER_SPEEDS.far) % 1920,
      mid: -(cameraX * LAYER_SPEEDS.mid) % 1920,
      near: -(cameraX * LAYER_SPEEDS.near) % 1920,
    };
  }, [cameraX]);

  // Generate debris elements for foreground layer
  const debrisElements = useMemo(() => {
    const elements: JSX.Element[] = [];
    const startX = Math.floor((cameraX - 200) / 300) * 300;
    
    for (let i = 0; i < 6; i++) {
      const x = startX + i * 300;
      const screenX = x - cameraX * LAYER_SPEEDS.near;
      const height = 20 + (x % 40);
      const width = 30 + (x % 50);
      
      elements.push(
        <div
          key={`debris-${i}`}
          className="absolute"
          style={{
            left: screenX % 1200,
            bottom: 60,
            width,
            height,
            background: `linear-gradient(180deg, ${zoneData.color}33, transparent)`,
            borderLeft: `2px solid ${zoneData.color}44`,
            opacity: 0.6,
          }}
        />
      );
    }
    return elements;
  }, [cameraX, zoneData.color]);

  // Generate mid-ground building silhouettes
  const midBuildings = useMemo(() => {
    const buildings: JSX.Element[] = [];
    const startX = Math.floor((cameraX - 400) / 200) * 200;
    
    for (let i = 0; i < 8; i++) {
      const x = startX + i * 200;
      const screenX = (x - cameraX * LAYER_SPEEDS.mid);
      const height = 80 + (x % 100);
      const width = 40 + (x % 60);
      
      buildings.push(
        <div
          key={`mid-building-${i}`}
          className="absolute"
          style={{
            left: ((screenX % 1600) + 1600) % 1600,
            bottom: 60,
            width,
            height,
            background: `linear-gradient(180deg, #0a0a1599, #05051066)`,
            borderTop: `2px solid ${zoneData.color}22`,
            boxShadow: `inset 0 0 20px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Window lights */}
          {Array.from({ length: Math.floor(height / 20) }).map((_, row) => (
            <div
              key={`window-${row}`}
              className="absolute"
              style={{
                left: '30%',
                bottom: 10 + row * 18,
                width: 6,
                height: 8,
                background: (x + row) % 3 === 0 ? zoneData.color : '#00000033',
                opacity: (x + row) % 3 === 0 ? 0.6 : 0.2,
                boxShadow: (x + row) % 3 === 0 ? `0 0 8px ${zoneData.color}` : 'none',
              }}
            />
          ))}
        </div>
      );
    }
    return buildings;
  }, [cameraX, zoneData.color]);

  // Generate far skyline silhouettes
  const farSkyline = useMemo(() => {
    const skyline: JSX.Element[] = [];
    const startX = Math.floor((cameraX - 600) / 250) * 250;
    
    for (let i = 0; i < 10; i++) {
      const x = startX + i * 250;
      const screenX = (x - cameraX * LAYER_SPEEDS.far);
      const height = 120 + (x % 150);
      const width = 60 + (x % 80);
      
      skyline.push(
        <div
          key={`far-building-${i}`}
          className="absolute"
          style={{
            left: ((screenX % 2500) + 2500) % 2500,
            bottom: 60,
            width,
            height,
            background: `linear-gradient(180deg, #0a0a15cc, #050510aa)`,
            opacity: 0.5,
          }}
        >
          {i % 3 === 0 && (
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: -15, width: 2, height: 15, background: '#333' }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-pulse"
                style={{ background: zoneData.color, boxShadow: `0 0 6px ${zoneData.color}` }}
              />
            </div>
          )}
        </div>
      );
    }
    return skyline;
  }, [cameraX, zoneData.color]);

  // Flickering neon signs state
  const [neonFlickers, setNeonFlickers] = useState<boolean[]>(NEON_SIGNS.map(() => true));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNeonFlickers(prev => prev.map((on, i) => {
        // Random flicker with different frequencies per sign
        const flickerChance = 0.1 + (i * 0.05);
        return Math.random() > flickerChance ? on : !on;
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Distant explosions state
  const [explosions, setExplosions] = useState<{ id: number; x: number; y: number; phase: number }[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly trigger a distant explosion
      if (Math.random() > 0.7 && explosions.length < 2) {
        const spot = EXPLOSION_SPOTS[Math.floor(Math.random() * EXPLOSION_SPOTS.length)];
        setExplosions(prev => [...prev, {
          id: Date.now(),
          x: spot.x + Math.random() * 100 - 50,
          y: spot.y + Math.random() * 40 - 20,
          phase: 0,
        }]);
      }
      // Progress explosion phases
      setExplosions(prev => prev
        .map(e => ({ ...e, phase: e.phase + 1 }))
        .filter(e => e.phase < 8)
      );
    }, 200);
    return () => clearInterval(interval);
  }, [explosions.length]);

  // Smoke animation time
  const [smokeTime, setSmokeTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSmokeTime(t => t + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* LAYER 1: Far background image - slowest parallax */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${currentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: `${parallaxLayers.far}px center`,
          backgroundRepeat: 'repeat-x',
          filter: isBossFight ? 'brightness(0.6) saturate(1.4)' : 'brightness(0.85)',
          transform: 'scale(1.1)', // Slightly larger to prevent edge gaps
        }}
      />
      
      {/* LAYER 2: Far skyline silhouettes */}
      <div className="absolute inset-0 pointer-events-none">
        {farSkyline}
      </div>
      
      {/* LAYER 2.5: Distant explosions */}
      <div className="absolute inset-0 pointer-events-none">
        {explosions.map(exp => {
          const screenX = ((exp.x - cameraX * LAYER_SPEEDS.far) % 1600 + 1600) % 1600;
          const size = 20 + exp.phase * 8;
          const opacity = Math.max(0, 1 - exp.phase * 0.15);
          return (
            <div key={exp.id} className="absolute" style={{ left: screenX, bottom: exp.y }}>
              {/* Flash */}
              <div
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  background: `radial-gradient(circle, #ff8800${Math.floor(opacity * 255).toString(16).padStart(2, '0')}, #ff4400${Math.floor(opacity * 150).toString(16).padStart(2, '0')}, transparent)`,
                  transform: 'translate(-50%, 50%)',
                  boxShadow: exp.phase < 3 ? `0 0 ${30 - exp.phase * 8}px #ff6600` : 'none',
                }}
              />
              {/* Smoke ring */}
              {exp.phase > 2 && (
                <div
                  className="absolute rounded-full border"
                  style={{
                    width: size * 1.5,
                    height: size * 0.8,
                    borderColor: `rgba(100,100,100,${opacity * 0.5})`,
                    transform: 'translate(-50%, 50%)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* LAYER 3: Mid-ground buildings with window lights */}
      <div className="absolute inset-0 pointer-events-none">
        {midBuildings}
      </div>
      
      {/* LAYER 3.5: Flickering neon signs */}
      <div className="absolute inset-0 pointer-events-none">
        {NEON_SIGNS.map((sign, i) => {
          const screenX = ((sign.x - cameraX * LAYER_SPEEDS.mid) % 1400 + 1400) % 1400;
          const isOn = neonFlickers[i];
          return (
            <div
              key={`neon-${i}`}
              className="absolute"
              style={{
                left: screenX,
                bottom: sign.y,
                opacity: isOn ? 1 : 0.2,
                transition: 'opacity 0.05s',
              }}
            >
              <div
                className="px-2 py-0.5 rounded-sm font-bold text-[8px] tracking-widest"
                style={{
                  background: isOn ? `${zoneData.color}33` : '#11111188',
                  color: isOn ? zoneData.color : '#333',
                  border: `1px solid ${isOn ? zoneData.color : '#222'}`,
                  textShadow: isOn ? `0 0 8px ${zoneData.color}, 0 0 16px ${zoneData.color}` : 'none',
                  boxShadow: isOn ? `0 0 12px ${zoneData.color}66, inset 0 0 8px ${zoneData.color}33` : 'none',
                }}
              >
                {sign.text}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* LAYER 4: Foreground debris/structures - fastest parallax */}
      <div className="absolute inset-0 pointer-events-none">
        {debrisElements}
      </div>
      
      {/* LAYER 4.5: Floating smoke particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {SMOKE_PARTICLES.map(smoke => {
          const driftX = Math.sin(smokeTime * smoke.speed + smoke.id) * 30;
          const driftY = Math.cos(smokeTime * smoke.speed * 0.7 + smoke.id) * 15;
          const screenX = ((smoke.baseX + driftX - cameraX * LAYER_SPEEDS.near * 0.3) % 1500 + 1500) % 1500;
          return (
            <div
              key={`smoke-${smoke.id}`}
              className="absolute rounded-full"
              style={{
                left: screenX,
                bottom: smoke.baseY + driftY,
                width: smoke.size,
                height: smoke.size * 0.6,
                background: `radial-gradient(ellipse, rgba(60,60,70,0.25), rgba(40,40,50,0.1), transparent)`,
                filter: 'blur(8px)',
              }}
            />
          );
        })}
      </div>
      
      {/* Atmospheric gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      
      {/* Zone color tint - subtle */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${zoneData.color}08, transparent 70%)`,
        }}
      />
      
      {/* Boss fight red pulse overlay */}
      {isBossFight && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,0,0,0.35) 100%)',
          }}
        />
      )}
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
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
