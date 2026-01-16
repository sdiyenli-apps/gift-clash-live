import { motion, AnimatePresence } from 'framer-motion';
import { GiftEvent, GIFT_ACTIONS } from '@/types/game';

interface GiftNotificationProps {
  notifications: GiftEvent[];
}

export const GiftNotification = ({ notifications }: GiftNotificationProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((event, index) => {
          const tierColors = {
            small: 'from-neon-cyan to-neon-green border-neon-cyan',
            medium: 'from-neon-purple to-primary border-neon-purple',
            large: 'from-neon-yellow to-neon-orange border-neon-yellow',
          };

          const tierGlow = {
            small: 'glow-cyan',
            medium: 'glow-pink',
            large: 'shadow-[0_0_30px_hsl(var(--neon-yellow)/0.6)]',
          };

          const actions = GIFT_ACTIONS[event.gift.tier];
          const randomAction = actions[Math.floor(Math.random() * actions.length)];

          return (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', damping: 15 }}
              className={`
                relative bg-gradient-to-r ${tierColors[event.gift.tier]}
                rounded-xl p-4 pr-6 border-2 ${tierGlow[event.gift.tier]}
                min-w-[280px] max-w-[350px]
              `}
            >
              {/* Particle effects for large gifts */}
              {event.gift.tier === 'large' && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-neon-yellow rounded-full"
                      initial={{ 
                        x: '50%', 
                        y: '50%',
                        scale: 0,
                      }}
                      animate={{
                        x: `${Math.random() * 200 - 50}%`,
                        y: `${Math.random() * 200 - 50}%`,
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.1,
                        repeat: 2,
                      }}
                    />
                  ))}
                </>
              )}

              <div className="flex items-center gap-3">
                {/* Gift emoji */}
                <motion.div
                  className="text-4xl"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {event.gift.emoji}
                </motion.div>

                <div className="flex-1">
                  {/* Username */}
                  <div className="font-display text-lg text-primary-foreground truncate">
                    {event.username}
                  </div>
                  
                  {/* Gift name */}
                  <div className="text-sm text-primary-foreground/80">
                    sent <span className="font-bold">{event.gift.name}</span>
                  </div>
                  
                  {/* Action triggered */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-display mt-1 text-primary-foreground/90"
                  >
                    ⚡ {randomAction.name}
                  </motion.div>
                </div>

                {/* Diamond count */}
                <div className="text-right">
                  <div className="text-2xl">💎</div>
                  <div className="font-display text-sm text-primary-foreground">
                    {event.gift.diamonds}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
