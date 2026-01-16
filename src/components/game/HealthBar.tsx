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
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm text-muted-foreground">PLAYER HP</span>
        <span className={`font-display text-lg ${isCritical ? 'text-destructive animate-pulse' : isLow ? 'text-neon-orange' : 'text-neon-green'}`}>
          {Math.ceil(health)} / {maxHealth}
        </span>
      </div>
      
      <div className="relative">
        {/* Background */}
        <div className="h-6 bg-muted rounded-full overflow-hidden border border-border">
          {/* Health bar */}
          <motion.div
            className={`h-full ${isCritical ? 'bg-destructive' : isLow ? 'bg-neon-orange' : 'bg-neon-green'}`}
            initial={{ width: '100%' }}
            animate={{ 
              width: `${healthPercent}%`,
            }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: isCritical 
                ? 'inset 0 0 20px hsl(var(--destructive))'
                : isLow 
                  ? 'inset 0 0 20px hsl(var(--neon-orange))'
                  : 'inset 0 0 20px hsl(var(--neon-green))',
            }}
          />
          
          {/* Shield overlay */}
          {shield > 0 && (
            <motion.div
              className="absolute top-0 left-0 h-full bg-secondary/50"
              animate={{ width: `${shield}%` }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>

        {/* Danger pulse effect */}
        {isCritical && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-destructive"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Shield indicator */}
      {shield > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-secondary">🛡️</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-secondary"
              animate={{ width: `${shield}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="font-display text-sm text-secondary">{Math.ceil(shield)}</span>
        </div>
      )}
    </div>
  );
};
