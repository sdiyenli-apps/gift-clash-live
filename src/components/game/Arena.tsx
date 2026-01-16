import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '@/types/game';
import { Level } from './Level';
import { Hero } from './Hero';
import { EnemySprite } from './Enemy';
import { ProjectileSprite } from './Projectile';
import { Particles } from './Particles';
import { ChaosElements } from './ChaosElements';

interface ArenaProps {
  gameState: GameState;
}

export const Arena = ({ gameState }: ArenaProps) => {
  const { 
    player, enemies, projectiles, particles, obstacles,
    cameraX, distance, levelLength, isUltraMode, speechBubble,
    combo, comboTimer, isFrozen, isBossFight, screenShake,
    flyingRobots, chickens, neonLights, explosions
  } = gameState;
  
  const shakeX = screenShake ? (Math.random() - 0.5) * screenShake * 10 : 0;
  const shakeY = screenShake ? (Math.random() - 0.5) * screenShake * 10 : 0;
  
  return (
    <div 
      className="relative w-full h-full rounded-xl overflow-hidden border-2"
      style={{
        borderColor: isBossFight ? '#ff0000' : isUltraMode ? '#ff00ff' : '#333366',
        boxShadow: isBossFight 
          ? '0 0 60px #ff0000, inset 0 0 100px rgba(255,0,0,0.3)' 
          : isUltraMode 
            ? '0 0 50px #ff00ff, inset 0 0 100px rgba(255,0,255,0.2)' 
            : '0 0 30px rgba(0, 255, 255, 0.2)',
        minHeight: 480,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <div 
        className="absolute inset-0"
        style={{ 
          height: 480,
          filter: isUltraMode ? 'saturate(1.5) contrast(1.2)' : 'none',
        }}
      >
        <Level 
          obstacles={obstacles} 
          cameraX={cameraX}
          distance={distance}
          levelLength={levelLength}
          isUltraMode={isUltraMode}
        />
        
        {projectiles.map(proj => (
          <ProjectileSprite key={proj.id} projectile={proj} cameraX={cameraX} />
        ))}
        
        {enemies.map(enemy => (
          <EnemySprite key={enemy.id} enemy={enemy} cameraX={cameraX} />
        ))}
        
        <Hero player={player} cameraX={cameraX} isUltraMode={isUltraMode} speechBubble={speechBubble} />
        
        <Particles particles={particles} cameraX={cameraX} />
        
        {/* Chaos Elements - Flying robots, chickens, neon lights, explosions */}
        <ChaosElements 
          flyingRobots={flyingRobots} 
          chickens={chickens} 
          neonLights={neonLights} 
          explosions={explosions} 
          cameraX={cameraX} 
        />
        
        {/* Combo display */}
        {combo > 1 && comboTimer > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-20 right-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="font-bold text-4xl"
              style={{ color: '#ff00ff', textShadow: '0 0 20px #ff00ff' }}
            >
              {combo}x COMBO!
            </motion.div>
          </motion.div>
        )}
        
        {/* Frozen overlay */}
        <AnimatePresence>
          {isFrozen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-cyan-500/20 z-30 flex items-center justify-center"
            >
              <motion.span
                className="text-6xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ❄️
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Ultra mode overlay */}
        {isUltraMode && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(255,0,255,0.3) 100%)' }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }}
      />
    </div>
  );
};
