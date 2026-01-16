import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useTikTokSimulator } from '@/hooks/useTikTokSimulator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Arena } from '@/components/game/Arena';
import { HealthBar } from '@/components/game/HealthBar';
import { GiftPanel } from '@/components/game/GiftPanel';
import { GiftNotification } from '@/components/game/GiftNotification';
import { GameOverlay } from '@/components/game/GameOverlay';
// Removed VictoryCutscene import
import gameTheme from '@/assets/cpt-squirbert-theme.mp3';

const Index = () => {
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { gameState, giftEvents, notifications, startGame, startNextWave, handleGift } = useGameState();
  const { playSound } = useSoundEffects();
  
  const { triggerGift } = useTikTokSimulator(
    autoSimulate && gameState.phase === 'playing',
    handleGift,
    'medium'
  );

  // Handle audio toggle
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(gameTheme);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    
    if (audioOn) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioOn]);

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

  // Play boss attack sounds based on attack type
  useEffect(() => {
    if (gameState.lastBossAttack) {
      switch (gameState.lastBossAttack) {
        case 'laser_sweep':
          playSound('laserSweep');
          break;
        case 'missile_barrage':
          playSound('missileWarning');
          break;
        case 'ground_pound':
          playSound('groundPound');
          break;
        case 'screen_attack':
          playSound('screenAttack');
          break;
      }
    }
  }, [gameState.lastBossAttack, playSound]);

  // Play sound when enemies shoot
  useEffect(() => {
    if (gameState.enemyLasers?.length > 0) {
      // Check if any are from drones (damage 8)
      const hasDroneLaser = gameState.enemyLasers.some(l => l.damage === 8);
      if (hasDroneLaser) {
        playSound('droneShoot');
      } else {
        playSound('enemyShoot');
      }
    }
  }, [gameState.enemyLasers?.length, playSound]);

  // Play sound when shield blocks
  useEffect(() => {
    if (gameState.shieldBlockFlash && gameState.shieldBlockFlash > 0) {
      playSound('shieldBlock');
    }
  }, [gameState.shieldBlockFlash, playSound]);

  const handleTriggerGift = useCallback((giftId: string) => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    triggerGift(giftId, `Viewer_${Math.floor(Math.random() * 9999)}`);
  }, [gameState.phase, triggerGift, playSound]);

  return (
    <div 
      className="h-screen w-screen flex flex-col overflow-hidden safe-area-inset"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%)',
      }}
    >
      <GiftNotification notifications={notifications} />

      {/* Compact Header - optimized for mobile */}
      <header className="px-2 py-1 bg-black/90 border-b border-purple-500/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🐿️</span>
            <h1 
              className="font-bold text-sm sm:text-base"
              style={{
                background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CPT SQUIRBERT
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle Button */}
            <motion.button
              onClick={() => setAudioOn(!audioOn)}
              className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                audioOn 
                  ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50' 
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {audioOn ? '🔊' : '🔇'}
            </motion.button>

            {gameState.phase === 'playing' && (
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="text-cyan-400 font-bold">⭐ {gameState.score}</div>
                <div className="text-yellow-400 font-bold">W{gameState.currentWave}</div>
                {gameState.player.isMagicDashing && (
                  <motion.div
                    className="text-pink-400 font-bold"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                  >
                    ✨ {gameState.player.magicDashTimer.toFixed(0)}s
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Full mobile optimized with better POV */}
      <main className="flex-1 flex flex-col p-1.5 gap-1.5 overflow-hidden min-h-0">
        {/* Health bar - only when playing - larger for visibility */}
        {gameState.phase === 'playing' && (
          <div className="bg-gray-900/90 rounded-lg p-1.5 border border-cyan-500/30 flex-shrink-0">
            <HealthBar 
              health={gameState.player.health}
              maxHealth={gameState.player.maxHealth}
              shield={gameState.player.shield}
            />
          </div>
        )}

        {/* Game Arena - takes all available space with better aspect ratio */}
        <div className="relative flex-1 min-h-0 rounded-lg overflow-hidden" style={{ minHeight: '45vh' }}>
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

        {/* Gift Controls - larger buttons for mobile */}
        <div className="flex-shrink-0">
          <GiftPanel 
            onTriggerGift={handleTriggerGift}
            disabled={gameState.phase !== 'playing'}
          />
        </div>

        {/* Auto-simulate & Recent - compact but readable */}
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="flex-1 bg-gray-900/90 rounded-lg p-1.5 border border-green-500/30">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-xs text-gray-300">🤖 Auto</span>
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

          <div className="flex-1 bg-gray-900/90 rounded-lg p-1.5 border border-yellow-500/30">
            <div className="text-xs text-yellow-400 font-bold mb-0.5">💫 Recent</div>
            <div className="flex gap-1 overflow-x-auto">
              {giftEvents.slice(0, 5).map((event) => (
                <span key={event.id} className="text-base">{event.gift.emoji}</span>
              ))}
              {giftEvents.length === 0 && <span className="text-xs text-gray-500">None</span>}
            </div>
          </div>
        </div>
      </main>

      {/* Footer - minimal */}
      <footer className="py-1 text-center bg-black/90 border-t border-purple-500/30 flex-shrink-0">
        <p className="text-xs text-gray-400">
          🎮 Send gifts to control hero! 👑 Save the Princess!
        </p>
      </footer>
    </div>
  );
};

export default Index;
