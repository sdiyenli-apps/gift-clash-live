import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Projectile, GiftBlock, getBossName, GiftEvent, Bomb, SupportUnit } from '@/types/game';
import { BackgroundVideo } from './BackgroundVideo';
import { Hero } from './Hero';
import { EnemySprite } from './Enemy';
import { ProjectileSprite, EnemyLaserSprite, FireballSprite } from './Projectile';
import { Particles } from './Particles';
import { Princess } from './Princess';
import { BossHUD } from './BossHUD';
import { BossHealthBar } from './BossHealthBar';
import { MiniMap } from './MiniMap';
import { CyberpunkBuildings } from './CyberpunkBuildings';
import { FloorAssets } from './FloorAssets';
import { SupportUnitSprite } from './SupportUnit';
import { Portal } from './Portal';

interface NeonLaser {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  bounces: number;
  life: number;
}

interface EMPGrenade {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  timer: number;
}

interface ExtendedGameState extends GameState {
  fireballs?: { id: string; x: number; y: number; velocityX: number; velocityY: number; damage: number }[];
  redFlash?: number;
  enemyLasers?: Projectile[];
  magicFlash?: number;
  bossTaunt?: string | null;
  damageFlash?: number;
  shieldBlockFlash?: number;
  neonLasers?: NeonLaser[];
  empGrenades?: EMPGrenade[];
  bombs?: Bomb[];
  portalOpen?: boolean;
  portalX?: number;
  heroEnteringPortal?: boolean;
  bossTransformFlash?: number;
  supportUnits?: SupportUnit[];
  supportProjectiles?: Projectile[];
  performanceMode?: 'normal' | 'reduced' | 'minimal';
}

interface ArenaProps {
  gameState: ExtendedGameState;
  notifications?: GiftEvent[];
}

// Memoized components for performance
const MemoizedEnemySprite = memo(EnemySprite);
const MemoizedProjectileSprite = memo(ProjectileSprite);
const MemoizedEnemyLaserSprite = memo(EnemyLaserSprite);
const MemoizedFireballSprite = memo(FireballSprite);
const MemoizedSupportUnitSprite = memo(SupportUnitSprite);

