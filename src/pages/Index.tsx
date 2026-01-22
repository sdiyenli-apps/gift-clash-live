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
      {/* TikTok Safe Zone Header - Minimal, top-right corner */}
      <header className="absolute top-12 right-2 z-40 flex items-center gap-1 pointer-events-auto">
        {gameState.phase === 'playing' && (
          <>
            {/* Score - compact gold */}
            <div 
              className="px-2 py-0.5 rounded font-black text-[10px]"
              style={{
                background: 'rgba(0,0,0,0.95)',
                border: '1px solid #FFD700',
                color: '#FFD700',
                textShadow: '0 0 4px #FFD700',
              }}
            >
              ⭐{gameState.score.toLocaleString()}
            </div>
            {/* Wave */}
            <div 
              className="px-1.5 py-0.5 rounded font-bold text-[9px]"
              style={{
                background: 'rgba(0,0,0,0.95)',
                border: '1px solid #00ffff',
                color: '#00ffff',
              }}
            >
              W{gameState.currentWave}
            </div>
            {/* Combo - only show when active */}
            {gameState.combo > 2 && (
              <motion.div
                className="px-1.5 py-0.5 rounded font-black text-[9px]"
                style={{
                  background: 'rgba(255,68,0,0.3)',
                  border: '1px solid #FF4400',
                  color: '#FF8800',
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              >
                🔥{gameState.combo}x
              </motion.div>
            )}
          </>
        )}
        {/* Audio toggle */}
        <motion.button
          onClick={() => setAudioOn(!audioOn)}
          className="w-6 h-6 rounded flex items-center justify-center text-xs touch-manipulation"
          style={{
            background: audioOn ? 'rgba(0,255,255,0.2)' : 'rgba(0,0,0,0.8)',
            border: audioOn ? '1px solid #00ffff' : '1px solid #444',
          }}
          whileTap={{ scale: 0.9 }}
        >
          {audioOn ? '🔊' : '🔇'}
        </motion.button>
      </header>

      {/* Magic Dash Timer - center top when active */}
      {gameState.phase === 'playing' && gameState.player.isMagicDashing && (
        <motion.div
          className="absolute top-12 left-2 z-40 px-2 py-1 rounded font-black text-xs"
          style={{
            background: 'linear-gradient(90deg, rgba(255,0,255,0.4), rgba(0,255,255,0.4))',
            border: '2px solid #ff00ff',
            color: '#fff',
            textShadow: '0 0 8px #ff00ff',
          }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 0.15, repeat: Infinity }}
        >
          ✨ ULTRA: {gameState.player.magicDashTimer.toFixed(1)}s
        </motion.div>
      )}

      {/* Main Game Arena - Maximum visibility */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 pt-8 pb-0">
        {/* Game Arena - Wider FOV, centered */}
        <div 
          className="flex-1 min-h-0 relative overflow-hidden mx-auto w-full"
          style={{ 
            maxHeight: 'calc(100dvh - 140px)',
            maxWidth: '580px',
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
          
          <WaveTransition
            isVisible={gameState.phase === 'victory'}
            currentWave={gameState.currentWave}
            maxWaves={gameState.maxWaves}
            score={gameState.score}
            onNextWave={startNextWave}
          />
        </div>

        {/* Bottom HUD - Compact, TikTok safe zone */}
        {gameState.phase === 'playing' && (
          <div 
            className="absolute bottom-24 left-0 right-0 z-30 px-2"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 80%, transparent 100%)',
              paddingBottom: 'max(env(safe-area-inset-bottom), 4px)',
            }}
          >
            {/* Health + Charges Row */}
            <div 
              className="px-2 py-1.5 rounded-lg mx-auto w-full max-w-md flex items-center gap-2"
              style={{
                background: 'rgba(10,10,20,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {/* Health Bar - takes most space */}
              <div className="flex-1">
                <HealthBar 
                  health={gameState.player.health}
                  maxHealth={gameState.player.maxHealth}
                  shield={gameState.player.shield}
                />
              </div>
              
              {/* Charges - compact pills */}
              <div className="flex gap-1">
                <div 
                  className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                  style={{ 
                    background: (gameState as any).empCharges > 0 ? 'rgba(0,255,255,0.2)' : 'rgba(50,50,50,0.5)',
                    border: `1px solid ${(gameState as any).empCharges > 0 ? '#00ffff' : '#333'}`,
                    color: (gameState as any).empCharges > 0 ? '#00ffff' : '#666',
                  }}
                >
                  ⚡{(gameState as any).empCharges || 0}
                </div>
                <div 
                  className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                  style={{ 
                    background: (gameState as any).allyCharges > 0 ? 'rgba(0,255,136,0.2)' : 'rgba(50,50,50,0.5)',
                    border: `1px solid ${(gameState as any).allyCharges > 0 ? '#00ff88' : '#333'}`,
                    color: (gameState as any).allyCharges > 0 ? '#00ff88' : '#666',
                  }}
                >
                  🤖{(gameState as any).allyCharges || 0}
                </div>
              </div>
            </div>
            
            {/* Gift buttons - below health */}
            <div className="w-full max-w-md mx-auto mt-1">
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
