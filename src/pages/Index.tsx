import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useTikTokSimulator } from '@/hooks/useTikTokSimulator';
import { Arena } from '@/components/game/Arena';
import { HealthBar } from '@/components/game/HealthBar';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { Leaderboard } from '@/components/game/Leaderboard';
import { GiftPanel } from '@/components/game/GiftPanel';
import { GiftNotification } from '@/components/game/GiftNotification';
import { GameOverlay } from '@/components/game/GameOverlay';
import { ConnectionStatus } from '@/components/game/ConnectionStatus';

const Index = () => {
  const [autoSimulate, setAutoSimulate] = useState(false);
  const { gameState, giftEvents, leaderboard, notifications, startGame, handleGift } = useGameState();
  
  const { triggerGift } = useTikTokSimulator(
    autoSimulate && gameState.phase === 'playing',
    handleGift,
    'medium'
  );

  const handleTriggerGift = useCallback((giftId: string) => {
    if (gameState.phase !== 'playing') return;
    triggerGift(giftId, `User_${Math.floor(Math.random() * 9999)}`);
  }, [gameState.phase, triggerGift]);

  return (
    <div className="min-h-screen bg-background">
      {/* Gift notifications */}
      <GiftNotification notifications={notifications} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-3xl">🎮</span>
            <h1 className="font-display text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              GIFT ARENA
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ConnectionStatus 
              isConnected={gameState.phase === 'playing'} 
              viewerCount={1234 + giftEvents.length * 10}
            />
          </motion.div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col lg:flex-row min-h-screen pt-24 pb-16 px-4 gap-4 max-w-7xl mx-auto">
        {/* Left sidebar - Stats */}
        <motion.aside
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:w-72 space-y-4 shrink-0"
        >
          {gameState.phase === 'playing' && (
            <>
              <ScoreDisplay 
                score={gameState.score}
                wave={gameState.wave}
                timeRemaining={gameState.timeRemaining}
              />
              
              <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4">
                <HealthBar 
                  health={gameState.player.health}
                  maxHealth={gameState.player.maxHealth}
                  shield={gameState.player.shield}
                />
              </div>

              {/* Enemy count */}
              <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm text-muted-foreground">ENEMIES</span>
                  <span className="font-display text-2xl text-destructive">
                    {gameState.enemies.length}
                  </span>
                </div>
                <div className="mt-2 flex gap-1">
                  {gameState.enemies.filter(e => e.type === 'boss').length > 0 && (
                    <span className="px-2 py-0.5 bg-destructive/20 rounded text-xs text-destructive">
                      👹 BOSS ACTIVE
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          <Leaderboard gifters={leaderboard} />
        </motion.aside>

        {/* Center - Arena */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 relative h-[500px] lg:h-auto lg:min-h-[600px]"
        >
          <Arena gameState={gameState} />
          <GameOverlay 
            phase={gameState.phase}
            score={gameState.score}
            wave={gameState.wave}
            onStart={startGame}
          />
        </motion.div>

        {/* Right sidebar - Gift controls */}
        <motion.aside
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:w-80 space-y-4 shrink-0"
        >
          {/* Auto-simulate toggle */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-display text-sm">Auto-simulate gifts</span>
              <button
                onClick={() => setAutoSimulate(!autoSimulate)}
                className={`
                  w-12 h-6 rounded-full transition-colors relative
                  ${autoSimulate ? 'bg-neon-green' : 'bg-muted'}
                `}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                  animate={{ left: autoSimulate ? '26px' : '2px' }}
                />
              </button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Randomly sends gifts every few seconds
            </p>
          </div>

          <GiftPanel 
            onTriggerGift={handleTriggerGift}
            disabled={gameState.phase !== 'playing'}
          />

          {/* Recent gifts feed */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4">
            <h3 className="font-display text-sm text-muted-foreground mb-3">RECENT GIFTS</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {giftEvents.slice(0, 10).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span>{event.gift.emoji}</span>
                  <span className="text-muted-foreground truncate flex-1">
                    {event.username}
                  </span>
                  <span className="text-secondary text-xs">💎{event.gift.diamonds}</span>
                </motion.div>
              ))}
              {giftEvents.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No gifts yet...
                </p>
              )}
            </div>
          </div>
        </motion.aside>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center bg-background/80 backdrop-blur-sm border-t border-border">
        <p className="text-xs text-muted-foreground">
          TikTok Gift Arena • Connect to TikTok Live to enable real gift integration
        </p>
      </footer>
    </div>
  );
};

export default Index;
