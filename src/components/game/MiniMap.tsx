import { motion } from 'framer-motion';
import { Enemy, Player } from '@/types/game';

interface MiniMapProps {
  player: Player;
  enemies: Enemy[];
  levelLength: number;
  princessX: number;
  cameraX: number;
}

export const MiniMap = ({ player, enemies, levelLength, princessX, cameraX }: MiniMapProps) => {
  const mapWidth = 120;
  const mapHeight = 20;
  
  // Scale positions to mini-map
  const scaleX = (x: number) => (x / levelLength) * mapWidth;
  
  // Visible area indicator
  const visibleStart = scaleX(cameraX);
  const visibleWidth = scaleX(400); // Approximate visible area
  
  return (
    <div 
      className="relative"
      style={{
        width: mapWidth + 8,
        height: mapHeight + 8,
        background: 'rgba(0,0,0,0.9)',
        border: '2px solid rgba(0,255,255,0.6)',
        borderRadius: 8,
        padding: 3,
        boxShadow: '0 0 10px rgba(0,255,255,0.3), inset 0 0 5px rgba(0,0,0,0.5)',
      }}
    >
      {/* Map background */}
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          borderRadius: 2,
        }}
      >
        {/* Visible area */}
        <div 
          className="absolute top-0 h-full opacity-30"
          style={{
            left: visibleStart,
            width: Math.min(visibleWidth, mapWidth - visibleStart),
            background: 'rgba(0,255,255,0.3)',
          }}
        />
        
        {/* Enemies */}
        {enemies.filter(e => !e.isDying && !e.isSpawning).map(enemy => (
          <motion.div
            key={enemy.id}
            className="absolute rounded-full"
            style={{
              left: scaleX(enemy.x),
              top: '50%',
              transform: 'translateY(-50%)',
              width: enemy.type === 'boss' ? 6 : 3,
              height: enemy.type === 'boss' ? 6 : 3,
              background: enemy.type === 'boss' ? '#ff0000' : 
                         enemy.type === 'tank' ? '#44aa44' :
                         enemy.type === 'ninja' ? '#8800ff' :
                         enemy.type === 'drone' ? '#00ffff' : '#ff4444',
              boxShadow: enemy.type === 'boss' ? '0 0 4px #ff0000' : 'none',
            }}
            animate={enemy.type === 'boss' ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        ))}
        
        {/* Player */}
        <motion.div
          className="absolute rounded-full"
          style={{
            left: scaleX(player.x),
            top: '50%',
            transform: 'translateY(-50%)',
            width: 4,
            height: 4,
            background: '#00ff00',
            boxShadow: '0 0 4px #00ff00',
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
        
        {/* Princess */}
        <motion.div
          className="absolute"
          style={{
            left: scaleX(princessX),
            top: '50%',
            transform: 'translateY(-50%)',
            width: 5,
            height: 5,
            background: '#ff69b4',
            boxShadow: '0 0 6px #ff69b4',
            borderRadius: '50%',
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        
        {/* Progress line */}
        <div 
          className="absolute bottom-0 left-0 h-px"
          style={{
            width: scaleX(player.x),
            background: 'linear-gradient(90deg, #00ff00, #00ffff)',
          }}
        />
      </div>
      
      {/* Legend removed for cleaner look */}
    </div>
  );
};
