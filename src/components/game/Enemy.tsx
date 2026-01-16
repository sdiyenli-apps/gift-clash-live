import { motion } from 'framer-motion';
import { Enemy as EnemyType, ENEMY_DEATH_SOUNDS } from '@/types/game';
import { useState, useEffect } from 'react';
import enemyRobot from '@/assets/enemy-robot.png';
import enemyDrone from '@/assets/enemy-drone.png';
import enemyMech from '@/assets/enemy-mech.png';
import enemyBossScary from '@/assets/enemy-boss-scary.png';

interface EnemyProps {
  enemy: EnemyType;
  cameraX: number;
}

const ENEMY_SPRITES: Record<string, string> = {
  robot: enemyRobot,
  drone: enemyDrone,
  mech: enemyMech,
  boss: enemyBossScary,
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
  
  if (screenX < -150 || screenX > 1000) return null;
  
  const color = ENEMY_COLORS[enemy.type] || '#ff4444';
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  const sprite = ENEMY_SPRITES[enemy.type];
  
  // Scale enemies - scaled for mobile
  const isBoss = enemy.type === 'boss';
  const bossPhase = enemy.bossPhase || 1;
  
  // Boss grows bigger with each phase
  const bossPhaseScale = isBoss ? (1 + (bossPhase - 1) * 0.2) : 1;
  const scaleFactor = (isBoss ? 0.8 : 1.0) * bossPhaseScale;
  const displayWidth = enemy.width * scaleFactor;
  const displayHeight = enemy.height * scaleFactor;
  
  // Flying enemies (drones) hover higher
  const isFlying = enemy.isFlying || enemy.type === 'drone';
  const flyOffset = isFlying ? (enemy.flyHeight || 50) : 0;
  
  // Portal spawn animation
  const isSpawning = enemy.isSpawning && (enemy.spawnTimer ?? 0) > 0;
  const spawnProgress = isSpawning ? 1 - ((enemy.spawnTimer ?? 0) / 0.8) : 1;
  
  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: screenX,
        bottom: 80 + flyOffset,
        width: displayWidth,
        height: displayHeight,
      }}
      initial={isSpawning ? { scale: 0, opacity: 0 } : {}}
      animate={enemy.isDying ? {
        scale: [1, 1.3, 0],
        rotate: [0, -30, 30, 0],
        opacity: [1, 1, 0],
      } : isSpawning ? {
        scale: spawnProgress,
        opacity: spawnProgress,
      } : {
        scale: 1,
        opacity: 1,
      }}
      transition={{ duration: enemy.isDying ? 0.4 : 0.1 }}
    >
      {/* Portal spawn effect */}
      {isSpawning && (
        <>
          <motion.div
            className="absolute inset-0 -m-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, #8800ff, #4400aa, transparent)',
              filter: 'blur(10px)',
            }}
            initial={{ scale: 2, opacity: 1 }}
            animate={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute inset-0 -m-6 rounded-full border-4 border-purple-500"
            initial={{ scale: 2.5, opacity: 1, rotate: 0 }}
            animate={{ scale: 0.3, opacity: 0, rotate: 360 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute inset-0 -m-4"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #ff00ff, #8800ff, transparent)',
              borderRadius: '50%',
              filter: 'blur(3px)',
            }}
            initial={{ rotate: 0, scale: 2 }}
            animate={{ rotate: 720, scale: 0.5 }}
            transition={{ duration: 0.8 }}
          />
        </>
      )}
      {/* Death effects */}
      {enemy.isDying && (
        <>
          <motion.div
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, #fff, ${color}, transparent)`,
              filter: 'blur(8px)',
            }}
          />
          {[0, 1, 2].map(i => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 2.5 + i, opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="absolute inset-0 rounded-full border-3"
              style={{ borderColor: i % 2 === 0 ? color : '#ffff00' }}
            />
          ))}
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1.3 }}
            animate={{ opacity: 0, y: -80, scale: 1.6 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-lg"
            style={{ color: '#ff4400', textShadow: '0 0 15px #ff0000, 0 0 30px #ff4400' }}
          >
            {deathSound}
          </motion.div>
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -100 }}
            transition={{ duration: 1 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-xl"
            style={{ color: '#ffff00', textShadow: '0 0 15px #ffff00, 0 0 30px #ff8800' }}
          >
            +{enemy.type === 'boss' ? 2500 : enemy.type === 'tank' ? 300 : enemy.type === 'mech' ? 180 : 60}
          </motion.div>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`debris-${i}`}
              className="absolute w-3 h-3 rounded"
              style={{ 
                background: color,
                left: '50%',
                top: '50%',
              }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ 
                x: (Math.random() - 0.5) * 150,
                y: (Math.random() - 0.5) * 150,
                rotate: Math.random() * 540,
                opacity: 0,
              }}
              transition={{ duration: 0.5, delay: i * 0.015 }}
            />
          ))}
        </>
      )}
      
      {/* Enemy Sprite - Original Style */}
      <motion.div
        className="relative w-full h-full"
        animate={enemy.isDying ? {} : {
          y: ['drone', 'flyer'].includes(enemy.type) ? [0, -10, 0] : [0, -3, 0],
          rotate: enemy.type === 'drone' ? [-3, 3, -3] : 0,
          scaleX: enemy.type === 'boss' ? [1, 1.02, 1] : 1,
        }}
        transition={{ duration: ['drone', 'flyer'].includes(enemy.type) ? 0.7 : 0.35, repeat: Infinity }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            filter: `brightness(0) drop-shadow(0 0 ${isBoss ? 20 : 10}px ${color}) drop-shadow(0 0 4px #fff)`,
          }}
        >
          {sprite ? (
            <img 
              src={sprite} 
              alt={enemy.type}
              className="w-full h-full object-contain"
              style={{
                transform: 'scaleX(-1)',
              }}
            />
          ) : (
            <div
              className="w-full h-full rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}88)`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 15px ${color}`,
              }}
            >
              <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full"
                style={{ background: '#ff0000', boxShadow: '0 0 15px #ff0000' }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.25, repeat: Infinity }}
              />
            </div>
          )}
          
          {/* Glowing eye effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            <div 
              className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, #ff0000, #ff000088)',
                boxShadow: '0 0 15px #ff0000, 0 0 30px #ff0000',
              }}
            />
          </motion.div>
          
          {/* Enemy shooting muzzle flash - MORE VISIBLE */}
          {enemy.attackCooldown <= 0.5 && enemy.attackCooldown > 0 && (
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ left: -25 }}
              initial={{ scale: 0 }}
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.8, 1.4, 0.8] }}
              transition={{ duration: 0.1, repeat: Infinity }}
            >
              {/* Muzzle flash */}
              <div 
                className="w-6 h-6 rounded-full"
                style={{
                  background: enemy.type === 'drone' 
                    ? 'radial-gradient(circle, #fff, #00ffff, #0088ff, transparent)'
                    : 'radial-gradient(circle, #fff, #ffff00, #ff4400, transparent)',
                  boxShadow: enemy.type === 'drone'
                    ? '0 0 20px #00ffff, 0 0 40px #0088ff'
                    : '0 0 15px #ffff00, 0 0 30px #ff4400',
                }}
              />
              {/* Flash rings */}
              {[0, 1].map(i => (
                <motion.div
                  key={`flash-${i}`}
                  className="absolute rounded-full border-2"
                  style={{
                    left: -5 - i * 5,
                    top: -5 - i * 5,
                    width: 16 + i * 10,
                    height: 16 + i * 10,
                    borderColor: enemy.type === 'drone' ? '#00ffff' : '#ff4400',
                  }}
                  animate={{ scale: [1, 2], opacity: [1, 0] }}
                  transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
        
        {/* Boss special effects - SCARY with phases */}
        {enemy.type === 'boss' && !enemy.isDying && (
          <>
            {/* Menacing aura - intensifies with phase */}
            <motion.div
              className="absolute -inset-12 rounded-full"
              style={{
                background: bossPhase === 3 
                  ? 'radial-gradient(circle, rgba(255,0,0,0.6), rgba(100,0,0,0.4), transparent)'
                  : bossPhase === 2
                  ? 'radial-gradient(circle, rgba(255,50,0,0.5), rgba(75,0,0,0.3), transparent)'
                  : 'radial-gradient(circle, rgba(255,0,0,0.4), rgba(50,0,0,0.2), transparent)',
                filter: `blur(${10 + bossPhase * 5}px)`,
              }}
              animate={{ 
                scale: [1, 1.2 + bossPhase * 0.1, 1], 
                opacity: [0.4, 0.7 + bossPhase * 0.1, 0.4] 
              }}
              transition={{ duration: 1.5 / bossPhase, repeat: Infinity }}
            />
            
            {/* Phase 2+ evil eyes */}
            {bossPhase >= 2 && (
              <>
                <motion.div
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    left: '30%',
                    top: '20%',
                    background: 'radial-gradient(circle, #ff0000, #aa0000)',
                    boxShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    right: '30%',
                    top: '20%',
                    background: 'radial-gradient(circle, #ff0000, #aa0000)',
                    boxShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: 0.15 }}
                />
              </>
            )}
            
            {/* Phase 3 rage flames */}
            {bossPhase === 3 && (
              <>
                <motion.div
                  className="absolute -inset-6 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, #ff0000, #ff4400, #ff0000, #ffff00, #ff0000)',
                    filter: 'blur(8px)',
                    opacity: 0.6,
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={`flame-${i}`}
                    className="absolute w-6 h-12"
                    style={{
                      left: `${15 + i * 25}%`,
                      top: '-20%',
                      background: 'linear-gradient(0deg, #ff4400, #ffff00, transparent)',
                      borderRadius: '50%',
                      filter: 'blur(3px)',
                    }}
                    animate={{ 
                      height: [12, 24, 12], 
                      opacity: [0.6, 1, 0.6],
                      y: [0, -10, 0],
                    }}
                    transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </>
            )}
            
            {/* Fire breathing - faster with phase */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ left: -50 - bossPhase * 10 }}
              animate={{ scaleX: [0.4, 1 + bossPhase * 0.2, 0.4], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 0.25 / bossPhase, repeat: Infinity }}
            >
              <div 
                className="w-16 h-8 rounded-full"
                style={{
                  width: 64 + bossPhase * 16,
                  background: bossPhase === 3 
                    ? 'linear-gradient(90deg, transparent, #ff0000, #ff4400, #ffff00)'
                    : 'linear-gradient(90deg, transparent, #ff4400, #ffff00)',
                  filter: 'blur(4px)',
                }}
              />
            </motion.div>
            
            {/* Dripping biomass effect */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={`drip-${i}`}
                className="absolute w-1 rounded-full"
                style={{
                  left: `${30 + i * 25}%`,
                  top: '80%',
                  height: 10 + Math.random() * 8 + bossPhase * 4,
                  background: bossPhase === 3 
                    ? 'linear-gradient(180deg, #ff0000, #660000)'
                    : 'linear-gradient(180deg, #ff2200, #aa0000)',
                }}
                animate={{
                  height: [10, 18 + bossPhase * 4, 10],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 0.8 + i * 0.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </>
        )}
        
        {/* Drone propeller */}
        {enemy.type === 'drone' && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-3"
            style={{ background: 'linear-gradient(90deg, transparent, #00ffff88, transparent)' }}
            animate={{ scaleX: [0.3, 1.2, 0.3], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.05, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Health bar - NOT on boss (use BossHUD instead) */}
      {!isBoss && (
        <div 
          className="absolute left-0 w-full rounded-full overflow-hidden -top-5 h-3"
          style={{ 
            background: 'rgba(0,0,0,0.9)', 
            border: `1px solid ${color}`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        >
          <motion.div
            className="h-full"
            style={{ 
              width: `${healthPercent}%`,
              background: `linear-gradient(90deg, ${color}, ${color}cc)`,
              boxShadow: `0 0 10px ${color}`,
            }}
            animate={{ opacity: healthPercent < 30 ? [1, 0.5, 1] : 1 }}
            transition={{ duration: 0.2, repeat: healthPercent < 30 ? Infinity : 0 }}
          />
        </div>
      )}
      
      {/* Damage sparks */}
      {healthPercent < 35 && !enemy.isDying && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: '#ffff00',
                left: `${20 + i * 25}%`,
                top: `${20 + (i * 20) % 50}%`,
                boxShadow: '0 0 8px #ffff00',
              }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.4], y: [-3, 3, -3] }}
              transition={{ duration: 0.25, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-500/40"
            animate={{ y: [-8, -20], opacity: [0.4, 0], scale: [0.4, 1.2] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        </>
      )}
    </motion.div>
  );
};
