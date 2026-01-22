import { motion, AnimatePresence } from 'framer-motion';
import { FlyingRobot, Chicken, NeonLight, Explosion } from '@/types/game';
import { useState, useEffect, forwardRef } from 'react';

const CHICKEN_SOUNDS = [
  "BAWK BAWK! 🐔",
  "CLUCK CLUCK!",
  "BOK BOK BOK!",
  "*chicken noises*",
  "BRRAWK!",
];

interface ChaosElementsProps {
  flyingRobots: FlyingRobot[];
  chickens?: Chicken[]; // Optional, not used
  neonLights: NeonLight[];
  explosions: Explosion[];
  cameraX: number;
}

export const ChaosElements = ({ neonLights, explosions, cameraX }: ChaosElementsProps) => {
  return (
    <>
      {/* Neon Lights - reduced for performance */}
      {neonLights.slice(0, 2).map(light => (
        <div
          key={light.id}
          className="absolute pointer-events-none"
          style={{
            left: light.x - cameraX,
            top: light.y,
            width: light.size * 3,
            height: light.size,
            background: light.color,
            borderRadius: '50%',
            filter: `blur(${light.size / 4}px)`,
            opacity: 0.6,
          }}
        />
      ))}
      
      {/* Explosions - limited */}
      <AnimatePresence>
        {explosions.slice(0, 3).map(explosion => (
          <ExplosionSprite key={explosion.id} explosion={explosion} cameraX={cameraX} />
        ))}
      </AnimatePresence>
    </>
  );
};

