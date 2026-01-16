import { motion } from 'framer-motion';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  shield: number;
}

export const HealthBar = ({ health, maxHealth, shield }: HealthBarProps) => {
  const healthPercent = (health / maxHealth) * 100;
  const isLow = healthPercent < 30;
  const isCritical = healthPercent < 15;

  return (
    <div className="w-full flex items-center gap-2">
      {/* HP Section */}
      <div className="flex items-center gap-1.5 flex-1">
        <span className="text-[10px] font-bold text-red-400">❤️</span>
        <div className="flex-1 h-3 bg-gray-800/80 rounded-full overflow-hidden relative">
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
        <span className={`text-[10px] font-bold min-w-[32px] text-right ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
          {Math.ceil(health)}
        </span>
      </div>

      {/* Shield Section - only if active */}
      {shield > 0 && (
        <div className="flex items-center gap-1.5 w-20">
          <span className="text-[10px]">🛡️</span>
          <div className="flex-1 h-2.5 bg-gray-800/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan-400"
              animate={{ width: `${Math.min(shield, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[10px] font-bold text-cyan-400">{Math.ceil(shield)}</span>
        </div>
      )}
    </div>
  );
};
