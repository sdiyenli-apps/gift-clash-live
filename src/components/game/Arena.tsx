import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Projectile, getBossName, Bomb, SupportUnit } from '@/types/game';
import { ParallaxBackground } from './ParallaxBackground';
import { Hero } from './Hero';
import { EnemySprite } from './Enemy';
import { ProjectileSprite, EnemyLaserSprite, FireballSprite } from './Projectile';
import { MetalSlugProjectile } from './MetalSlugProjectile';
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
import { DronePaths } from './DronePath';

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
  
}

interface ArenaProps {
  gameState: ExtendedGameState;
}

export const Arena = ({ gameState }: ArenaProps) => {
  const { 
    player, enemies, projectiles, particles, obstacles,
    cameraX, distance, levelLength, isUltraMode, speechBubble,
    combo, comboTimer, isFrozen, isBossFight, screenShake,
    flyingRobots, chickens, neonLights, explosions,
    fireballs = [], redFlash = 0, enemyLasers = [],
    magicFlash = 0, bossTaunt = null, currentWave,
    damageFlash = 0, shieldBlockFlash = 0, neonLasers = [],
    empGrenades = [], bombs = [],
    portalOpen = false, portalX = 0, heroEnteringPortal = false,
    bossTransformFlash = 0,
    supportUnits = [], supportProjectiles = [],
    evasionPopup = null,
  } = gameState as ExtendedGameState & { evasionPopup?: { x: number; y: number; timer: number; target: string } | null };
  
  const shakeX = screenShake ? (Math.random() - 0.5) * screenShake * 8 : 0;
  const shakeY = screenShake ? (Math.random() - 0.5) * screenShake * 8 : 0;
  
  // Check if tank is active - enemies show fear when tank is deployed
  const isTankActive = supportUnits.some(u => u.type === 'tank' && !u.isSelfDestructing && u.health > 0);
  
  // Get boss info for HUD
  const bossEnemy = enemies.find(e => e.type === 'boss' && !e.isDying);
  
  return (
    <div 
      className="w-full h-full overflow-hidden relative"
      style={{
        boxShadow: isBossFight 
          ? '0 0 20px rgba(255,0,0,0.5), inset 0 0 30px rgba(255,0,0,0.15)' 
          : player.isMagicDashing 
            ? '0 0 15px rgba(255,0,255,0.4), inset 0 0 25px rgba(255,0,255,0.15)' 
            : 'none',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        background: '#0a0a15',
        borderRadius: 0,
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
      
      {/* EVASION POPUP - Shows when attack is evaded */}
      {evasionPopup && evasionPopup.timer > 0 && (
        <motion.div
          className="absolute z-60 pointer-events-none font-black text-lg"
          style={{
            left: 150,
            bottom: 200,
            color: '#00ff00',
            textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 2px 2px 0 #000',
          }}
          initial={{ opacity: 1, y: 0, scale: 1.5 }}
          animate={{ opacity: 0, y: -30, scale: 1 }}
          transition={{ duration: 1 }}
        >
          ⚡ EVADED! ⚡
        </motion.div>
      )}
      
      {/* Zone/Level info - smaller and out of way */}
      <div className="absolute top-1 right-1 z-30 text-[8px] opacity-60">
        <span className="text-cyan-400">W{currentWave}</span>
      </div>
      
      <div 
        className="absolute inset-0"
        style={{ filter: player.isMagicDashing ? 'saturate(1.3) contrast(1.05)' : 'none' }}
      >
        {/* Parallax scrolling background */}

        {/* Parallax scrolling background */}
        <ParallaxBackground 
          cameraX={cameraX}
          currentWave={currentWave || 1}
          isBossFight={isBossFight}
        />
        
        {/* Player projectiles - filter off-screen */}
        {projectiles
          .filter(proj => {
            const screenX = proj.x - cameraX;
            return screenX > -30 && screenX < 700;
          })
          .map(proj => (
            <ProjectileSprite key={proj.id} projectile={proj} cameraX={cameraX} />
          ))}
        
        {/* Enemy lasers - filter off-screen */}
        {enemyLasers
          .filter(laser => {
            const screenX = laser.x - cameraX;
            return screenX > -30 && screenX < 700;
          })
          .map(laser => (
            <EnemyLaserSprite key={laser.id} projectile={laser} cameraX={cameraX} />
          ))}
        
        {/* Boss fireballs - filter off-screen */}
        {fireballs
          .filter(fireball => {
            const screenX = fireball.x - cameraX;
            return screenX > -50 && screenX < 750;
          })
          .map(fireball => (
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
        
        {/* REMOVED: Neon beams - All attacks are now projectiles only */}
        
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
        
        {/* BOMBS - Dropped by bomber enemies - ENHANCED VISIBILITY */}
        {bombs.map(bomb => {
          const screenX = bomb.x - cameraX;
          if (screenX < -50 || screenX > 800) return null;
          
          // Check if bomb is close to ground (about to explode)
          const isNearGround = bomb.y <= 200;
          const isAboutToExplode = bomb.y <= 180;
          
          return (
            <motion.div
              key={bomb.id}
              className="absolute pointer-events-none z-40"
              style={{
                left: screenX,
                bottom: bomb.y,
                width: 32,
                height: 38,
              }}
            >
              {/* Outer warning glow - MUCH MORE VISIBLE */}
              <motion.div
                className="absolute -inset-6 rounded-full"
                style={{
                  background: isAboutToExplode
                    ? 'radial-gradient(circle, rgba(255,0,0,0.8), rgba(255,68,0,0.5), transparent)'
                    : 'radial-gradient(circle, rgba(255,100,0,0.6), rgba(255,68,0,0.3), transparent)',
                  filter: 'blur(6px)',
                }}
                animate={{ 
                  scale: isAboutToExplode ? [1, 2, 1] : [1, 1.4, 1], 
                  opacity: [0.6, 1, 0.6] 
                }}
                transition={{ duration: isAboutToExplode ? 0.1 : 0.2, repeat: Infinity }}
              />
              
              {/* Bomb body */}
              <motion.div
                className="w-full h-full relative"
                animate={{ rotate: [0, 15, -15, 0], scale: isAboutToExplode ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.2, repeat: Infinity }}
              >
                {/* Bomb casing - LARGER and more visible */}
                <div
                  className="w-full h-full rounded-b-full rounded-t-lg"
                  style={{
                    background: 'linear-gradient(135deg, #444 0%, #111 50%, #333 100%)',
                    border: isAboutToExplode ? '3px solid #ff0000' : '3px solid #ff6600',
                    boxShadow: isAboutToExplode 
                      ? '0 0 25px #ff0000, 0 0 50px rgba(255,0,0,0.8), inset 0 2px 6px rgba(255,255,255,0.3)'
                      : '0 0 20px #ff6600, 0 0 40px rgba(255,100,0,0.6), inset 0 2px 6px rgba(255,255,255,0.3)',
                  }}
                />
                {/* Fuse */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-4"
                  style={{
                    background: '#555',
                    borderRadius: '3px',
                  }}
                />
                {/* Spark on fuse - BIGGER */}
                <motion.div
                  className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
                  style={{
                    background: isAboutToExplode 
                      ? 'radial-gradient(circle, #fff, #ff0000, #ff4400)'
                      : 'radial-gradient(circle, #fff, #ff8800, #ff4400)',
                    boxShadow: isAboutToExplode
                      ? '0 0 15px #ff0000, 0 0 30px #ff4400'
                      : '0 0 12px #ff8800, 0 0 20px #ff4400',
                  }}
                  animate={{ scale: [1, 2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                />
                {/* Warning icon - LARGER */}
                <div
                  className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                  style={{ color: '#ff6600', textShadow: '0 0 6px #ff6600' }}
                >
                  💣
                </div>
              </motion.div>
              
              {/* Fire trail effect - LONGER and brighter */}
              <motion.div
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-12"
                style={{
                  background: 'linear-gradient(180deg, transparent, rgba(255,100,0,0.7), rgba(255,200,0,0.5), rgba(255,255,0,0.3))',
                  filter: 'blur(3px)',
                }}
                animate={{ opacity: [0.8, 1, 0.8], scaleY: [1, 1.3, 1] }}
                transition={{ duration: 0.15, repeat: Infinity }}
              />
              
              {/* Sparks around bomb */}
              {[0, 1, 2].map(i => (
                <motion.div
                  key={`bomb-spark-${i}`}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: '#ffff00',
                    boxShadow: '0 0 6px #ffff00',
                    left: '50%',
                    top: -8 - i * 6,
                  }}
                  animate={{ 
                    x: [(i - 1) * 8, (i - 1) * 12, (i - 1) * 8],
                    opacity: [1, 0.5, 0],
                    scale: [1, 0.5, 0]
                  }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
              
              {/* DANGER text when close to ground */}
              {isNearGround && (
                <motion.div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black whitespace-nowrap px-1 rounded"
                  style={{
                    background: 'rgba(255,0,0,0.9)',
                    color: '#fff',
                    textShadow: '0 0 4px #000',
                  }}
                  animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.15, repeat: Infinity }}
                >
                  ⚠️ BOMB! ⚠️
                </motion.div>
              )}
            </motion.div>
          );
        })}
        
        
        {/* Drone Flight Paths - visible sine wave trails */}
        <DronePaths enemies={enemies} cameraX={cameraX} />
        
        {/* === UNIFIED GAME LAYER (z-25) - All entities on same level for proper interaction === */}
        <div className="absolute inset-0 z-25">
          {/* Enemies rendered first (back) */}
          {enemies.map(enemy => (
            <EnemySprite key={enemy.id} enemy={enemy} cameraX={cameraX} isTankActive={isTankActive} currentWave={currentWave} />
          ))}
          
          
          {/* Support Units - friendly mech and walker allies */}
          {supportUnits.map(unit => (
            <SupportUnitSprite key={unit.id} unit={unit} cameraX={cameraX} />
          ))}
          
          {/* Hero - rendered in same layer */}
          <Hero player={player} cameraX={cameraX} isUltraMode={isUltraMode} speechBubble={speechBubble} />
        </div>
        
        {/* Projectiles Layer (z-30) - Above entities for visibility */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Support Unit Projectiles - Metal Slug style with shell casings */}
          {supportProjectiles.map(proj => {
            const isTank = proj.id.includes('tank');
            const isMech = proj.type === 'ultra' && !isTank;
            const unitType = isTank ? 'tank' : isMech ? 'mech' : 'walker';
            
            return (
              <MetalSlugProjectile
                key={proj.id}
                projectile={proj}
                cameraX={cameraX}
                unitType={unitType}
              />
            );
          })}
        </div>
        
        {/* Floor Assets - dustbins, rats, debris */}
        <FloorAssets cameraX={cameraX} levelLength={levelLength} />
        
        {/* Floor - Original size */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-5"
          style={{
            height: 160, // Original floor height
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
        
        {/* Shield indicator removed from bottom-left */}
        
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
