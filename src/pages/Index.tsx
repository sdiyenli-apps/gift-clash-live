import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useTikTokSimulator } from '@/hooks/useTikTokSimulator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Arena } from '@/components/game/Arena';
import { HealthBar } from '@/components/game/HealthBar';
import { GiftPanel } from '@/components/game/GiftPanel';
import { GameOverlay } from '@/components/game/GameOverlay';
import { WaveTransition } from '@/components/game/WaveTransition';
import gameTheme from '@/assets/cpt-squirbert-theme.mp3';

const Index = () => {
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { gameState, startGame, startNextWave, handleGift } = useGameState();
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

  // Play jet robot drop sounds when jet robots are dropping
  const droppingJetRobots = gameState.enemies.filter(e => e.type === 'jetrobot' && e.isDropping && e.dropTimer && e.dropTimer > 0.8);
  useEffect(() => {
    if (droppingJetRobots.length > 0) {
      playSound('jetDrop');
      playSound('jetSwoosh');
    }
  }, [droppingJetRobots.length, playSound]);

  // Play engine roar when jet robots finish dropping
  const landedJetRobots = gameState.enemies.filter(e => e.type === 'jetrobot' && e.isDropping && e.dropTimer && e.dropTimer < 0.3 && e.dropTimer > 0.1);
  useEffect(() => {
    if (landedJetRobots.length > 0) {
      playSound('jetEngine');
    }
  }, [landedJetRobots.length, playSound]);

  // Optimized gift trigger - immediate response
  const handleTriggerGift = useCallback((giftId: string) => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    triggerGift(giftId, `Player_${Math.floor(Math.random() * 999)}`);
  }, [gameState.phase, triggerGift, playSound]);

  // Powerup handlers - immediate action processing
  const handleUseAlly = useCallback(() => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    handleGift({
      id: `ally-${Date.now()}`,
      gift: { id: 'ally_powerup', name: 'Ally', tier: 'large', diamonds: 0, emoji: '🤖', action: 'summon_support' },
      username: 'Hero',
      timestamp: Date.now(),
      action: 'summon_support',
    } as any);
  }, [gameState.phase, playSound, handleGift]);

  const handleUseUlt = useCallback(() => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    handleGift({
      id: `ult-${Date.now()}`,
      gift: { id: 'ult_powerup', name: 'ULT', tier: 'large', diamonds: 0, emoji: '🚀', action: 'magic_dash' },
      username: 'Hero',
      timestamp: Date.now(),
      action: 'magic_dash',
    } as any);
  }, [gameState.phase, playSound, handleGift]);

  const handleUseTank = useCallback(() => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    handleGift({
      id: `tank-${Date.now()}`,
      gift: { id: 'tank_powerup', name: 'Tank', tier: 'large', diamonds: 0, emoji: '🔫', action: 'summon_tank' as any },
      username: 'Hero',
      timestamp: Date.now(),
      action: 'summon_tank' as any,
    } as any);
  }, [gameState.phase, playSound, handleGift]);

  return (
    <div 
      className="h-[100dvh] w-screen flex flex-col overflow-hidden touch-none select-none"
      style={{
        background: 'linear-gradient(180deg, #0a0a12 0%, #12081c 100%)',
        // TikTok Live optimized - smartphone vertical screen
        maxWidth: '100vw',
      }}
    >
      {/* TikTok Live-style Header - Positioned to avoid TikTok UI elements */}
      <header className="absolute top-14 left-2 right-2 z-30 flex items-center justify-between pointer-events-none">
        {/* Left side - Empty (game name removed) */}
        <div className="flex items-center pointer-events-auto" />

        {/* Right side - Audio only */}
        <div className="flex items-center gap-1 pointer-events-auto">
          <motion.button
            onClick={() => setAudioOn(!audioOn)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm touch-manipulation"
            style={{
              background: audioOn ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: audioOn ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.2)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            {audioOn ? '🔊' : '🔇'}
          </motion.button>
        </div>
      </header>

      {/* Main Game Content - TikTok Live 9:16 optimized - FULL WIDTH */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 px-0 pt-10 pb-0">
        {/* Game Arena - FULL WIDTH - fills entire screen width */}
        <div 
          className="flex-1 min-h-0 relative overflow-hidden w-full"
          style={{ 
            maxHeight: 'calc(100dvh - 100px)',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)', // Expand to full viewport width
            transform: 'scale(0.78)',
            transformOrigin: 'center top',
          }}
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
          
          {/* Wave Transition Screen */}
          <WaveTransition
            isVisible={gameState.phase === 'victory'}
            currentWave={gameState.currentWave}
            maxWaves={gameState.maxWaves}
            score={gameState.score}
            onNextWave={startNextWave}
          />
        </div>

        {/* Bottom HUD - TikTok Live green zone - compact gift panel with integrated health bar */}
        {gameState.phase === 'playing' && (
          <div 
            className="absolute bottom-16 left-0 right-0 z-20 px-2"
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom), 4px)',
            }}
          >
            <div className="w-full max-w-md mx-auto">
              <GiftPanel 
                onTriggerGift={handleTriggerGift}
                disabled={gameState.phase !== 'playing'}
                collectedAllyPowerups={gameState.collectedAllyPowerups || 0}
                collectedUltPowerups={gameState.collectedUltPowerups || 0}
                collectedTankPowerups={gameState.collectedTankPowerups || 0}
                onUseAlly={handleUseAlly}
                onUseUlt={handleUseUlt}
                onUseTank={handleUseTank}
                health={gameState.player.health}
                maxHealth={gameState.player.maxHealth}
                shield={gameState.player.shield}
                isMagicDashing={gameState.player.isMagicDashing}
                magicDashTimer={gameState.player.magicDashTimer}
                empCooldown={gameState.empCooldown}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;