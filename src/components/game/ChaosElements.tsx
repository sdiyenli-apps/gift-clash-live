import { motion, AnimatePresence } from 'framer-motion';
import { FlyingRobot, Chicken, NeonLight, Explosion, CHICKEN_SOUNDS } from '@/types/game';
import { useState, useEffect } from 'react';

interface ChaosElementsProps {
  flyingRobots: FlyingRobot[];
  chickens: Chicken[];
  neonLights: NeonLight[];
  explosions: Explosion[];
  cameraX: number;
}

export const ChaosElements = ({ flyingRobots, chickens, neonLights, explosions, cameraX }: ChaosElementsProps) => {
  return (
    <>
      {/* Flying Robots in the sky */}
      {flyingRobots.map(robot => (
        <FlyingRobotSprite key={robot.id} robot={robot} cameraX={cameraX} />
      ))}
      
      {/* Random Chickens */}
      <AnimatePresence>
        {chickens.map(chicken => (
          <ChickenSprite key={chicken.id} chicken={chicken} cameraX={cameraX} />
        ))}
      </AnimatePresence>
      
      {/* Neon Lights flying by */}
      {neonLights.map(light => (
        <motion.div
          key={light.id}
          className="absolute pointer-events-none"
          style={{
            left: light.x - cameraX,
            top: light.y,
            width: light.size * 3,
            height: light.size,
            background: light.color,
            borderRadius: '50%',
            filter: `blur(${light.size / 2}px)`,
            boxShadow: `0 0 ${light.size * 2}px ${light.color}`,
          }}
          animate={{
            x: [-100, 1200],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Explosions */}
      <AnimatePresence>
        {explosions.map(explosion => (
          <ExplosionSprite key={explosion.id} explosion={explosion} cameraX={cameraX} />
        ))}
      </AnimatePresence>
    </>
  );
};

const FlyingRobotSprite = ({ robot, cameraX }: { robot: FlyingRobot; cameraX: number }) => {
  const screenX = robot.x - cameraX;
  if (screenX < -200 || screenX > 1200) return null;
  
  const robotEmoji = robot.type === 'ufo' ? '🛸' : robot.type === 'jet' ? '✈️' : '🛰️';
  
  return (
    <motion.div
      className="absolute z-5 pointer-events-none"
      style={{
        left: screenX,
        top: robot.y,
      }}
      animate={{
        y: [robot.y, robot.y - 20, robot.y],
        rotate: robot.type === 'jet' ? [0, -5, 0, 5, 0] : 0,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.span 
        className="text-4xl"
        style={{ 
          filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.5))',
          display: 'block',
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {robotEmoji}
      </motion.span>
      
      {/* Trail effect */}
      <motion.div
        className="absolute top-1/2 -right-8 w-12 h-2"
        style={{
          background: 'linear-gradient(90deg, #00ffff, transparent)',
          filter: 'blur(2px)',
        }}
        animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.8, 1.2, 0.8] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </motion.div>
  );
};

const ChickenSprite = ({ chicken, cameraX }: { chicken: Chicken; cameraX: number }) => {
  const screenX = chicken.x - cameraX;
  const [showSound, setShowSound] = useState(false);
  const [sound, setSound] = useState('');
  
  useEffect(() => {
    if (chicken.state === 'stopped') {
      setShowSound(true);
      setSound(CHICKEN_SOUNDS[Math.floor(Math.random() * CHICKEN_SOUNDS.length)]);
    } else {
      setShowSound(false);
    }
  }, [chicken.state]);
  
  if (screenX < -100 || screenX > 1100 || chicken.state === 'gone') return null;
  
  return (
    <motion.div
      className="absolute z-15"
      style={{
        left: screenX,
        bottom: 100,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: chicken.state === 'appearing' ? [0, 1] : 1,
        scale: chicken.state === 'appearing' ? [0, 1.2, 1] : 1,
        x: chicken.state === 'walking' ? chicken.direction * 200 : 0,
      }}
      exit={{ opacity: 0, y: -50, scale: 0 }}
      transition={{ duration: chicken.state === 'walking' ? 2 : 0.5 }}
    >
      {/* Speech bubble */}
      {showSound && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-bold text-orange-600 whitespace-nowrap"
        >
          {sound}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-white" />
        </motion.div>
      )}
      
      {/* Chicken body */}
      <motion.div
        className="relative"
        animate={{ 
          rotate: chicken.state === 'stopped' ? [-5, 5, -5] : 0,
          scaleX: chicken.direction,
        }}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        <span className="text-5xl" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.4))' }}>
          🐔
        </span>
      </motion.div>
      
      {/* Walking dust */}
      {chicken.state === 'walking' && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          <div className="w-6 h-2 bg-yellow-700/30 rounded-full blur-sm" />
        </motion.div>
      )}
    </motion.div>
  );
};

const ExplosionSprite = ({ explosion, cameraX }: { explosion: Explosion; cameraX: number }) => {
  const screenX = explosion.x - cameraX;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenX - explosion.size / 2,
        top: explosion.y - explosion.size / 2,
        width: explosion.size,
        height: explosion.size,
      }}
      initial={{ scale: 0.5, opacity: 1 }}
      animate={{ scale: [0.5, 1.5, 2], opacity: [1, 0.8, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Core explosion */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, #ffffff, #ffff00, #ff8800, #ff0000, transparent)',
          filter: 'blur(5px)',
        }}
      />
      
      {/* Explosion rings */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `3px solid ${i === 0 ? '#ff8800' : i === 1 ? '#ff4400' : '#ff0000'}`,
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 1 + i * 0.5, opacity: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        />
      ))}
      
      {/* Sparks */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            background: i % 2 === 0 ? '#ffff00' : '#ff8800',
            boxShadow: `0 0 10px ${i % 2 === 0 ? '#ffff00' : '#ff8800'}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ 
            x: Math.cos(i * Math.PI / 4) * explosion.size,
            y: Math.sin(i * Math.PI / 4) * explosion.size,
            opacity: 0,
          }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </motion.div>
  );
};
