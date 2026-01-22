import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  const { gameState, giftEvents, notifications, startGame, startNextWave, handleGift } = useGameState();
  const { playSound } = useSoundEffects();
  
  const { triggerGift } = useTikTokSimulator(
    autoSimulate && gameState.phase === 'playing',
    handleGift,
    'medium'
  );

  // Memoize performance mode class
  const performanceClass = useMemo(() => {
    const mode = (gameState as any).performanceMode || 'normal';
    return mode === 'minimal' ? 'reduce-motion' : '';
  }, [(gameState as any).performanceMode]);

  // Handle audio toggle
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(gameTheme);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
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

  // Play sound effects (throttled)
  const lastSoundRef = useRef<Record<string, number>>({});
  const throttledPlaySound = useCallback((sound: string, minInterval = 100) => {
    const now = Date.now();
    if (now - (lastSoundRef.current[sound] || 0) > minInterval) {
      playSound(sound);
      lastSoundRef.current[sound] = now;
    }
  }, [playSound]);

  useEffect(() => {
    if (gameState.player.isShooting) {
      throttledPlaySound(gameState.player.isMagicDashing ? 'shootUltra' : 'shoot', 80);
    }
  }, [gameState.player.isShooting, gameState.player.isMagicDashing, throttledPlaySound]);

  useEffect(() => {
    if (gameState.player.animationState === 'hurt') {
      throttledPlaySound('hurt', 200);
    }
  }, [gameState.player.animationState, throttledPlaySound]);

  const handleTriggerGift = useCallback((giftId: string) => {
    if (gameState.phase !== 'playing') return;
    throttledPlaySound('gift', 50);
    triggerGift(giftId, `Viewer_${Math.floor(Math.random() * 9999)}`);
  }, [gameState.phase, triggerGift, throttledPlaySound]);

  return (
    <div 
      className={`h-[100dvh] w-screen flex flex-col overflow-hidden touch-none select-none ${performanceClass}`}
      style={{
        background: 'linear-gradient(180deg, #0a0a12 0%, #12081c 100%)',
        maxWidth: '100vw',
      }}
    >
      {/* TikTok Live Header - Compact and out of the way */}
      <header className="absolute top-12 left-2 right-2 z-30 flex items-center justify-between pointer-events-none">
        {/* Logo */}
        <div className="flex items-center pointer-events-auto">
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,0,255,0.3)',
            }}
          >
            <span className="text-xs">🔫</span>
            <span 
              className="font-black text-[9px]"
              style={{
                background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              RUN & GUN
            </span>
          </div>
        </div>

        {/* Score/Wave/Audio */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {gameState.phase === 'playing' && (
            <>
              <div 
                className="px-2 py-0.5 rounded-full font-bold text-[10px]"
                style={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,0,0.3)',
                  color: '#ffff00',
                }}
              >
                ⭐{gameState.score.toLocaleString()}
              </div>
              <div 
                className="px-2 py-0.5 rounded-full font-bold text-[10px]"
                style={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(0,255,255,0.3)',
                  color: '#00ffff',
                }}
              >
                W{gameState.currentWave}
              </div>
              {gameState.combo > 2 && (
                <motion.div
                  className="px-2 py-0.5 rounded-full font-bold text-[10px]"
                  style={{
                    background: 'rgba(255,100,0,0.3)',
                    border: '1px solid rgba(255,100,0,0.5)',
                    color: '#ff8800',
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  🔥{gameState.combo}x
                </motion.div>
              )}
              {gameState.player.isMagicDashing && (
                <motion.div
                  className="px-2 py-0.5 rounded-full font-bold text-[9px]"
                  style={{
                    background: 'rgba(255,0,255,0.3)',
                    border: '1px solid rgba(255,0,255,0.5)',
                    color: '#ff66ff',
                  }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.15, repeat: Infinity }}
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
              border: audioOn ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.2)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            {audioOn ? '🔊' : '🔇'}
          </motion.button>
        </div>
      </header>

      {/* Main Game Content - TikTok 9:16 optimized */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 px-0 pt-10 pb-0">
        {/* Game Arena - Wider FOV with smaller characters */}
        <div 
          className="flex-1 min-h-0 relative overflow-hidden mx-auto w-full"
          style={{ 
            maxHeight: 'calc(100dvh - 150px)',
            maxWidth: '600px',
            transform: 'scale(0.7)',
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
          
          <WaveTransition
            isVisible={gameState.phase === 'victory'}
            currentWave={gameState.currentWave}
            maxWaves={gameState.maxWaves}
            score={gameState.score}
            onNextWave={startNextWave}
          />
        </div>

        {/* Bottom HUD - Compact, above TikTok comments */}
        {gameState.phase === 'playing' && (
          <div 
            className="absolute bottom-20 left-0 right-0 z-20 px-2 space-y-1"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)',
              paddingBottom: 'max(env(safe-area-inset-bottom), 6px)',
            }}
          >
            {/* Health bar - compact */}
            <div 
              className="px-2 py-1 rounded-lg mx-auto w-full max-w-sm"
              style={{
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(255,0,255,0.2)',
              }}
            >
              <HealthBar 
                health={gameState.player.health}
                maxHealth={gameState.player.maxHealth}
                shield={gameState.player.shield}
              />
              
              {/* Cooldown indicators */}
              <div className="flex justify-center gap-3 mt-1 text-[8px]">
                <span style={{ color: (gameState as any).empCharges > 0 ? '#00ffff' : '#666' }}>
                  ⚡EMP: {(gameState as any).empCharges || 0}/2
                </span>
                <span style={{ color: (gameState as any).allyCharges > 0 ? '#00ff88' : '#666' }}>
                  🤖ALLY: {(gameState as any).allyCharges || 0}/2
                </span>
              </div>
            </div>
            
            {/* Gift buttons */}
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
