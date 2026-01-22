import { useMemo } from 'react';

interface FloorAssetsProps {
  cameraX: number;
  levelLength: number;
}

// Generate deterministic assets based on position - including broken tanks and vehicles
const generateAssets = (levelLength: number) => {
  const assets: Array<{
    id: string;
    type: 'dustbin' | 'rat' | 'pipe' | 'crate' | 'barrel' | 'debris' | 'tank' | 'jeep' | 'truck';
    x: number;
    size: number;
    variant?: number;
  }> = [];
  
  // Add broken tanks at intervals
  for (let x = 400; x < levelLength - 400; x += 1000 + Math.random() * 800) {
    assets.push({
      id: `tank-${x}`,
      type: 'tank',
      x,
      size: 0.8 + Math.random() * 0.4,
      variant: Math.floor(Math.random() * 3),
    });
  }
  
  // Add destroyed jeeps
  for (let x = 600; x < levelLength - 400; x += 1200 + Math.random() * 600) {
    assets.push({
      id: `jeep-${x}`,
      type: 'jeep',
      x,
      size: 0.7 + Math.random() * 0.4,
      variant: Math.floor(Math.random() * 2),
    });
  }
  
  // Add destroyed trucks
  for (let x = 900; x < levelLength - 400; x += 1500 + Math.random() * 800) {
    assets.push({
      id: `truck-${x}`,
      type: 'truck',
      x,
      size: 0.8 + Math.random() * 0.3,
      variant: Math.floor(Math.random() * 2),
    });
  }
  
  // Spread other assets across the level
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
    <div className="absolute inset-0 pointer-events-none z-8">
      {assets.map(asset => {
        const screenX = asset.x - cameraX;
        
        if (screenX < -50 || screenX > 650) return null;
        
        return (
          <div
            key={asset.id}
            className="absolute"
            style={{
              left: screenX,
              bottom: 78, // Original floor level
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
              <div 
                style={{ 
                  width: 14 * asset.size, 
                  height: 8 * asset.size,
                }}
              >
                <div 
                  className="w-full h-full rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #4a3c3c, #2d2424)',
                  }}
                />
                <div 
                  style={{
                    position: 'absolute',
                    right: -6 * asset.size,
                    top: '40%',
                    width: 10 * asset.size,
                    height: 2,
                    background: '#3d3030',
                    borderRadius: 2,
                  }}
                />
              </div>
            )}
            
            {asset.type === 'pipe' && (
              <div 
                style={{ 
                  width: 35 * asset.size, 
                  height: 10 * asset.size,
                }}
              >
                <div 
                  className="w-full h-full rounded-full"
                  style={{
                    background: 'linear-gradient(180deg, #555 0%, #333 50%, #555 100%)',
                  }}
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
            
            {asset.type === 'tank' && (
              <div 
                className="relative"
                style={{ 
                  width: 80 * asset.size, 
                  height: 40 * asset.size,
                }}
              >
                {/* Tank body - broken and tilted */}
                <div 
                  className="absolute bottom-0"
                  style={{
                    width: '100%',
                    height: '60%',
                    background: 'linear-gradient(180deg, #3a3a2a 0%, #2a2a1a 50%, #1a1a0a 100%)',
                    borderRadius: 4,
                    transform: `rotate(${(asset.variant || 0) * 5 - 5}deg)`,
                    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.6)',
                  }}
                />
                {/* Tank turret - damaged */}
                <div 
                  className="absolute"
                  style={{
                    width: '40%',
                    height: '35%',
                    left: '25%',
                    bottom: '55%',
                    background: 'linear-gradient(180deg, #444430 0%, #333320 100%)',
                    borderRadius: 3,
                    transform: `rotate(${(asset.variant || 0) * 15 - 10}deg)`,
                  }}
                />
                {/* Broken cannon */}
                <div 
                  className="absolute"
                  style={{
                    width: '50%',
                    height: 6 * asset.size,
                    left: '50%',
                    bottom: '65%',
                    background: 'linear-gradient(90deg, #333, #222)',
                    borderRadius: 2,
                    transform: `rotate(${(asset.variant || 0) * 10 + 5}deg)`,
                  }}
                />
                {/* Track marks */}
                <div 
                  className="absolute bottom-0 w-full"
                  style={{
                    height: 8 * asset.size,
                    background: 'repeating-linear-gradient(90deg, #222 0px, #333 4px, #222 8px)',
                    borderRadius: 2,
                  }}
                />
                {/* Smoke/fire from damage */}
                <div 
                  className="absolute"
                  style={{
                    width: 15 * asset.size,
                    height: 20 * asset.size,
                    left: '30%',
                    bottom: '70%',
                    background: 'linear-gradient(180deg, rgba(50,50,50,0.6), transparent)',
                    filter: 'blur(3px)',
                    borderRadius: '50%',
                  }}
                />
                {/* Rust/damage marks */}
                <div 
                  className="absolute rounded-full"
                  style={{
                    width: 8 * asset.size,
                    height: 8 * asset.size,
                    left: '60%',
                    bottom: '30%',
                    background: 'radial-gradient(circle, #5a3a2a, transparent)',
                    opacity: 0.7,
                  }}
                />
              </div>
            )}
            
            {asset.type === 'jeep' && (
              <div 
                className="relative"
                style={{ 
                  width: 55 * asset.size, 
                  height: 30 * asset.size,
                }}
              >
                {/* Jeep body - destroyed */}
                <div 
                  className="absolute bottom-0"
                  style={{
                    width: '100%',
                    height: '55%',
                    background: 'linear-gradient(180deg, #4a4a3a 0%, #3a3a2a 100%)',
                    borderRadius: 3,
                    transform: `rotate(${(asset.variant || 0) * 8 - 4}deg)`,
                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.5)',
                  }}
                />
                {/* Broken windshield frame */}
                <div 
                  className="absolute"
                  style={{
                    width: '30%',
                    height: '40%',
                    left: '15%',
                    bottom: '50%',
                    background: 'linear-gradient(180deg, #555 0%, #333 100%)',
                    transform: `rotate(${(asset.variant || 0) * 10 - 5}deg)`,
                    borderRadius: 2,
                  }}
                />
                {/* Wheels - one missing */}
                <div 
                  className="absolute rounded-full"
                  style={{
                    width: 12 * asset.size,
                    height: 12 * asset.size,
                    left: '10%',
                    bottom: -2,
                    background: 'radial-gradient(circle, #333, #111)',
                    border: '2px solid #222',
                  }}
                />
                <div 
                  className="absolute rounded-full"
                  style={{
                    width: 12 * asset.size,
                    height: 12 * asset.size,
                    right: '15%',
                    bottom: -2,
                    background: 'radial-gradient(circle, #333, #111)',
                    border: '2px solid #222',
                    opacity: asset.variant === 0 ? 0.3 : 1,
                  }}
                />
                {/* Fire/smoke */}
                <div 
                  className="absolute"
                  style={{
                    width: 12 * asset.size,
                    height: 18 * asset.size,
                    left: '40%',
                    bottom: '60%',
                    background: 'linear-gradient(180deg, rgba(80,60,40,0.5), transparent)',
                    filter: 'blur(4px)',
                    borderRadius: '50%',
                  }}
                />
              </div>
            )}
            
            {asset.type === 'truck' && (
              <div 
                className="relative"
                style={{ 
                  width: 90 * asset.size, 
                  height: 45 * asset.size,
                }}
              >
                {/* Truck cargo area - destroyed */}
                <div 
                  className="absolute"
                  style={{
                    width: '60%',
                    height: '70%',
                    right: 0,
                    bottom: '15%',
                    background: 'linear-gradient(180deg, #3a3a30 0%, #2a2a20 100%)',
                    borderRadius: 2,
                    transform: `rotate(${(asset.variant || 0) * 5 - 3}deg)`,
                    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Torn canvas cover */}
                  <div 
                    className="absolute"
                    style={{
                      width: '80%',
                      height: '30%',
                      left: '10%',
                      top: 0,
                      background: 'linear-gradient(90deg, #4a4a3a, #5a5a4a, #4a4a3a)',
                      borderRadius: '50% 50% 0 0',
                      clipPath: 'polygon(0 100%, 20% 0, 50% 30%, 80% 0, 100% 100%)',
                    }}
                  />
                </div>
                {/* Truck cab */}
                <div 
                  className="absolute"
                  style={{
                    width: '35%',
                    height: '60%',
                    left: 0,
                    bottom: '15%',
                    background: 'linear-gradient(180deg, #444 0%, #333 100%)',
                    borderRadius: 3,
                    transform: `rotate(${(asset.variant || 0) * 6 - 3}deg)`,
                  }}
                />
                {/* Broken window */}
                <div 
                  className="absolute"
                  style={{
                    width: '20%',
                    height: '25%',
                    left: '8%',
                    bottom: '50%',
                    background: 'rgba(100,150,200,0.3)',
                    borderRadius: 1,
                    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)',
                  }}
                />
                {/* Wheels */}
                <div 
                  className="absolute rounded-full"
                  style={{
                    width: 14 * asset.size,
                    height: 14 * asset.size,
                    left: '5%',
                    bottom: 0,
                    background: 'radial-gradient(circle, #333, #111)',
                    border: '2px solid #222',
                  }}
                />
                <div 
                  className="absolute rounded-full"
                  style={{
                    width: 14 * asset.size,
                    height: 14 * asset.size,
                    right: '20%',
                    bottom: 0,
                    background: 'radial-gradient(circle, #333, #111)',
                    border: '2px solid #222',
                  }}
                />
                {/* Heavy smoke from engine */}
                <div 
                  className="absolute"
                  style={{
                    width: 20 * asset.size,
                    height: 25 * asset.size,
                    left: '15%',
                    bottom: '70%',
                    background: 'linear-gradient(180deg, rgba(40,40,40,0.7), transparent)',
                    filter: 'blur(5px)',
                    borderRadius: '50%',
                  }}
                />
                {/* Damage marks */}
                <div 
                  className="absolute rounded-full"
                  style={{
                    width: 10 * asset.size,
                    height: 10 * asset.size,
                    right: '30%',
                    bottom: '40%',
                    background: 'radial-gradient(circle, #5a3a2a, transparent)',
                    opacity: 0.6,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
