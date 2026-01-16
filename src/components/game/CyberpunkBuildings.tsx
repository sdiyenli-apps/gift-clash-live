import { useMemo } from 'react';

interface CyberpunkBuildingsProps {
  cameraX: number;
}

interface Building {
  id: string;
  x: number;
  width: number;
  height: number;
  layer: 'far' | 'mid' | 'near';
  windowRows: number;
  windowCols: number;
  hasNeon: boolean;
  neonColor: string;
}

const NEON_COLORS = ['#ff00ff', '#00ffff', '#ff0080', '#00ff80'];

const generateBuildings = (): Building[] => {
  const buildings: Building[] = [];
  
  // Far layer buildings
  for (let i = 0; i < 20; i++) {
    const height = 80 + Math.random() * 100;
    buildings.push({
      id: `far-${i}`,
      x: i * 250 - 500,
      width: 50 + Math.random() * 50,
      height,
      layer: 'far',
      windowRows: Math.floor(height / 20),
      windowCols: 3,
      hasNeon: Math.random() > 0.7,
      neonColor: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
    });
  }
  
  // Mid layer buildings
  for (let i = 0; i < 15; i++) {
    const height = 100 + Math.random() * 120;
    buildings.push({
      id: `mid-${i}`,
      x: i * 350 - 400,
      width: 70 + Math.random() * 60,
      height,
      layer: 'mid',
      windowRows: Math.floor(height / 22),
      windowCols: 4,
      hasNeon: Math.random() > 0.5,
      neonColor: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
    });
  }
  
  // Near layer buildings
  for (let i = 0; i < 12; i++) {
    const height = 130 + Math.random() * 150;
    buildings.push({
      id: `near-${i}`,
      x: i * 500 - 300,
      width: 90 + Math.random() * 80,
      height,
      layer: 'near',
      windowRows: Math.floor(height / 25),
      windowCols: 5,
      hasNeon: Math.random() > 0.4,
      neonColor: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
    });
  }
  
  return buildings;
};

export const CyberpunkBuildings = ({ cameraX }: CyberpunkBuildingsProps) => {
  const buildings = useMemo(() => generateBuildings(), []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {buildings.map(building => {
        const parallaxFactor = building.layer === 'far' ? 0.1 : building.layer === 'mid' ? 0.2 : 0.35;
        const screenX = building.x - cameraX * parallaxFactor;
        
        if (screenX < -building.width - 50 || screenX > 750) return null;
        
        const opacity = building.layer === 'far' ? 0.25 : building.layer === 'mid' ? 0.4 : 0.6;
        const scale = building.layer === 'far' ? 0.5 : building.layer === 'mid' ? 0.7 : 1;
        const bottom = building.layer === 'far' ? 90 : building.layer === 'mid' ? 70 : 50;
        const zIndex = building.layer === 'far' ? 1 : building.layer === 'mid' ? 2 : 3;
        
        const scaledWidth = building.width * scale;
        const scaledHeight = building.height * scale;
        
        return (
          <div
            key={building.id}
            className="absolute"
            style={{
              left: screenX,
              bottom,
              width: scaledWidth,
              height: scaledHeight,
              opacity,
              zIndex,
            }}
          >
            {/* Building body */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(25,25,40,0.95) 0%, rgba(15,15,25,1) 100%)',
                boxShadow: building.hasNeon 
                  ? `0 0 15px ${building.neonColor}22`
                  : 'none',
              }}
            />
            
            {/* Static white windows grid */}
            <div 
              className="absolute"
              style={{
                top: 4,
                left: 4,
                right: 4,
                bottom: building.layer === 'near' ? 20 : 4,
                display: 'grid',
                gridTemplateColumns: `repeat(${building.windowCols}, 1fr)`,
                gridTemplateRows: `repeat(${building.windowRows}, 1fr)`,
                gap: 2,
              }}
            >
              {[...Array(building.windowRows * building.windowCols)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: Math.random() > 0.3 
                      ? 'rgba(255,255,200,0.6)' 
                      : 'rgba(30,30,40,0.8)',
                    boxShadow: Math.random() > 0.3 
                      ? '0 0 2px rgba(255,255,200,0.4)' 
                      : 'none',
                  }}
                />
              ))}
            </div>
            
            {/* Door for near buildings */}
            {building.layer === 'near' && (
              <div 
                className="absolute"
                style={{
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 12 * scale,
                  height: 18 * scale,
                  background: 'linear-gradient(180deg, #2a2a35, #1a1a22)',
                  border: '1px solid #333',
                }}
              >
                {/* Door handle */}
                <div 
                  style={{
                    position: 'absolute',
                    right: 2,
                    top: '50%',
                    width: 2,
                    height: 3,
                    background: '#666',
                    borderRadius: 1,
                  }}
                />
              </div>
            )}
            
            {/* Simple neon accent line */}
            {building.hasNeon && (
              <div
                style={{
                  position: 'absolute',
                  top: '15%',
                  left: '10%',
                  width: '80%',
                  height: 2,
                  background: building.neonColor,
                  boxShadow: `0 0 6px ${building.neonColor}`,
                  opacity: 0.8,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
