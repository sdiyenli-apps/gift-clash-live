import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useTikTokSimulator } from '@/hooks/useTikTokSimulator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Arena } from '@/components/game/Arena';
import { HealthBar } from '@/components/game/HealthBar';
import { GiftPanel } from '@/components/game/GiftPanel';
import { SkillQueue } from '@/components/game/SkillQueue';
// Gift notifications are now flying boxes in the Arena
import { GameOverlay } from '@/components/game/GameOverlay';
import { WaveTransition } from '@/components/game/WaveTransition';
import { GiftEvent } from '@/types/game';
import gameTheme from '@/assets/cpt-squirbert-theme.mp3';

const Index = () => {
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [recentGifts, setRecentGifts] = useState<GiftEvent[]>([]);
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

  const handleTriggerGift = useCallback((giftId: string) => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    const result = triggerGift(giftId, `Viewer_${Math.floor(Math.random() * 9999)}`);
    
    // Add to recent gifts queue (max 10)
    if (result) {
      setRecentGifts(prev => {
        const newGifts = [...prev, result].slice(-10);
        return newGifts;
      });
    }
  }, [gameState.phase, triggerGift, playSound]);

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
        {/* Left side - Compact Logo - Moved down to avoid TikTok profile area */}
        <div className="flex items-center pointer-events-auto">
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,0,255,0.3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <span className="text-xs">🔫</span>
            <span 
              className="font-black text-[9px]"
              style={{
                background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px',
              }}
            >
              RUN & GUN
            </span>
          </div>
        </div>

        {/* Right side - Score, Wave, Audio - Positioned to avoid TikTok follow button */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {gameState.phase === 'playing' && (
            <>
              <div 
                className="px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs"
                style={{
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,0,0.3)',
                  color: '#ffff00',
                }}
              >
                ⭐{gameState.score.toLocaleString()}
              </div>
              <div 
                className="px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs"
                style={{
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,255,255,0.3)',
                  color: '#00ffff',
                }}
              >
                W{gameState.currentWave}
              </div>
              {gameState.player.isMagicDashing && (
                <motion.div
                  className="px-2 py-0.5 rounded-full font-bold text-[10px]"
                  style={{
                    background: 'rgba(255,0,255,0.3)',
                    border: '1px solid rgba(255,0,255,0.5)',
                    color: '#ff66ff',
                  }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                >
                  ✨{gameState.player.magicDashTimer.toFixed(0)}
                </motion.div>
              )}
            </>
          )}
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

      {/* Main Game Content - TikTok Live 9:16 optimized with space for TikTok UI */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 px-0 pt-12 pb-0">
        {/* Game Arena - Smartphone-sized with smaller characters for wider FOV */}
        <div 
          className="flex-1 min-h-0 relative overflow-hidden mx-auto w-full"
          style={{ 
            maxHeight: 'calc(100dvh - 160px)', // Leave space for TikTok bottom UI
            maxWidth: '580px', // Smartphone width constraint
            // Smaller scale = smaller characters = wider FOV camera effect
            transform: 'scale(0.72)',
            transformOrigin: 'center top',
          }}
        >
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

        {/* Bottom HUD - TikTok Live-style controls positioned compactly above comment section */}
        {gameState.phase === 'playing' && (
          <div 
            className="absolute bottom-24 left-0 right-0 z-20 px-2 space-y-1"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 80%, transparent 100%)',
              paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
            }}
          >
            {/* Skill Queue Display - Shows recent gifts (max 10) */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-[8px] font-bold text-cyan-400 opacity-70">SKILLS:</span>
              <SkillQueue recentGifts={recentGifts} maxItems={10} />
            </div>
            
            {/* Compact Health bar - Full width TikTok style */}
            <div 
              className="px-2 py-1.5 rounded-xl mx-auto w-full max-w-sm"
              style={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,0,255,0.25)',
                boxShadow: '0 0 10px rgba(255,0,255,0.15)',
              }}
            >
              <HealthBar 
                health={gameState.player.health}
                maxHealth={gameState.player.maxHealth}
                shield={gameState.player.shield}
              />
            </div>
            
            {/* Compact Gift buttons - TikTok large touch targets */}
            <div className="w-full max-w-sm mx-auto">
              <GiftPanel 
                onTriggerGift={handleTriggerGift}
                disabled={gameState.phase !== 'playing'}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;