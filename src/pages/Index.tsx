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
import { MusicPlayer } from '@/components/game/MusicPlayer';

const Index = () => {
  const [autoSimulate, setAutoSimulate] = useState(false);
  const { gameState, giftEvents, leaderboard, notifications, startGame, startNextWave, handleGift } = useGameState();
  
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
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%)',
      }}
    >
      {/* Gift notifications */}
      <GiftNotification notifications={notifications} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-black/70 backdrop-blur-sm border-b border-purple-500/20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-3xl">👃</span>
            <h1 
              className="font-bold text-2xl"
              style={{
                background: 'linear-gradient(90deg, #ff00ff, #00ffff, #ffff00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              BIG NOSE HERO
            </h1>
          </motion.div>

          <div className="flex items-center gap-4">
            <MusicPlayer 
              isPlaying={gameState.phase === 'playing'} 
              isUltraMode={gameState.isUltraMode}
              isBossFight={gameState.isBossFight}
            />
            <ConnectionStatus 
              isConnected={gameState.phase === 'playing'} 
              viewerCount={1234 + giftEvents.length * 10}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col lg:flex-row min-h-screen pt-24 pb-4 px-4 gap-4 max-w-7xl mx-auto">
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
                wave={Math.floor(gameState.distance / 1000) + 1}
                timeRemaining={0}
              />
              
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-4">
                <HealthBar 
                  health={gameState.player.health}
                  maxHealth={gameState.player.maxHealth}
                  shield={gameState.player.shield}
                />
              </div>

              {/* Enemy count & Ultra mode timer */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-pink-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-400">ENEMIES AHEAD</span>
                  <span className="font-bold text-2xl text-red-400">
                    {gameState.enemies.filter(e => !e.isDying).length}
                  </span>
                </div>
                
                {gameState.isUltraMode && (
                  <motion.div
                    className="p-2 rounded-lg"
                    style={{
                      background: 'linear-gradient(90deg, rgba(255,0,255,0.3), rgba(0,255,255,0.3))',
                    }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  >
                    <div className="text-center font-bold text-pink-400">
                      ⚡ ULTRA MODE ⚡
                    </div>
                    <div className="text-center text-2xl font-bold text-white">
                      {gameState.ultraModeTimer.toFixed(1)}s
                    </div>
                  </motion.div>
                )}
                
                {gameState.combo > 1 && (
                  <div className="text-center">
                    <span className="text-yellow-400 font-bold">{gameState.combo}x COMBO!</span>
                  </div>
                )}
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
          className="flex-1 relative"
          style={{ minHeight: 520 }}
        >
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
        </motion.div>

        {/* Right sidebar - Gift controls */}
        <motion.aside
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:w-80 space-y-4 shrink-0"
        >
          {/* Auto-simulate toggle */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-green-500/30 p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-sm text-gray-300">🤖 Auto-simulate gifts</span>
              <button
                onClick={() => setAutoSimulate(!autoSimulate)}
                className={`
                  w-12 h-6 rounded-full transition-colors relative
                  ${autoSimulate ? 'bg-green-500' : 'bg-gray-700'}
                `}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                  animate={{ left: autoSimulate ? '26px' : '2px' }}
                />
              </button>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Randomly sends gifts to test the game
            </p>
          </div>

          <GiftPanel 
            onTriggerGift={handleTriggerGift}
            disabled={gameState.phase !== 'playing'}
          />

          {/* Recent gifts feed */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-4">
            <h3 className="font-bold text-sm text-yellow-400 mb-3">💫 RECENT GIFTS</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {giftEvents.slice(0, 10).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span>{event.gift.emoji}</span>
                  <span className="text-gray-400 truncate flex-1">
                    {event.username}
                  </span>
                  <span className="text-cyan-400 text-xs">💎{event.gift.diamonds}</span>
                </motion.div>
              ))}
              {giftEvents.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">
                  No gifts yet... Be the first! 🎁
                </p>
              )}
            </div>
          </div>
        </motion.aside>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-2 text-center bg-black/70 backdrop-blur-sm border-t border-purple-500/20">
        <p className="text-xs text-gray-500">
          🎮 Big Nose Hero • Viewers control the game with TikTok gifts! • Save the Princess! 👸
        </p>
      </footer>
    </div>
  );
};

export default Index;
