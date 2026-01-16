import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FloorAssetsProps {
  cameraX: number;
  levelLength: number;
}

// Generate deterministic assets based on position
const generateAssets = (levelLength: number) => {
  const assets: Array<{
    id: string;
    type: 'dustbin' | 'rat' | 'pipe' | 'crate' | 'barrel' | 'debris';
    x: number;
    size: number;
  }> = [];
  
  // Spread assets across the level
  for (let x = 100; x < levelLength - 200; x += 150 + Math.random() * 200) {
    const roll = Math.random();
    let type: 'dustbin' | 'rat' | 'pipe' | 'crate' | 'barrel' | 'debris';
    let size = 1;
    
    if (roll < 0.2) {
      type = 'dustbin';
      size = 0.8 + Math.random() * 0.4;
    } else if (roll < 0.35) {
      type = 'rat';
      size = 0.6 + Math.random() * 0.3;
    } else if (roll < 0.5) {
      type = 'pipe';
      size = 1 + Math.random() * 0.5;
    } else if (roll < 0.65) {
      type = 'crate';
      size = 0.7 + Math.random() * 0.4;
    } else if (roll < 0.8) {
      type = 'barrel';
      size = 0.8 + Math.random() * 0.3;
    } else {
      type = 'debris';
      size = 0.5 + Math.random() * 0.5;
    }
    
    assets.push({
      id: `asset-${x}-${roll}`,
      type,
      x,
      size,
    });
  }
  
  return assets;
};

