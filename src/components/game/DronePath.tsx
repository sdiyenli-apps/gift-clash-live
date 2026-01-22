import { motion } from 'framer-motion';
import { Enemy } from '@/types/game';

interface DronePathProps {
  enemies: Enemy[];
  cameraX: number;
}

export const DronePaths = ({ enemies, cameraX }: DronePathProps) => {
  // Filter to only flying enemies (drones, bombers)
  const flyingEnemies = enemies.filter(e => 
    (e.type === 'drone' || e.type === 'bomber' || e.type === 'flyer') && 
    !e.isDying && 
    !e.isSpawning
  );
  
  return (
    <>
      {flyingEnemies.map(enemy => {
        const screenX = enemy.x - cameraX;
        if (screenX < -200 || screenX > 900) return null;
        
        const isSpiralDrone = enemy.isSpiralDrone;
        const flyHeight = enemy.flyHeight || 80;
        const waveAmplitude = 30; // How high/low the sine wave goes
        
        // Generate path points for sine wave
        const pathPoints: { x: number; y: number }[] = [];
        const pathLength = 300; // How far ahead to show path
        
        if (isSpiralDrone) {
          // Spiral path
          const spiralRadius = 40;
          for (let i = 0; i < 32; i++) {
            const angle = (enemy.spiralAngle || 0) + (i * 0.2);
            pathPoints.push({
              x: screenX + Math.cos(angle) * spiralRadius + i * 3,
              y: 160 + flyHeight + Math.sin(angle) * spiralRadius,
            });
          }
        } else {
          // Sine wave path
          for (let i = 0; i < pathLength; i += 15) {
            const phase = enemy.animationPhase || 0;
            const waveY = Math.sin(((enemy.x + i) / 100) + phase) * waveAmplitude;
            pathPoints.push({
              x: screenX + i,
              y: 160 + flyHeight + waveY,
            });
          }
        }
        
        // Create SVG path string
        const pathD = pathPoints.length > 1
          ? `M ${pathPoints[0].x} ${400 - pathPoints[0].y} ` + 
            pathPoints.slice(1).map(p => `L ${p.x} ${400 - p.y}`).join(' ')
          : '';
        
        const pathColor = enemy.type === 'bomber' ? '#ff6600' : '#00ffff';
        
        return (
          <motion.svg
            key={`path-${enemy.id}`}
            className="absolute inset-0 pointer-events-none z-10"
            style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
          >
            {/* Main path line */}
            <motion.path
              d={pathD}
              fill="none"
              stroke={pathColor}
              strokeWidth={2}
              strokeDasharray="8,4"
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 4px ${pathColor})`,
              }}
              animate={{
                strokeDashoffset: [0, -24],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            
            {/* Direction arrow at the end */}
            {pathPoints.length > 2 && (
              <motion.circle
                cx={pathPoints[pathPoints.length - 1].x}
                cy={400 - pathPoints[pathPoints.length - 1].y}
                r={4}
                fill={pathColor}
                style={{
                  filter: `drop-shadow(0 0 6px ${pathColor})`,
                }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  r: [4, 6, 4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                }}
              />
            )}
          </motion.svg>
        );
      })}
    </>
  );
};
