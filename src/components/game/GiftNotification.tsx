import { motion, AnimatePresence } from 'framer-motion';
import { GiftEvent, GIFT_ACTION_INFO } from '@/types/game';

interface GiftNotificationProps {
  notifications: GiftEvent[];
}

export const GiftNotification = ({ notifications }: GiftNotificationProps) => {
  return (
    <div className="absolute -top-4 left-0 right-0 z-50 flex flex-wrap justify-center gap-2 px-2">
      <AnimatePresence>
        {notifications.map((event, index) => {
          const actionInfo = GIFT_ACTION_INFO[event.gift.action] || { name: '⚡ ACTION', effect: 'help' as const };
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-2 rounded-xl backdrop-blur-md border flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(30,30,60,0.9))',
                borderColor: '#00ff88',
                boxShadow: '0 0 20px rgba(0,255,136,0.4), 0 4px 15px rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center gap-2">
                <motion.span 
                  className="text-2xl" 
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }} 
                  transition={{ duration: 0.5 }}
                >
                  {event.gift.emoji}
                </motion.span>
                <div className="flex flex-col">
                  <div className="font-bold text-white text-xs truncate max-w-[80px]">{event.username}</div>
                  <div className="text-[10px] font-bold text-green-400">{actionInfo.name}</div>
                </div>
                <div className="text-[10px] text-yellow-400 font-bold">💎{event.gift.diamonds}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
