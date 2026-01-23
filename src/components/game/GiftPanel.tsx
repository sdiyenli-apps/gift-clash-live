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

  const giftStyles: Record<string, { border: string; bg: string; color: string }> = {
    move_forward: { border: '#ffc800', bg: 'rgba(255,200,0,0.3)', color: '#ffc800' },
    shoot: { border: '#6496ff', bg: 'rgba(100,150,255,0.3)', color: '#6496ff' },
    armor: { border: '#00c896', bg: 'rgba(0,200,150,0.3)', color: '#00c896' },
    heal: { border: '#c864c8', bg: 'rgba(200,100,200,0.3)', color: '#c864c8' },
    spawn_enemies: { border: '#ff5050', bg: 'rgba(255,80,80,0.3)', color: '#ff5050' },
    emp_grenade: { border: '#00ffc8', bg: 'rgba(0,255,200,0.3)', color: '#00ffc8' },
  };

  const giftLabels: Record<string, string> = {
    move_forward: 'GO',
    shoot: 'FIRE',
    armor: 'DEF',
    heal: 'HP',
    spawn_enemies: 'MOB',
    emp_grenade: 'EMP',
  };

  return (
    <div 
      className="rounded-xl p-3"
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(16px)',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
      }}
    >
      {/* HP + Shield Bar Row */}
      <div className="flex items-center gap-3 mb-3">
        {/* HP Section */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">❤️</span>
          <div className="flex-1 h-6 bg-gray-900 rounded-full overflow-hidden relative border-2 border-gray-600">
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
          <span className={`text-base font-bold min-w-[36px] text-right ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
            {Math.ceil(health)}
          </span>
        </div>

        {/* Shield Section */}
        <div className="flex items-center gap-2 w-28">
          <span className="text-lg">🛡️</span>
          <div className="flex-1 h-5 bg-gray-900 rounded-full overflow-hidden border-2 border-gray-600">
            <motion.div
              className="h-full bg-red-500"
              animate={{ width: `${Math.min(shield, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-base font-bold text-red-400 min-w-[32px] text-right">
            {Math.ceil(shield)}
          </span>
        </div>
      </div>

      {/* Gift Buttons Row - 6 gifts */}
      <div className="flex items-center gap-1.5 mb-2">
        {gifts.map(gift => {
          const style = giftStyles[gift.action] || { border: '#888', bg: 'rgba(128,128,128,0.3)', color: '#888' };
          
          return (
            <motion.button
              key={gift.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => onTriggerGift(gift.id)}
              disabled={disabled}
              className="flex-1 rounded-lg flex flex-col items-center justify-center py-2 touch-manipulation"
              style={{
                background: style.bg,
                border: `3px solid ${style.border}`,
                opacity: disabled ? 0.5 : 1,
                minHeight: '52px',
                boxShadow: `0 0 10px ${style.border}40`,
              }}
            >
              <span className="text-xl">{gift.emoji}</span>
              <span 
                className="text-[8px] font-bold uppercase"
                style={{ color: style.color }}
              >
                {giftLabels[gift.action]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Powerup Buttons Row - ALLY, ULT, TANK */}
      <div className="flex items-center gap-2 mb-2">
        {/* ALLY Button */}
        <motion.button
          whileTap={{ scale: collectedAllyPowerups > 0 ? 0.88 : 1 }}
          onClick={() => collectedAllyPowerups > 0 && onUseAlly?.()}
          disabled={disabled || collectedAllyPowerups <= 0}
          className="relative flex-1 rounded-lg flex flex-col items-center justify-center py-2 touch-manipulation"
          style={{
            background: collectedAllyPowerups > 0 ? 'rgba(100,150,255,0.4)' : 'rgba(60,60,60,0.6)',
            border: `3px solid ${collectedAllyPowerups > 0 ? '#6496ff' : '#555'}`,
            opacity: disabled ? 0.5 : 1,
            minHeight: '48px',
            boxShadow: collectedAllyPowerups > 0 ? '0 0 14px rgba(100,150,255,0.5)' : 'none',
          }}
        >
          <span className="text-lg">🤖</span>
          <span 
            className="text-[9px] font-bold uppercase"
            style={{ color: collectedAllyPowerups > 0 ? '#6496ff' : '#666' }}
          >
            ALLY
          </span>
          <div 
            className="absolute -top-1.5 -right-1.5 rounded-full text-[10px] font-black w-5 h-5 flex items-center justify-center"
            style={{ background: collectedAllyPowerups > 0 ? '#6496ff' : '#444', color: '#000' }}
          >
            {collectedAllyPowerups}
          </div>
        </motion.button>

        {/* ULT Button */}
        <motion.button
          whileTap={{ scale: collectedUltPowerups > 0 ? 0.88 : 1 }}
          onClick={() => collectedUltPowerups > 0 && onUseUlt?.()}
          disabled={disabled || collectedUltPowerups <= 0}
          className="relative flex-1 rounded-lg flex flex-col items-center justify-center py-2 touch-manipulation"
          style={{
            background: collectedUltPowerups > 0 ? 'rgba(0,200,100,0.4)' : 'rgba(60,60,60,0.6)',
            border: `3px solid ${collectedUltPowerups > 0 ? '#00c864' : '#555'}`,
            opacity: disabled ? 0.5 : 1,
            minHeight: '48px',
            boxShadow: collectedUltPowerups > 0 ? '0 0 14px rgba(0,200,100,0.5)' : 'none',
          }}
        >
          <span className="text-lg">🚀</span>
          <span 
            className="text-[9px] font-bold uppercase"
            style={{ color: collectedUltPowerups > 0 ? '#00c864' : '#666' }}
          >
            ULT
          </span>
          <div 
            className="absolute -top-1.5 -right-1.5 rounded-full text-[10px] font-black w-5 h-5 flex items-center justify-center"
            style={{ background: collectedUltPowerups > 0 ? '#00c864' : '#444', color: '#000' }}
          >
            {collectedUltPowerups}
          </div>
        </motion.button>
        
        {/* TANK Button */}
        <motion.button
          whileTap={{ scale: collectedTankPowerups > 0 ? 0.88 : 1 }}
          onClick={() => collectedTankPowerups > 0 && onUseTank?.()}
          disabled={disabled || collectedTankPowerups <= 0}
          className="relative flex-1 rounded-lg flex flex-col items-center justify-center py-2 touch-manipulation"
          style={{
            background: collectedTankPowerups > 0 ? 'rgba(255,150,0,0.4)' : 'rgba(60,60,60,0.6)',
            border: `3px solid ${collectedTankPowerups > 0 ? '#ff9600' : '#555'}`,
            opacity: disabled ? 0.5 : 1,
            minHeight: '48px',
            boxShadow: collectedTankPowerups > 0 ? '0 0 14px rgba(255,150,0,0.5)' : 'none',
          }}
        >
          <span className="text-lg">🔫</span>
          <span 
            className="text-[9px] font-bold uppercase"
            style={{ color: collectedTankPowerups > 0 ? '#ff9600' : '#666' }}
          >
            TANK
          </span>
          <div 
            className="absolute -top-1.5 -right-1.5 rounded-full text-[10px] font-black w-5 h-5 flex items-center justify-center"
            style={{ background: collectedTankPowerups > 0 ? '#ff9600' : '#444', color: '#000' }}
          >
            {collectedTankPowerups}
          </div>
        </motion.button>
      </div>

      {/* Legend Row */}
      <div className="flex justify-center gap-4 text-[10px] text-gray-300 font-medium">
        <span>🌹 Move</span>
        <span>⚡ Shoot</span>
        <span>⚡ EMP</span>
        <span className="text-yellow-400">⭐ Kill ELITES!</span>
      </div>
    </div>
  );
};
