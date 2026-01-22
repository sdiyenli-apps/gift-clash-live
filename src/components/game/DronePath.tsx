import { motion } from 'framer-motion';
import { Enemy } from '@/types/game';

interface DronePathProps {
  enemies: Enemy[];
  cameraX: number;
}

// Movement zone constants - drones zoom away when close to hero
const HERO_SCREEN_X = 60; // Hero fixed position
const DANGER_ZONE_X = 140; // Drones retreat when reaching this X
const ENTRY_ZONE_X = 550; // Drones enter from here

export const DronePaths = ({ enemies, cameraX }: DronePathProps) => {
  // Filter to only flying enemies (drones, bombers)
  const flyingEnemies = enemies.filter(e => 
    (e.type === 'drone' || e.type === 'bomber' || e.type === 'flyer') && 
    !e.isDying && 
    !e.isSpawning
  );
  
  if (flyingEnemies.length === 0) return null;
  
  // Check if any drone is retreating
  const retreatingCount = flyingEnemies.filter(e => e.isRetreating).length;
  const attackingCount = flyingEnemies.length - retreatingCount;
  
  const time = Date.now() * 0.002;
  
  // Generate dynamic path showing drone approach -> retreat pattern
  const approachPath: { x: number; y: number }[] = [];
  const retreatPath: { x: number; y: number }[] = [];
  
  // Approach path - from right to danger zone
  for (let i = 0; i < 40; i++) {
    const progress = i / 40;
    const x = ENTRY_ZONE_X - progress * (ENTRY_ZONE_X - DANGER_ZONE_X);
    const y = 180 + Math.sin(progress * Math.PI * 3 + time) * 30;
    approachPath.push({ x, y });
  }
  
  // Retreat path - fast zoom back to right
  for (let i = 0; i < 20; i++) {
    const progress = i / 20;
    const x = DANGER_ZONE_X + progress * (ENTRY_ZONE_X - DANGER_ZONE_X + 100);
    const y = 180 + Math.sin(progress * Math.PI + time) * 20;
    retreatPath.push({ x, y });
  }
  
  // Create SVG path strings
  const approachD = approachPath.length > 1
    ? `M ${approachPath[0].x} ${400 - approachPath[0].y} ` + 
      approachPath.slice(1).map(p => `L ${p.x} ${400 - p.y}`).join(' ')
    : '';
    
  const retreatD = retreatPath.length > 1
    ? `M ${retreatPath[0].x} ${400 - retreatPath[0].y} ` + 
      retreatPath.slice(1).map(p => `L ${p.x} ${400 - p.y}`).join(' ')
    : '';
  
  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
    >
      {/* Danger zone line - drones don't cross */}
      <motion.line
        x1={DANGER_ZONE_X}
        y1={100}
        x2={DANGER_ZONE_X}
        y2={300}
        stroke="#ff4444"
        strokeWidth={2}
        strokeDasharray="6,4"
        style={{ filter: 'drop-shadow(0 0 4px #ff4444)' }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      {/* Approach flight path - cyan */}
      <motion.path
        d={approachD}
        fill="none"
        stroke="#00ffff"
        strokeWidth={2}
        strokeDasharray="8,4"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 4px #00ffff)' }}
        animate={{ strokeDashoffset: [0, -24] }}
        transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Retreat flight path - red/orange when retreating */}
      {retreatingCount > 0 && (
        <motion.path
          d={retreatD}
          fill="none"
          stroke="#ff6600"
          strokeWidth={3}
          strokeDasharray="12,6"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px #ff6600)' }}
          animate={{ strokeDashoffset: [0, 36] }}
          transition={{ duration: 0.2, repeat: Infinity, ease: 'linear' }}
        />
      )}
      
      {/* DANGER ZONE label */}
      <text
        x={DANGER_ZONE_X - 45}
        y={90}
        fill="#ff4444"
        fontSize={8}
        fontWeight="bold"
        style={{ filter: 'drop-shadow(0 0 3px #ff4444)' }}
      >
        ⚠ DANGER
      </text>
      
      {/* Status indicators */}
      <text
        x={ENTRY_ZONE_X - 60}
        y={130}
        fill={retreatingCount > 0 ? '#ff6600' : '#00ffff'}
        fontSize={9}
        fontWeight="bold"
        style={{ filter: `drop-shadow(0 0 3px ${retreatingCount > 0 ? '#ff6600' : '#00ffff'})` }}
      >
        {retreatingCount > 0 ? `🚀 ${retreatingCount} RETREATING` : `✈ ${attackingCount} ATTACKING`}
      </text>
      
      {/* Pulse markers at key positions */}
      {[DANGER_ZONE_X, 250, 400, ENTRY_ZONE_X].map((x, idx) => (
        <motion.circle
          key={`marker-${idx}`}
          cx={x}
          cy={400 - 180}
          r={3}
          fill={idx === 0 ? '#ff4444' : '#00ffff'}
          style={{ filter: `drop-shadow(0 0 4px ${idx === 0 ? '#ff4444' : '#00ffff'})` }}
          animate={{ 
            opacity: [0.4, 1, 0.4], 
            r: [2, 4, 2],
          }}
          transition={{ duration: 0.8, repeat: Infinity, delay: idx * 0.15 }}
        />
      ))}
    </motion.svg>
  );
};