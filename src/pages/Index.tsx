import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useTikTokSimulator } from '@/hooks/useTikTokSimulator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { Arena } from '@/components/game/Arena';
import { GiftPanel } from '@/components/game/GiftPanel';
import { GameOverlay } from '@/components/game/GameOverlay';
import { WaveTransition } from '@/components/game/WaveTransition';
import { AdminPanel } from '@/components/game/AdminPanel';
import gameTheme from '@/assets/cpt-squirbert-theme.mp3';

const Index = () => {
  // ALL HOOKS FIRST - Never place computed values between hooks
  const [autoSimulate] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Layout settings with localStorage persistence
  const {
    arenaScale, setArenaScale,
    arenaOffsetX, setArenaOffsetX,
    arenaOffsetY, setArenaOffsetY,
    hudScale, setHudScale,
    hudOffsetX, setHudOffsetX,
    hudOffsetY, setHudOffsetY,
    resetSettings,
  } = useLayoutSettings();
  
  // Drag state refs for smooth dragging
  const arenaDragRef = useRef({ startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 });
  const hudDragRef = useRef({ startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 });
  const [isDraggingArena, setIsDraggingArena] = useState(false);
  const [isDraggingHud, setIsDraggingHud] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { gameState, startGame, startNextWave, handleGift, triggerSummon } = useGameState();
  const { playSound } = useSoundEffects();
  
  const { triggerGift } = useTikTokSimulator(
    autoSimulate && gameState.phase === 'playing',
    handleGift,
    'medium'
  );

  // Memoize computed values to avoid recalculating every render
  const droppingJetRobots = useMemo(() => 
    gameState.enemies?.filter(e => e.type === 'jetrobot' && e.isDropping && e.dropTimer && e.dropTimer > 0.8) || [],
    [gameState.enemies]
  );
  
  const landedJetRobots = useMemo(() =>
    gameState.enemies?.filter(e => e.type === 'jetrobot' && e.isDropping && e.dropTimer && e.dropTimer < 0.3 && e.dropTimer > 0.1) || [],
    [gameState.enemies]
  );

  // ALL useCallbacks together
  const handleTriggerGift = useCallback((giftId: string) => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    triggerGift(giftId, `Player_${Math.floor(Math.random() * 999)}`);
  }, [gameState.phase, triggerGift, playSound]);

  const handleSummonAlly = useCallback(() => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    triggerSummon('ally');
  }, [gameState.phase, playSound, triggerSummon]);

  const handleSummonUlt = useCallback(() => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    triggerSummon('ult');
  }, [gameState.phase, playSound, triggerSummon]);

  const handleSummonTank = useCallback(() => {
    if (gameState.phase !== 'playing') return;
    playSound('gift');
    triggerSummon('tank');
  }, [gameState.phase, playSound, triggerSummon]);

  // Drag handlers for Arena
  const handleArenaDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!editMode) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    arenaDragRef.current = {
      startX: clientX,
      startY: clientY,
      startOffsetX: arenaOffsetX,
      startOffsetY: arenaOffsetY,
    };
    setIsDraggingArena(true);
  }, [editMode, arenaOffsetX, arenaOffsetY]);

  const handleArenaDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingArena) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - arenaDragRef.current.startX;
    const deltaY = clientY - arenaDragRef.current.startY;
    setArenaOffsetX(arenaDragRef.current.startOffsetX + deltaX);
    setArenaOffsetY(arenaDragRef.current.startOffsetY + deltaY);
  }, [isDraggingArena, setArenaOffsetX, setArenaOffsetY]);

  const handleArenaDragEnd = useCallback(() => {
    setIsDraggingArena(false);
  }, []);

  // Drag handlers for HUD
  const handleHudDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    hudDragRef.current = {
      startX: clientX,
      startY: clientY,
      startOffsetX: hudOffsetX,
      startOffsetY: hudOffsetY,
    };
    setIsDraggingHud(true);
  }, [editMode, hudOffsetX, hudOffsetY]);

  const handleHudDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingHud) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - hudDragRef.current.startX;
    const deltaY = -(clientY - hudDragRef.current.startY); // Invert Y since bottom-based
    setHudOffsetX(hudDragRef.current.startOffsetX + deltaX);
    setHudOffsetY(hudDragRef.current.startOffsetY + deltaY);
  }, [isDraggingHud, setHudOffsetX, setHudOffsetY]);

  const handleHudDragEnd = useCallback(() => {
    setIsDraggingHud(false);
  }, []);

  // ALL useEffects together
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

  // Global drag event listeners
  useEffect(() => {
    if (isDraggingArena) {
      window.addEventListener('mousemove', handleArenaDrag);
      window.addEventListener('mouseup', handleArenaDragEnd);
      window.addEventListener('touchmove', handleArenaDrag);
      window.addEventListener('touchend', handleArenaDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleArenaDrag);
        window.removeEventListener('mouseup', handleArenaDragEnd);
        window.removeEventListener('touchmove', handleArenaDrag);
        window.removeEventListener('touchend', handleArenaDragEnd);
      };
    }
  }, [isDraggingArena, handleArenaDrag, handleArenaDragEnd]);

  useEffect(() => {
    if (isDraggingHud) {
      window.addEventListener('mousemove', handleHudDrag);
      window.addEventListener('mouseup', handleHudDragEnd);
      window.addEventListener('touchmove', handleHudDrag);
      window.addEventListener('touchend', handleHudDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleHudDrag);
        window.removeEventListener('mouseup', handleHudDragEnd);
        window.removeEventListener('touchmove', handleHudDrag);
        window.removeEventListener('touchend', handleHudDragEnd);
      };
    }
  }, [isDraggingHud, handleHudDrag, handleHudDragEnd]);

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

  useEffect(() => {
    if (gameState.lastBossAttack) {
      switch (gameState.lastBossAttack) {
        case 'laser_sweep': playSound('laserSweep'); break;
        case 'missile_barrage': playSound('missileWarning'); break;
        case 'ground_pound': playSound('groundPound'); break;
        case 'screen_attack': playSound('screenAttack'); break;
        case 'shield': playSound('shieldBlock'); break;
      }
    }
  }, [gameState.lastBossAttack, playSound]);

  useEffect(() => {
    if (gameState.enemyLasers?.length > 0) {
      const hasDroneLaser = gameState.enemyLasers.some(l => l.damage === 8);
      playSound(hasDroneLaser ? 'droneShoot' : 'enemyShoot');
    }
  }, [gameState.enemyLasers?.length, playSound]);

  useEffect(() => {
    if (gameState.shieldBlockFlash && gameState.shieldBlockFlash > 0) {
      playSound('shieldBlock');
    }
  }, [gameState.shieldBlockFlash, playSound]);

  useEffect(() => {
    if (droppingJetRobots.length > 0) {
      playSound('jetDrop');
      playSound('jetSwoosh');
    }
  }, [droppingJetRobots.length, playSound]);

  useEffect(() => {
    if (landedJetRobots.length > 0) {
      playSound('jetEngine');
    }
  }, [landedJetRobots.length, playSound]);


  return (
    <div 
      className="h-[100dvh] w-screen flex flex-col overflow-hidden touch-none select-none"
      style={{
        background: 'linear-gradient(180deg, #0a0a12 0%, #12081c 100%)',
        maxWidth: '100vw',
      }}
    >
      {/* Admin Panel - Right side organized buttons */}
      <AdminPanel
        showControls={showControls}
        setShowControls={setShowControls}
        audioOn={audioOn}
        setAudioOn={setAudioOn}
        editMode={editMode}
        setEditMode={setEditMode}
        arenaScale={arenaScale}
        setArenaScale={setArenaScale}
        arenaOffsetX={arenaOffsetX}
        setArenaOffsetX={setArenaOffsetX}
        arenaOffsetY={arenaOffsetY}
        setArenaOffsetY={setArenaOffsetY}
        hudScale={hudScale}
        setHudScale={setHudScale}
        hudOffsetX={hudOffsetX}
        setHudOffsetX={setHudOffsetX}
        hudOffsetY={hudOffsetY}
        setHudOffsetY={setHudOffsetY}
        resetSettings={resetSettings}
      />

      <main className="flex-1 flex flex-col overflow-hidden min-h-0 px-0 pt-10 pb-0">
        {/* Game Arena - Draggable in edit mode */}
        <div 
          className={`flex-1 min-h-0 relative overflow-hidden w-full ${editMode ? 'cursor-grab' : ''} ${isDraggingArena ? 'cursor-grabbing' : ''}`}
          style={{ 
            maxHeight: 'calc(100dvh - 100px)',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            transform: `scale(${arenaScale}) translate(${arenaOffsetX}px, ${arenaOffsetY}px)`,
            transformOrigin: 'center top',
            outline: editMode ? '3px dashed rgba(0,255,255,0.5)' : 'none',
          }}
          onMouseDown={handleArenaDragStart}
          onTouchStart={handleArenaDragStart}
        >
          {/* Edit mode overlay label */}
          {editMode && (
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-lg text-xs font-bold pointer-events-none"
              style={{
                background: 'rgba(0,255,255,0.9)',
                color: '#000',
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🎮 ARENA - Drag to move
            </motion.div>
          )}
          
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

        {/* Bottom HUD - Draggable in edit mode */}
        <div 
          className={`absolute z-20 ${editMode ? 'cursor-grab' : ''} ${isDraggingHud ? 'cursor-grabbing' : ''}`}
          style={{
            bottom: `${hudOffsetY}px`,
            left: `${hudOffsetX}px`,
            width: 'calc(85% - 16px)',
            maxWidth: '650px',
            transform: `scale(${hudScale})`,
            transformOrigin: 'bottom left',
            paddingBottom: 'max(env(safe-area-inset-bottom), 4px)',
            opacity: gameState.phase === 'playing' ? 1 : 0.7,
            outline: editMode ? '3px dashed rgba(255,200,0,0.6)' : 'none',
          }}
          onMouseDown={handleHudDragStart}
          onTouchStart={handleHudDragStart}
        >
          {/* Edit mode overlay label */}
          {editMode && (
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-lg text-xs font-bold pointer-events-none"
              style={{
                background: 'rgba(255,200,0,0.9)',
                color: '#000',
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🎁 HUD - Drag to move
            </motion.div>
          )}
          
          <GiftPanel 
            onTriggerGift={handleTriggerGift}
            disabled={gameState.phase !== 'playing'}
            onSummonAlly={handleSummonAlly}
            onSummonUlt={handleSummonUlt}
            onSummonTank={handleSummonTank}
            allyCooldown={gameState.allyCooldown || 0}
            ultCooldown={gameState.ultCooldown || 0}
            tankCooldown={gameState.tankCooldown || 0}
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