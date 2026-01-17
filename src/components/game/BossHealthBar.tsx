import { motion } from 'framer-motion';
import { Enemy } from '@/types/game';

interface BossHealthBarProps {
  boss: Enemy;
  cameraX: number;
}

export const BossHealthBar = ({ boss, cameraX }: BossHealthBarProps) => {
  const screenX = boss.x - cameraX;
  const healthPercent = (boss.health / boss.maxHealth) * 100;
  const bossPhase = boss.bossPhase || 1;
  const isRaging = healthPercent <= 30 || bossPhase === 3;
  
  // Boss display scaling
  const bossPhaseScale = 1 + (bossPhase - 1) * 0.2;
  const displayWidth = boss.width * 0.8 * bossPhaseScale;
  const displayHeight = boss.height * 0.8 * bossPhaseScale;
  
  // Position HP bar above boss head
  const barWidth = Math.max(displayWidth, 80);
  
  if (screenX < -150 || screenX > 1000 || boss.isDying) return null;
  
  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      style={{
        left: screenX + (displayWidth / 2) - (barWidth / 2),
        bottom: 50 + displayHeight + 20, // Above boss head
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Boss name */}
      <motion.div
        className="text-center mb-1"
        animate={isRaging ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        <span 
          className="font-bold text-[10px] tracking-wider"
          style={{ 
            color: bossPhase === 3 ? '#ff0000' : bossPhase === 2 ? '#ff4400' : '#ff6600',
            textShadow: `0 0 8px ${bossPhase === 3 ? '#ff0000' : '#ff4400'}`,
          }}
        >
          {bossPhase === 3 ? '☠️' : bossPhase === 2 ? '😈' : '👹'}
          {bossPhase > 1 && (
            <motion.span
              className="ml-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              P{bossPhase}
            </motion.span>
          )}
        </span>
      </motion.div>
      
      {/* Health bar container */}
      <div 
        className="h-3 rounded-full overflow-hidden relative"
        style={{
          width: barWidth,
          background: 'rgba(0,0,0,0.9)',
          border: `2px solid ${isRaging ? '#ff0000' : '#ff4400'}`,
          boxShadow: `0 0 12px ${isRaging ? '#ff0000' : '#ff4400'}66`,
        }}
      >
        <motion.div
          className="h-full"
          style={{ 
            width: `${healthPercent}%`,
            background: isRaging 
              ? 'linear-gradient(90deg, #ff0000, #ff4400)'
              : 'linear-gradient(90deg, #ff4400, #ff8800, #ffff00)',
            boxShadow: `0 0 8px ${isRaging ? '#ff0000' : '#ff4400'}, inset 0 1px 2px rgba(255,255,255,0.3)`,
          }}
          animate={isRaging ? { opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
        
        {/* Shine effect */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />
      </div>
      
      {/* Health percentage */}
      <div className="text-center mt-0.5">
        <span 
          className="text-[9px] font-bold"
          style={{ 
            color: isRaging ? '#ff0000' : '#fff',
            textShadow: isRaging ? '0 0 8px #ff0000' : 'none',
          }}
        >
          {Math.round(healthPercent)}%
        </span>
      </div>
      
      {/* Rage indicator border */}
      {isRaging && (
        <motion.div
          className="absolute -inset-1 pointer-events-none rounded-lg"
          style={{
            border: '1px solid #ff0000',
            boxShadow: '0 0 15px #ff0000',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