export const Arena = memo(({ gameState, notifications = [] }: ArenaProps) => {
  const { 
    player, enemies, projectiles, particles, obstacles,
    cameraX, distance, levelLength, isUltraMode, speechBubble,
    combo, comboTimer, isFrozen, isBossFight, screenShake,
    flyingRobots, chickens, neonLights, explosions, giftBlocks = [],
    fireballs = [], redFlash = 0, enemyLasers = [],
    magicFlash = 0, bossTaunt = null, currentWave,
    damageFlash = 0, shieldBlockFlash = 0, neonLasers = [],
    empGrenades = [], bombs = [],
    portalOpen = false, portalX = 0, heroEnteringPortal = false,
    bossTransformFlash = 0,
    supportUnits = [], supportProjectiles = [],
    performanceMode = 'normal'
  } = gameState;
  
  // Memoize shake values
  const shakeX = useMemo(() => screenShake ? (Math.random() - 0.5) * screenShake * 6 : 0, [screenShake]);
  const shakeY = useMemo(() => screenShake ? (Math.random() - 0.5) * screenShake * 6 : 0, [screenShake]);
  
  // Memoize boss info
  const bossEnemy = useMemo(() => enemies.find(e => e.type === 'boss' && !e.isDying), [enemies]);
  
  // Limit rendered entities for performance
  const visibleEnemies = useMemo(() => 
    enemies.filter(e => e.x > cameraX - 100 && e.x < cameraX + 700).slice(0, 12),
    [enemies, cameraX]
  );
  
  const visibleProjectiles = useMemo(() => 
    projectiles.filter(p => p.x > cameraX - 50 && p.x < cameraX + 800).slice(0, 10),
    [projectiles, cameraX]
  );
  
  const visibleEnemyLasers = useMemo(() => 
    enemyLasers.filter(l => l.x > cameraX - 50 && l.x < cameraX + 800).slice(0, 8),
    [enemyLasers, cameraX]
  );
  
  const visibleFireballs = useMemo(() => 
    fireballs.filter(f => f.x > cameraX - 50 && f.x < cameraX + 800).slice(0, 6),
    [fireballs, cameraX]
  );
  
  const visibleBombs = useMemo(() => 
    bombs.filter(b => b.x > cameraX - 50 && b.x < cameraX + 700).slice(0, 4),
    [bombs, cameraX]
  );

  const reducedEffects = performanceMode !== 'normal';

  return (
    <div 
      className="w-full h-full rounded-lg overflow-hidden relative"
      style={{
        boxShadow: isBossFight 
          ? '0 0 15px rgba(255,0,0,0.4)' 
          : player.isMagicDashing 
            ? '0 0 12px rgba(255,0,255,0.3)' 
            : 'inset 0 0 15px rgba(0, 255, 255, 0.05)',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        background: '#0a0a15',
      }}
    >
      {/* Mini-map */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50">
        <MiniMap 
          player={player}
          enemies={visibleEnemies}
          levelLength={levelLength}
          princessX={levelLength - 100}
          cameraX={cameraX}
        />
      </div>
      
      {/* Boss HUD */}
      {bossEnemy && isBossFight && bossTaunt && (
        <BossHUD 
          bossHealth={bossEnemy.health}
          bossMaxHealth={bossEnemy.maxHealth}
          bossName={getBossName(currentWave || 1)}
          isVisible={true}
          bossTaunt={bossTaunt}
          bossPhase={bossEnemy.bossPhase}
        />
      )}
      
      {/* Boss health bar */}
      {bossEnemy && isBossFight && (
        <BossHealthBar boss={bossEnemy} cameraX={cameraX} />
      )}
      
      {/* Screen flashes - simplified */}
      {redFlash > 0 && !reducedEffects && (
        <div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{ background: `rgba(255,0,0,${Math.min(0.5, redFlash * 0.3)})` }}
        />
      )}
      
      {magicFlash > 0 && !reducedEffects && (
        <div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{ background: `rgba(255,0,255,${Math.min(0.4, magicFlash * 0.25)})` }}
        />
      )}
      
      {damageFlash > 0 && (
        <div
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, rgba(255,0,0,${Math.min(0.5, damageFlash * 0.3)}), rgba(255,0,0,${Math.min(0.6, damageFlash * 0.35)}))`,
          }}
        />
      )}
      
      {shieldBlockFlash > 0 && (
        <div
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, rgba(0,255,255,${Math.min(0.3, shieldBlockFlash * 0.2)}), rgba(0,150,255,${Math.min(0.35, shieldBlockFlash * 0.25)}))`,
          }}
        />
      )}
      
      {bossTransformFlash > 0 && !reducedEffects && (
        <motion.div
          className="absolute inset-0 z-60 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, rgba(255,255,255,${Math.min(0.7, bossTransformFlash * 0.4)}), rgba(255,0,255,${Math.min(0.4, bossTransformFlash * 0.25)}))`,
          }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      {/* Zone info - tiny */}
      <div className="absolute top-1 right-1 z-30 text-[7px] opacity-50">
        <span className="text-cyan-400">W{currentWave}</span>
      </div>
      
      <div 
        className="absolute inset-0"
        style={{ filter: player.isMagicDashing ? 'saturate(1.2)' : 'none' }}
      >
        {/* Background */}
        <CyberpunkBuildings cameraX={cameraX} />
        <BackgroundVideo 
          distance={distance}
          cameraX={cameraX}
          isUltraMode={isUltraMode}
          isBossFight={isBossFight}
          levelLength={levelLength}
        />
        
        {/* Player projectiles */}
        {visibleProjectiles.map(proj => (
          <MemoizedProjectileSprite key={proj.id} projectile={proj} cameraX={cameraX} />
        ))}
        
        {/* Enemy lasers */}
        {visibleEnemyLasers.map(laser => (
          <MemoizedEnemyLaserSprite key={laser.id} projectile={laser} cameraX={cameraX} />
        ))}
        
        {/* Fireballs */}
        {visibleFireballs.map(fireball => (
          <MemoizedFireballSprite key={fireball.id} fireball={fireball} cameraX={cameraX} />
        ))}
        
        {/* Neon lasers - limited */}
        {!reducedEffects && neonLasers.slice(0, 3).map(laser => {
          const screenX = laser.x - cameraX;
          const colors = ['#ff00ff', '#00ffff', '#ffff00'];
          const color = colors[Math.floor(Math.abs(laser.x) % colors.length)];
          return (
            <div
              key={laser.id}
              className="absolute pointer-events-none z-40"
              style={{
                left: screenX,
                bottom: laser.y,
                width: 16,
                height: 4,
                background: `linear-gradient(90deg, ${color}, white, ${color})`,
                boxShadow: `0 0 10px ${color}`,
                borderRadius: '50%',
                opacity: laser.life > 0.5 ? 1 : laser.life * 2,
              }}
            />
          );
        })}
        
        {/* EMP Grenades - limited */}
        {empGrenades.slice(0, 2).map(grenade => {
          const screenX = grenade.x - cameraX;
          const screenY = Math.min(400, Math.max(60, grenade.y - 80));
          const isAboutToExplode = grenade.timer < 0.5;
          
          return (
            <div
              key={grenade.id}
              className="absolute pointer-events-none z-40"
              style={{ left: screenX, bottom: screenY, width: 28, height: 28 }}
            >
              <div
                className="w-full h-full rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #222, #111)',
                  border: `2px solid ${isAboutToExplode ? '#ff0000' : '#00ffff'}`,
                  boxShadow: `0 0 ${isAboutToExplode ? 20 : 12}px ${isAboutToExplode ? '#ff0000' : '#00ffff'}`,
                  animation: 'spin 0.3s linear infinite',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-sm">⚡</div>
              </div>
            </div>
          );
        })}
        
        {/* Bombs - limited */}
        {visibleBombs.map(bomb => {
          const screenX = bomb.x - cameraX;
          return (
            <div
              key={bomb.id}
              className="absolute pointer-events-none z-35"
              style={{ left: screenX, bottom: bomb.y, width: 18, height: 22 }}
            >
              <div
                className="w-full h-full rounded-b-full rounded-t-lg"
                style={{
                  background: 'linear-gradient(135deg, #333, #111)',
                  border: '2px solid #ff6600',
                  boxShadow: '0 0 10px #ff6600',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs">💣</div>
              </div>
            </div>
          );
        })}
        
        {/* Game entities layer */}
        <div className="absolute inset-0 z-25">
          {/* Enemies */}
          {visibleEnemies.map(enemy => (
            <MemoizedEnemySprite key={enemy.id} enemy={enemy} cameraX={cameraX} />
          ))}
          
          {/* Support Units */}
          {supportUnits.slice(0, 4).map(unit => (
            <MemoizedSupportUnitSprite key={unit.id} unit={unit} cameraX={cameraX} />
          ))}
          
          {/* Hero */}
          <Hero player={player} cameraX={cameraX} isUltraMode={isUltraMode} speechBubble={speechBubble} />
        </div>
        
        {/* Support projectiles */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {(supportProjectiles || []).slice(0, 6).map(proj => {
            const screenX = proj.x - cameraX;
            const isMech = proj.type === 'ultra';
            
            if (screenX < -20 || screenX > 700) return null;

            return (
              <div
                key={proj.id}
                className="absolute"
                style={{
                  left: screenX,
                  bottom: 280 - proj.y - 4,
                  width: isMech ? 12 : 10,
                  height: isMech ? 6 : 5,
                  background: isMech 
                    ? 'linear-gradient(90deg, #fff, #ffaa00, #ff6600)'
                    : 'linear-gradient(90deg, #fff, #00ffaa, #00ff88)',
                  boxShadow: isMech
                    ? '0 0 8px #ff8800'
                    : '0 0 6px #00ff88',
                  borderRadius: '50%',
                }}
              />
            );
          })}
        </div>
        
        {/* Portal */}
        {portalOpen && (
          <Portal x={portalX} cameraX={cameraX} />
        )}
        
        {/* Floor */}
        <FloorAssets cameraX={cameraX} levelLength={levelLength} />
        
        {/* Particles - limited */}
        {!reducedEffects && particles.length > 0 && (
          <Particles particles={particles.slice(-15)} cameraX={cameraX} />
        )}
      </div>
    </div>
  );
});

Arena.displayName = 'Arena';
