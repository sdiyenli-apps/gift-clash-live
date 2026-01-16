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

interface NeonLaser {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  bounces: number;
  life: number;
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
    damageFlash = 0, shieldBlockFlash = 0, neonLasers = []
  } = gameState;
  
  const shakeX = screenShake ? (Math.random() - 0.5) * screenShake * 8 : 0;
  const shakeY = screenShake ? (Math.random() - 0.5) * screenShake * 8 : 0;
  
  // Get boss info for HUD
  const bossEnemy = enemies.find(e => e.type === 'boss' && !e.isDying);
  
  return (
    <div 
      className="relative w-full h-full rounded-lg overflow-hidden border-2"
      style={{
        borderColor: isBossFight ? '#ff0000' : player.isMagicDashing ? '#ff00ff' : '#333366',
        boxShadow: isBossFight 
          ? '0 0 30px #ff0000, inset 0 0 40px rgba(255,0,0,0.2)' 
          : player.isMagicDashing 
            ? '0 0 20px #ff00ff, inset 0 0 40px rgba(255,0,255,0.2)' 
            : '0 0 15px rgba(0, 255, 255, 0.2)',
        height: '100%',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        // Better POV - zoom out slightly for wider view
        perspective: '1000px',
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
        
        {enemies.map(enemy => (
          <EnemySprite key={enemy.id} enemy={enemy} cameraX={cameraX} />
        ))}
        
        <Hero player={player} cameraX={cameraX} isUltraMode={isUltraMode} speechBubble={speechBubble} />
        
        {/* Floor that hero walks on */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-20 z-5"
          style={{
            background: 'linear-gradient(180deg, rgba(30,30,50,0.9) 0%, rgba(15,15,30,1) 40%, #0a0a18 100%)',
            borderTop: '3px solid rgba(0, 255, 255, 0.4)',
            boxShadow: '0 -5px 20px rgba(0, 255, 255, 0.2), inset 0 5px 30px rgba(0,0,0,0.5)',
          }}
        >
          {/* Floor grid lines */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(0,255,255,0.15) 1px, transparent 1px),
                linear-gradient(0deg, rgba(0,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 10px',
              transform: `translateX(${-cameraX % 40}px)`,
            }}
          />
          {/* Floor glow */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.6), transparent)',
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
