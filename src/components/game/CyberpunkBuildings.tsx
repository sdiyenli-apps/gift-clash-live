import { useMemo } from 'react';

interface CyberpunkBuildingsProps {
  cameraX: number;
}

interface StreetLamp {
  id: string;
  x: number;
  layer: 'far' | 'mid' | 'near';
  height: number;
  lightColor: string;
}

const LIGHT_COLORS = ['#ffdd88', '#ff9944', '#ffcc66', '#ffffaa'];

const generateStreetLamps = (): StreetLamp[] => {
  const lamps: StreetLamp[] = [];
  
  // Far layer lamps
  for (let i = 0; i < 30; i++) {
    lamps.push({
      id: `far-${i}`,
      x: i * 200 - 500,
      layer: 'far',
      height: 60,
      lightColor: LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)],
    });
  }
  
  // Mid layer lamps
  for (let i = 0; i < 25; i++) {
    lamps.push({
      id: `mid-${i}`,
      x: i * 280 - 400,
      layer: 'mid',
      height: 80,
      lightColor: LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)],
    });
  }
  
  // Near layer lamps
  for (let i = 0; i < 20; i++) {
    lamps.push({
      id: `near-${i}`,
      x: i * 350 - 300,
      layer: 'near',
      height: 100,
      lightColor: LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)],
    });
  }
  
  return lamps;
};

export const CyberpunkBuildings = ({ cameraX }: CyberpunkBuildingsProps) => {
  const lamps = useMemo(() => generateStreetLamps(), []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {lamps.map(lamp => {
        const parallaxFactor = lamp.layer === 'far' ? 0.1 : lamp.layer === 'mid' ? 0.2 : 0.35;
        const screenX = lamp.x - cameraX * parallaxFactor;
        
        if (screenX < -50 || screenX > 750) return null;
        
        const opacity = lamp.layer === 'far' ? 0.3 : lamp.layer === 'mid' ? 0.5 : 0.8;
        const scale = lamp.layer === 'far' ? 0.4 : lamp.layer === 'mid' ? 0.6 : 1;
        const bottom = lamp.layer === 'far' ? 95 : lamp.layer === 'mid' ? 80 : 60;
        const zIndex = lamp.layer === 'far' ? 1 : lamp.layer === 'mid' ? 2 : 3;
        
        const scaledHeight = lamp.height * scale;
        const poleWidth = 3 * scale;
        const armWidth = 15 * scale;
        const lampHeadSize = 8 * scale;
        
        return (
          <div
            key={lamp.id}
            className="absolute"
            style={{
              left: screenX,
              bottom,
              opacity,
              zIndex,
            }}
          >
            {/* Pole */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: poleWidth,
                height: scaledHeight,
                background: 'linear-gradient(90deg, #2a2a35, #3a3a45, #2a2a35)',
                borderRadius: 1,
              }}
            />
            
            {/* Horizontal arm */}
            <div 
              style={{
                position: 'absolute',
                bottom: scaledHeight - 2,
                left: poleWidth - 1,
                width: armWidth,
                height: 2 * scale,
                background: '#3a3a45',
              }}
            />
            
            {/* Lamp head */}
            <div 
              style={{
                position: 'absolute',
                bottom: scaledHeight - lampHeadSize - 2,
                left: poleWidth + armWidth - lampHeadSize / 2,
                width: lampHeadSize,
                height: lampHeadSize * 0.6,
                background: '#222',
                borderRadius: '2px 2px 0 0',
              }}
            />
            
            {/* Light bulb */}
            <div 
              style={{
                position: 'absolute',
                bottom: scaledHeight - lampHeadSize - 4,
                left: poleWidth + armWidth - lampHeadSize * 0.3,
                width: lampHeadSize * 0.6,
                height: lampHeadSize * 0.4,
                background: lamp.lightColor,
                borderRadius: '0 0 50% 50%',
                boxShadow: `0 0 ${10 * scale}px ${lamp.lightColor}, 0 0 ${20 * scale}px ${lamp.lightColor}55`,
              }}
            />
            
            {/* Light cone / glow on ground */}
            <div 
              style={{
                position: 'absolute',
                bottom: -5,
                left: poleWidth + armWidth - 20 * scale,
                width: 40 * scale,
                height: scaledHeight * 0.8,
                background: `linear-gradient(180deg, transparent 0%, ${lamp.lightColor}15 50%, ${lamp.lightColor}25 100%)`,
                clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
                opacity: 0.5,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
