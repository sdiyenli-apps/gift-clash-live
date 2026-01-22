import { motion } from 'framer-motion';

interface FloatingPowerupProps {
  powerup: {
    id: string;
    x: number;
    y: number;
    type: 'ally' | 'ult' | 'tank';
    timer: number;
  };
  cameraX: number;
}

export const FloatingPowerup = ({ powerup, cameraX }: FloatingPowerupProps) => {
  const screenX = powerup.x - cameraX;
  
  // Don't render if off screen
  if (screenX < -60 || screenX > 700) return null;
  
  const getStyle = () => {
    switch (powerup.type) {
      case 'ally':
        return {
          emoji: '🤖',
          color: '#00ff88',
          bg: 'rgba(0,255,136,0.3)',
          border: 'rgba(0,255,136,0.8)',
          glow: '0 0 20px rgba(0,255,136,0.7)',
        };
      case 'ult':
        return {
          emoji: '🚀',
          color: '#ff00ff',
          bg: 'rgba(255,0,255,0.3)',
          border: 'rgba(255,0,255,0.8)',
          glow: '0 0 20px rgba(255,0,255,0.7)',
        };
      case 'tank':
        return {
          emoji: '🔫',
          color: '#ff8800',
          bg: 'rgba(255,136,0,0.3)',
          border: 'rgba(255,136,0,0.8)',
          glow: '0 0 25px rgba(255,136,0,0.8)',
        };
    }
  };
  
  const style = getStyle();
  const isExpiring = powerup.timer < 5;
  
  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      style={{
        left: screenX - 25,
        bottom: 130 + powerup.y * 0.1, // Float above ground level
      }}
      initial={{ scale: 0, y: 50, opacity: 0 }}
      animate={{ 
        scale: 1, 
        y: [0, -10, 0], 
        opacity: isExpiring ? [1, 0.3, 1] : 1,
      }}
      transition={{ 
        scale: { duration: 0.3 },
        y: { duration: 1, repeat: Infinity, ease: "easeInOut" },
        opacity: isExpiring ? { duration: 0.3, repeat: Infinity } : {},
      }}
    >
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 -m-3 rounded-full"
        style={{
          background: `radial-gradient(circle, ${style.bg}, transparent)`,
          filter: 'blur(8px)',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Main powerup box */}
      <motion.div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: style.bg,
          border: `3px solid ${style.border}`,
          boxShadow: style.glow,
        }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-2xl">{style.emoji}</span>
        
        {/* Sparkles */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={`spark-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: style.color,
              top: -5 + i * 12,
              right: -5 + i * 8,
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: i * 0.25,
            }}
          />
        ))}
      </motion.div>
      
      {/* Label */}
      <motion.div
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.5 rounded whitespace-nowrap"
        style={{
          background: 'rgba(0,0,0,0.8)',
          color: style.color,
          border: `1px solid ${style.border}`,
        }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {powerup.type === 'tank' ? '★ RARE ★' : powerup.type.toUpperCase()}
      </motion.div>
      
      {/* Timer indicator */}
      {isExpiring && (
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold text-red-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          {Math.ceil(powerup.timer)}s
        </motion.div>
      )}
    </motion.div>
  );
};
