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
  // Resize/move controls for arena
  const [arenaScale, setArenaScale] = useState(0.78);
  const [arenaOffsetY, setArenaOffsetY] = useState(0);
  // Resize/move controls for HUD
  const [hudScale, setHudScale] = useState(1);
  const [hudOffsetX, setHudOffsetX] = useState(8);
  const [hudOffsetY, setHudOffsetY] = useState(8);
  const [showControls, setShowControls] = useState(false);
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

        {/* Right side - Audio + Controls toggle */}
        <div className="flex items-center gap-1 pointer-events-auto">
          <motion.button
            onClick={() => setShowControls(!showControls)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm touch-manipulation"
            style={{
              background: showControls ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: showControls ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.2)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            ⚙️
          </motion.button>
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

      {/* Resize/Move Controls Panel */}
      {showControls && (
        <div 
          className="absolute top-24 right-2 z-40 p-3 rounded-xl pointer-events-auto"
          style={{
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          {/* Arena Controls */}
          <div className="text-cyan-400 text-xs font-bold mb-2">🎮 Arena</div>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] w-10">Size:</span>
              <input
                type="range"
                min="0.1"
                max="4.0"
                step="0.02"
                value={arenaScale}
                onChange={(e) => setArenaScale(parseFloat(e.target.value))}
                className="w-28 accent-cyan-400"
              />
              <span className="text-cyan-400 text-[10px] w-10">{Math.round(arenaScale * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] w-10">Y:</span>
              <input
                type="range"
                min="-600"
                max="1000"
                step="5"
                value={arenaOffsetY}
                onChange={(e) => setArenaOffsetY(parseFloat(e.target.value))}
                className="w-28 accent-cyan-400"
              />
              <span className="text-cyan-400 text-[10px] w-10">{arenaOffsetY}px</span>
            </div>
          </div>

          {/* HUD Controls */}
          <div className="text-yellow-400 text-xs font-bold mb-2">🎁 Gift HUD</div>
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] w-10">Size:</span>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.05"
                value={hudScale}
                onChange={(e) => setHudScale(parseFloat(e.target.value))}
                className="w-28 accent-yellow-400"
              />
              <span className="text-yellow-400 text-[10px] w-10">{Math.round(hudScale * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] w-10">X:</span>
              <input
                type="range"
                min="-200"
                max="600"
                step="2"
                value={hudOffsetX}
                onChange={(e) => setHudOffsetX(parseFloat(e.target.value))}
                className="w-28 accent-yellow-400"
              />
              <span className="text-yellow-400 text-[10px] w-10">{hudOffsetX}px</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] w-10">Y:</span>
              <input
                type="range"
                min="-100"
                max="800"
                step="2"
                value={hudOffsetY}
                onChange={(e) => setHudOffsetY(parseFloat(e.target.value))}
                className="w-28 accent-yellow-400"
              />
              <span className="text-yellow-400 text-[10px] w-10">{hudOffsetY}px</span>
            </div>
          </div>

          <motion.button
            onClick={() => { 
              setArenaScale(0.78); 
              setArenaOffsetY(0); 
              setHudScale(1); 
              setHudOffsetX(8); 
              setHudOffsetY(8); 
            }}
            className="text-[10px] text-gray-400 hover:text-white w-full text-center py-1 border border-gray-600 rounded"
            whileTap={{ scale: 0.95 }}
          >
            Reset All
          </motion.button>
        </div>
      )}


      <main className="flex-1 flex flex-col overflow-hidden min-h-0 px-0 pt-10 pb-0">
        {/* Game Arena - FULL WIDTH - fills entire screen width */}
        <div 
          className="flex-1 min-h-0 relative overflow-hidden w-full"
          style={{ 
            maxHeight: 'calc(100dvh - 100px)',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            transform: `scale(${arenaScale}) translateY(${arenaOffsetY}px)`,
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

        {/* Bottom HUD - ALWAYS visible for positioning, slightly dimmed when not playing */}
        <div 
          className="absolute z-20"
          style={{
            bottom: `${hudOffsetY}px`,
            left: `${hudOffsetX}px`,
            width: 'calc(85% - 16px)',
            maxWidth: '650px',
            transform: `scale(${hudScale})`,
            transformOrigin: 'bottom left',
            paddingBottom: 'max(env(safe-area-inset-bottom), 4px)',
            opacity: gameState.phase === 'playing' ? 1 : 0.7,
          }}
        >
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
          />
        </div>
      </main>
    </div>
  );
};

export default Index;