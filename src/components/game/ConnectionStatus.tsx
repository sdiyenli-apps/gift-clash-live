import { motion } from 'framer-motion';
import { TikTokConnectionState } from '@/hooks/useTikTokLive';

interface ConnectionStatusProps {
  isConnected: boolean;
  viewerCount?: number;
}

export const ConnectionStatus = ({ isConnected, viewerCount = 0 }: ConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border">
      {/* Connection indicator */}
      <div className="flex items-center gap-2">
        <motion.div
          className={`w-3 h-3 rounded-full ${isConnected ? 'bg-neon-green' : 'bg-destructive'}`}
          animate={isConnected ? { 
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="font-display text-sm">
          {isConnected ? (
            <span className="text-neon-green">LIVE</span>
          ) : (
            <span className="text-destructive">OFFLINE</span>
          )}
        </span>
      </div>

      {/* TikTok branding */}
      <div className="flex items-center gap-1">
        <span className="text-lg">📱</span>
        <span className="font-game text-sm text-muted-foreground">TikTok Live</span>
      </div>

      {/* Viewer count */}
      <div className="flex items-center gap-1">
        <span>👁️</span>
        <span className="font-display text-sm text-foreground">
          {viewerCount.toLocaleString()}
        </span>
      </div>

      {/* Demo badge */}
      <div className="px-2 py-0.5 bg-neon-purple/20 rounded-full">
        <span className="font-display text-[10px] text-neon-purple">DEMO MODE</span>
      </div>
    </div>
  );
};
