import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Projectile, getBossName, Bomb, SupportUnit } from '@/types/game';
import { ParallaxBackground } from './ParallaxBackground';
import { Hero } from './Hero';
import { EnemySprite } from './Enemy';
import { ProjectileSprite, EnemyLaserSprite, FireballSprite } from './Projectile';
import { MetalSlugProjectile } from './MetalSlugProjectile';
import { OptimizedParticles } from './OptimizedParticles';
import { ChaosElements } from './ChaosElements';
import { Princess } from './Princess';
import { BossHUD } from './BossHUD';
import { MiniMap } from './MiniMap';
import { SupportUnitSprite } from './SupportUnit';
import { Portal } from './Portal';
import { DronePaths } from './DronePath';
import { EnemiesWaitingIndicator } from './EnemiesWaitingIndicator';
import { GiftComboIndicator } from './GiftComboIndicator';
import { EnemyDeathVFX } from './EnemyDeathVFX';
import { HeroAttackEffect } from './HeroAttackEffect';
import { KillStreakAnnouncer } from './KillStreakAnnouncer';
import { BossAttackVFX, BombExplosionVFX } from './BossAttackVFX';
import { BossLaserSweepVFX } from './BossLaserSweepVFX';
import { MultiplierVFX } from './MultiplierVFX';
import { EnemyMuzzleFlash, AttackWarning } from './EnemyAttackVFX';
import { DroneFireFlash, DroneFireProjectile, DroneAttackWarning } from './DroneAttackVFX';
import { DamageNumbers, DamageNumber } from './DamageNumbers';
import { ThunderController } from './ThunderStrike';
import { BossNeonLaser, EnemyLaserAttack } from './BossNeonLaser';
import { RayCannonVFX } from './RayCannonVFX';
import { CinematicEffects } from './CinematicEffects';
import { GrenadeExplosionVFX } from './GrenadeExplosionVFX';
import { UltBackgroundEffect } from './UltBackgroundEffect';

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
  armorTimer?: number;
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
  evasionPopup?: { x: number; y: number; timer: number; target: 'hero' | 'enemy' | 'ally' } | null;
  firstGiftSent?: boolean;
  giftCombo?: number;
  giftComboTimer?: number;
  giftDamageMultiplier?: number;
  lastBossAttack?: 'fireball' | 'laser_sweep' | 'missile_barrage' | 'ground_pound' | 'screen_attack' | 'shield' | 'jump_bomb' | 'neon_laser' | null;
  lastBossAttackTime?: number;
  damageNumbers?: DamageNumber[];
  bossLaserActive?: boolean;
  bossLaserTimer?: number;
  enemyLaserAttacks?: { enemyId: string; timer: number }[];
  rayCannonActive?: boolean;
  rayCannonTimer?: number;
  grenadeExplosions?: { id: string; x: number; y: number; timer: number }[];
}

interface ArenaProps {
  gameState: ExtendedGameState;
}

