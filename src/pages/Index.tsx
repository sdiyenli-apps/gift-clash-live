import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useTikTokSimulator } from '@/hooks/useTikTokSimulator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Arena } from '@/components/game/Arena';
import { HealthBar } from '@/components/game/HealthBar';
import { GiftPanel } from '@/components/game/GiftPanel';
// Gift notifications are now flying boxes in the Arena
import { GameOverlay } from '@/components/game/GameOverlay';
import { WaveTransition } from '@/components/game/WaveTransition';
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
        case 'shield':
          playSound('shieldBlock');
          break;
      }
    }
  }, [gameState.lastBossAttack, playSound]);

  // Play sound when enemies shoot
  useEffect(() => {
    if (gameState.enemyLasers?.length > 0) {
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
      className="h-screen w-screen flex flex-col overflow-hidden safe-area-inset touch-none select-none"
      style={{
        background: 'linear-gradient(180deg, #0a0a12 0%, #12081c 100%)',
      }}
    >
      {/* Gift notifications now shown as flying boxes in the Arena */}

      {/* Modern TikTok Live Header - Floating pill style */}
      <header className="absolute top-2 left-2 right-2 z-30 flex items-center justify-between pointer-events-none">
        {/* Left side - Logo & Stats */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-base">🐿️</span>
            <span 
              className="font-black text-xs"
              style={{
                background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CPT SQUIRBERT
            </span>
          </div>
        </div>

        {/* Right side - Audio & Wave info */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {gameState.phase === 'playing' && (
            <>
              <div 
                className="px-2.5 py-1 rounded-full font-bold text-xs"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,0,0.3)',
                  color: '#ffff00',
                }}
              >
                ⭐ {gameState.score.toLocaleString()}
              </div>
              <div 
                className="px-2.5 py-1 rounded-full font-bold text-xs"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,255,255,0.3)',
                  color: '#00ffff',
                }}
              >
                W{gameState.currentWave}
              </div>
              {gameState.player.isMagicDashing && (
                <motion.div
                  className="px-2.5 py-1 rounded-full font-bold text-xs"
                  style={{
                    background: 'rgba(255,0,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,0,255,0.5)',
                    color: '#ff66ff',
                  }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                >
                  ✨ {gameState.player.magicDashTimer.toFixed(0)}s
                </motion.div>
              )}
            </>
          )}
          <motion.button
            onClick={() => setAudioOn(!audioOn)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{
              background: audioOn ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: audioOn ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.2)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {audioOn ? '🔊' : '🔇'}
          </motion.button>
        </div>
      </header>

      {/* Main Game Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Top HUD - HP, Shield, and Gifts */}
        {gameState.phase === 'playing' && (
          <div className="absolute top-11 left-2 right-2 z-20 space-y-1.5">
            {/* Health bar */}
            <div 
              className="px-2 py-1 rounded-lg"
              style={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(0,255,255,0.2)',
              }}
            >
              <HealthBar 
                health={gameState.player.health}
                maxHealth={gameState.player.maxHealth}
                shield={gameState.player.shield}
              />
            </div>
            
            {/* Gift buttons - under HP bar */}
            <GiftPanel 
              onTriggerGift={handleTriggerGift}
              disabled={gameState.phase !== 'playing'}
            />
          </div>
        )}

        {/* Game Arena */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <Arena gameState={gameState} notifications={notifications} />
          <GameOverlay 
            phase={gameState.phase}
            score={gameState.score}
            distance={gameState.distance}
            currentWave={gameState.currentWave}
            maxWaves={gameState.maxWaves}
            onStart={() => startGame(gameState.currentWave || 1)}
            onNextWave={startNextWave}
          />
          
          {/* Wave Transition Screen */}
          <WaveTransition
            isVisible={gameState.phase === 'victory'}
            currentWave={gameState.currentWave}
            maxWaves={gameState.maxWaves}
            score={gameState.score}
            onNextWave={startNextWave}
          />
        </div>

      </main>
    </div>
  );
};

export default Index;