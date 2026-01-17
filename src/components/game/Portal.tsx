import { motion, AnimatePresence } from 'framer-motion';

interface PortalProps {
  x: number;
  cameraX: number;
  isOpen: boolean;
  isEntering: boolean;
}

export const Portal = ({ x, cameraX, isOpen, isEntering }: PortalProps) => {
  const screenX = x - cameraX;
  
  // Only render if visible on screen
  if (screenX < -100 || screenX > 800) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute z-25 pointer-events-none"
          style={{
            left: screenX,
            bottom: 160, // Ground level
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Portal frame - cyberpunk arch */}
          <div
            className="relative"
            style={{
              width: 80,
              height: 120,
            }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{
                background: 'radial-gradient(ellipse, rgba(0,255,255,0.4) 0%, transparent 70%)',
                filter: 'blur(10px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            
            {/* Portal frame */}
            <div
              className="absolute inset-0 rounded-t-full"
              style={{
                background: 'linear-gradient(180deg, #333 0%, #111 50%, #333 100%)',
                border: '4px solid #00ffff',
                boxShadow: '0 0 20px #00ffff, inset 0 0 20px rgba(0,255,255,0.3)',
              }}
            />
            
            {/* Portal inner vortex */}
            <motion.div
              className="absolute rounded-t-full overflow-hidden"
              style={{
                inset: 8,
              }}
            >
              {/* Swirling vortex */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'conic-gradient(from 0deg, #00ffff, #ff00ff, #00ff88, #ff00ff, #00ffff)',
                  filter: 'blur(3px)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Inner glow */}
              <motion.div
                className="absolute inset-2 rounded-t-full"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(0,255,255,0.5) 40%, rgba(255,0,255,0.3) 70%, transparent 100%)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              
              {/* Center bright spot */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ffffff 0%, rgba(0,255,255,0.8) 50%, transparent 100%)',
                  boxShadow: '0 0 30px #ffffff, 0 0 60px #00ffff',
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </motion.div>
            
            {/* Portal energy particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: '50%',
                  bottom: '50%',
                  background: i % 2 === 0 ? '#00ffff' : '#ff00ff',
                  boxShadow: `0 0 8px ${i % 2 === 0 ? '#00ffff' : '#ff00ff'}`,
                }}
                animate={{
                  x: [0, Math.cos(i * Math.PI / 4) * 50, 0],
                  y: [0, Math.sin(i * Math.PI / 4) * 50 - 30, 0],
                  opacity: [1, 0.5, 1],
                  scale: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: 'easeInOut',
                }}
              />
            ))}
            
            {/* "ENTER" text */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
              style={{
                color: '#00ffff',
                textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
              }}
              animate={{
                y: [0, -5, 0],
                opacity: [1, 0.7, 1],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ▼ ENTER PORTAL ▼
            </motion.div>
            
            {/* Floor glow */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2"
              style={{
                width: 100,
                height: 8,
                background: 'radial-gradient(ellipse, rgba(0,255,255,0.6) 0%, transparent 70%)',
                filter: 'blur(4px)',
              }}
            />
          </div>
          
          {/* Hero entering animation overlay */}
          {isEntering && (
            <motion.div
              className="absolute inset-0 rounded-t-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,255,255,0.8) 50%, transparent 100%)',
              }}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 3 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
