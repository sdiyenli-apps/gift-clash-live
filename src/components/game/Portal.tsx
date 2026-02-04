import { motion, AnimatePresence } from 'framer-motion';

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
            left: screenX - 50, // Center the portal
            bottom: 120, // Ground level - more visible
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Portal frame - cyberpunk arch - LARGER SIZE */}
          <div
            className="relative"
            style={{
              width: 120,
              height: 160,
            }}
          >
            {/* Outer glow ring - BIGGER AND BRIGHTER */}
            <motion.div
              className="absolute rounded-full"
              style={{
                inset: -30,
                background: 'radial-gradient(ellipse, rgba(0,255,255,0.7) 0%, rgba(255,0,255,0.4) 40%, transparent 70%)',
                filter: 'blur(15px)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            
            {/* Ground beacon rays */}
            <motion.div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2"
              style={{
                width: 200,
                height: 100,
                background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(0,255,255,0.5), rgba(255,0,255,0.3), transparent)',
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scaleX: [1, 1.2, 1],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            
            {/* Portal frame */}
            <div
              className="absolute inset-0 rounded-t-full"
              style={{
                background: 'linear-gradient(180deg, #222 0%, #111 50%, #333 100%)',
                border: '6px solid #00ffff',
                boxShadow: '0 0 40px #00ffff, 0 0 80px #ff00ff, inset 0 0 30px rgba(0,255,255,0.4)',
              }}
            />
            
            {/* Portal inner vortex */}
            <motion.div
              className="absolute rounded-t-full overflow-hidden"
              style={{
                inset: 10,
              }}
            >
              {/* Swirling vortex - faster spin */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'conic-gradient(from 0deg, #00ffff, #ff00ff, #00ff88, #ffff00, #ff00ff, #00ffff)',
                  filter: 'blur(4px)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Inner glow */}
              <motion.div
                className="absolute inset-3 rounded-t-full"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(0,255,255,0.6) 40%, rgba(255,0,255,0.4) 70%, transparent 100%)',
                }}
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              
              {/* Center bright spot */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ffffff 0%, rgba(0,255,255,0.9) 50%, transparent 100%)',
                  boxShadow: '0 0 40px #ffffff, 0 0 80px #00ffff',
                }}
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            </motion.div>
            
            {/* Portal energy particles - more particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: '50%',
                  bottom: '50%',
                  background: i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ffff00',
                  boxShadow: `0 0 12px ${i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ffff00'}`,
                }}
                animate={{
                  x: [0, Math.cos(i * Math.PI / 6) * 70, 0],
                  y: [0, Math.sin(i * Math.PI / 6) * 70 - 40, 0],
                  opacity: [1, 0.6, 1],
                  scale: [1, 0.6, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
            
            {/* "ENTER" text - BIGGER AND MORE VISIBLE */}
            <motion.div
              className="absolute -top-12 left-1/2 -translate-x-1/2 text-base font-black whitespace-nowrap"
              style={{
                color: '#00ffff',
                textShadow: '0 0 15px #00ffff, 0 0 30px #00ffff, 0 0 45px #ff00ff',
              }}
              animate={{
                y: [0, -8, 0],
                opacity: [1, 0.8, 1],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ⚡ ENTER PORTAL ⚡
            </motion.div>
            
            {/* Floor glow - bigger */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2"
              style={{
                width: 160,
                height: 16,
                background: 'radial-gradient(ellipse, rgba(0,255,255,0.8) 0%, rgba(255,0,255,0.4) 50%, transparent 80%)',
                filter: 'blur(6px)',
              }}
            />
            
            {/* Rising light beams */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={`beam-${i}`}
                className="absolute bottom-0 rounded-full"
                style={{
                  left: 20 + i * 40,
                  width: 8,
                  height: 200,
                  background: `linear-gradient(0deg, ${i % 2 === 0 ? '#00ffff' : '#ff00ff'}, transparent)`,
                  filter: 'blur(4px)',
                  opacity: 0.6,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scaleY: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
          
          {/* Hero entering animation overlay */}
          {isEntering && (
            <motion.div
              className="absolute inset-0 rounded-t-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,255,255,0.9) 50%, transparent 100%)',
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
