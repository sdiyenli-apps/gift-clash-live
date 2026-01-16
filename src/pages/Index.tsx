import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useTikTokSimulator } from '@/hooks/useTikTokSimulator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Arena } from '@/components/game/Arena';
import { HealthBar } from '@/components/game/HealthBar';
import { GiftPanel } from '@/components/game/GiftPanel';
import { GiftNotification } from '@/components/game/GiftNotification';
import { GameOverlay } from '@/components/game/GameOverlay';

const Index = () => {
  const [autoSimulate, setAutoSimulate] = useState(false);
  const { gameState, giftEvents, notifications, startGame, startNextWave, handleGift } = useGameState();
  const { playSound, startMusic, stopMusic } = useSoundEffects();
  
  const { triggerGift } = useTikTokSimulator(
    autoSimulate && gameState.phase === 'playing',
    handleGift,
    'medium'
  );

  // Start music when game starts
  useEffect(() => {
    if (gameState.phase === 'playing') {
      startMusic();
    } else {
      stopMusic();
    }
  }, [gameState.phase, startMusic, stopMusic]);

  // Play sound effects
  useEffect(() => {
    if (gameState.player.isShooting) {
      playSound(gameState.player.isMagicDashing ? 'shootUltra' : 'shoot');
    }
  }, [gameState.player.isShooting, gameState.player.isMagicDashing, playSound]);

  useEffect(() => {
    if (gameState.player.animationState === 'hurt') {
      playSound('hurt');
    }
  }, [gameState.player.animationState, playSound]);

  useEffect(() => {
    if (gameState.isBossFight && gameState.fireballs?.length > 0) {
      playSound('bossFireball');
    }
  }, [gameState.fireballs?.length, gameState.isBossFight, playSound]);

  const handleTriggerGift = useCallback((giftId: string) => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    triggerGift(giftId, `Viewer_${Math.floor(Math.random() * 9999)}`);
  }, [gameState.phase, triggerGift, playSound]);

  return (
    <div 
      className="min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%)',
      }}
    >
      <GiftNotification notifications={notifications} />

      {/* Compact Header */}
      <header className="p-1.5 bg-black/80 border-b border-purple-500/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">👃</span>
            <h1 
              className="font-bold text-sm"
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
            <div className="flex items-center gap-2 text-[10px]">
              <div className="text-cyan-400 font-bold">⭐ {gameState.score}</div>
              <div className="text-yellow-400 font-bold">W{gameState.currentWave}</div>
              {gameState.player.isMagicDashing && (
                <motion.div
                  className="text-pink-400 font-bold"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                >
                  ✨ {gameState.player.magicDashTimer.toFixed(1)}s
                </motion.div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Mobile optimized */}
      <main className="flex-1 flex flex-col p-1.5 gap-1.5 overflow-hidden">
        {/* Health bar */}
        {gameState.phase === 'playing' && (
          <div className="bg-gray-900/90 rounded-lg p-1.5 border border-cyan-500/30 flex-shrink-0">
            <HealthBar 
              health={gameState.player.health}
              maxHealth={gameState.player.maxHealth}
              shield={gameState.player.shield}
            />
          </div>
        )}

        {/* Game Arena - flexible height */}
        <div className="relative flex-1 min-h-[200px] max-h-[300px]">
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

        {/* Auto-simulate & Recent */}
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="flex-1 bg-gray-900/90 rounded-lg p-1.5 border border-green-500/30">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-[10px] text-gray-300">🤖 Auto</span>
              <button
                onClick={() => setAutoSimulate(!autoSimulate)}
                className={`w-8 h-4 rounded-full transition-colors relative ${autoSimulate ? 'bg-green-500' : 'bg-gray-700'}`}
              >
                <motion.div
                  className="w-3 h-3 bg-white rounded-full absolute top-0.5"
                  animate={{ left: autoSimulate ? '18px' : '2px' }}
                />
              </button>
            </label>
          </div>

          <div className="flex-1 bg-gray-900/90 rounded-lg p-1.5 border border-yellow-500/30">
            <div className="text-[9px] text-yellow-400 font-bold mb-0.5">💫 Recent</div>
            <div className="flex gap-0.5 overflow-x-auto">
              {giftEvents.slice(0, 5).map((event) => (
                <span key={event.id} className="text-sm">{event.gift.emoji}</span>
              ))}
              {giftEvents.length === 0 && <span className="text-[8px] text-gray-500">None</span>}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-1 text-center bg-black/80 border-t border-purple-500/30 flex-shrink-0">
        <p className="text-[8px] text-gray-500">
          🎮 Viewers control with gifts! 👑 Save the Princess!
        </p>
      </footer>
    </div>
  );
};

export default Index;
