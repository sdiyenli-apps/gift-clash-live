import { motion, AnimatePresence } from 'framer-motion';
import portalRingGif from '@/assets/portal-ring.gif';

interface PortalProps {
  x: number;
  cameraX: number;
  isOpen: boolean;
  isEntering: boolean;
}

export const Portal = ({ x, cameraX, isOpen, isEntering }: PortalProps) => {
  const screenX = x - cameraX;
  
  // Only render if visible on screen - wider range for visibility
  if (screenX < -150 || screenX > 900) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute z-40 pointer-events-none"
          style={{
            left: screenX - 80, // Center the portal
            bottom: 80, // Ground level - more visible
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Portal frame - using the Elden Ring style GIF */}
          <div
            className="relative"
            style={{
              width: 180,
              height: 180,
            }}
          >
            {/* Outer glow effect behind the ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                inset: -40,
                background: 'radial-gradient(ellipse, rgba(255,200,0,0.6) 0%, rgba(255,100,0,0.3) 40%, transparent 70%)',
                filter: 'blur(20px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            
            {/* THE ELDEN RING GIF - Main portal visual */}
            <motion.div
              className="absolute inset-0"
              animate={{
                rotate: 360,
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <img
                src={portalRingGif}
                alt="Portal"
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 0 20px #ffaa00) drop-shadow(0 0 40px #ff6600)',
                  mixBlendMode: 'screen',
                }}
              />
            </motion.div>
            
            {/* Inner vortex glow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                inset: 30,
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,200,100,0.6) 40%, transparent 70%)',
                boxShadow: '0 0 40px #ffcc00, 0 0 80px #ff8800',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            
            {/* Center bright spot - beckoning the player */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
              style={{
                background: 'radial-gradient(circle, #ffffff 0%, #ffcc00 50%, transparent 100%)',
                boxShadow: '0 0 50px #ffffff, 0 0 100px #ffaa00',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            
            {/* Portal energy particles rising */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: '50%',
                  bottom: 0,
                  background: i % 2 === 0 ? '#ffcc00' : '#ff8800',
                  boxShadow: `0 0 8px ${i % 2 === 0 ? '#ffcc00' : '#ff8800'}`,
                }}
                animate={{
                  y: [0, -150],
                  x: [0, (Math.random() - 0.5) * 60],
                  opacity: [1, 0],
                  scale: [1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeOut',
                }}
              />
            ))}
            
            {/* "ENTER" text - BIGGER AND MORE VISIBLE */}
            <motion.div
              className="absolute -top-14 left-1/2 -translate-x-1/2 text-base font-black whitespace-nowrap"
              style={{
                color: '#ffcc00',
                textShadow: '0 0 15px #ffcc00, 0 0 30px #ff8800, 0 0 45px #ff6600',
              }}
              animate={{
                y: [0, -8, 0],
                opacity: [1, 0.8, 1],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ⚡ ENTER PORTAL ⚡
            </motion.div>
            
            {/* Floor glow - golden */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2"
              style={{
                width: 200,
                height: 20,
                background: 'radial-gradient(ellipse, rgba(255,200,0,0.8) 0%, rgba(255,100,0,0.4) 50%, transparent 80%)',
                filter: 'blur(8px)',
              }}
            />
          </div>
          
          {/* Hero entering animation overlay */}
          {isEntering && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,200,0,0.9) 50%, transparent 100%)',
              }}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 4 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
