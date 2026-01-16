import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  wave: number;
  timeRemaining: number;
}

export const ScoreDisplay = ({ score, wave, timeRemaining }: ScoreDisplayProps) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const isLowTime = timeRemaining < 30;

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border">
      {/* Score */}
      <div className="text-center">
        <div className="text-xs font-display text-muted-foreground">SCORE</div>
        <motion.div
          key={score}
          initial={{ scale: 1.2, color: 'hsl(var(--neon-yellow))' }}
          animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
          className="font-display text-2xl"
        >
          {score.toLocaleString()}
        </motion.div>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className="text-xs font-display text-muted-foreground">TIME</div>
        <motion.div
          className={`font-display text-2xl ${isLowTime ? 'text-destructive animate-pulse' : 'text-secondary'}`}
          animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {minutes}:{seconds.toString().padStart(2, '0')}
        </motion.div>
      </div>

      {/* Wave */}
      <div className="text-center">
        <div className="text-xs font-display text-muted-foreground">WAVE</div>
        <div className="font-display text-2xl text-primary">
          {wave}/10
        </div>
      </div>
    </div>
  );
};
