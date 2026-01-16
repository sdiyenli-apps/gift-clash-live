import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useTikTokSimulator } from '@/hooks/useTikTokSimulator';
import { Arena } from '@/components/game/Arena';
import { HealthBar } from '@/components/game/HealthBar';
import { GiftPanel } from '@/components/game/GiftPanel';
import { GiftNotification } from '@/components/game/GiftNotification';
import { GameOverlay } from '@/components/game/GameOverlay';

const Index = () => {
  const [autoSimulate, setAutoSimulate] = useState(false);
  const { gameState, giftEvents, notifications, startGame, startNextWave, handleGift } = useGameState();
  
  const { triggerGift } = useTikTokSimulator(
    autoSimulate && gameState.phase === 'playing',
    handleGift,
    'medium'
  );

  const handleTriggerGift = useCallback((giftId: string) => {
    if (gameState.phase !== 'playing') return;
    triggerGift(giftId, `Viewer_${Math.floor(Math.random() * 9999)}`);
  }, [gameState.phase, triggerGift]);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%)',
      }}
    >
      <GiftNotification notifications={notifications} />

      {/* Compact Header */}
      <header className="p-2 bg-black/80 border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👃</span>
            <h1 
              className="font-bold text-lg"
              style={{
                background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              BIG NOSE HERO
            </h1>
          </div>

          {gameState.phase === 'playing' && (
            <div className="flex items-center gap-3 text-xs">
              <div className="text-cyan-400 font-bold">
                ⭐ {gameState.score}
              </div>
              <div className="text-yellow-400 font-bold">
                W{gameState.currentWave}
              </div>
              {gameState.player.isMagicDashing && (
                <motion.div
                  className="text-pink-400 font-bold"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  ✨ {gameState.player.magicDashTimer.toFixed(1)}s
                </motion.div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Stacked for mobile */}
      <main className="flex-1 flex flex-col p-2 gap-2 overflow-auto">
        {/* Health bar */}
        {gameState.phase === 'playing' && (
          <div className="bg-gray-900/90 rounded-lg p-2 border border-cyan-500/30">
            <HealthBar 
              health={gameState.player.health}
              maxHealth={gameState.player.maxHealth}
              shield={gameState.player.shield}
            />
          </div>
        )}

        {/* Game Arena */}
        <div className="relative flex-shrink-0" style={{ height: 280 }}>
          <Arena gameState={gameState} />
          <GameOverlay 
            phase={gameState.phase}
            score={gameState.score}
            distance={gameState.distance}
            currentWave={gameState.currentWave}
            maxWaves={gameState.maxWaves}
            onStart={() => startGame(gameState.currentWave || 1)}
            onNextWave={startNextWave}
          />
        </div>

        {/* Gift Controls */}
        <GiftPanel 
          onTriggerGift={handleTriggerGift}
          disabled={gameState.phase !== 'playing'}
        />

        {/* Auto-simulate & Recent gifts */}
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-900/90 rounded-lg p-2 border border-green-500/30">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-xs text-gray-300">🤖 Auto-sim</span>
              <button
                onClick={() => setAutoSimulate(!autoSimulate)}
                className={`w-10 h-5 rounded-full transition-colors relative ${autoSimulate ? 'bg-green-500' : 'bg-gray-700'}`}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                  animate={{ left: autoSimulate ? '22px' : '2px' }}
                />
              </button>
            </label>
          </div>

          <div className="flex-1 bg-gray-900/90 rounded-lg p-2 border border-yellow-500/30">
            <div className="text-xs text-yellow-400 font-bold mb-1">💫 Recent</div>
            <div className="flex gap-1 overflow-x-auto">
              {giftEvents.slice(0, 5).map((event) => (
                <span key={event.id} className="text-lg">{event.gift.emoji}</span>
              ))}
              {giftEvents.length === 0 && <span className="text-[10px] text-gray-500">No gifts yet</span>}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-1 text-center bg-black/80 border-t border-purple-500/30">
        <p className="text-[10px] text-gray-500">
          🎮 Viewers control with TikTok gifts! 👑 Save the Princess!
        </p>
      </footer>
    </div>
  );
};

export default Index;
