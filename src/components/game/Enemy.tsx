import { motion } from 'framer-motion';
import { Enemy as EnemyType, ENEMY_DEATH_SOUNDS } from '@/types/game';
import { useState, useEffect } from 'react';
import enemyRobot from '@/assets/enemy-robot.png';
import enemyDrone from '@/assets/enemy-drone.png';
import enemyMech from '@/assets/enemy-mech.png';
import enemyBoss from '@/assets/enemy-boss.png';

interface EnemyProps {
  enemy: EnemyType;
  cameraX: number;
}

const ENEMY_SPRITES: Record<string, string> = {
  robot: enemyRobot,
  drone: enemyDrone,
  mech: enemyMech,
  boss: enemyBoss,
  ninja: enemyRobot,
  tank: enemyMech,
  flyer: enemyDrone,
};

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
  const sprite = ENEMY_SPRITES[enemy.type];
  
  // Bigger enemies
  const displayWidth = enemy.width * 1.3;
  const displayHeight = enemy.height * 1.3;
  
  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: screenX,
        bottom: 80,
        width: displayWidth,
        height: displayHeight,
      }}
      animate={enemy.isDying ? {
        scale: [1, 1.4, 0],
        rotate: [0, -45, 45, 0],
        opacity: [1, 1, 0],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Death effects */}
      {enemy.isDying && (
        <>
          {/* Big explosion flash */}
          <motion.div
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, #fff, ${color}, transparent)`,
              filter: 'blur(10px)',
            }}
          />
          {/* Explosion rings */}
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 3 + i, opacity: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: i % 2 === 0 ? color : '#ffff00' }}
            />
          ))}
          {/* Death sound text */}
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1.5 }}
            animate={{ opacity: 0, y: -100, scale: 2 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-2xl"
            style={{ color: '#ff4400', textShadow: '0 0 20px #ff0000, 0 0 40px #ff4400' }}
          >
            {deathSound}
          </motion.div>
          {/* Score popup */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -120 }}
            transition={{ duration: 1.2 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-3xl"
            style={{ color: '#ffff00', textShadow: '0 0 20px #ffff00, 0 0 40px #ff8800' }}
          >
            +{enemy.type === 'boss' ? 2000 : enemy.type === 'tank' ? 300 : enemy.type === 'mech' ? 200 : 50}
          </motion.div>
          {/* Debris particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`debris-${i}`}
              className="absolute w-4 h-4 rounded"
              style={{ 
                background: color,
                left: '50%',
                top: '50%',
              }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ 
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                rotate: Math.random() * 720,
                opacity: 0,
              }}
              transition={{ duration: 0.6, delay: i * 0.02 }}
            />
          ))}
        </>
      )}
      
      {/* Enemy Sprite Image - with blend mode to remove background */}
      <motion.div
        className="relative w-full h-full"
        animate={enemy.isDying ? {} : {
          y: ['drone', 'flyer'].includes(enemy.type) ? [0, -15, 0] : [0, -4, 0],
          rotate: enemy.type === 'drone' ? [-5, 5, -5] : 0,
          scaleX: enemy.type === 'boss' ? [1, 1.02, 1] : 1,
        }}
        transition={{ duration: ['drone', 'flyer'].includes(enemy.type) ? 0.8 : 0.4, repeat: Infinity }}
      >
        {/* The actual sprite */}
        <motion.div
          className="relative w-full h-full"
          style={{
            filter: `drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color}66)`,
          }}
        >
          {sprite ? (
            <img 
              src={sprite} 
              alt={enemy.type}
              className="w-full h-full object-contain"
              style={{
                transform: 'scaleX(-1)', // Face the hero
                mixBlendMode: 'screen', // Helps with background removal
              }}
            />
          ) : (
            /* Fallback for types without sprites */
            <div
              className="w-full h-full rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${color}dd, ${color}66)`,
                boxShadow: `inset -5px -5px 20px rgba(0,0,0,0.4), inset 5px 5px 20px rgba(255,255,255,0.2)`,
                border: `3px solid ${color}`,
              }}
            >
              <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                style={{ background: '#ff0000', boxShadow: '0 0 20px #ff0000' }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </div>
          )}
          
          {/* Glowing eye effect overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div 
              className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full"
              style={{ 
                background: '#ff0000',
                boxShadow: '0 0 25px #ff0000, 0 0 50px #ff0000',
              }}
            />
          </motion.div>
          
          {/* Enemy shooting indicator */}
          {enemy.attackCooldown <= 0.5 && enemy.attackCooldown > 0 && (
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ left: -20 }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              <div 
                className="w-4 h-4 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ff0000, #ff4400, transparent)',
                  boxShadow: '0 0 10px #ff0000',
                }}
              />
            </motion.div>
          )}
        </motion.div>
        
        {/* Boss special effects */}
        {enemy.type === 'boss' && !enemy.isDying && (
          <>
            {/* Fire breathing effect */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ left: -80 }}
              animate={{ scaleX: [0.5, 1.2, 0.5], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <div 
                className="w-24 h-12 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, #ff4400, #ffff00)',
                  filter: 'blur(5px)',
                }}
              />
            </motion.div>
            
            {/* Boss title */}
            <motion.div
              className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap"
              animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-3xl font-black tracking-wider" style={{ color: '#ff0000', textShadow: '0 0 30px #ff0000, 0 0 60px #ff4400' }}>
                🐉 DRAGON LORD 🐉
              </span>
            </motion.div>
            
            {/* Boss health percent */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              animate={{ scale: healthPercent <= 30 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <span 
                className="text-lg font-black"
                style={{ 
                  color: healthPercent <= 30 ? '#ff0000' : '#fff',
                  textShadow: healthPercent <= 30 ? '0 0 20px #ff0000' : '0 0 10px #000',
                }}
              >
                {Math.round(healthPercent)}%
              </span>
            </motion.div>
            
            {/* Boss aura */}
            <motion.div
              className="absolute -inset-16 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,0,0,0.4), transparent)',
                filter: 'blur(20px)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Wing flap effect */}
            <motion.div
              className="absolute inset-0"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </>
        )}
        
        {/* Drone propeller effect */}
        {enemy.type === 'drone' && (
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-4"
            style={{ background: 'linear-gradient(90deg, transparent, #00ffff88, transparent)' }}
            animate={{ scaleX: [0.4, 1.3, 0.4], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.06, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Health bar */}
      <div 
        className="absolute -top-8 left-0 w-full h-5 rounded-full overflow-hidden"
        style={{ 
          background: 'rgba(0,0,0,0.9)', 
          border: `2px solid ${color}`,
          boxShadow: `0 0 10px ${color}44`,
        }}
      >
        <motion.div
          className="h-full"
          style={{ 
            width: `${healthPercent}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 15px ${color}, inset 0 1px 2px rgba(255,255,255,0.3)`,
          }}
          animate={{ opacity: healthPercent < 30 ? [1, 0.6, 1] : 1 }}
          transition={{ duration: 0.3, repeat: healthPercent < 30 ? Infinity : 0 }}
        />
      </div>
      
      {/* Damage sparks when low health */}
      {healthPercent < 40 && !enemy.isDying && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: '#ffff00',
                left: `${20 + i * 20}%`,
                top: `${20 + (i * 15) % 60}%`,
                boxShadow: '0 0 10px #ffff00',
              }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], y: [-5, 5, -5] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
          {/* Smoke */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gray-500/50"
            animate={{ y: [-10, -30], opacity: [0.5, 0], scale: [0.5, 1.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </>
      )}
    </motion.div>
  );
};