export const FloorAssets = ({ cameraX, levelLength }: FloorAssetsProps) => {
  const assets = useMemo(() => generateAssets(levelLength), [levelLength]);
  
  return (
    <>
      {assets.map(asset => {
        const screenX = asset.x - cameraX;
        
        // Only render if on screen
        if (screenX < -80 || screenX > 700) return null;
        
        return (
          <div
            key={asset.id}
            className="absolute z-10 pointer-events-none"
            style={{
              left: screenX,
              bottom: 50, // On the floor
            }}
          >
            {asset.type === 'dustbin' && (
              <div 
                className="relative"
                style={{ 
                  width: 20 * asset.size, 
                  height: 28 * asset.size,
                }}
              >
                {/* Bin body */}
                <div 
                  className="absolute bottom-0 w-full rounded-t-sm"
                  style={{
                    height: '85%',
                    background: 'linear-gradient(90deg, #333 0%, #555 50%, #333 100%)',
                    boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.5), 0 0 5px rgba(0,255,255,0.1)',
                    border: '1px solid #222',
                  }}
                />
                {/* Bin lid */}
                <div 
                  className="absolute top-0 w-full rounded-t"
                  style={{
                    height: '20%',
                    background: 'linear-gradient(180deg, #666, #444)',
                    boxShadow: '0 -1px 3px rgba(255,255,255,0.1)',
                  }}
                />
                {/* Grime/sticker */}
                <div 
                  className="absolute rounded-full"
                  style={{
                    width: 6 * asset.size,
                    height: 6 * asset.size,
                    background: 'rgba(255,0,100,0.4)',
                    left: '30%',
                    top: '40%',
                    boxShadow: '0 0 4px rgba(255,0,100,0.3)',
                  }}
                />
              </div>
            )}
            
            {asset.type === 'rat' && (
              <motion.div 
                className="relative"
                style={{ 
                  width: 16 * asset.size, 
                  height: 10 * asset.size,
                }}
                animate={{
                  x: [0, -30, -60, -90],
                  opacity: [1, 1, 0.8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3 + Math.random() * 5,
                }}
              >
                {/* Rat body */}
                <div 
                  className="absolute w-full h-full rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #4a3c3c, #2d2424)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  }}
                />
                {/* Rat tail */}
                <div 
                  className="absolute"
                  style={{
                    right: -8 * asset.size,
                    top: '40%',
                    width: 12 * asset.size,
                    height: 2 * asset.size,
                    background: 'linear-gradient(90deg, #3d3030, #1a1515)',
                    borderRadius: 2,
                    transform: 'rotate(-10deg)',
                  }}
                />
                {/* Eye */}
                <div 
                  className="absolute rounded-full"
                  style={{
                    width: 2,
                    height: 2,
                    background: '#ff0000',
                    left: '15%',
                    top: '30%',
                    boxShadow: '0 0 3px #ff0000',
                  }}
                />
              </motion.div>
            )}
            
            {asset.type === 'pipe' && (
              <div 
                className="relative"
                style={{ 
                  width: 40 * asset.size, 
                  height: 12 * asset.size,
                }}
              >
                {/* Pipe body */}
                <div 
                  className="absolute w-full rounded-full"
                  style={{
                    height: '100%',
                    background: 'linear-gradient(180deg, #666 0%, #333 50%, #666 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 2px 5px rgba(0,0,0,0.5)',
                  }}
                />
                {/* Rust spots */}
                <div 
                  className="absolute rounded-full"
                  style={{
                    width: 8 * asset.size,
                    height: 6 * asset.size,
                    background: 'rgba(139,69,19,0.5)',
                    left: '20%',
                    top: '20%',
                  }}
                />
                {/* Cyan glow leak */}
                <motion.div 
                  className="absolute"
                  style={{
                    width: 4,
                    height: 4,
                    background: '#00ffff',
                    borderRadius: '50%',
                    left: '60%',
                    bottom: -2,
                    boxShadow: '0 0 8px #00ffff, 0 0 15px #00ffff',
                  }}
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            )}
            
            {asset.type === 'crate' && (
              <div 
                className="relative"
                style={{ 
                  width: 22 * asset.size, 
                  height: 22 * asset.size,
                }}
              >
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #5a4a3a 0%, #3d3028 50%, #5a4a3a 100%)',
                    border: '2px solid #2a221a',
                    boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.1), 0 2px 5px rgba(0,0,0,0.4)',
                  }}
                />
                {/* Cross pattern */}
                <div 
                  className="absolute bg-amber-900/50"
                  style={{
                    width: '80%',
                    height: 3,
                    left: '10%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
                <div 
                  className="absolute bg-amber-900/50"
                  style={{
                    width: 3,
                    height: '80%',
                    left: '50%',
                    top: '10%',
                    transform: 'translateX(-50%)',
                  }}
                />
              </div>
            )}
            
            {asset.type === 'barrel' && (
              <div 
                className="relative"
                style={{ 
                  width: 18 * asset.size, 
                  height: 24 * asset.size,
                }}
              >
                <div 
                  className="absolute inset-0 rounded"
                  style={{
                    background: 'linear-gradient(90deg, #444 0%, #666 30%, #666 70%, #444 100%)',
                    boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.15), 0 2px 5px rgba(0,0,0,0.5)',
                  }}
                />
                {/* Metal bands */}
                <div 
                  className="absolute w-full"
                  style={{
                    height: 3,
                    background: '#333',
                    top: '20%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                />
                <div 
                  className="absolute w-full"
                  style={{
                    height: 3,
                    background: '#333',
                    bottom: '20%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                />
                {/* Hazard symbol */}
                <div 
                  className="absolute text-[8px] font-bold"
                  style={{
                    color: '#ff8800',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textShadow: '0 0 3px #ff4400',
                  }}
                >
                  ⚠
                </div>
              </div>
            )}
            
            {asset.type === 'debris' && (
              <div 
                className="relative"
                style={{ 
                  width: 25 * asset.size, 
                  height: 8 * asset.size,
                }}
              >
                {/* Scattered debris pieces */}
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      width: 6 + Math.random() * 8,
                      height: 4 + Math.random() * 5,
                      background: `linear-gradient(${45 + i * 30}deg, #555, #333)`,
                      left: `${i * 35}%`,
                      top: `${Math.random() * 40}%`,
                      transform: `rotate(${i * 45 - 30}deg)`,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
