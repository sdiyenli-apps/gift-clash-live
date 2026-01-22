import { motion } from 'framer-motion';
import { Enemy } from '@/types/game';

interface DronePathProps {
  enemies: Enemy[];
  cameraX: number;
}

// Spiral path configuration - stays to the RIGHT of hero
const HERO_SCREEN_X = 80; // Hero is at ~60px, drones should never go past this
const SPIRAL_CENTER_X = 350; // Center of spiral (right side of screen)
const SPIRAL_CENTER_Y = 180; // Vertical center
const SPIRAL_RADIUS_MIN = 40;
const SPIRAL_RADIUS_MAX = 120;

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
  
  // Generate SPIRAL path points - fast outward spiral then back inward
  // Drones never go past the hero (stay right of HERO_SCREEN_X)
  const pathPoints: { x: number; y: number }[] = [];
  const numPoints = 80;
  const time = Date.now() * 0.003; // Faster animation
  
  for (let i = 0; i < numPoints; i++) {
    const progress = i / numPoints;
    // Spiral outward first half, inward second half
    const spiralPhase = progress < 0.5 
      ? progress * 2 // 0 to 1 for first half
      : 2 - progress * 2; // 1 to 0 for second half
    
    const radius = SPIRAL_RADIUS_MIN + spiralPhase * (SPIRAL_RADIUS_MAX - SPIRAL_RADIUS_MIN);
    const angle = progress * Math.PI * 6 + time; // Multiple rotations + time animation
    
    // Calculate position - ensure X never goes past hero
    let x = SPIRAL_CENTER_X + Math.cos(angle) * radius;
    x = Math.max(x, HERO_SCREEN_X + 40); // Never go left of hero + margin
    
    const y = SPIRAL_CENTER_Y + Math.sin(angle) * radius * 0.6; // Elliptical vertical
    
    pathPoints.push({ x, y });
  }
  
  // Create SVG path string for spiral
  const pathD = pathPoints.length > 1
    ? `M ${pathPoints[0].x} ${400 - pathPoints[0].y} ` + 
      pathPoints.slice(1).map(p => `L ${p.x} ${400 - p.y}`).join(' ')
    : '';
  
  const pathColor = '#ff00ff';
  
  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.35 }}
    >
      {/* Spiral drone flight path */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={pathColor}
        strokeWidth={2}
        strokeDasharray="8,4"
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${pathColor})`,
        }}
        animate={{
          strokeDashoffset: [0, -48],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Spiral center marker */}
      <motion.circle
        cx={SPIRAL_CENTER_X}
        cy={400 - SPIRAL_CENTER_Y}
        r={6}
        fill="none"
        stroke={pathColor}
        strokeWidth={2}
        style={{ filter: `drop-shadow(0 0 8px ${pathColor})` }}
        animate={{ 
          r: [6, 10, 6],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      {/* Path label */}
      <text
        x={SPIRAL_CENTER_X - 30}
        y={400 - SPIRAL_CENTER_Y - SPIRAL_RADIUS_MAX - 15}
        fill={pathColor}
        fontSize={9}
        fontWeight="bold"
        style={{ filter: `drop-shadow(0 0 4px ${pathColor})` }}
      >
        ⟳ DRONE ZONE
      </text>
      
      {/* Pulse markers along spiral at key points */}
      {[0, 0.25, 0.5, 0.75].map((progress, idx) => {
        const pointIdx = Math.floor(progress * (pathPoints.length - 1));
        const point = pathPoints[pointIdx];
        return (
          <motion.circle
            key={`marker-${idx}`}
            cx={point.x}
            cy={400 - point.y}
            r={3}
            fill={pathColor}
            style={{ filter: `drop-shadow(0 0 5px ${pathColor})` }}
            animate={{ 
              opacity: [0.4, 1, 0.4], 
              r: [2, 4, 2],
            }}
            transition={{ duration: 0.8, repeat: Infinity, delay: idx * 0.2 }}
          />
        );
      })}
      
      {/* Hero boundary line - drones don't cross */}
      <line
        x1={HERO_SCREEN_X + 30}
        y1={400 - SPIRAL_CENTER_Y - 80}
        x2={HERO_SCREEN_X + 30}
        y2={400 - SPIRAL_CENTER_Y + 80}
        stroke="#ff4444"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.3}
      />
    </motion.svg>
  );
};