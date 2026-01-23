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
      className="rounded-lg p-2"
      style={{
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Compact HP + Shield Row */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex items-center gap-1 flex-1">
          <span className="text-sm">❤️</span>
          <div className="flex-1 h-4 bg-gray-900 rounded-full overflow-hidden relative border border-gray-700">
            <motion.div
              className={`h-full ${isCritical ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-green-500'}`}
              animate={{ width: `${healthPercent}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className={`text-xs font-bold min-w-[28px] text-right ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
            {Math.ceil(health)}
          </span>
        </div>
        <div className="flex items-center gap-1 w-20">
          <span className="text-sm">🛡️</span>
          <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
            <motion.div
              className="h-full bg-cyan-500"
              animate={{ width: `${Math.min(shield, 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className="text-xs font-bold text-cyan-400 min-w-[24px] text-right">{Math.ceil(shield)}</span>
        </div>
      </div>

      {/* Gift Buttons - compact */}
      <div className="flex items-center gap-1 mb-1.5">
        {gifts.map(gift => {
          const style = giftStyles[gift.action] || { border: '#888', bg: 'rgba(128,128,128,0.3)', color: '#888' };
          return (
            <motion.button
              key={gift.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTriggerGift(gift.id)}
              disabled={disabled}
              className="flex-1 rounded flex flex-col items-center justify-center py-1 touch-manipulation"
              style={{
                background: style.bg,
                border: `2px solid ${style.border}`,
                opacity: disabled ? 0.5 : 1,
                minHeight: '40px',
              }}
            >
              <span className="text-base">{gift.emoji}</span>
              <span className="text-[7px] font-bold" style={{ color: style.color }}>{giftLabels[gift.action]}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Powerups Row - ALLY, ULT, TANK only */}
      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{ scale: collectedAllyPowerups > 0 ? 0.9 : 1 }}
          onClick={() => collectedAllyPowerups > 0 && onUseAlly?.()}
          disabled={disabled || collectedAllyPowerups <= 0}
          className="relative flex-1 rounded flex flex-col items-center justify-center py-1 touch-manipulation"
          style={{
            background: collectedAllyPowerups > 0 ? 'rgba(100,150,255,0.4)' : 'rgba(50,50,50,0.6)',
            border: `2px solid ${collectedAllyPowerups > 0 ? '#6496ff' : '#444'}`,
            opacity: disabled ? 0.5 : 1,
            minHeight: '36px',
          }}
        >
          <span className="text-sm">🤖</span>
          <span className="text-[7px] font-bold" style={{ color: collectedAllyPowerups > 0 ? '#6496ff' : '#555' }}>ALLY</span>
          <div 
            className="absolute -top-1 -right-1 rounded-full text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center"
            style={{ background: collectedAllyPowerups > 0 ? '#6496ff' : '#333', color: '#000' }}
          >{collectedAllyPowerups}</div>
        </motion.button>

        <motion.button
          whileTap={{ scale: collectedUltPowerups > 0 ? 0.9 : 1 }}
          onClick={() => collectedUltPowerups > 0 && onUseUlt?.()}
          disabled={disabled || collectedUltPowerups <= 0}
          className="relative flex-1 rounded flex flex-col items-center justify-center py-1 touch-manipulation"
          style={{
            background: collectedUltPowerups > 0 ? 'rgba(0,200,100,0.4)' : 'rgba(50,50,50,0.6)',
            border: `2px solid ${collectedUltPowerups > 0 ? '#00c864' : '#444'}`,
            opacity: disabled ? 0.5 : 1,
            minHeight: '36px',
          }}
        >
          <span className="text-sm">🚀</span>
          <span className="text-[7px] font-bold" style={{ color: collectedUltPowerups > 0 ? '#00c864' : '#555' }}>ULT</span>
          <div 
            className="absolute -top-1 -right-1 rounded-full text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center"
            style={{ background: collectedUltPowerups > 0 ? '#00c864' : '#333', color: '#000' }}
          >{collectedUltPowerups}</div>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: collectedTankPowerups > 0 ? 0.9 : 1 }}
          onClick={() => collectedTankPowerups > 0 && onUseTank?.()}
          disabled={disabled || collectedTankPowerups <= 0}
          className="relative flex-1 rounded flex flex-col items-center justify-center py-1 touch-manipulation"
          style={{
            background: collectedTankPowerups > 0 ? 'rgba(255,150,0,0.4)' : 'rgba(50,50,50,0.6)',
            border: `2px solid ${collectedTankPowerups > 0 ? '#ff9600' : '#444'}`,
            opacity: disabled ? 0.5 : 1,
            minHeight: '36px',
          }}
        >
          <span className="text-sm">🔫</span>
          <span className="text-[7px] font-bold" style={{ color: collectedTankPowerups > 0 ? '#ff9600' : '#555' }}>TANK</span>
          <div 
            className="absolute -top-1 -right-1 rounded-full text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center"
            style={{ background: collectedTankPowerups > 0 ? '#ff9600' : '#333', color: '#000' }}
          >{collectedTankPowerups}</div>
        </motion.button>
      </div>
    </div>
  );
};