const FlyingRobotSprite = forwardRef<HTMLDivElement, { robot: FlyingRobot; cameraX: number }>(
  ({ robot, cameraX }, ref) => {
    const screenX = robot.x - cameraX;
    if (screenX < -200 || screenX > 1200) return null;
    
    const robotEmoji = robot.type === 'ufo' ? '🛸' : robot.type === 'jet' ? '✈️' : '🛰️';
    
    return (
      <motion.div
        ref={ref}
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
          className="text-3xl"
          style={{ 
            filter: 'drop-shadow(0 0 8px rgba(0,255,255,0.5))',
            display: 'block',
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {robotEmoji}
        </motion.span>
        
        {/* Trail effect */}
        <motion.div
          className="absolute top-1/2 -right-6 w-8 h-1"
          style={{
            background: 'linear-gradient(90deg, #00ffff, transparent)',
            filter: 'blur(1px)',
          }}
          animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </motion.div>
    );
  }
);
FlyingRobotSprite.displayName = 'FlyingRobotSprite';

const ChickenSprite = forwardRef<HTMLDivElement, { chicken: Chicken; cameraX: number }>(
  ({ chicken, cameraX }, ref) => {
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
    
    // Attacking chickens fly through the air toward enemies!
    const isAttacking = chicken.state === 'attacking';
    const bottomPos = isAttacking ? chicken.y : 60;
    
    return (
      <motion.div
        ref={ref}
        className="absolute z-15"
        style={{
          left: screenX,
          bottom: bottomPos,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1,
          scale: isAttacking ? 1.3 : 1,
          rotate: isAttacking ? [0, 15, -15, 0] : 0,
        }}
        exit={{ opacity: 0, y: -30, scale: 0 }}
        transition={{ duration: isAttacking ? 0.15 : 0.5, repeat: isAttacking ? Infinity : 0 }}
      >
        {/* Speech bubble */}
        {showSound && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-lg text-xs font-bold text-orange-600 whitespace-nowrap"
          >
            {sound}
          </motion.div>
        )}
        
        {/* Attack trail for flying chickens */}
        {isAttacking && (
          <motion.div
            className="absolute -left-8 top-1/2 -translate-y-1/2 w-12 h-3"
            style={{
              background: 'linear-gradient(90deg, transparent, #ff8800, #ffff00)',
              filter: 'blur(4px)',
              borderRadius: '50%',
            }}
            animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
        )}
        
        {/* Chicken body */}
        <motion.div
          className="relative"
          animate={{ 
            rotate: chicken.state === 'stopped' ? [-5, 5, -5] : isAttacking ? [0, 20, -20, 0] : 0,
            scaleX: chicken.direction,
          }}
          transition={{ duration: isAttacking ? 0.1 : 0.3, repeat: Infinity }}
        >
          <span 
            className={`${isAttacking ? 'text-4xl' : 'text-3xl'}`} 
            style={{ 
              filter: isAttacking 
                ? 'drop-shadow(0 0 10px #ff8800) drop-shadow(2px 3px 4px rgba(0,0,0,0.4))' 
                : 'drop-shadow(2px 3px 4px rgba(0,0,0,0.4))',
            }}
          >
            {isAttacking ? '🐓' : '🐔'}
          </span>
        </motion.div>
      </motion.div>
    );
  }
);
ChickenSprite.displayName = 'ChickenSprite';

const ExplosionSprite = forwardRef<HTMLDivElement, { explosion: Explosion; cameraX: number }>(
  ({ explosion, cameraX }, ref) => {
    const screenX = explosion.x - cameraX;
    if (screenX < -100 || screenX > 1100) return null;
    
    // Check if this is a tank explosion (larger size = tank)
    const isTankExplosion = explosion.size >= 100;
    const aoeRadius = isTankExplosion ? 120 : 0; // Match the AOE_RADIUS from game logic
    
    return (
      <motion.div
        ref={ref}
        className="absolute pointer-events-none z-5"
        style={{
          left: screenX - explosion.size / 2,
          top: explosion.y - explosion.size / 2,
          width: explosion.size,
          height: explosion.size,
        }}
        initial={{ scale: 0.3, opacity: 1 }}
        animate={{ scale: [0.3, 1.5, 2.5], opacity: [1, 0.9, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* TANK AOE RADIUS INDICATOR */}
        {isTankExplosion && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: aoeRadius * 2,
              height: aoeRadius * 2,
              marginLeft: -aoeRadius,
              marginTop: -aoeRadius,
              border: '3px solid rgba(255,100,0,0.8)',
              background: 'radial-gradient(circle, rgba(255,150,0,0.3), rgba(255,50,0,0.1), transparent 70%)',
              boxShadow: '0 0 30px rgba(255,100,0,0.6), inset 0 0 40px rgba(255,200,0,0.3)',
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.2, 1], opacity: [1, 0.8, 0] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
        
        {/* Core explosion - bright white center */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: isTankExplosion 
              ? 'radial-gradient(circle, #ffffff 0%, #ffcc00 15%, #ff8800 35%, #ff4400 55%, #ff0000 75%, transparent 100%)'
              : 'radial-gradient(circle, #ffffff 0%, #ffff00 20%, #ff8800 40%, #ff4400 60%, #ff0000 80%, transparent 100%)',
            filter: isTankExplosion ? 'blur(5px)' : 'blur(3px)',
          }}
        />
        
        {/* Outer glow - bigger for tank */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: isTankExplosion ? -20 : -4,
            background: isTankExplosion 
              ? 'radial-gradient(circle, rgba(255,150,0,0.7), rgba(255,50,0,0.4) 50%, transparent 80%)'
              : 'radial-gradient(circle, rgba(255,100,0,0.6), transparent 70%)',
          }}
          animate={{ scale: [1, 1.8], opacity: [0.9, 0] }}
          transition={{ duration: isTankExplosion ? 0.5 : 0.4 }}
        />
        
        {/* Explosion rings - more for tank */}
        {[0, 1, 2, ...(isTankExplosion ? [3, 4] : [])].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: `${isTankExplosion ? 4 : 3}px solid ${i === 0 ? '#ffff00' : i === 1 ? '#ff8800' : i === 2 ? '#ff4400' : '#ff0000'}`,
              boxShadow: `0 0 ${isTankExplosion ? 15 : 10}px ${i === 0 ? '#ffff00' : i === 1 ? '#ff8800' : i === 2 ? '#ff4400' : '#ff0000'}`,
            }}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.5 + i * 0.5, opacity: 0 }}
            transition={{ duration: isTankExplosion ? 0.5 : 0.4, delay: i * 0.06 }}
          />
        ))}
        
        {/* Sparks flying out - more for tank */}
        {[...Array(isTankExplosion ? 12 : 8)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: isTankExplosion ? 4 : 2,
              height: isTankExplosion ? 4 : 2,
              background: i % 2 === 0 ? '#ffff00' : '#ff6600',
              boxShadow: `0 0 ${isTankExplosion ? 10 : 6}px ${i % 2 === 0 ? '#ffff00' : '#ff6600'}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(i * Math.PI / (isTankExplosion ? 6 : 4)) * explosion.size * (isTankExplosion ? 1.5 : 1),
              y: Math.sin(i * Math.PI / (isTankExplosion ? 6 : 4)) * explosion.size * (isTankExplosion ? 1.5 : 1),
              opacity: 0,
            }}
            transition={{ duration: isTankExplosion ? 0.6 : 0.5, ease: 'easeOut' }}
          />
        ))}
      </motion.div>
    );
  }
);
ExplosionSprite.displayName = 'ExplosionSprite';
