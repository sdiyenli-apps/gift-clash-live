import { motion } from 'framer-motion';
import { Gifter } from '@/types/game';

interface LeaderboardProps {
  gifters: Gifter[];
}

export const Leaderboard = ({ gifters }: LeaderboardProps) => {
  const topGifters = gifters.slice(0, 5);

  const rankStyles = [
    'bg-gradient-to-r from-neon-yellow to-neon-orange border-neon-yellow text-neon-yellow',
    'bg-gradient-to-r from-slate-300 to-slate-400 border-slate-300 text-slate-300',
    'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-600 text-amber-500',
  ];

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4">
      <h3 className="font-display text-lg text-center mb-4 text-secondary text-glow-cyan">
        🏆 TOP GIFTERS
      </h3>

      {topGifters.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">
          <span className="text-2xl">🎁</span>
          <p className="text-sm mt-2">Send gifts to appear here!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topGifters.map((gifter, index) => (
            <motion.div
              key={gifter.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-3 p-2 rounded-lg
                ${index < 3 ? 'bg-muted/50' : 'bg-transparent'}
              `}
            >
              {/* Rank badge */}
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center
                font-display text-sm font-bold
                ${index < 3 
                  ? `${rankStyles[index]} bg-opacity-20 border` 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {index + 1}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-sm">
                {gifter.username.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="font-game font-semibold truncate text-foreground">
                  {gifter.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  {gifter.giftCount} gift{gifter.giftCount > 1 ? 's' : ''}
                </div>
              </div>

              {/* Diamonds */}
              <div className="flex items-center gap-1">
                <span>💎</span>
                <span className="font-display text-secondary">
                  {gifter.totalDiamonds.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
