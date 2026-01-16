import { motion } from 'framer-motion';
import { Enemy as EnemyType, ENEMY_DEATH_SOUNDS } from '@/types/game';
import { useState, useEffect } from 'react';

interface EnemyProps {
  enemy: EnemyType;
  cameraX: number;
}

const ENEMY_COLORS: Record<string, string> = {
  robot: '#ff4444',
  drone: '#00ffff',
  mech: '#ff8800',
  boss: '#ff0000',
  ninja: '#8800ff',
  tank: '#44aa44',
  flyer: '#ff66ff',
  chicken: '#ffaa00',
};

export const EnemySprite = ({ enemy, cameraX }: EnemyProps) => {
  const screenX = enemy.x - cameraX;
  const [deathSound, setDeathSound] = useState('');
  
  useEffect(() => {
    if (enemy.isDying && !deathSound) {
      setDeathSound(ENEMY_DEATH_SOUNDS[Math.floor(Math.random() * ENEMY_DEATH_SOUNDS.length)]);
    }
  }, [enemy.isDying, deathSound]);
  
  if (screenX < -200 || screenX > 1200) return null;
  
  const color = ENEMY_COLORS[enemy.type] || '#ff4444';
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  
  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: screenX,
        bottom: 480 - enemy.y - enemy.height,
        width: enemy.width,
        height: enemy.height,
      }}
      animate={enemy.isDying ? {
        scale: [1, 1.3, 0],
        rotate: [0, -30, 30, 0],
        opacity: [1, 1, 0],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Death effects */}
      {enemy.isDying && (
        <>
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}, transparent)`,
              filter: 'blur(15px)',
            }}
          />
          {[0, 1, 2].map(i => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.5 + i, opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: color }}
            />
          ))}
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -80, scale: 1.5 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-xl"
            style={{ color: '#ff4400', textShadow: '0 0 15px #ff0000' }}
          >
            {deathSound}
          </motion.div>
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -100 }}
            transition={{ duration: 1 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-2xl"
            style={{ color: '#ffff00', textShadow: '0 0 15px #ffff00' }}
          >
            +{enemy.type === 'boss' ? 2000 : enemy.type === 'tank' ? 300 : enemy.type === 'mech' ? 200 : 50}
          </motion.div>
        </>
      )}
      
      {/* Enemy Body - 3D-ish Premium Look */}
      <motion.div
        className="relative w-full h-full"
        animate={enemy.isDying ? {} : {
          y: ['drone', 'flyer'].includes(enemy.type) ? [0, -10, 0] : [0, -3, 0],
          rotate: enemy.type === 'drone' ? [-3, 3, -3] : 0,
        }}
        transition={{ duration: ['drone', 'flyer'].includes(enemy.type) ? 1 : 0.5, repeat: Infinity }}
      >
        {/* Main Body with 3D gradient */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${color}dd, ${color}66, ${color}44)`,
            boxShadow: `0 4px 20px ${color}66, inset -5px -5px 20px rgba(0,0,0,0.4), inset 5px 5px 20px rgba(255,255,255,0.2)`,
            border: `3px solid ${color}`,
          }}
        >
          {/* Metallic highlight */}
          <div 
            className="absolute top-2 left-2 w-1/3 h-1/3 rounded-lg opacity-40"
            style={{ background: 'linear-gradient(135deg, #fff, transparent)' }}
          />
          
          {/* Eye(s) */}
          {enemy.type !== 'chicken' && (
            <motion.div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 flex gap-2"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {enemy.type === 'boss' ? (
                <>
                  <div className="w-6 h-8 rounded-full bg-red-500" style={{ boxShadow: '0 0 20px #ff0000' }}>
                    <div className="w-3 h-3 bg-black rounded-full mt-2 ml-1.5" />
                  </div>
                  <div className="w-6 h-8 rounded-full bg-red-500" style={{ boxShadow: '0 0 20px #ff0000' }}>
                    <div className="w-3 h-3 bg-black rounded-full mt-2 ml-1.5" />
                  </div>
                </>
              ) : (
                <div 
                  className={`rounded-full ${enemy.type === 'tank' ? 'w-8 h-4' : 'w-4 h-4'}`}
                  style={{ background: color, boxShadow: `0 0 15px ${color}` }}
                />
              )}
            </motion.div>
          )}
          
          {/* Type-specific features */}
          {enemy.type === 'ninja' && (
            <motion.div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-800"
              animate={{ scaleX: [1, 0.8, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          )}
          
          {enemy.type === 'tank' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-gray-700 rounded" />
          )}
          
          {enemy.type === 'drone' && (
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-2"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
              animate={{ scaleX: [0.5, 1.2, 0.5], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.08, repeat: Infinity }}
            />
          )}
          
          {enemy.type === 'flyer' && (
            <>
              <motion.div
                className="absolute top-2 -left-4 w-6 h-3 rounded-full"
                style={{ background: color }}
                animate={{ rotate: [0, -20, 0], y: [0, -3, 0] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-2 -right-4 w-6 h-3 rounded-full"
                style={{ background: color }}
                animate={{ rotate: [0, 20, 0], y: [0, -3, 0] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              />
            </>
          )}
        </div>
        
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-2 rounded-lg opacity-30"
          style={{
            background: `radial-gradient(circle, ${color}66, transparent)`,
            filter: 'blur(10px)',
          }}
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Health bar */}
      <div 
        className="absolute -top-5 left-0 w-full h-3 rounded-full overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.8)', border: `2px solid ${color}66` }}
      >
        <motion.div
          className="h-full transition-all duration-200"
          style={{ 
            width: `${healthPercent}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
      
      {/* Boss-specific elements */}
      {enemy.type === 'boss' && !enemy.isDying && (
        <>
          <motion.div
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-xl font-black tracking-wider" style={{ color: '#ff0000', textShadow: '0 0 20px #ff0000, 0 0 40px #ff0000' }}>
              💀 MEGA DESTROYER 💀
            </span>
          </motion.div>
          
          <motion.div
            className="absolute -inset-8 rounded-lg"
            style={{
              background: 'radial-gradient(circle, rgba(255,0,0,0.3), transparent)',
              filter: 'blur(15px)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Boss lightning effects */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`lightning-${i}`}
              className="absolute w-1 h-20"
              style={{
                left: `${20 + i * 20}%`,
                bottom: '100%',
                background: 'linear-gradient(180deg, transparent, #ff0000, #ffff00)',
                filter: 'blur(1px)',
              }}
              animate={{ opacity: [0, 1, 0], scaleY: [0.5, 1, 0.5] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </>
      )}
      
      {/* Damage indicator */}
      {healthPercent < 50 && !enemy.isDying && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle, transparent 50%, ${color}44 100%)` }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          {/* Sparks when damaged */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`damage-spark-${i}`}
              className="absolute w-2 h-2 rounded-full bg-yellow-400"
              style={{
                left: `${30 + i * 20}%`,
                top: `${20 + (i * 17) % 50}%`,
              }}
              animate={{ opacity: [0, 1, 0], y: [-5, 5, -5] }}
              transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};
