import { motion } from 'framer-motion';
import { Enemy as EnemyType, ENEMY_DEATH_SOUNDS } from '@/types/game';
import { useState, useEffect } from 'react';

interface EnemyProps {
  enemy: EnemyType;
  cameraX: number;
}

export const EnemySprite = ({ enemy, cameraX }: EnemyProps) => {
  const screenX = enemy.x - cameraX;
  const [deathSound, setDeathSound] = useState('');
  
  useEffect(() => {
    if (enemy.isDying && !deathSound) {
      setDeathSound(ENEMY_DEATH_SOUNDS[Math.floor(Math.random() * ENEMY_DEATH_SOUNDS.length)]);
    }
  }, [enemy.isDying, deathSound]);
  
  // Don't render if off screen
  if (screenX < -100 || screenX > 1000) return null;
  
  const renderRobot = () => (
    <div className="relative w-full h-full">
      {/* Body */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-8 rounded-md"
        style={{
          background: 'linear-gradient(135deg, #666, #444)',
          boxShadow: '2px 2px 0 #333, inset 0 0 10px rgba(255,0,0,0.3)',
        }}
      />
      {/* Head */}
      <div 
        className="absolute bottom-7 left-1/2 -translate-x-1/2 w-8 h-7 rounded-t-md"
        style={{
          background: 'linear-gradient(135deg, #888, #555)',
          boxShadow: '2px 2px 0 #333',
        }}
      />
      {/* Evil red eyes */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex gap-2">
        <motion.div 
          className="w-2 h-2 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ boxShadow: '0 0 8px #ff0000' }}
        />
        <motion.div 
          className="w-2 h-2 rounded-full bg-red-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ boxShadow: '0 0 8px #ff0000' }}
        />
      </div>
      {/* Antenna */}
      <div className="absolute bottom-[54px] left-1/2 -translate-x-1/2 w-0.5 h-3 bg-gray-500" />
      <motion.div 
        className="absolute bottom-[66px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-400"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        style={{ boxShadow: '0 0 6px #ff0000' }}
      />
      {/* Arms */}
      <div className="absolute bottom-3 -left-1 w-2 h-5 bg-gray-500 rounded" />
      <div className="absolute bottom-3 -right-1 w-2 h-5 bg-gray-500 rounded" />
      {/* Legs */}
      <motion.div
        className="absolute -bottom-1 left-2 w-2 h-2 bg-gray-600 rounded-b"
        animate={{ y: [0, -1, 0] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-1 right-2 w-2 h-2 bg-gray-600 rounded-b"
        animate={{ y: [-1, 0, -1] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />
    </div>
  );
  
  const renderDrone = () => (
    <div className="relative w-full h-full">
      {/* Body */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-5 rounded-full"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        style={{
          background: 'linear-gradient(135deg, #555, #333)',
          boxShadow: '0 3px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(255,0,0,0.3)',
        }}
      />
      {/* Eye */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500"
        animate={{ opacity: [1, 0.3, 1], y: [0, -3, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        style={{ boxShadow: '0 0 12px #ff0000' }}
      />
      {/* Propellers */}
      <motion.div
        className="absolute -top-1 left-0 w-full h-1 bg-gray-400 rounded"
        animate={{ scaleX: [0.8, 1, 0.8], y: [0, -3, 0] }}
        transition={{ duration: 0.1, repeat: Infinity }}
      />
    </div>
  );
  
  const renderMech = () => (
    <div className="relative w-full h-full">
      {/* Legs */}
      <motion.div
        className="absolute bottom-0 left-3 w-4 h-10 bg-gray-600 rounded"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 0.4, repeat: Infinity }}
        style={{ transformOrigin: 'top center' }}
      />
      <motion.div
        className="absolute bottom-0 right-3 w-4 h-10 bg-gray-600 rounded"
        animate={{ rotate: [5, -5, 5] }}
        transition={{ duration: 0.4, repeat: Infinity }}
        style={{ transformOrigin: 'top center' }}
      />
      {/* Body */}
      <div 
        className="absolute bottom-9 left-1/2 -translate-x-1/2 w-14 h-12 rounded-md"
        style={{
          background: 'linear-gradient(135deg, #777, #444)',
          boxShadow: '3px 3px 0 #333, inset 0 0 15px rgba(255,100,0,0.3)',
        }}
      />
      {/* Cockpit/head */}
      <div 
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-10 h-8 rounded-t-lg"
        style={{
          background: 'linear-gradient(135deg, #555, #333)',
          boxShadow: '2px 2px 0 #222',
        }}
      />
      {/* Visor */}
      <motion.div 
        className="absolute bottom-21 left-1/2 -translate-x-1/2 w-8 h-3 rounded bg-red-500"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        style={{ boxShadow: '0 0 15px #ff0000' }}
      />
      {/* Shoulder cannons */}
      <div className="absolute bottom-16 -left-1 w-4 h-3 bg-gray-500 rounded-l" />
      <div className="absolute bottom-16 -right-1 w-4 h-3 bg-gray-500 rounded-r" />
    </div>
  );
  
  const renderBoss = () => (
    <div className="relative w-full h-full">
      {/* Massive body */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-24 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #8B0000, #4a0000)',
          boxShadow: '5px 5px 0 #2a0000, inset 0 0 30px rgba(255,0,0,0.5)',
        }}
      />
      {/* Head */}
      <div 
        className="absolute bottom-22 left-1/2 -translate-x-1/2 w-16 h-14 rounded-t-lg"
        style={{
          background: 'linear-gradient(135deg, #666, #333)',
          boxShadow: '4px 4px 0 #222',
        }}
      />
      {/* Evil eyes */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-4">
        <motion.div 
          className="w-4 h-4 rounded-full bg-red-600"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{ boxShadow: '0 0 20px #ff0000' }}
        />
        <motion.div 
          className="w-4 h-4 rounded-full bg-red-600"
          animate={{ scale: [1.3, 1, 1.3], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{ boxShadow: '0 0 20px #ff0000' }}
        />
      </div>
      {/* Horns */}
      <div className="absolute bottom-36 left-6 w-3 h-8 bg-gray-600 rounded-t -rotate-12" />
      <div className="absolute bottom-36 right-6 w-3 h-8 bg-gray-600 rounded-t rotate-12" />
      {/* Arm cannons */}
      <motion.div 
        className="absolute bottom-10 -left-6 w-8 h-6 bg-gray-500 rounded-l"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-10 -right-6 w-8 h-6 bg-gray-500 rounded-r"
        animate={{ rotate: [5, -5, 5] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      {/* Health bar */}
      <div className="absolute -top-6 left-0 w-full h-3 bg-gray-800 rounded overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
          style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
        />
      </div>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold text-red-400">
        BOSS
      </div>
    </div>
  );
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: screenX,
        bottom: 480 - enemy.y - enemy.height,
        width: enemy.width,
        height: enemy.height,
      }}
      animate={enemy.isDying ? {
        scale: [1, 1.2, 0],
        rotate: [0, -20, 20, 0],
        opacity: [1, 1, 0],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Death text */}
      {enemy.isDying && deathSound && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -50 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-sm"
          style={{ color: '#ff4400', textShadow: '0 0 10px #ff0000' }}
        >
          {deathSound}
        </motion.div>
      )}
      
      {enemy.type === 'robot' && renderRobot()}
      {enemy.type === 'drone' && renderDrone()}
      {enemy.type === 'mech' && renderMech()}
      {enemy.type === 'boss' && renderBoss()}
    </motion.div>
  );
};
