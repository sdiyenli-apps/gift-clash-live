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
  // Health bar props
  health?: number;
  maxHealth?: number;
  shield?: number;
  isMagicDashing?: boolean;
  magicDashTimer?: number;
  empCooldown?: number;
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
  health = 100,
  maxHealth = 100,
  shield = 0,
  isMagicDashing = false,
  magicDashTimer = 0,
  empCooldown = 0,
}: GiftPanelProps) => {
  const gifts = Object.values(TIKTOK_GIFTS);
  const healthPercent = (health / maxHealth) * 100;
  const isLow = healthPercent < 30;
  const isCritical = healthPercent < 15;

  const getGiftStyle = (action: string) => {
    const styles: Record<string, { border: string; bg: string; glow: string }> = {
      move_forward: { border: 'rgba(0,255,255,0.8)', bg: 'rgba(0,255,255,0.25)', glow: '0 0 15px rgba(0,255,255,0.5)' },
      shoot: { border: 'rgba(255,150,0,0.8)', bg: 'rgba(255,150,0,0.25)', glow: '0 0 15px rgba(255,150,0,0.5)' },
      armor: { border: 'rgba(0,150,255,0.8)', bg: 'rgba(0,150,255,0.25)', glow: '0 0 15px rgba(0,150,255,0.5)' },
      heal: { border: 'rgba(0,255,100,0.8)', bg: 'rgba(0,255,100,0.25)', glow: '0 0 15px rgba(0,255,100,0.5)' },
      spawn_enemies: { border: 'rgba(255,50,50,0.8)', bg: 'rgba(255,50,50,0.25)', glow: '0 0 15px rgba(255,50,50,0.5)' },
      emp_grenade: { border: 'rgba(255,255,0,0.8)', bg: 'rgba(255,255,0,0.25)', glow: '0 0 15px rgba(255,255,0,0.5)' },
    };
    return styles[action] || { border: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.1)', glow: 'none' };
  };

  return (
    <div 
      className="rounded-2xl p-3"
      style={{
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* Integrated Health Bar Row */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
        {/* HP Bar */}
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-sm">❤️</span>
          <div className="flex-1 h-4 bg-gray-800/80 rounded-full overflow-hidden relative">
            <motion.div
              className={`h-full ${isCritical ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-green-500'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${healthPercent}%` }}
              transition={{ duration: 0.3 }}
            />
            {isCritical && (
              <motion.div
                className="absolute inset-0 bg-red-500/30"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            )}
          </div>
          <span className={`text-xs font-bold min-w-[28px] text-right ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
            {Math.ceil(health)}
          </span>
        </div>

        {/* Shield */}
        {shield > 0 && (
          <div className="flex items-center gap-1 w-16">
            <span className="text-sm">🛡️</span>
            <div className="flex-1 h-3 bg-gray-800/80 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-400"
                animate={{ width: `${Math.min(shield, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Status indicators */}
        {isMagicDashing && (
          <motion.div
            className="px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(255,0,255,0.4)', border: '1px solid rgba(255,0,255,0.7)', color: '#ff66ff' }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            ✨{magicDashTimer.toFixed(0)}
          </motion.div>
        )}
        
        {empCooldown > 0 && (
          <motion.div
            className="px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(0,255,255,0.4)', border: '1px solid rgba(0,255,255,0.7)', color: '#00ffff' }}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            ⚡{empCooldown.toFixed(0)}
          </motion.div>
        )}
      </div>

      {/* Gift Grid - 6 columns for larger buttons */}
      <div className="grid grid-cols-6 gap-2 mb-2">
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
                minHeight: '52px',
              }}
            >
              <motion.div 
                className="text-2xl"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {gift.emoji}
              </motion.div>
              <span 
                className="text-[8px] font-bold mt-0.5 opacity-90 uppercase tracking-tight"
                style={{ color: style.border.replace('0.8', '1') }}
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
      </div>
      
      {/* Powerup Row - ALLY, ULT, TANK */}
      <div className="grid grid-cols-3 gap-2">
        {/* ALLY Powerup Button */}
        <motion.button
          whileHover={{ scale: collectedAllyPowerups > 0 ? 1.05 : 1 }}
          whileTap={{ scale: collectedAllyPowerups > 0 ? 0.92 : 1 }}
          onClick={() => collectedAllyPowerups > 0 && onUseAlly?.()}
          disabled={disabled || collectedAllyPowerups <= 0}
          className="relative rounded-xl flex items-center justify-center gap-2 py-2.5 touch-manipulation"
          style={{
            background: collectedAllyPowerups > 0 ? 'rgba(0,255,136,0.35)' : 'rgba(50,50,50,0.6)',
            border: `2px solid ${collectedAllyPowerups > 0 ? 'rgba(0,255,136,0.9)' : 'rgba(100,100,100,0.5)'}`,
            boxShadow: collectedAllyPowerups > 0 ? '0 0 20px rgba(0,255,136,0.5)' : 'none',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <motion.div 
            className="text-xl"
            animate={collectedAllyPowerups > 0 ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            🤖
          </motion.div>
          <span 
            className="text-sm font-bold uppercase"
            style={{ color: collectedAllyPowerups > 0 ? '#00ff88' : '#666' }}
          >
            ALLY
          </span>
          {/* Collected count badge */}
          <div 
            className="absolute -top-1.5 -right-1.5 rounded-full text-xs font-black w-5 h-5 flex items-center justify-center"
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
          whileHover={{ scale: collectedUltPowerups > 0 ? 1.05 : 1 }}
          whileTap={{ scale: collectedUltPowerups > 0 ? 0.92 : 1 }}
          onClick={() => collectedUltPowerups > 0 && onUseUlt?.()}
          disabled={disabled || collectedUltPowerups <= 0}
          className="relative rounded-xl flex items-center justify-center gap-2 py-2.5 touch-manipulation"
          style={{
            background: collectedUltPowerups > 0 ? 'rgba(255,0,255,0.35)' : 'rgba(50,50,50,0.6)',
            border: `2px solid ${collectedUltPowerups > 0 ? 'rgba(255,0,255,0.9)' : 'rgba(100,100,100,0.5)'}`,
            boxShadow: collectedUltPowerups > 0 ? '0 0 20px rgba(255,0,255,0.5)' : 'none',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <motion.div 
            className="text-xl"
            animate={collectedUltPowerups > 0 ? { rotate: [0, 360] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🚀
          </motion.div>
          <span 
            className="text-sm font-bold uppercase"
            style={{ color: collectedUltPowerups > 0 ? '#ff66ff' : '#666' }}
          >
            ULT
          </span>
          {/* Collected count badge */}
          <div 
            className="absolute -top-1.5 -right-1.5 rounded-full text-xs font-black w-5 h-5 flex items-center justify-center"
            style={{
              background: collectedUltPowerups > 0 ? '#ff00ff' : '#444',
              color: '#fff',
            }}
          >
            {collectedUltPowerups}
          </div>
        </motion.button>
        
        {/* TANK Powerup Button */}
        <motion.button
          whileHover={{ scale: collectedTankPowerups > 0 ? 1.05 : 1 }}
          whileTap={{ scale: collectedTankPowerups > 0 ? 0.92 : 1 }}
          onClick={() => collectedTankPowerups > 0 && onUseTank?.()}
          disabled={disabled || collectedTankPowerups <= 0}
          className="relative rounded-xl flex items-center justify-center gap-2 py-2.5 touch-manipulation"
          style={{
            background: collectedTankPowerups > 0 ? 'rgba(255,136,0,0.35)' : 'rgba(50,50,50,0.6)',
            border: `2px solid ${collectedTankPowerups > 0 ? 'rgba(255,136,0,0.9)' : 'rgba(100,100,100,0.5)'}`,
            boxShadow: collectedTankPowerups > 0 ? '0 0 20px rgba(255,136,0,0.5)' : 'none',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <motion.div 
            className="text-xl"
            animate={collectedTankPowerups > 0 ? { x: [-2, 2, -2] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            🔫
          </motion.div>
          <span 
            className="text-sm font-bold uppercase"
            style={{ color: collectedTankPowerups > 0 ? '#ff8800' : '#666' }}
          >
            TANK
          </span>
          {/* Collected count badge */}
          <div 
            className="absolute -top-1.5 -right-1.5 rounded-full text-xs font-black w-5 h-5 flex items-center justify-center"
            style={{
              background: collectedTankPowerups > 0 ? '#ff8800' : '#444',
              color: '#000',
            }}
          >
            {collectedTankPowerups}
          </div>
        </motion.button>
      </div>
    </div>
  );
};
