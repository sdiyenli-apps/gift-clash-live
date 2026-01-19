import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Projectile, GiftBlock, getBossName, GiftEvent, Bomb, SupportUnit } from '@/types/game';
import { BackgroundVideo } from './BackgroundVideo';
import { Hero } from './Hero';
import { EnemySprite } from './Enemy';
import { ProjectileSprite, EnemyLaserSprite, FireballSprite } from './Projectile';
import { Particles } from './Particles';
import { ChaosElements } from './ChaosElements';
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

// Neon beam from jet robots
interface NeonBeam {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  life: number;
  damageTimer: number;
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
  neonBeams?: NeonBeam[];
  supportUnits?: SupportUnit[];
  supportProjectiles?: Projectile[];
}

interface ArenaProps {
  gameState: ExtendedGameState;
  notifications?: GiftEvent[];
}

export const Arena = ({ gameState, notifications = [] }: ArenaProps) => {
  const { 
    player, enemies, projectiles, particles, obstacles,
    cameraX, distance, levelLength, isUltraMode, speechBubble,
    combo, comboTimer, isFrozen, isBossFight, screenShake,
    flyingRobots, chickens, neonLights, explosions, giftBlocks = [],
    fireballs = [], redFlash = 0, armorTimer = 0, enemyLasers = [],
    magicFlash = 0, bossTaunt = null, currentWave,
    damageFlash = 0, shieldBlockFlash = 0, neonLasers = [],
    empGrenades = [], bombs = [],
    portalOpen = false, portalX = 0, heroEnteringPortal = false,
    bossTransformFlash = 0, neonBeams = [],
    supportUnits = [], supportProjectiles = []
  } = gameState;
  
  const shakeX = screenShake ? (Math.random() - 0.5) * screenShake * 8 : 0;
  const shakeY = screenShake ? (Math.random() - 0.5) * screenShake * 8 : 0;
  
  // Get boss info for HUD
  const bossEnemy = enemies.find(e => e.type === 'boss' && !e.isDying);
  
  return (
    <div 
      className="w-full h-full rounded-lg overflow-hidden relative"
      style={{
        boxShadow: isBossFight 
          ? '0 0 20px rgba(255,0,0,0.5), inset 0 0 30px rgba(255,0,0,0.15)' 
          : player.isMagicDashing 
            ? '0 0 15px rgba(255,0,255,0.4), inset 0 0 25px rgba(255,0,255,0.15)' 
            : 'inset 0 0 20px rgba(0, 255, 255, 0.08)',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        background: '#0a0a15',
      }}
    >
      {/* Mini-map - positioned at top for visibility */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50">
        <MiniMap 
          player={player}
          enemies={enemies}
          levelLength={levelLength}
          princessX={levelLength - 100}
          cameraX={cameraX}
        />
      </div>
      
      {/* Boss HUD - shows taunts at top */}
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
      
      {/* Boss health bar above boss head */}
      {bossEnemy && isBossFight && (
        <BossHealthBar boss={bossEnemy} cameraX={cameraX} />
      )}
      
      {/* Red flash for boss mega attack */}
      {redFlash > 0 && (
        <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{ background: 'rgba(255,0,0,0.7)' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: redFlash > 1 ? 1 : redFlash }}
        />
      )}
      
      {/* Magic flash */}
      {magicFlash > 0 && (
        <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{ background: 'rgba(255,0,255,0.5)' }}
          animate={{ opacity: magicFlash }}
        />
      )}
      
      {/* DAMAGE FLASH - red screen flash when hero takes damage */}
      {damageFlash > 0 && (
        <motion.div
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, rgba(255,0,0,0.6), rgba(255,0,0,0.8))',
            boxShadow: 'inset 0 0 100px rgba(255,0,0,0.9)',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: damageFlash }}
        />
      )}
      
      {/* SHIELD BLOCK FLASH - cyan/blue flash when shield blocks attack */}
      {shieldBlockFlash > 0 && (
        <motion.div
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, rgba(0,255,255,0.4), rgba(0,150,255,0.5))',
            boxShadow: 'inset 0 0 80px rgba(0,255,255,0.8)',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: shieldBlockFlash }}
        />
      )}
      
      {/* BOSS TRANSFORMATION FLASH - white/purple flash when boss transforms */}
      {bossTransformFlash > 0 && (
        <motion.div
          className="absolute inset-0 z-60 pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,0,255,0.6), rgba(255,0,0,0.4))',
            boxShadow: 'inset 0 0 150px rgba(255,255,255,1)',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.5, 0.8, 0.3, 0] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
      
      {/* Zone/Level info - smaller and out of way */}
      <div className="absolute top-1 right-1 z-30 text-[8px] opacity-60">
        <span className="text-cyan-400">W{currentWave}</span>
      </div>
      
      <div 
        className="absolute inset-0"
        style={{ filter: player.isMagicDashing ? 'saturate(1.3) contrast(1.05)' : 'none' }}
      >
        {/* Cyberpunk buildings in background */}
        <CyberpunkBuildings cameraX={cameraX} />
        
        
        {/* Video-like background */}
        <BackgroundVideo 
          distance={distance}
          cameraX={cameraX}
          isUltraMode={isUltraMode}
          isBossFight={isBossFight}
          levelLength={levelLength}
        />
        
        {/* Player projectiles */}
        {projectiles.map(proj => (
          <ProjectileSprite key={proj.id} projectile={proj} cameraX={cameraX} />
        ))}
        
        {/* Enemy lasers */}
        {enemyLasers.map(laser => (
          <EnemyLaserSprite key={laser.id} projectile={laser} cameraX={cameraX} />
        ))}
        
        {/* Boss fireballs */}
        {fireballs.map(fireball => (
          <FireballSprite key={fireball.id} fireball={fireball} cameraX={cameraX} />
        ))}
        
        {/* NEON LASERS - bouncing wall lasers! */}
        {neonLasers.map(laser => {
          const screenX = laser.x - cameraX;
          const neonColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff80'];
          const color = neonColors[Math.floor(Math.abs(laser.x + laser.y) % neonColors.length)];
          return (
            <motion.div
              key={laser.id}
              className="absolute pointer-events-none z-40"
              style={{
                left: screenX,
                bottom: laser.y,
                width: 20,
                height: 4,
                background: `linear-gradient(90deg, ${color}, white, ${color})`,
                boxShadow: `0 0 15px ${color}, 0 0 30px ${color}, 0 0 45px ${color}`,
                borderRadius: '50%',
                transform: `rotate(${Math.atan2(laser.velocityY, laser.velocityX) * 180 / Math.PI}deg)`,
              }}
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: laser.life > 0.5 ? 1 : laser.life * 2,
              }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
          );
        })}
        
        {/* NEON BEAMS - Fired by jet robots, damage over time */}
        {neonBeams.map(beam => {
          const startX = beam.x - cameraX;
          const endX = beam.targetX - cameraX;
          const startY = beam.y;
          const endY = beam.targetY;
          
          // Calculate beam angle and length
          const dx = endX - startX;
          const dy = endY - startY;
          const angle = Math.atan2(dy, dx);
          const length = Math.sqrt(dx * dx + dy * dy);
          
          return (
            <motion.div
              key={beam.id}
              className="absolute pointer-events-none z-45"
              style={{
                left: startX,
                bottom: startY,
                width: length,
                height: 6,
                background: `linear-gradient(90deg, 
                  rgba(0,255,255,0.9), 
                  rgba(255,0,255,1), 
                  rgba(0,255,255,0.9)
                )`,
                boxShadow: `
                  0 0 10px #00ffff, 
                  0 0 20px #ff00ff, 
                  0 0 30px #00ffff,
                  0 0 40px rgba(255,0,255,0.5)
                `,
                transformOrigin: 'left center',
                transform: `rotate(${-angle * 180 / Math.PI}deg)`,
                borderRadius: '3px',
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ 
                opacity: beam.life > 0.3 ? 1 : beam.life * 3,
                scaleX: 1,
              }}
              transition={{ duration: 0.1 }}
            >
              {/* Inner bright core */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, white, rgba(0,255,255,1), white)',
                  filter: 'blur(1px)',
                }}
                animate={{ 
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ duration: 0.1, repeat: Infinity }}
              />
              
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                }}
                animate={{ 
                  x: ['-100%', '100%'],
                }}
                transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
        
        {/* EMP Grenades - THROWN HIGH into the sky - Metal Slug style arc */}
        {empGrenades.map(grenade => {
          const screenX = grenade.x - cameraX;
          // Grenade goes HIGH into the sky - y value maps to screen bottom position
          // Higher Y = higher on screen (further from ground)
          const screenY = Math.min(500, Math.max(60, grenade.y - 80));
          const isAboutToExplode = grenade.timer < 0.5;
          const isRising = grenade.velocityY > 0;
          
          return (
            <motion.div
              key={grenade.id}
              className="absolute pointer-events-none z-40"
              style={{
                left: screenX,
                bottom: screenY,
                width: 36,
                height: 36,
              }}
            >
              {/* Grenade body - LARGER and more visible */}
              <motion.div
                className="w-full h-full rounded-lg relative"
                style={{
                  background: 'linear-gradient(135deg, #222 0%, #111 50%, #333 100%)',
                  border: '3px solid #00ffff',
                  boxShadow: isAboutToExplode 
                    ? '0 0 25px #ff0000, 0 0 50px rgba(255,0,0,0.8)' 
                    : '0 0 20px #00ffff, 0 0 40px rgba(0,255,255,0.6)',
                  borderColor: isAboutToExplode ? '#ff0000' : '#00ffff',
                }}
                animate={{ 
                  rotate: [0, 360],
                  scale: isAboutToExplode ? [1, 1.2, 1] : 1,
                }}
                transition={{ 
                  rotate: { duration: 0.25, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 0.1, repeat: Infinity },
                }}
              >
                {/* EMP lightning symbol - LARGER */}
                <div 
                  className="absolute inset-0 flex items-center justify-center text-base font-black"
                  style={{ 
                    color: isAboutToExplode ? '#ff4400' : '#00ffff', 
                    textShadow: `0 0 8px ${isAboutToExplode ? '#ff4400' : '#00ffff'}` 
                  }}
                >
                  ⚡
                </div>
                
                {/* Pin on top */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-3"
                  style={{
                    background: '#666',
                    borderRadius: '2px 2px 0 0',
                    border: '1px solid #888',
                  }}
                />
              </motion.div>
              
              {/* Arc trail effect - shows throwing trajectory */}
              <motion.div
                className="absolute -z-10"
                style={{
                  left: -30,
                  top: '50%',
                  transform: 'translateY(-50%) rotate(-20deg)',
                  width: 45,
                  height: 12,
                  background: 'linear-gradient(90deg, transparent, #00ffff, #00ffff)',
                  filter: 'blur(4px)',
                  opacity: 0.8,
                  borderRadius: '50%',
                }}
              />
              
              {/* Spinning arc particles */}
              {[0, 1, 2].map(i => (
                <motion.div
                  key={`trail-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: isAboutToExplode ? '#ff4400' : '#00ffff',
                    boxShadow: `0 0 6px ${isAboutToExplode ? '#ff4400' : '#00ffff'}`,
                    left: -10 - i * 12,
                    top: '50%',
                  }}
                  animate={{ 
                    opacity: [1, 0.3, 0],
                    scale: [1, 0.5, 0],
                  }}
                  transition={{ duration: 0.2, delay: i * 0.05, repeat: Infinity }}
                />
              ))}
              
              {/* Warning flash as it's about to explode */}
              {isAboutToExplode && (
                <motion.div
                  className="absolute -inset-6 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,68,0,0.8) 0%, rgba(255,0,0,0.4) 50%, transparent 70%)',
                  }}
                  animate={{ scale: [1, 2.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.08, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
        
        {/* BOMBS - Dropped by bomber enemies */}
        {bombs.map(bomb => {
          const screenX = bomb.x - cameraX;
          if (screenX < -50 || screenX > 800) return null;
          
          return (
            <motion.div
              key={bomb.id}
              className="absolute pointer-events-none z-35"
              style={{
                left: screenX,
                bottom: bomb.y,
                width: 20,
                height: 24,
              }}
            >
              {/* Bomb body */}
              <motion.div
                className="w-full h-full relative"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                {/* Bomb casing */}
                <div
                  className="w-full h-full rounded-b-full rounded-t-lg"
                  style={{
                    background: 'linear-gradient(135deg, #333 0%, #111 50%, #222 100%)',
                    border: '2px solid #ff6600',
                    boxShadow: '0 0 12px #ff6600, inset 0 2px 4px rgba(255,255,255,0.2)',
                  }}
                />
                {/* Fuse */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3"
                  style={{
                    background: '#666',
                    borderRadius: '2px',
                  }}
                />
                {/* Spark on fuse */}
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #fff, #ff8800, #ff4400)',
                    boxShadow: '0 0 8px #ff8800, 0 0 15px #ff4400',
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 0.15, repeat: Infinity }}
                />
                {/* Warning icon */}
                <div
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: '#ff6600', textShadow: '0 0 4px #ff6600' }}
                >
                  💣
                </div>
              </motion.div>
              
              {/* Trail effect */}
              <motion.div
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-8"
                style={{
                  background: 'linear-gradient(180deg, transparent, rgba(255,100,0,0.5), rgba(255,200,0,0.3))',
                  filter: 'blur(2px)',
                }}
              />
            </motion.div>
          );
        })}
        
        {enemies.map(enemy => (
          <EnemySprite key={enemy.id} enemy={enemy} cameraX={cameraX} />
        ))}
        
        {/* Support Units - friendly mech and walker allies */}
        {supportUnits.map(unit => (
          <SupportUnitSprite key={unit.id} unit={unit} cameraX={cameraX} />
        ))}
        
        {/* Support Unit Projectiles - VISIBLE ALLY ATTACKS */}
        {supportProjectiles.map(proj => {
          const screenX = proj.x - cameraX;
          const screenY = proj.y;
          const isMech = proj.type === 'ultra';
          
          return (
            <motion.div
              key={proj.id}
              className="absolute pointer-events-none z-35"
              style={{
                left: screenX,
                bottom: screenY,
                width: isMech ? 28 : 35,
                height: isMech ? 14 : 8,
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {isMech ? (
                // Mech heavy projectile - orange/yellow plasma
                <motion.div
                  className="w-full h-full rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse at 30% 50%, #fff, #ffaa00, #ff6600)',
                    boxShadow: '0 0 15px #ff8800, 0 0 25px rgba(255,136,0,0.7)',
                  }}
                  animate={{ scaleX: [1, 1.2, 1] }}
                  transition={{ duration: 0.08, repeat: Infinity }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent)' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.1, repeat: Infinity }}
                  />
                </motion.div>
              ) : (
                // Walker laser projectile - green/cyan energy
                <motion.div
                  className="w-full h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #00ff88, #00ffcc, #fff, #00ffcc, #00ff88, transparent)',
                    boxShadow: '0 0 12px #00ff88, 0 0 25px rgba(0,255,136,0.7)',
                  }}
                  animate={{ scaleX: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 0.06, repeat: Infinity }}
                />
              )}
              
              {/* Trail effect */}
              <motion.div
                className="absolute right-full top-1/2 -translate-y-1/2"
                style={{
                  width: 40,
                  height: isMech ? 8 : 4,
                  background: isMech 
                    ? 'linear-gradient(90deg, transparent, #ff880066, #ffaa00)'
                    : 'linear-gradient(90deg, transparent, #00ff8866, #00ffaa)',
                  filter: 'blur(2px)',
                }}
              />
            </motion.div>
          );
        })}
        
        <Hero player={player} cameraX={cameraX} isUltraMode={isUltraMode} speechBubble={speechBubble} />
        
        {/* Floor Assets - dustbins, rats, debris */}
        <FloorAssets cameraX={cameraX} levelLength={levelLength} />
        
        {/* Floor - Adjusted for zoomed out view */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-5"
          style={{
            height: 120, // Lowered ground for zoom out
          }}
        >
          {/* Concrete base texture */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(180deg, 
                  rgba(60,55,50,0.95) 0%, 
                  rgba(45,42,38,1) 20%,
                  rgba(35,32,28,1) 60%, 
                  rgba(25,22,18,1) 100%
                )
              `,
              boxShadow: 'inset 0 15px 40px rgba(0,0,0,0.8)',
            }}
          />
          
          {/* Concrete texture overlay - cracks and grain */}
          <div 
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage: `
                url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")
              `,
              backgroundSize: '150px 150px',
              transform: `translateX(${-cameraX % 150}px)`,
            }}
          />
          
          {/* Concrete cracks */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.3) 49%, rgba(0,0,0,0.3) 51%, transparent 52%),
                linear-gradient(-30deg, transparent 48%, rgba(0,0,0,0.2) 49%, rgba(0,0,0,0.2) 51%, transparent 52%)
              `,
              backgroundSize: '100px 50px, 150px 80px',
              transform: `translateX(${-cameraX % 150}px)`,
            }}
          />
          
          {/* Neon edge lines on concrete */}
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(0,255,255,0.15) 1px, transparent 1px),
                linear-gradient(0deg, rgba(255,0,255,0.08) 1px, transparent 1px)
              `,
              backgroundSize: '120px 40px',
              transform: `translateX(${-cameraX % 120}px)`,
            }}
          />
          
          {/* Top edge - neon glow on concrete */}
          <div 
            className="absolute top-0 left-0 right-0"
            style={{
              height: 4,
              background: 'linear-gradient(90deg, rgba(0,255,255,0.5), rgba(255,0,255,0.7), rgba(0,255,255,0.5))',
              boxShadow: '0 0 15px rgba(0,255,255,0.6), 0 3px 20px rgba(255,0,255,0.4)',
            }}
          />
          
          {/* Puddle reflections */}
          <div 
            className="absolute opacity-20"
            style={{
              width: 80,
              height: 12,
              background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.4), transparent)',
              left: `${(200 - cameraX % 400)}px`,
              top: 25,
              borderRadius: '50%',
              filter: 'blur(3px)',
            }}
          />
          <div 
            className="absolute opacity-15"
            style={{
              width: 50,
              height: 8,
              background: 'linear-gradient(90deg, transparent, rgba(255,0,255,0.3), transparent)',
              left: `${(350 - cameraX % 500)}px`,
              top: 50,
              borderRadius: '50%',
              filter: 'blur(2px)',
            }}
          />
        </div>
        
        {/* Portal - appears after boss is defeated */}
        <Portal
          x={portalX}
          cameraX={cameraX}
          isOpen={portalOpen}
          isEntering={heroEnteringPortal}
        />
        
        {/* Princess only visible at wave 1000 */}
        <Princess
          x={levelLength - 100} 
          cameraX={cameraX} 
          isVisible={currentWave === 1000 && !isBossFight && distance > levelLength - 600}
        />
        
        <Particles particles={particles} cameraX={cameraX} />
        
        <ChaosElements 
          flyingRobots={flyingRobots} 
          chickens={chickens} 
          neonLights={neonLights} 
          explosions={explosions} 
          cameraX={cameraX} 
        />
        
        {/* Shield indicator - permanent (no timer) */}
        {gameState.player.shield > 0 && (
          <motion.div
            className="absolute bottom-2 left-2 z-30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div 
              className="px-2 py-1 rounded-full font-bold text-[10px]"
              style={{
                background: 'linear-gradient(135deg, #00ffff, #0088ff)',
                color: '#fff',
                boxShadow: '0 0 12px #00ffff',
              }}
            >
              🛡️ {Math.ceil(gameState.player.shield)}
            </div>
          </motion.div>
        )}
        
        {/* Combo */}
        {combo > 1 && comboTimer > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-12 right-2 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.25, repeat: Infinity }}
              className="font-bold text-xl"
              style={{ color: '#ff00ff', textShadow: '0 0 15px #ff00ff' }}
            >
              {combo}x
            </motion.div>
          </motion.div>
        )}
        
        <AnimatePresence>
          {isFrozen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-cyan-500/20 z-30 flex items-center justify-center"
            >
              <motion.span className="text-4xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.4, repeat: Infinity }}>
                ❄️
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isUltraMode && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(255,0,255,0.25) 100%)' }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        )}
      </div>
      
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-8"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)' }}
      />
    </div>
  );
};
