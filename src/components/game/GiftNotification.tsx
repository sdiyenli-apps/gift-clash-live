import { motion, AnimatePresence } from 'framer-motion';
import { GiftEvent, GIFT_ACTION_INFO } from '@/types/game';

interface GiftNotificationProps {
  notifications: GiftEvent[];
}

export const GiftNotification = ({ notifications }: GiftNotificationProps) => {
  return (
    <div className="fixed top-24 left-4 z-50 space-y-2 max-w-xs">
      <AnimatePresence>
        {notifications.map((event, index) => {
          const actionInfo = GIFT_ACTION_INFO[event.gift.action] || { name: '⚡ ACTION', effect: 'help' as const };
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-3 rounded-xl backdrop-blur-md border"
              style={{
                background: 'linear-gradient(135deg, rgba(255,0,255,0.2), rgba(0,255,255,0.2))',
                borderColor: '#00ff88',
                boxShadow: '0 0 20px rgba(0,255,136,0.3)',
              }}
            >
              <div className="flex items-center gap-3">
                <motion.span className="text-3xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5 }}>
                  {event.gift.emoji}
                </motion.span>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">{event.username}</div>
                  <div className="text-xs text-cyan-400">sent {event.gift.name}!</div>
                  <div className="text-xs font-bold mt-1 text-green-400">{actionInfo.name}</div>
                </div>
                <div className="text-xs text-yellow-400 font-bold">💎{event.gift.diamonds}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
