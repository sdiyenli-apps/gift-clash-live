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
}: GiftPanelProps) => {
  const gifts = Object.values(TIKTOK_GIFTS);
  const healthPercent = (health / maxHealth) * 100;
  const isLow = healthPercent < 30;
  const isCritical = healthPercent < 15;

  const getGiftStyle = (action: string) => {
    const styles: Record<string, { border: string; bg: string }> = {
      move_forward: { border: 'rgba(255,200,0,0.9)', bg: 'rgba(255,200,0,0.2)' },
      shoot: { border: 'rgba(100,150,255,0.9)', bg: 'rgba(100,150,255,0.2)' },
      armor: { border: 'rgba(0,200,150,0.9)', bg: 'rgba(0,200,150,0.2)' },
      heal: { border: 'rgba(200,100,200,0.9)', bg: 'rgba(200,100,200,0.2)' },
      spawn_enemies: { border: 'rgba(255,80,80,0.9)', bg: 'rgba(255,80,80,0.2)' },
      emp_grenade: { border: 'rgba(0,255,200,0.9)', bg: 'rgba(0,255,200,0.2)' },
    };
    return styles[action] || { border: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.1)' };
  };

  const getGiftLabel = (action: string) => {
    const labels: Record<string, string> = {
      move_forward: 'GO',
      shoot: 'FIRE',
      armor: 'DEF',
      heal: 'HP',
      spawn_enemies: 'MOB',
      emp_grenade: 'EMP',
    };
    return labels[action] || '';
  };

  return (
    <div 
      className="rounded-t-xl px-3 py-2"
      style={{
        background: 'rgba(20,20,30,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.15)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* HP + Shield Bar Row */}
      <div className="flex items-center gap-3 mb-2">
        {/* HP Section */}
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-base">❤️</span>
          <div className="flex-1 h-5 bg-gray-900 rounded-full overflow-hidden relative border border-gray-700">
            <motion.div
              className={`h-full ${isCritical ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-green-500'}`}
              animate={{ width: `${healthPercent}%` }}
              transition={{ duration: 0.3 }}
            />
            {isCritical && (
              <motion.div
                className="absolute inset-0 bg-red-500/40"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            )}
          </div>
          <span className={`text-sm font-bold min-w-[32px] text-right ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
            {Math.ceil(health)}
          </span>
        </div>

        {/* Shield Section */}
        <div className="flex items-center gap-1.5 w-24">
          <span className="text-base">🛡️</span>
          <div className="flex-1 h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
            <motion.div
              className="h-full bg-red-500"
              animate={{ width: `${Math.min(shield, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm font-bold text-red-400 min-w-[28px] text-right">
            {Math.ceil(shield)}
          </span>
        </div>
      </div>

      {/* Gift Buttons Row - 6 gifts + 2 powerups */}
      <div className="flex items-center gap-1.5 mb-1.5">
        {/* 6 Gift buttons */}
        {gifts.map(gift => {
          const style = getGiftStyle(gift.action);
          
          return (
            <motion.button
              key={gift.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTriggerGift(gift.id)}
              disabled={disabled}
              className="flex-1 rounded-lg flex flex-col items-center justify-center py-2 touch-manipulation"
              style={{
                background: style.bg,
                border: `2px solid ${style.border}`,
                opacity: disabled ? 0.5 : 1,
                minHeight: '48px',
              }}
            >
              <span className="text-xl">{gift.emoji}</span>
              <span 
                className="text-[7px] font-bold uppercase mt-0.5"
                style={{ color: style.border }}
              >
                {getGiftLabel(gift.action)}
              </span>
            </motion.button>
          );
        })}
        
        {/* Separator */}
        <div className="w-px h-10 bg-gray-600 mx-0.5" />
        
        {/* ULT Button */}
        <motion.button
          whileTap={{ scale: collectedUltPowerups > 0 ? 0.9 : 1 }}
          onClick={() => collectedUltPowerups > 0 && onUseUlt?.()}
          disabled={disabled || collectedUltPowerups <= 0}
          className="relative rounded-lg flex flex-col items-center justify-center py-2 px-3 touch-manipulation"
          style={{
            background: collectedUltPowerups > 0 ? 'rgba(0,200,100,0.3)' : 'rgba(50,50,50,0.5)',
            border: `2px solid ${collectedUltPowerups > 0 ? 'rgba(0,200,100,0.9)' : 'rgba(80,80,80,0.5)'}`,
            opacity: disabled ? 0.5 : 1,
            minHeight: '48px',
          }}
        >
          <span className="text-lg">🚀</span>
          <span 
            className="text-[7px] font-bold uppercase mt-0.5"
            style={{ color: collectedUltPowerups > 0 ? '#00c864' : '#555' }}
          >
            ULT
          </span>
          <div 
            className="absolute -top-1 -right-1 rounded-full text-[8px] font-black w-4 h-4 flex items-center justify-center"
            style={{ background: collectedUltPowerups > 0 ? '#00c864' : '#444', color: '#000' }}
          >
            {collectedUltPowerups}
          </div>
        </motion.button>
        
        {/* TANK Button */}
        <motion.button
          whileTap={{ scale: collectedTankPowerups > 0 ? 0.9 : 1 }}
          onClick={() => collectedTankPowerups > 0 && onUseTank?.()}
          disabled={disabled || collectedTankPowerups <= 0}
          className="relative rounded-lg flex flex-col items-center justify-center py-2 px-3 touch-manipulation"
          style={{
            background: collectedTankPowerups > 0 ? 'rgba(0,200,100,0.3)' : 'rgba(50,50,50,0.5)',
            border: `2px solid ${collectedTankPowerups > 0 ? 'rgba(0,200,100,0.9)' : 'rgba(80,80,80,0.5)'}`,
            opacity: disabled ? 0.5 : 1,
            minHeight: '48px',
          }}
        >
          <span className="text-lg">🔫</span>
          <span 
            className="text-[7px] font-bold uppercase mt-0.5"
            style={{ color: collectedTankPowerups > 0 ? '#00c864' : '#555' }}
          >
            TANK
          </span>
          <div 
            className="absolute -top-1 -right-1 rounded-full text-[8px] font-black w-4 h-4 flex items-center justify-center"
            style={{ background: collectedTankPowerups > 0 ? '#00c864' : '#444', color: '#000' }}
          >
            {collectedTankPowerups}
          </div>
        </motion.button>
      </div>

      {/* Legend Row */}
      <div className="flex justify-center gap-3 text-[9px] text-gray-400">
        <span>🌹 Move</span>
        <span>⚡ Shoot</span>
        <span>⚡ EMP</span>
        <span className="text-yellow-400">⭐ Kill ELITES!</span>
      </div>
    </div>
  );
};
