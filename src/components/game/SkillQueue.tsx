import { motion, AnimatePresence } from 'framer-motion';
import { GiftEvent, GIFT_ACTION_INFO } from '@/types/game';

interface SkillQueueProps {
  recentGifts: GiftEvent[];
  maxItems?: number;
}

export const SkillQueue = ({ recentGifts, maxItems = 10 }: SkillQueueProps) => {
  // Take only the most recent gifts up to maxItems
  const displayedGifts = recentGifts.slice(-maxItems);
  
  if (displayedGifts.length === 0) return null;
  
  return (
    <div 
      className="flex flex-wrap gap-1 items-center justify-start"
      style={{ maxWidth: '200px' }}
    >
      <AnimatePresence mode="popLayout">
        {displayedGifts.map((event, index) => {
          const actionInfo = GIFT_ACTION_INFO[event.action];
          const isHelp = actionInfo?.effect === 'help';
          
          return (
            <motion.div
              key={event.id}
              initial={{ scale: 0, opacity: 0, x: -10 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: 10 }}
              transition={{ duration: 0.15, delay: index * 0.02 }}
              className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold"
              style={{
                background: isHelp 
                  ? 'linear-gradient(135deg, rgba(0,255,136,0.3), rgba(0,200,100,0.2))'
                  : 'linear-gradient(135deg, rgba(255,68,68,0.3), rgba(200,50,50,0.2))',
                border: `1px solid ${isHelp ? 'rgba(0,255,136,0.5)' : 'rgba(255,68,68,0.5)'}`,
                color: isHelp ? '#00ff88' : '#ff4444',
                textShadow: `0 0 4px ${isHelp ? '#00ff88' : '#ff4444'}`,
              }}
            >
              <span>{event.gift.emoji}</span>
              <span className="hidden sm:inline opacity-70 truncate max-w-[40px]">
                {event.username.slice(0, 6)}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Counter if queue is full */}
      {displayedGifts.length >= maxItems && (
        <motion.div
          className="text-[7px] font-bold px-1 py-0.5 rounded"
          style={{
            background: 'rgba(255,255,0,0.2)',
            border: '1px solid rgba(255,255,0,0.4)',
            color: '#ffff00',
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          MAX
        </motion.div>
      )}
    </div>
  );
};
