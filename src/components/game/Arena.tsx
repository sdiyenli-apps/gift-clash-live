import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Projectile, GiftBlock, getBossName } from '@/types/game';
import { BackgroundVideo } from './BackgroundVideo';
import { Hero } from './Hero';
import { EnemySprite } from './Enemy';
import { ProjectileSprite, EnemyLaserSprite, FireballSprite } from './Projectile';
import { Particles } from './Particles';
import { ChaosElements } from './ChaosElements';
import { Princess } from './Princess';
import { BossHUD } from './BossHUD';
import { MiniMap } from './MiniMap';
import { CyberpunkBuildings } from './CyberpunkBuildings';
import { FloorAssets } from './FloorAssets';

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
}

interface ArenaProps {
  gameState: ExtendedGameState;
}

export const Arena = ({ gameState }: ArenaProps) => {
  const { 
    player, enemies, projectiles, particles, obstacles,
    cameraX, distance, levelLength, isUltraMode, speechBubble,
    combo, comboTimer, isFrozen, isBossFight, screenShake,
    flyingRobots, chickens, neonLights, explosions, giftBlocks = [],
    fireballs = [], redFlash = 0, armorTimer = 0, enemyLasers = [],
    magicFlash = 0, bossTaunt = null, currentWave,
    damageFlash = 0, shieldBlockFlash = 0, neonLasers = [],
    empGrenades = []
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
      {/* Mini-map */}
      <MiniMap 
        player={player}
        enemies={enemies}
        levelLength={levelLength}
        princessX={levelLength - 100}
        cameraX={cameraX}
      />
      
      {/* Boss HUD */}
      {bossEnemy && isBossFight && (
        <BossHUD 
          bossHealth={bossEnemy.health}
          bossMaxHealth={bossEnemy.maxHealth}
          bossName={getBossName(currentWave || 1)}
          isVisible={true}
          bossTaunt={bossTaunt}
          bossPhase={bossEnemy.bossPhase}
        />
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
        
        {/* EMP Grenades - thrown by hero */}
        {empGrenades.map(grenade => {
          const screenX = grenade.x - cameraX;
          // Grenade is falling from arc - y increases as it goes up (bottom-based)
          const screenY = Math.max(80, 120 - grenade.y + 100);
          
          return (
            <motion.div
              key={grenade.id}
              className="absolute pointer-events-none z-35"
              style={{
                left: screenX,
                bottom: screenY,
                width: 24,
                height: 24,
              }}
            >
              {/* Grenade body */}
              <motion.div
                className="w-full h-full rounded-full relative"
                style={{
                  background: 'linear-gradient(135deg, #333 0%, #111 50%, #444 100%)',
                  border: '2px solid #00ffff',
                  boxShadow: '0 0 15px #00ffff, 0 0 30px rgba(0,255,255,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
                }}
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{ 
                  duration: 0.3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {/* EMP lightning symbol */}
                <div 
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: '#00ffff', textShadow: '0 0 5px #00ffff' }}
                >
                  ⚡
                </div>
              </motion.div>
              
              {/* Trail effect */}
              <motion.div
                className="absolute -z-10"
                style={{
                  left: -15,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 25,
                  height: 8,
                  background: 'linear-gradient(90deg, transparent, #00ffff)',
                  filter: 'blur(3px)',
                  opacity: 0.7,
                }}
              />
              
              {/* Warning flash as it's about to explode */}
              {grenade.timer < 0.3 && (
                <motion.div
                  className="absolute -inset-4 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(0,255,255,0.8) 0%, transparent 70%)',
                  }}
                  animate={{ scale: [1, 2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
        
        {enemies.map(enemy => (
          <EnemySprite key={enemy.id} enemy={enemy} cameraX={cameraX} />
        ))}
        
        <Hero player={player} cameraX={cameraX} isUltraMode={isUltraMode} speechBubble={speechBubble} />
        
        {/* Floor Assets - dustbins, rats, debris */}
        <FloorAssets cameraX={cameraX} levelLength={levelLength} />
        
        {/* Floor - CONCRETE TEXTURE with cyberpunk styling */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-5"
          style={{
            height: 50,
          }}
        >
          {/* Concrete base texture */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(180deg, 
                  rgba(60,55,50,0.95) 0%, 
                  rgba(45,42,38,1) 30%,
                  rgba(35,32,28,1) 70%, 
                  rgba(25,22,18,1) 100%
                )
              `,
              boxShadow: 'inset 0 8px 25px rgba(0,0,0,0.7)',
            }}
          />
          
          {/* Concrete texture overlay - cracks and grain */}
          <div 
            className="absolute inset-0 opacity-40"
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
              backgroundSize: '80px 40px, 120px 60px',
              transform: `translateX(${-cameraX % 120}px)`,
            }}
          />
          
          {/* Neon edge lines on concrete */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(0,255,255,0.15) 1px, transparent 1px),
                linear-gradient(0deg, rgba(255,0,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '100px 25px',
              transform: `translateX(${-cameraX % 100}px)`,
            }}
          />
          
          {/* Top edge - neon glow on concrete */}
          <div 
            className="absolute top-0 left-0 right-0"
            style={{
              height: 3,
              background: 'linear-gradient(90deg, rgba(0,255,255,0.4), rgba(255,0,255,0.6), rgba(0,255,255,0.4))',
              boxShadow: '0 0 12px rgba(0,255,255,0.5), 0 2px 15px rgba(255,0,255,0.3)',
            }}
          />
          
          {/* Puddle reflections */}
          <div 
            className="absolute opacity-20"
            style={{
              width: 60,
              height: 8,
              background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.4), transparent)',
              left: `${(200 - cameraX % 400)}px`,
              top: 15,
              borderRadius: '50%',
              filter: 'blur(2px)',
            }}
          />
          <div 
            className="absolute opacity-15"
            style={{
              width: 40,
              height: 6,
              background: 'linear-gradient(90deg, transparent, rgba(255,0,255,0.3), transparent)',
              left: `${(350 - cameraX % 500)}px`,
              top: 25,
              borderRadius: '50%',
              filter: 'blur(2px)',
            }}
          />
          
          {/* Gift blocks flying INSIDE the floor section */}
          {giftBlocks.map(block => {
            const blockScreenX = block.x - cameraX;
            // Only render if on screen
            if (blockScreenX < -100 || blockScreenX > 900) return null;
            
            return (
              <motion.div
                key={block.id}
                className="absolute z-30 flex flex-col items-center pointer-events-none"
                style={{
                  left: blockScreenX,
                  top: block.y, // INSIDE the floor (top of floor section)
                }}
                initial={{ scale: 0, opacity: 0, x: -50 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  scale: { duration: 0.2 },
                  opacity: { duration: 0.15 },
                }}
              >
                {/* Glowing gift box container */}
                <motion.div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,0,255,0.9), rgba(0,255,255,0.9))',
                    boxShadow: '0 0 15px rgba(255,0,255,0.8), 0 0 30px rgba(0,255,255,0.6)',
                    border: '2px solid rgba(255,255,255,0.8)',
                  }}
                  animate={{
                    rotate: [-3, 3, -3],
                    y: [-2, 2, -2],
                  }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                >
                  {block.emoji}
                </motion.div>
                {/* Username label */}
                <div 
                  className="absolute -bottom-4 text-[8px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded"
                  style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: '#00ffff',
                    textShadow: '0 0 5px #00ffff',
                  }}
                >
                  {block.username.slice(0, 8)}
                </div>
                {/* Trail effect */}
                <motion.div
                  className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-4 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,0,255,0.5))',
                    filter: 'blur(3px)',
                  }}
                />
              </motion.div>
            );
          })}
        </div>
        
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
