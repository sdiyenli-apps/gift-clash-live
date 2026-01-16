import { motion } from 'framer-motion';
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
  hasNeon: boolean;
  neonColor: string;
  windowPattern: number;
}

const NEON_COLORS = ['#ff00ff', '#00ffff', '#ff0080', '#00ff80', '#ffff00', '#ff4400'];

const generateBuildings = (): Building[] => {
  const buildings: Building[] = [];
  
  // Far layer buildings (smallest, most distant)
  for (let i = 0; i < 30; i++) {
    buildings.push({
      id: `far-${i}`,
      x: i * 200 - 500,
      width: 40 + Math.random() * 60,
      height: 80 + Math.random() * 120,
      layer: 'far',
      hasNeon: Math.random() > 0.6,
      neonColor: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      windowPattern: Math.floor(Math.random() * 3),
    });
  }
  
  // Mid layer buildings
  for (let i = 0; i < 25; i++) {
    buildings.push({
      id: `mid-${i}`,
      x: i * 280 - 400,
      width: 60 + Math.random() * 80,
      height: 100 + Math.random() * 150,
      layer: 'mid',
      hasNeon: Math.random() > 0.4,
      neonColor: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      windowPattern: Math.floor(Math.random() * 3),
    });
  }
  
  // Near layer buildings (largest, closest)
  for (let i = 0; i < 20; i++) {
    buildings.push({
      id: `near-${i}`,
      x: i * 400 - 300,
      width: 80 + Math.random() * 120,
      height: 140 + Math.random() * 180,
      layer: 'near',
      hasNeon: Math.random() > 0.3,
      neonColor: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      windowPattern: Math.floor(Math.random() * 3),
    });
  }
  
  return buildings;
};

export const CyberpunkBuildings = ({ cameraX }: CyberpunkBuildingsProps) => {
  const buildings = useMemo(() => generateBuildings(), []);
  
  const renderBuilding = (building: Building) => {
    // Parallax effect based on layer
    const parallaxFactor = building.layer === 'far' ? 0.1 : building.layer === 'mid' ? 0.2 : 0.35;
    const screenX = building.x - cameraX * parallaxFactor;
    
    // Only render if potentially visible (wide margin for parallax)
    if (screenX < -building.width - 100 || screenX > 800) return null;
    
    const opacity = building.layer === 'far' ? 0.3 : building.layer === 'mid' ? 0.5 : 0.7;
    const scale = building.layer === 'far' ? 0.5 : building.layer === 'mid' ? 0.7 : 1;
    const bottom = building.layer === 'far' ? 90 : building.layer === 'mid' ? 70 : 50;
    
    return (
      <div
        key={building.id}
        className="absolute pointer-events-none"
        style={{
          left: screenX,
          bottom,
          width: building.width * scale,
          height: building.height * scale,
          opacity,
          zIndex: building.layer === 'far' ? 1 : building.layer === 'mid' ? 2 : 3,
        }}
      >
        {/* Building body */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, 
              rgba(20,20,40,0.9) 0%, 
              rgba(15,15,30,0.95) 50%, 
              rgba(10,10,25,1) 100%)`,
            boxShadow: building.hasNeon 
              ? `0 0 20px ${building.neonColor}33, inset 0 0 15px rgba(0,0,0,0.8)`
              : 'inset 0 0 15px rgba(0,0,0,0.8)',
          }}
        />
        
        {/* Building edge highlight */}
        <div 
          className="absolute top-0 left-0 w-1 h-full"
          style={{
            background: `linear-gradient(180deg, 
              rgba(100,100,150,0.4) 0%, 
              rgba(50,50,80,0.2) 100%)`,
          }}
        />
        
        {/* Windows */}
        <div 
          className="absolute inset-2"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${3 + building.windowPattern}, 1fr)`,
            gridTemplateRows: `repeat(${Math.floor(building.height / 25)}, 1fr)`,
            gap: '3px',
          }}
        >
          {[...Array(Math.floor(building.height / 25) * (3 + building.windowPattern))].map((_, i) => {
            const isLit = Math.random() > 0.4;
            const windowColor = isLit 
              ? (Math.random() > 0.7 ? building.neonColor : '#ffcc00') 
              : 'transparent';
            
            return (
              <motion.div
                key={i}
                style={{
                  background: isLit 
                    ? `linear-gradient(180deg, ${windowColor}88, ${windowColor}44)`
                    : 'rgba(20,20,30,0.5)',
                  boxShadow: isLit ? `0 0 4px ${windowColor}66` : 'none',
                }}
                animate={isLit ? {
                  opacity: [0.6, 1, 0.6],
                } : {}}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            );
          })}
        </div>
        
        {/* Neon sign */}
        {building.hasNeon && building.layer !== 'far' && (
          <motion.div
            className="absolute"
            style={{
              top: '20%',
              left: '10%',
              width: '80%',
              height: 8,
              background: `linear-gradient(90deg, transparent, ${building.neonColor}, transparent)`,
              boxShadow: `0 0 10px ${building.neonColor}, 0 0 20px ${building.neonColor}`,
              borderRadius: 2,
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.5 + Math.random(),
              repeat: Infinity,
            }}
          />
        )}
        
        {/* Antenna/spire */}
        {Math.random() > 0.6 && (
          <div 
            className="absolute"
            style={{
              width: 2,
              height: 20 * scale,
              background: 'linear-gradient(180deg, #666, #333)',
              left: '50%',
              top: -18 * scale,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Blinking light */}
            <motion.div
              className="absolute -top-1 left-1/2 w-2 h-2 rounded-full -translate-x-1/2"
              style={{
                background: '#ff0000',
                boxShadow: '0 0 6px #ff0000, 0 0 12px #ff0000',
              }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        )}
        
        {/* Billboard on some buildings */}
        {building.layer === 'near' && Math.random() > 0.7 && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded-sm"
            style={{
              background: 'rgba(0,0,0,0.9)',
              border: `1px solid ${building.neonColor}`,
              boxShadow: `0 0 8px ${building.neonColor}`,
            }}
            animate={{
              boxShadow: [
                `0 0 8px ${building.neonColor}`,
                `0 0 15px ${building.neonColor}`,
                `0 0 8px ${building.neonColor}`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span 
              className="text-[6px] font-bold whitespace-nowrap"
              style={{ color: building.neonColor, textShadow: `0 0 4px ${building.neonColor}` }}
            >
              {['CYBER', 'NEON', 'TECH', 'GRID', 'BYTE'][Math.floor(Math.random() * 5)]}
            </span>
          </motion.div>
        )}
      </div>
    );
  };
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {buildings.map(renderBuilding)}
    </div>
  );
};
