import { motion } from 'framer-motion';
import { Obstacle } from '@/types/game';

interface LevelProps {
  obstacles: Obstacle[];
  cameraX: number;
  distance: number;
  levelLength: number;
  isUltraMode: boolean;
}

export const Level = ({ obstacles, cameraX, distance, levelLength, isUltraMode }: LevelProps) => {
  // Generate repeating background elements
  const backgroundLayers = [];
  
  // Distant city buildings (parallax slow)
  for (let x = -200; x < cameraX + 1200; x += 180) {
    const parallaxX = x - (cameraX * 0.3);
    if (parallaxX >= -200 && parallaxX <= 1000) {
      backgroundLayers.push(
        <div
          key={`building-${x}`}
          className="absolute"
          style={{
            left: parallaxX,
            bottom: 120,
            width: 60 + (x % 40),
            height: 100 + (x % 80),
            background: 'linear-gradient(180deg, #1a1a3a, #0a0a2a)',
            boxShadow: isUltraMode ? '0 0 20px #ff00ff' : 'none',
          }}
        >
          {/* Windows */}
          <div className="grid grid-cols-3 gap-1 p-2">
            {[...Array(9)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2"
                style={{
                  background: Math.random() > 0.5 ? '#ffff00' : '#333',
                  boxShadow: Math.random() > 0.5 ? '0 0 4px #ffff00' : 'none',
                }}
                animate={isUltraMode ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      );
    }
  }
  
  // Mid-ground elements (parallax medium)
  for (let x = -100; x < cameraX + 1200; x += 300) {
    const parallaxX = x - (cameraX * 0.6);
    if (parallaxX >= -100 && parallaxX <= 1000) {
      backgroundLayers.push(
        <div
          key={`midground-${x}`}
          className="absolute"
          style={{
            left: parallaxX,
            bottom: 100,
            width: 100,
            height: 80,
          }}
        >
          {/* Cyberpunk signs */}
          <motion.div
            className="w-16 h-8 rounded"
            style={{
              background: x % 600 < 300 ? 'linear-gradient(90deg, #ff00ff, #00ffff)' : 'linear-gradient(90deg, #ffff00, #ff8800)',
              boxShadow: '0 0 15px currentColor',
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1 + (x % 2), repeat: Infinity }}
          />
        </div>
      );
    }
  }
  
  // Ground tiles
  const groundTiles = [];
  for (let x = Math.floor((cameraX - 100) / 80) * 80; x < cameraX + 1000; x += 80) {
    const screenX = x - cameraX;
    groundTiles.push(
      <div
        key={`ground-${x}`}
        className="absolute"
        style={{
          left: screenX,
          bottom: 0,
          width: 82,
          height: 100,
          background: 'linear-gradient(180deg, #2a2a4a, #1a1a3a)',
          borderTop: '4px solid #444466',
          boxShadow: isUltraMode ? 'inset 0 0 20px #ff00ff' : 'inset 0 0 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Grid lines for cyber effect */}
        <div 
          className="w-full h-full"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #333355 20px)',
          }}
        />
      </div>
    );
  }
  
  // Princess at the end!
  const princessX = levelLength - 150 - cameraX;
  const showPrincess = princessX > -100 && princessX < 1000;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: isUltraMode 
            ? 'linear-gradient(180deg, #1a0030 0%, #300050 30%, #500030 60%, #200020 100%)'
            : 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 30%, #2a1a4a 60%, #1a1a2a 100%)',
        }}
      />
      
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 40}%`,
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1 + (i % 3), repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
      
      {/* Background buildings */}
      {backgroundLayers}
      
      {/* Ground */}
      {groundTiles}
      
      {/* Platforms */}
      {obstacles.filter(o => o.type === 'platform').map(platform => {
        const screenX = platform.x - cameraX;
        if (screenX < -150 || screenX > 1000) return null;
        
        return (
          <motion.div
            key={platform.id}
            className="absolute"
            style={{
              left: screenX,
              bottom: 480 - platform.y,
              width: platform.width,
              height: platform.height,
              background: 'linear-gradient(180deg, #4a4a6a, #3a3a5a)',
              borderTop: '3px solid #666688',
              borderRadius: '4px',
              boxShadow: isUltraMode ? '0 0 15px #ff00ff' : '0 4px 8px rgba(0,0,0,0.3)',
            }}
            animate={isUltraMode ? { y: [0, -2, 0] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        );
      })}
      
      {/* Princess/Goal */}
      {showPrincess && (
        <motion.div
          className="absolute"
          style={{ left: princessX, bottom: 100 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {/* Castle tower */}
          <div 
            className="w-24 h-40 bg-gradient-to-b from-purple-800 to-purple-900 rounded-t-lg relative"
            style={{ boxShadow: '0 0 30px #ff00ff' }}
          >
            {/* Tower top */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[32px] border-l-transparent border-r-transparent border-b-pink-600" />
            {/* Window */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-16 bg-pink-400 rounded-t-full" style={{ boxShadow: '0 0 20px #ff66ff' }}>
              {/* Princess silhouette */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                animate={{ x: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Head */}
                <div className="w-6 h-6 bg-[#ffd5b4] rounded-full mx-auto" />
                {/* Crown */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-yellow-400" style={{ clipPath: 'polygon(0 100%, 20% 0, 40% 100%, 60% 0, 80% 100%, 100% 0, 100% 100%)' }} />
                {/* Dress */}
                <div className="w-8 h-8 bg-pink-500 rounded-t-full mx-auto -mt-1" />
              </motion.div>
            </div>
            {/* Help text */}
            <motion.div
              className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-pink-400 font-bold text-sm" style={{ textShadow: '0 0 10px #ff66ff' }}>
                SAVE ME! 👸
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
      
      {/* Progress bar at top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64">
        <div className="text-center text-xs text-cyan-400 mb-1 font-bold">
          DISTANCE TO PRINCESS
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-cyan-400/30">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-pink-500"
            style={{ width: `${Math.min(100, (distance / levelLength) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>🏃</span>
          <span>{Math.floor(distance)}m / {levelLength}m</span>
          <span>👸</span>
        </div>
      </div>
    </div>
  );
};
