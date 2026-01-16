import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Projectile } from '@/types/game';
import { BackgroundVideo } from './BackgroundVideo';
import { Hero } from './Hero';
import { EnemySprite } from './Enemy';
import { ProjectileSprite, EnemyLaserSprite, FireballSprite } from './Projectile';
import { Particles } from './Particles';
import { ChaosElements } from './ChaosElements';
import { Princess } from './Princess';
import { BossHUD } from './BossHUD';
import { MiniMap } from './MiniMap';

interface ExtendedGameState extends GameState {
  fireballs?: { id: string; x: number; y: number; velocityX: number; velocityY: number; damage: number }[];
  redFlash?: number;
  armorTimer?: number;
  enemyLasers?: Projectile[];
  magicFlash?: number;
  bossTaunt?: string | null;
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
    fireballs = [], redFlash = 0, armorTimer = 0, enemyLasers = [],
    magicFlash = 0, bossTaunt = null, currentWave
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
          bossName={bossEnemy.bossPhase === 3 ? "NIGHTMARE TERROR" : bossEnemy.bossPhase === 2 ? "EVOLVED TERROR" : "BIOMECH TERROR"}
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
        </div>
        
        <Princess
          x={levelLength - 100} 
          cameraX={cameraX} 
          isVisible={!isBossFight && distance > levelLength - 600}
        />
        
        <Particles particles={particles} cameraX={cameraX} />
        
        <ChaosElements 
          flyingRobots={flyingRobots} 
          chickens={chickens} 
          neonLights={neonLights} 
          explosions={explosions} 
          cameraX={cameraX} 
        />
        
        {/* Armor timer */}
        {armorTimer > 0 && (
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
              🛡️ {armorTimer.toFixed(1)}s
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
