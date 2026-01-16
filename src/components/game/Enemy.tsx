import { motion } from 'framer-motion';
import { Enemy as EnemyType, ENEMY_DEATH_SOUNDS } from '@/types/game';
import { useState, useEffect } from 'react';

import robotSprite from '@/assets/enemy-robot.png';
import droneSprite from '@/assets/enemy-drone.png';
import mechSprite from '@/assets/enemy-mech.png';
import bossSprite from '@/assets/enemy-boss.png';

interface EnemyProps {
  enemy: EnemyType;
  cameraX: number;
}

const SPRITE_MAP = {
  robot: robotSprite,
  drone: droneSprite,
  mech: mechSprite,
  boss: bossSprite,
};

const ENEMY_COLORS = {
  robot: '#ff4444',
  drone: '#00ffff',
  mech: '#ff8800',
  boss: '#ff0000',
};

export const EnemySprite = ({ enemy, cameraX }: EnemyProps) => {
  const screenX = enemy.x - cameraX;
  const [deathSound, setDeathSound] = useState('');
  
  useEffect(() => {
    if (enemy.isDying && !deathSound) {
      setDeathSound(ENEMY_DEATH_SOUNDS[Math.floor(Math.random() * ENEMY_DEATH_SOUNDS.length)]);
    }
  }, [enemy.isDying, deathSound]);
  
  // Don't render if off screen
  if (screenX < -150 || screenX > 1100) return null;
  
  const sprite = SPRITE_MAP[enemy.type];
  const color = ENEMY_COLORS[enemy.type];
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
        filter: ['brightness(1)', 'brightness(3)', 'brightness(0)'],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Death explosion effect */}
      {enemy.isDying && (
        <>
          {/* Flash */}
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}, transparent)`,
              filter: 'blur(10px)',
            }}
          />
          {/* Explosion rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2 + i, opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: color }}
            />
          ))}
          {/* Death text */}
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 1.5 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-lg"
            style={{ 
              color: '#ff4400',
              textShadow: '0 0 10px #ff0000, 0 0 20px #ff0000',
            }}
          >
            {deathSound}
          </motion.div>
          {/* Score popup */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -80 }}
            transition={{ duration: 1 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-xl"
            style={{ 
              color: '#ffff00',
              textShadow: '0 0 10px #ffff00',
            }}
          >
            +{enemy.type === 'boss' ? 1000 : enemy.type === 'mech' ? 200 : 50}
          </motion.div>
        </>
      )}
      
      {/* Enemy sprite container */}
      <motion.div
        className="relative w-full h-full"
        animate={enemy.isDying ? {} : {
          y: enemy.type === 'drone' ? [0, -8, 0] : [0, -2, 0],
          rotate: enemy.type === 'drone' ? [-3, 3, -3] : 0,
        }}
        transition={{ 
          duration: enemy.type === 'drone' ? 1 : 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Sprite image */}
        <motion.img
          src={sprite}
          alt={enemy.type}
          className="w-full h-full object-contain"
          style={{
            filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 10px ${color}66)`,
          }}
          animate={enemy.isDying ? {} : {
            scaleX: [-1, -1],
          }}
        />
        
        {/* Enemy glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${color}44, transparent)`,
            filter: 'blur(15px)',
          }}
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Eye glow (for robot/mech/boss) */}
        {(enemy.type === 'robot' || enemy.type === 'mech' || enemy.type === 'boss') && !enemy.isDying && (
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4 h-2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 15px ${color}, 0 0 30px ${color}`,
            }}
            animate={{ 
              opacity: [0.7, 1, 0.7],
              scaleX: [1, 1.2, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        
        {/* Drone propeller effect */}
        {enemy.type === 'drone' && !enemy.isDying && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1"
            style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
            animate={{ scaleX: [0.5, 1, 0.5] }}
            transition={{ duration: 0.05, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Health bar (always visible for all enemies) */}
      <div 
        className="absolute -top-4 left-0 w-full h-2 rounded-full overflow-hidden"
        style={{ 
          background: 'rgba(0,0,0,0.7)',
          border: `1px solid ${color}66`,
        }}
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
      
      {/* Boss specific elements */}
      {enemy.type === 'boss' && !enemy.isDying && (
        <>
          {/* Boss name */}
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span 
              className="text-sm font-bold tracking-wider"
              style={{ 
                color: '#ff0000',
                textShadow: '0 0 10px #ff0000',
              }}
            >
              ⚠️ MEGA DESTROYER ⚠️
            </span>
          </motion.div>
          
          {/* Boss aura */}
          <motion.div
            className="absolute -inset-4 rounded-lg"
            style={{
              background: 'radial-gradient(circle, rgba(255,0,0,0.2), transparent)',
              filter: 'blur(10px)',
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </>
      )}
      
      {/* Damage indicator */}
      {healthPercent < 50 && !enemy.isDying && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle, transparent 50%, ${color}33 100%)`,
          }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