export const Arena = ({ gameState }: ArenaProps) => {
  const { 
    player, enemies, projectiles, particles,
    cameraX, distance, levelLength, isUltraMode, speechBubble,
    combo, comboTimer, isFrozen, isBossFight, screenShake,
    neonLights, explosions, killStreak = 0,
    fireballs = [], redFlash = 0, enemyLasers = [],
    magicFlash = 0, bossTaunt = null, currentWave,
    damageFlash = 0, shieldBlockFlash = 0, neonLasers = [],
    empGrenades = [], bombs = [],
    portalOpen = false, portalX = 0, heroEnteringPortal = false,
    bossTransformFlash = 0,
    supportUnits = [], supportProjectiles = [],
    evasionPopup = null,
    firstGiftSent = false,
    giftCombo = 0,
    giftComboTimer = 0,
    giftDamageMultiplier = 1,
    lastBossAttack = null,
    lastBossAttackTime = 0,
    damageNumbers = [],
    bossLaserActive = false,
    bossLaserTimer = 0,
    enemyLaserAttacks = [],
    grenadeExplosions = [],
  } = gameState as ExtendedGameState & { evasionPopup?: { x: number; y: number; timer: number; target: string } | null };
  
  const prevMultiplierRef = useRef(giftDamageMultiplier);
  const [previousMultiplier, setPreviousMultiplier] = useState(1);
  
  useEffect(() => {
    if (giftDamageMultiplier !== prevMultiplierRef.current) {
      setPreviousMultiplier(prevMultiplierRef.current);
      prevMultiplierRef.current = giftDamageMultiplier;
    }
  }, [giftDamageMultiplier]);
  
  const activeEnemyCount = enemies.filter(e => !e.isDying && !e.isSpawning).length;
  
  const shakeX = screenShake ? (Math.random() - 0.5) * screenShake * 8 : 0;
  const shakeY = screenShake ? (Math.random() - 0.5) * screenShake * 8 : 0;
  
  const isTankActive = supportUnits.some(u => u.type === 'tank' && !u.isSelfDestructing && u.health > 0);
  
  const bossEnemy = enemies.find(e => e.type === 'boss' && !e.isDying);
  
  const bossAttackVFXType = lastBossAttack === 'laser_sweep' ? 'laser' 
    : lastBossAttack === 'missile_barrage' ? 'missile'
    : lastBossAttack as 'fireball' | 'ground_pound' | 'screen_attack' | null;

  // PERFORMANCE: Memoize visible projectiles
  const visibleProjectiles = useMemo(() => 
    projectiles.filter(proj => {
      const screenX = proj.x - cameraX;
      return screenX > -30 && screenX < 700;
    }), [projectiles, cameraX]);

  const visibleEnemyLasers = useMemo(() =>
    enemyLasers.filter(laser => {
      const screenX = laser.x - cameraX;
      return screenX > -30 && screenX < 700;
    }), [enemyLasers, cameraX]);

  const visibleFireballs = useMemo(() =>
    fireballs.filter(fb => {
      const screenX = fb.x - cameraX;
      return screenX > -50 && screenX < 750;
    }), [fireballs, cameraX]);

  const visibleBombs = useMemo(() =>
    bombs.filter(b => {
      const screenX = b.x - cameraX;
      return screenX > -50 && screenX < 800;
    }), [bombs, cameraX]);

  // PERFORMANCE: Memoize enemy sub-lists
  const dyingEnemies = useMemo(() => enemies.filter(e => e.isDying), [enemies]);
  const attackingEnemies = useMemo(() => enemies.filter(e => !e.isDying && e.attackCooldown > 0 && e.attackCooldown <= 0.3), [enemies]);
  const droneAttacking = useMemo(() => enemies.filter(e => !e.isDying && (e.type === 'drone' || e.type === 'flyer') && e.attackCooldown > 0 && e.attackCooldown <= 0.25), [enemies]);
  
  return (
    <div 
      className="w-full h-full overflow-hidden relative"
      style={{
        boxShadow: isBossFight 
          ? '0 0 20px rgba(255,0,0,0.5), inset 0 0 50px rgba(0,0,0,0.8)' 
          : 'inset 0 0 60px rgba(0,0,0,0.6)',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        background: '#050508',
        borderRadius: 0,
      }}
    >
      {/* FULLSCREEN ULT BACKGROUND EFFECT */}
      <UltBackgroundEffect isActive={player.isMagicDashing} />
      
      {/* SIMPLIFIED FOG - single layer, no animation */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 100%, rgba(20,25,40,0.6) 0%, transparent 60%),
            linear-gradient(180deg, rgba(10,15,25,0.3) 0%, transparent 30%, rgba(10,15,25,0.4) 100%)
          `,
        }}
      />

      {/* Mini-map */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50">
        <MiniMap 
          player={player}
          enemies={enemies}
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
      
      {/* Boss Attack VFX */}
      {bossEnemy && isBossFight && bossAttackVFXType && (
        <BossAttackVFX
          attackType={bossAttackVFXType}
          bossX={bossEnemy.x + bossEnemy.width / 2}
          bossY={bossEnemy.y + bossEnemy.height / 2}
          cameraX={cameraX}
        />
      )}
      
      {bossEnemy && isBossFight && lastBossAttack === 'laser_sweep' && (
        <BossLaserSweepVFX isActive={true} side="both" />
      )}
      
      {bossEnemy && isBossFight && (lastBossAttack === 'neon_laser' || bossLaserActive) && (
        <BossNeonLaser
          isActive={true}
          bossX={bossEnemy.x + bossEnemy.width / 2}
          bossY={bossEnemy.y + bossEnemy.height / 2}
          heroX={player.x + 16}
          heroY={player.y + 24}
          cameraX={cameraX}
          duration={3}
        />
      )}
      
      <ThunderController isBossFight={isBossFight} />
      
      <DamageNumbers damageNumbers={damageNumbers} cameraX={cameraX} />

      {/* Bomb explosion VFX - only near-explosion bombs */}
      {visibleBombs.filter(b => b.timer <= 0.3).map(bomb => (
        <BombExplosionVFX
          key={`bomb-vfx-${bomb.id}`}
          x={bomb.x}
          y={bomb.y}
          cameraX={cameraX}
          size="medium"
        />
      ))}
      
      {/* Red flash */}
      {redFlash > 0 && (
        <div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{ background: 'rgba(255,0,0,0.7)', opacity: redFlash > 1 ? 1 : redFlash }}
        />
      )}
      
      {/* Magic flash */}
      {magicFlash > 0 && (
        <div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{ background: 'rgba(255,0,255,0.5)', opacity: magicFlash }}
        />
      )}
      
      {/* Shield block flash */}
      {shieldBlockFlash > 0 && (
        <div
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, rgba(0,255,255,0.4), rgba(0,150,255,0.5))',
            opacity: shieldBlockFlash,
          }}
        />
      )}
      
      {/* Boss transformation flash */}
      {bossTransformFlash > 0 && (
        <div
          className="absolute inset-0 z-60 pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,0,255,0.6), rgba(255,0,0,0.4))',
            opacity: bossTransformFlash,
          }}
        />
      )}
      
      {/* Evasion popup */}
      {evasionPopup && evasionPopup.timer > 0 && (
        <div
          className="absolute z-60 pointer-events-none font-black text-lg"
          style={{
            left: 150,
            bottom: 200,
            color: '#00ff00',
            textShadow: '0 0 10px #00ff00, 2px 2px 0 #000',
            animation: 'float 1s ease-out forwards',
          }}
        >
          ⚡ EVADED! ⚡
        </div>
      )}
      
      {/* Wave info */}
      <div className="absolute top-1 right-1 z-30 text-[8px] opacity-60">
        <span className="text-cyan-400">W{currentWave}</span>
      </div>
      
      {/* Cinematic Effects - now lightweight CSS-only */}
      <CinematicEffects
        isBossFight={isBossFight}
        killStreak={killStreak}
        giftDamageMultiplier={giftDamageMultiplier}
        screenShake={screenShake}
      />
      
      <div 
        className="absolute inset-0"
        style={{ filter: player.isMagicDashing ? 'saturate(1.3) contrast(1.05)' : 'none' }}
      >
        <ParallaxBackground 
          cameraX={cameraX}
          currentWave={currentWave || 1}
          isBossFight={isBossFight}
        />
        
        {/* Player projectiles */}
        {visibleProjectiles.map(proj => (
          <ProjectileSprite key={proj.id} projectile={proj} cameraX={cameraX} />
        ))}
        
        {/* Enemy lasers */}
        {visibleEnemyLasers.map(laser => (
          <EnemyLaserSprite key={laser.id} projectile={laser} cameraX={cameraX} />
        ))}
        
        {/* Drone fire projectile trails - limited */}
        {visibleEnemyLasers
          .filter(laser => laser.damage === 8)
          .slice(0, 4)
          .map(laser => (
            <DroneFireProjectile
              key={`drone-proj-${laser.id}`}
              x={laser.x}
              y={laser.y}
              cameraX={cameraX}
              velocityX={laser.velocityX}
              velocityY={laser.velocityY}
              variant={0}
            />
          ))}
        
        {/* Boss fireballs */}
        {visibleFireballs.map(fireball => (
          <FireballSprite key={fireball.id} fireball={fireball} cameraX={cameraX} />
        ))}
        
        {/* Neon lasers */}
        {neonLasers.map(laser => {
          const screenX = laser.x - cameraX;
          const neonColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff80'];
          const color = neonColors[Math.floor(Math.abs(laser.x + laser.y) % neonColors.length)];
          return (
            <div
              key={laser.id}
              className="absolute pointer-events-none z-40"
              style={{
                left: screenX,
                bottom: laser.y,
                width: 20,
                height: 4,
                background: `linear-gradient(90deg, ${color}, white, ${color})`,
                boxShadow: `0 0 15px ${color}, 0 0 30px ${color}`,
                borderRadius: '50%',
                transform: `rotate(${Math.atan2(laser.velocityY, laser.velocityX) * 180 / Math.PI}deg)`,
                opacity: laser.life > 0.5 ? 1 : laser.life * 2,
              }}
            />
          );
        })}
        
        {/* EMP Grenades - simplified */}
        {empGrenades.map(grenade => {
          const screenX = grenade.x - cameraX;
          const screenY = Math.min(500, Math.max(60, grenade.y - 80));
          const isAboutToExplode = grenade.timer < 0.5;
          
          return (
            <div
              key={grenade.id}
              className="absolute pointer-events-none z-40"
              style={{
                left: screenX,
                bottom: screenY,
                width: 36,
                height: 36,
              }}
            >
              <div
                className="w-full h-full rounded-lg relative"
                style={{
                  background: 'linear-gradient(135deg, #222 0%, #111 50%, #333 100%)',
                  border: `3px solid ${isAboutToExplode ? '#ff0000' : '#00ffff'}`,
                  boxShadow: isAboutToExplode 
                    ? '0 0 25px #ff0000' 
                    : '0 0 20px #00ffff',
                  animation: 'sparkFade 0.25s linear infinite',
                }}
              >
                <div 
                  className="absolute inset-0 flex items-center justify-center text-base font-black"
                  style={{ color: isAboutToExplode ? '#ff4400' : '#00ffff' }}
                >
                  ⚡
                </div>
              </div>
              {isAboutToExplode && (
                <div
                  className="absolute -inset-6 rounded-full animate-pulse-glow"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,68,0,0.6) 0%, transparent 70%)',
                  }}
                />
              )}
            </div>
          );
        })}
        
        <GrenadeExplosionVFX explosions={grenadeExplosions} cameraX={cameraX} />
        
        {/* Bombs - simplified, no framer-motion */}
        {visibleBombs.map(bomb => {
          const screenX = bomb.x - cameraX;
          const isNearGround = bomb.y <= 200;
          const isAboutToExplode = bomb.y <= 180;
          
          return (
            <div
              key={bomb.id}
              className="absolute pointer-events-none z-40"
              style={{
                left: screenX,
                bottom: bomb.y,
                width: 32,
                height: 38,
              }}
            >
              <div className="w-full h-full relative">
                <div
                  className="w-full h-full rounded-b-full rounded-t-lg"
                  style={{
                    background: 'linear-gradient(135deg, #444 0%, #111 50%, #333 100%)',
                    border: `3px solid ${isAboutToExplode ? '#ff0000' : '#ff6600'}`,
                    boxShadow: isAboutToExplode 
                      ? '0 0 25px #ff0000' 
                      : '0 0 20px #ff6600',
                  }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                  style={{ color: '#ff6600', textShadow: '0 0 6px #ff6600' }}
                >
                  💣
                </div>
              </div>
              {isNearGround && (
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black whitespace-nowrap px-1 rounded animate-pulse-glow"
                  style={{ background: 'rgba(255,0,0,0.9)', color: '#fff' }}
                >
                  ⚠️ BOMB!
                </div>
              )}
            </div>
          );
        })}
        
        <DronePaths enemies={enemies} cameraX={cameraX} />
        
        {/* === UNIFIED GAME LAYER (z-25) === */}
        <div className="absolute inset-0 z-25">
          {enemies.map(enemy => (
            <EnemySprite key={enemy.id} enemy={enemy} cameraX={cameraX} isTankActive={isTankActive} currentWave={currentWave} />
          ))}
          
          {dyingEnemies.map(enemy => (
            <EnemyDeathVFX key={`death-${enemy.id}`} enemy={enemy} cameraX={cameraX} />
          ))}
          
          {/* Enemy muzzle flashes - limited */}
          {attackingEnemies.slice(0, 4).map(enemy => (
            <EnemyMuzzleFlash
              key={`muzzle-${enemy.id}`}
              enemyType={enemy.type}
              x={enemy.x - 20}
              y={enemy.groundY || 115}
              cameraX={cameraX}
              isActive={true}
            />
          ))}
          
          {/* Drone attack VFX - limited */}
          {droneAttacking.slice(0, 3).map(enemy => (
            <DroneFireFlash
              key={`drone-flash-${enemy.id}`}
              drone={enemy}
              cameraX={cameraX}
              isAttacking={true}
            />
          ))}
          
          {supportUnits.map(unit => (
            <SupportUnitSprite key={unit.id} unit={unit} cameraX={cameraX} />
          ))}
          
          <Hero player={player} cameraX={cameraX} isUltraMode={isUltraMode} speechBubble={speechBubble} damageMultiplier={giftDamageMultiplier} />
          
          <HeroAttackEffect 
            isAttacking={player.isShooting} 
            x={player.x} 
            y={player.y} 
            cameraX={cameraX} 
            facingRight={player.facingRight} 
          />
        </div>
        
        {/* Projectiles Layer (z-30) */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {supportProjectiles.map((proj, index) => {
            const isTank = proj.id.includes('tank');
            const isMech = proj.type === 'ultra' && !isTank;
            const unitType = isTank ? 'tank' : isMech ? 'mech' : 'walker';
            return (
              <MetalSlugProjectile
                key={`${proj.id}-${index}`}
                projectile={proj}
                cameraX={cameraX}
                unitType={unitType}
              />
            );
          })}
        </div>
        
        {/* Floor */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-5"
          style={{ height: 160 }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, rgba(60,55,50,0.95) 0%, rgba(45,42,38,1) 20%, rgba(35,32,28,1) 60%, rgba(25,22,18,1) 100%)`,
              boxShadow: 'inset 0 15px 40px rgba(0,0,0,0.8)',
            }}
          />
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(0,255,255,0.15) 1px, transparent 1px), linear-gradient(0deg, rgba(255,0,255,0.08) 1px, transparent 1px)`,
              backgroundSize: '120px 40px',
              transform: `translateX(${-cameraX % 120}px)`,
            }}
          />
          <div 
            className="absolute top-0 left-0 right-0"
            style={{
              height: 4,
              background: 'linear-gradient(90deg, rgba(0,255,255,0.5), rgba(255,0,255,0.7), rgba(0,255,255,0.5))',
              boxShadow: '0 0 15px rgba(0,255,255,0.6)',
            }}
          />
        </div>
        
        <Portal x={portalX} cameraX={cameraX} isOpen={portalOpen} isEntering={heroEnteringPortal} />
        
        <Princess
          x={levelLength - 100} 
          cameraX={cameraX} 
          isVisible={currentWave === 1000 && !isBossFight && distance > levelLength - 600}
        />
        
        <EnemiesWaitingIndicator 
          isVisible={!firstGiftSent && activeEnemyCount > 0} 
          enemyCount={activeEnemyCount} 
        />
        
        <OptimizedParticles particles={particles} cameraX={cameraX} isBossFight={isBossFight} />
        
        <ChaosElements 
          neonLights={neonLights} 
          explosions={explosions} 
          cameraX={cameraX} 
        />
        
        {/* Combo */}
        {combo > 1 && comboTimer > 0 && (
          <div className="absolute top-12 right-2 text-center">
            <div
              className="font-bold text-xl animate-pulse-glow"
              style={{ color: '#ff00ff', textShadow: '0 0 15px #ff00ff' }}
            >
              {combo}x
            </div>
          </div>
        )}
        
        {isFrozen && (
          <div className="absolute inset-0 bg-cyan-500/20 z-30 flex items-center justify-center">
            <span className="text-4xl animate-pulse-glow">❄️</span>
          </div>
        )}
        
        {isUltraMode && (
          <div
            className="absolute inset-0 pointer-events-none animate-pulse-glow"
            style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(255,0,255,0.25) 100%)' }}
          />
        )}
      </div>
      
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-8"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)' }}
      />
      
      <GiftComboIndicator 
        giftCombo={giftCombo} 
        giftComboTimer={giftComboTimer} 
        damageMultiplier={giftDamageMultiplier} 
      />
      
      <KillStreakAnnouncer killStreak={killStreak} />
      
      <MultiplierVFX 
        damageMultiplier={giftDamageMultiplier} 
        previousMultiplier={previousMultiplier} 
      />
      
      <RayCannonVFX
        isActive={(gameState as any).rayCannonActive || false}
        heroX={player.x}
        heroY={player.y}
        cameraX={cameraX}
        duration={3}
      />
    </div>
  );
};
