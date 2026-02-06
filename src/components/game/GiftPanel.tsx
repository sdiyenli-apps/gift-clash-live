import { motion } from 'framer-motion';
import { TIKTOK_GIFTS } from '@/types/game';

interface GiftPanelProps {
  onTriggerGift: (giftId: string) => void;
  disabled: boolean;
  onSummonAlly?: () => void;
  onSummonUlt?: () => void;
  onSummonTank?: () => void;
  allyCooldown?: number;
  ultCooldown?: number;
  tankCooldown?: number;
  health?: number;
  maxHealth?: number;
  shield?: number;
}

export const GiftPanel = ({ 
  onTriggerGift, 
  disabled, 
  onSummonAlly,
  onSummonUlt,
  onSummonTank,
  allyCooldown = 0,
  ultCooldown = 0,
  tankCooldown = 0,
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
    spawn_enemies: { border: '#ff00ff', bg: 'rgba(255,0,255,0.3)', color: '#ff00ff' },
    emp_grenade: { border: '#00ffc8', bg: 'rgba(0,255,200,0.3)', color: '#00ffc8' },
  };

  const giftLabels: Record<string, string> = {
    move_forward: 'GO',
    shoot: 'FIRE',
    armor: 'DEF',
    heal: 'HP',
    spawn_enemies: 'RAY',
    emp_grenade: 'EMP',
  };

  // Summon button styles - always enabled but show cooldown
  const summonStyles = {
    ally: { border: '#6496ff', bg: 'rgba(100,150,255,0.4)', color: '#6496ff', emoji: '🤖', label: 'ALLY' },
    ult: { border: '#00c864', bg: 'rgba(0,200,100,0.4)', color: '#00c864', emoji: '🚀', label: 'ULT' },
    tank: { border: '#ff9600', bg: 'rgba(255,150,0,0.4)', color: '#ff9600', emoji: '🔫', label: 'TANK' },
  };

  const renderSummonButton = (
    type: 'ally' | 'ult' | 'tank',
    cooldown: number,
    onSummon?: () => void
  ) => {
    const style = summonStyles[type];
    const isReady = cooldown <= 0;
    const cooldownPercent = Math.min(cooldown / 15, 1) * 100;

    return (
      <motion.button
        key={type}
        whileTap={{ scale: isReady ? 0.9 : 1 }}
        onClick={() => isReady && onSummon?.()}
        disabled={disabled || !isReady}
        className="relative flex-1 rounded flex flex-col items-center justify-center py-1 touch-manipulation overflow-hidden"
        style={{
          background: isReady ? style.bg : 'rgba(50,50,50,0.6)',
          border: `2px solid ${isReady ? style.border : '#444'}`,
          opacity: disabled ? 0.5 : 1,
          minHeight: '36px',
        }}
      >
        {/* Cooldown overlay */}
        {!isReady && (
          <div 
            className="absolute bottom-0 left-0 right-0 bg-black/60"
            style={{ height: `${cooldownPercent}%` }}
          />
        )}
        <span className="text-sm relative z-10">{style.emoji}</span>
        <span className="text-[7px] font-bold relative z-10" style={{ color: isReady ? style.color : '#555' }}>
          {isReady ? style.label : `${Math.ceil(cooldown)}s`}
        </span>
      </motion.button>
    );
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

      {/* Gift Buttons + Summons in one row */}
      <div className="flex items-center gap-1">
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
                minHeight: '36px',
              }}
            >
              <span className="text-base">{gift.emoji}</span>
              <span className="text-[7px] font-bold" style={{ color: style.color }}>{giftLabels[gift.action]}</span>
            </motion.button>
          );
        })}
        
        {/* Summon buttons with cooldowns */}
        {renderSummonButton('ally', allyCooldown, onSummonAlly)}
        {renderSummonButton('ult', ultCooldown, onSummonUlt)}
        {renderSummonButton('tank', tankCooldown, onSummonTank)}
      </div>
    </div>
  );
};
