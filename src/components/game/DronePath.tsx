import { Enemy } from '@/types/game';

interface DronePathProps {
  enemies: Enemy[];
  cameraX: number;
}

// Simple drone path indicator - no overlay, just minimal UI
export const DronePaths = ({ enemies, cameraX }: DronePathProps) => {
  // Filter to only flying enemies (drones, bombers)
  const flyingEnemies = enemies.filter(e => 
    (e.type === 'drone' || e.type === 'bomber' || e.type === 'flyer') && 
    !e.isDying && 
    !e.isSpawning
  );
  
  if (flyingEnemies.length === 0) return null;
  
  const retreatingCount = flyingEnemies.filter(e => e.isRetreating).length;
  const attackingCount = flyingEnemies.length - retreatingCount;
  
  // Simple status text only - no overlay paths
  return (
    <div 
      className="absolute top-2 right-2 z-10 pointer-events-none text-[10px] font-bold px-2 py-1 rounded"
      style={{
        background: retreatingCount > 0 ? 'rgba(255,102,0,0.8)' : 'rgba(0,255,255,0.8)',
        color: '#000',
      }}
    >
      {retreatingCount > 0 
        ? `🚀 ${retreatingCount} RETREATING` 
        : `✈ ${attackingCount} DRONES`}
    </div>
  );
};
