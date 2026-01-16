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
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%)',
      }}
    >
      <GiftNotification notifications={notifications} />

      {/* Compact Header */}
      <header className="p-1 bg-black/80 border-b border-purple-500/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-base">🐿️</span>
            <h1 
              className="font-bold text-xs"
              style={{
                background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CAPTAIN SQUIRBERT
            </h1>
          </div>

          {gameState.phase === 'playing' && (
            <div className="flex items-center gap-2 text-[9px]">
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

      {/* Main Content - Full mobile optimized */}
      <main className="flex-1 flex flex-col p-1 gap-1 overflow-hidden min-h-0">
        {/* Health bar - only when playing */}
        {gameState.phase === 'playing' && (
          <div className="bg-gray-900/90 rounded p-1 border border-cyan-500/30 flex-shrink-0">
            <HealthBar 
              health={gameState.player.health}
              maxHealth={gameState.player.maxHealth}
              shield={gameState.player.shield}
            />
          </div>
        )}

        {/* Game Arena - takes all available space */}
        <div className="relative flex-1 min-h-0">
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

        {/* Gift Controls - compact */}
        <div className="flex-shrink-0">
          <GiftPanel 
            onTriggerGift={handleTriggerGift}
            disabled={gameState.phase !== 'playing'}
          />
        </div>

        {/* Auto-simulate & Recent - very compact */}
        <div className="flex gap-1 flex-shrink-0">
          <div className="flex-1 bg-gray-900/90 rounded p-1 border border-green-500/30">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-[9px] text-gray-300">🤖 Auto</span>
              <button
                onClick={() => setAutoSimulate(!autoSimulate)}
                className={`w-7 h-3.5 rounded-full transition-colors relative ${autoSimulate ? 'bg-green-500' : 'bg-gray-700'}`}
              >
                <motion.div
                  className="w-2.5 h-2.5 bg-white rounded-full absolute top-0.5"
                  animate={{ left: autoSimulate ? '14px' : '2px' }}
                />
              </button>
            </label>
          </div>

          <div className="flex-1 bg-gray-900/90 rounded p-1 border border-yellow-500/30">
            <div className="text-[8px] text-yellow-400 font-bold">💫 Recent</div>
            <div className="flex gap-0.5 overflow-x-auto">
              {giftEvents.slice(0, 5).map((event) => (
                <span key={event.id} className="text-xs">{event.gift.emoji}</span>
              ))}
              {giftEvents.length === 0 && <span className="text-[7px] text-gray-500">None</span>}
            </div>
          </div>
        </div>
      </main>

      {/* Footer - minimal */}
      <footer className="p-0.5 text-center bg-black/80 border-t border-purple-500/30 flex-shrink-0">
        <p className="text-[7px] text-gray-500">
          🎮 Gifts control hero! 👑 Save Princess!
        </p>
      </footer>
    </div>
  );
};

export default Index;
