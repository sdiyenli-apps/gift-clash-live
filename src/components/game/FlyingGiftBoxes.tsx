import { motion, AnimatePresence } from 'framer-motion';
import { GiftEvent } from '@/types/game';

interface FlyingGiftBox {
  id: string;
  emoji: string;
  username: string;
  x: number;
  y: number;
  speed: number;
}

interface FlyingGiftBoxesProps {
  notifications: GiftEvent[];
  cameraX: number;
}

export const FlyingGiftBoxes = ({ notifications, cameraX }: FlyingGiftBoxesProps) => {
  // Convert notifications to flying boxes with random sky positions
  const flyingBoxes: FlyingGiftBox[] = notifications.map((event, index) => ({
    id: event.id,
    emoji: event.gift.emoji,
    username: event.username,
    x: 600 + index * 80, // Start from right side, staggered
    y: 160 + (index % 3) * 40, // Vary height in sky area
    speed: 150 + Math.random() * 100,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-15">
      <AnimatePresence>
        {flyingBoxes.map((box) => (
          <motion.div
            key={box.id}
            className="absolute"
            initial={{ x: 700, opacity: 0 }}
            animate={{ 
              x: -150,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              x: { duration: 4, ease: 'linear' },
              opacity: { duration: 0.3 },
            }}
            style={{
              bottom: box.y,
              left: 0,
            }}
          >
            {/* Gift box container */}
            <motion.div
              className="relative"
              animate={{
                y: [-5, 5, -5],
                rotate: [-3, 3, -3],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Box body */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl relative"
                style={{
                  background: 'linear-gradient(135deg, #ff6b9d, #c93a87)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 15px rgba(255,107,157,0.6), 0 4px 8px rgba(0,0,0,0.3)',
                }}
              >
                {/* Ribbon cross */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(90deg, transparent 45%, #ffd700 45%, #ffd700 55%, transparent 55%),
                      linear-gradient(0deg, transparent 45%, #ffd700 45%, #ffd700 55%, transparent 55%)
                    `,
                  }}
                />
                {/* Bow on top */}
                <div 
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                >
                  🎀
                </div>
                {/* Gift emoji */}
                <span className="relative z-10">{box.emoji}</span>
              </div>
              
              {/* Username tag below */}
              <div 
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-bold whitespace-nowrap px-1 py-0.5 rounded"
                style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: '#00ffff',
                  textShadow: '0 0 4px #00ffff',
                }}
              >
                {box.username.slice(0, 6)}
              </div>
              
              {/* Sparkle trail */}
              <motion.div
                className="absolute -right-3 top-1/2 -translate-y-1/2"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
