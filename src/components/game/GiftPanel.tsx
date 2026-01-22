import { motion } from 'framer-motion';
import { TIKTOK_GIFTS } from '@/types/game';

interface GiftPanelProps {
  onTriggerGift: (giftId: string) => void;
  disabled: boolean;
  collectedAllyPowerups?: number;
  collectedUltPowerups?: number;
  collectedTankPowerups?: number;
  onUseAlly?: () => void;
  onUseUlt?: () => void;
  onUseTank?: () => void;
}

export const GiftPanel = ({ 
  onTriggerGift, 
  disabled, 
  collectedAllyPowerups = 0, 
  collectedUltPowerups = 0,
  collectedTankPowerups = 0,
  onUseAlly,
  onUseUlt,
  onUseTank,
}: GiftPanelProps) => {
  const gifts = Object.values(TIKTOK_GIFTS);

  const getGiftStyle = (action: string) => {
    const styles: Record<string, { border: string; bg: string; glow: string }> = {
      move_forward: { border: 'rgba(0,255,255,0.6)', bg: 'rgba(0,255,255,0.2)', glow: '0 0 12px rgba(0,255,255,0.4)' },
      shoot: { border: 'rgba(255,150,0,0.6)', bg: 'rgba(255,150,0,0.2)', glow: '0 0 12px rgba(255,150,0,0.4)' },
      armor: { border: 'rgba(0,150,255,0.6)', bg: 'rgba(0,150,255,0.2)', glow: '0 0 12px rgba(0,150,255,0.4)' },
      heal: { border: 'rgba(0,255,100,0.6)', bg: 'rgba(0,255,100,0.2)', glow: '0 0 12px rgba(0,255,100,0.4)' },
      spawn_enemies: { border: 'rgba(255,50,50,0.6)', bg: 'rgba(255,50,50,0.2)', glow: '0 0 12px rgba(255,50,50,0.4)' },
      emp_grenade: { border: 'rgba(255,255,0,0.6)', bg: 'rgba(255,255,0,0.2)', glow: '0 0 12px rgba(255,255,0,0.4)' },
    };
    return styles[action] || { border: 'rgba(255,255,255,0.2)', bg: 'rgba(255,255,255,0.05)', glow: 'none' };
  };

  return (
    <div 
      className="rounded-xl p-2"
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Gift Grid + Powerup Buttons */}
      <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
        {/* Regular gift buttons (6) */}
        {gifts.map(gift => {
          const style = getGiftStyle(gift.action);
          
          return (
            <motion.button
              key={gift.id}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => onTriggerGift(gift.id)}
              disabled={disabled}
              className="relative rounded-xl flex flex-col items-center justify-center aspect-square touch-manipulation active:opacity-80"
              style={{
                background: style.bg,
                border: `2px solid ${style.border}`,
                boxShadow: style.glow,
                opacity: disabled ? 0.5 : 1,
                minHeight: '40px',
                minWidth: '40px',
              }}
            >
              <motion.div 
                className="text-lg sm:text-xl"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {gift.emoji}
              </motion.div>
              <span 
                className="text-[5px] sm:text-[6px] font-bold mt-0.5 opacity-80 uppercase tracking-tight"
                style={{ color: style.border.replace('0.6', '1') }}
              >
                {gift.action === 'emp_grenade' ? 'EMP' : 
                 gift.action === 'move_forward' ? 'GO' :
                 gift.action === 'shoot' ? 'FIRE' :
                 gift.action === 'armor' ? 'DEF' :
                 gift.action === 'heal' ? 'HP' :
                 gift.action === 'spawn_enemies' ? '⚠️' : ''}
              </span>
            </motion.button>
          );
        })}
        
        {/* ALLY Powerup Button */}
        <motion.button
          whileHover={{ scale: collectedAllyPowerups > 0 ? 1.08 : 1 }}
          whileTap={{ scale: collectedAllyPowerups > 0 ? 0.88 : 1 }}
          onClick={() => collectedAllyPowerups > 0 && onUseAlly?.()}
          disabled={disabled || collectedAllyPowerups <= 0}
          className="relative rounded-xl flex flex-col items-center justify-center aspect-square touch-manipulation"
          style={{
            background: collectedAllyPowerups > 0 ? 'rgba(0,255,136,0.3)' : 'rgba(50,50,50,0.5)',
            border: `2px solid ${collectedAllyPowerups > 0 ? 'rgba(0,255,136,0.8)' : 'rgba(100,100,100,0.4)'}`,
            boxShadow: collectedAllyPowerups > 0 ? '0 0 15px rgba(0,255,136,0.5)' : 'none',
            opacity: disabled ? 0.5 : 1,
            minHeight: '40px',
            minWidth: '40px',
          }}
        >
          <motion.div 
            className="text-lg sm:text-xl"
            animate={collectedAllyPowerups > 0 ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            🤖
          </motion.div>
          <span 
            className="text-[5px] sm:text-[6px] font-bold mt-0.5 uppercase"
            style={{ color: collectedAllyPowerups > 0 ? '#00ff88' : '#666' }}
          >
            ALLY
          </span>
          {/* Collected count badge */}
          <div 
            className="absolute -top-1 -right-1 rounded-full text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center"
            style={{
              background: collectedAllyPowerups > 0 ? '#00ff88' : '#444',
              color: '#000',
            }}
          >
            {collectedAllyPowerups}
          </div>
        </motion.button>
        
        {/* ULT Powerup Button */}
        <motion.button
          whileHover={{ scale: collectedUltPowerups > 0 ? 1.08 : 1 }}
          whileTap={{ scale: collectedUltPowerups > 0 ? 0.88 : 1 }}
          onClick={() => collectedUltPowerups > 0 && onUseUlt?.()}
          disabled={disabled || collectedUltPowerups <= 0}
          className="relative rounded-xl flex flex-col items-center justify-center aspect-square touch-manipulation"
          style={{
            background: collectedUltPowerups > 0 ? 'rgba(255,0,255,0.3)' : 'rgba(50,50,50,0.5)',
            border: `2px solid ${collectedUltPowerups > 0 ? 'rgba(255,0,255,0.8)' : 'rgba(100,100,100,0.4)'}`,
            boxShadow: collectedUltPowerups > 0 ? '0 0 15px rgba(255,0,255,0.5)' : 'none',
            opacity: disabled ? 0.5 : 1,
            minHeight: '40px',
            minWidth: '40px',
          }}
        >
          <motion.div 
            className="text-lg sm:text-xl"
            animate={collectedUltPowerups > 0 ? { rotate: [0, 360] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🚀
          </motion.div>
          <span 
            className="text-[5px] sm:text-[6px] font-bold mt-0.5 uppercase"
            style={{ color: collectedUltPowerups > 0 ? '#ff66ff' : '#666' }}
          >
            ULT
          </span>
          {/* Collected count badge */}
          <div 
            className="absolute -top-1 -right-1 rounded-full text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center"
            style={{
              background: collectedUltPowerups > 0 ? '#ff00ff' : '#444',
              color: '#fff',
            }}
          >
            {collectedUltPowerups}
          </div>
        </motion.button>
        
        {/* TANK Powerup Button - Rare */}
        <motion.button
          whileHover={{ scale: collectedTankPowerups > 0 ? 1.08 : 1 }}
          whileTap={{ scale: collectedTankPowerups > 0 ? 0.88 : 1 }}
          onClick={() => collectedTankPowerups > 0 && onUseTank?.()}
          disabled={disabled || collectedTankPowerups <= 0}
          className="relative rounded-xl flex flex-col items-center justify-center aspect-square touch-manipulation"
          style={{
            background: collectedTankPowerups > 0 ? 'rgba(255,136,0,0.3)' : 'rgba(50,50,50,0.5)',
            border: `2px solid ${collectedTankPowerups > 0 ? 'rgba(255,136,0,0.8)' : 'rgba(100,100,100,0.4)'}`,
            boxShadow: collectedTankPowerups > 0 ? '0 0 15px rgba(255,136,0,0.5)' : 'none',
            opacity: disabled ? 0.5 : 1,
            minHeight: '40px',
            minWidth: '40px',
          }}
        >
          <motion.div 
            className="text-lg sm:text-xl"
            animate={collectedTankPowerups > 0 ? { x: [-2, 2, -2] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            🔫
          </motion.div>
          <span 
            className="text-[5px] sm:text-[6px] font-bold mt-0.5 uppercase"
            style={{ color: collectedTankPowerups > 0 ? '#ff8800' : '#666' }}
          >
            TANK
          </span>
          {/* Collected count badge */}
          <div 
            className="absolute -top-1 -right-1 rounded-full text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center"
            style={{
              background: collectedTankPowerups > 0 ? '#ff8800' : '#444',
              color: '#000',
            }}
          >
            {collectedTankPowerups}
          </div>
        </motion.button>
      </div>

      {/* Legend */}
      <div className="mt-1.5 pt-1.5 border-t border-white/15 flex justify-center gap-2 text-[7px] sm:text-[8px] text-gray-300">
        <span className="flex items-center gap-0.5"><span className="opacity-70">🌹</span>Move</span>
        <span className="flex items-center gap-0.5"><span className="opacity-70">🫰</span>Shoot</span>
        <span className="flex items-center gap-0.5"><span className="opacity-70">⚡</span>EMP</span>
        <span className="flex items-center gap-0.5 text-yellow-400"><span className="opacity-70">⭐</span>Kill ELITES!</span>
      </div>
    </div>
  );
};
