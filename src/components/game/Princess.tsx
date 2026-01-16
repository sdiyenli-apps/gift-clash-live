import { motion } from 'framer-motion';
import princessSprite from '@/assets/princess-sprite.png';

interface PrincessProps {
  x: number;
  cameraX: number;
  isVisible: boolean;
}

export const Princess = ({ x, cameraX, isVisible }: PrincessProps) => {
  const screenX = x - cameraX;
  
  if (!isVisible || screenX < -100 || screenX > 1100) return null;
  
  return (
    <motion.div
      className="absolute z-15"
      style={{
        left: screenX,
        bottom: 80,
        width: 90,
        height: 110,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Sparkle aura */}
      <motion.div
        className="absolute -inset-10 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,182,193,0.5), rgba(255,105,180,0.3), transparent)',
          filter: 'blur(15px)',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Floating hearts */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{ left: -20 + i * 30, top: -30 }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          💖
        </motion.div>
      ))}
      
      {/* Princess sprite - OUTLINE STYLE with transparent background */}
      <motion.img
        src={princessSprite}
        alt="Princess"
        className="w-full h-full object-contain"
        style={{
          filter: 'brightness(0) invert(1) drop-shadow(0 0 20px #ff69b4) drop-shadow(0 0 40px #ff1493)',
          opacity: 0.9,
        }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Neon outline border */}
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          border: '2px solid #ff69b4',
          boxShadow: '0 0 15px #ff69b4, inset 0 0 10px #ff69b444',
        }}
      />
      
      {/* Speech bubble */}
      <motion.div
        className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div 
          className="px-4 py-2 rounded-xl text-sm font-bold shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #ffb6c1, #ff69b4)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(255,105,180,0.5)',
          }}
        >
          SAVE ME, HERO! 💕
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '10px solid #ff69b4',
            }}
          />
        </div>
      </motion.div>
      
      {/* Ground sparkles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ground-${i}`}
          className="absolute -bottom-2 w-3 h-3 rounded-full"
          style={{
            background: '#fff',
            left: 20 + i * 30,
            boxShadow: '0 0 10px #fff, 0 0 20px #ff69b4',
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.div>
  );
};
