import { motion } from 'framer-motion';
import { Enemy } from '@/types/game';

interface DronePathProps {
  enemies: Enemy[];
  cameraX: number;
}

// Drone path runs through CENTER of screen horizontally
const CENTER_PATH_Y = 200; // Center vertical position (screen center)
const PATH_AMPLITUDE = 40; // Wave amplitude

export const DronePaths = ({ enemies, cameraX }: DronePathProps) => {
  // Filter to only flying enemies (drones, bombers)
  const flyingEnemies = enemies.filter(e => 
    (e.type === 'drone' || e.type === 'bomber' || e.type === 'flyer') && 
    !e.isDying && 
    !e.isSpawning
  );
  
  // Only render ONE central path (not per-enemy)
  const hasFlying = flyingEnemies.length > 0;
  
  if (!hasFlying) return null;
  
  // Generate CENTER SCREEN path points - horizontal sine wave across screen center
  const pathPoints: { x: number; y: number }[] = [];
  const pathLength = 600; // Full screen width
  
  for (let i = 0; i < pathLength; i += 12) {
    const waveY = Math.sin((i / 80) + Date.now() * 0.001) * PATH_AMPLITUDE;
    pathPoints.push({
      x: i,
      y: CENTER_PATH_Y + waveY,
    });
  }
  
  // Create SVG path string for CENTER path
  const pathD = pathPoints.length > 1
    ? `M ${pathPoints[0].x} ${400 - pathPoints[0].y} ` + 
      pathPoints.slice(1).map(p => `L ${p.x} ${400 - p.y}`).join(' ')
    : '';
  
  const pathColor = '#00ffff';
  
  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
    >
      {/* Central drone flight path */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={pathColor}
        strokeWidth={3}
        strokeDasharray="12,6"
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${pathColor})`,
        }}
        animate={{
          strokeDashoffset: [0, -36],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Center path label */}
      <text
        x={50}
        y={400 - CENTER_PATH_Y - 15}
        fill={pathColor}
        fontSize={10}
        fontWeight="bold"
        style={{ filter: `drop-shadow(0 0 4px ${pathColor})` }}
      >
        DRONE PATH
      </text>
      
      {/* Pulse markers along path */}
      {[0, 150, 300, 450].map(i => {
        const idx = Math.floor(i / 12);
        const point = pathPoints[idx] || pathPoints[0];
        return (
          <motion.circle
            key={`marker-${i}`}
            cx={point.x}
            cy={400 - point.y}
            r={4}
            fill={pathColor}
            style={{ filter: `drop-shadow(0 0 6px ${pathColor})` }}
            animate={{ opacity: [0.4, 1, 0.4], r: [3, 5, 3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.001 }}
          />
        );
      })}
    </motion.svg>
  );
};
