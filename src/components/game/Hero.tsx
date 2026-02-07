import { motion } from 'framer-motion';
import { Player, SpeechBubble } from '@/types/game';
import heroSprite from '@/assets/hero-sprite.gif';
import spaceshipSprite from '@/assets/hero-spaceship.gif';
import armorShieldGif from '@/assets/armor-shield.gif';
import ultBackgroundGif from '@/assets/ult-background.gif';

interface HeroProps {
  player: Player;
  cameraX: number;
  isUltraMode: boolean;
  speechBubble: SpeechBubble | null;
  damageMultiplier?: number;
}

// Get power-up visual style based on multiplier
const getPowerUpStyle = (multiplier: number) => {
  if (multiplier >= 3.0) return { 
    glowColor: '#ff00ff', 
    intensity: 'legendary',
    pulseSpeed: 0.15,
    auraSize: 25,
  };
  if (multiplier >= 2.5) return { 
    glowColor: '#ff4400', 
    intensity: 'mythic',
    pulseSpeed: 0.2,
    auraSize: 20,
  };
  if (multiplier >= 2.0) return { 
    glowColor: '#ff6600', 
    intensity: 'ultra',
    pulseSpeed: 0.25,
    auraSize: 15,
  };
  if (multiplier >= 1.5) return { 
    glowColor: '#ffaa00', 
    intensity: 'super',
    pulseSpeed: 0.3,
    auraSize: 10,
  };
  return null;
};

export const Hero = ({ player, cameraX, isUltraMode, speechBubble, damageMultiplier = 1 }: HeroProps) => {
  // Fixed screen position - hero on LEFT side (moved slightly left)
  const screenX = 50;
  const isEmpowered = isUltraMode || player.isMagicDashing;
  const isSlashing = player.isAutoSlashing || player.animationState === 'sword_slash';
  const isWalking = player.animationState === 'run' || player.animationState === 'dash';
  const isShooting = player.isShooting;
  const isFlipAttacking = player.isFlipAttacking || player.animationState === 'flip_attack';
  
  // Check if hero is in spaceship mode (during magic dash/ULT)
  const isSpaceshipMode = player.isMagicDashing;

  // Hero sized LARGER for visibility - Metal Slug style proportions (slightly bigger)
  const heroWidth = isSpaceshipMode ? 110 : 90;
  const heroHeight = isSpaceshipMode ? 70 : 95;
  
  // DYNAMIC VERTICAL MOVEMENT - Hero bobs up and down as they progress through the level
  // Creates an organic, upbeat running feel
  const progressBob = Math.sin(player.x * 0.03) * 8; // Bob based on position
  const runningBob = isWalking ? Math.sin(Date.now() * 0.02) * 4 : 0; // Extra bob when moving
  
  // Hero positioned lower on ground (reduced to 85), flies high in spaceship mode, jumps during flip
  const flipProgress = player.flipAttackTimer ? (1.2 - player.flipAttackTimer) / 1.2 : 0;
  const flipJumpHeight = isFlipAttacking ? Math.sin(flipProgress * Math.PI) * 120 : 0;
  const baseHeight = 85 + progressBob + runningBob;
  const flyingHeight = isSpaceshipMode ? 200 : (baseHeight + flipJumpHeight);
  
  // Flip rotation during flip attack
  const flipRotation = isFlipAttacking ? flipProgress * 360 : 0;

  return (
    <motion.div
      className="absolute"
      style={{
        left: screenX,
        width: heroWidth,
        height: heroHeight,
        zIndex: 27, // Hero above enemies/allies
      }}
      animate={{
        bottom: flyingHeight, // Animate flying position
        scale: isFlipAttacking ? 1.3 : isEmpowered ? [1, 1.04, 1] : isSlashing ? [1, 1.1, 1] : 1,
        rotate: isFlipAttacking ? flipRotation : isSlashing ? [0, 8, 0] : player.isShooting ? [-1, 1, 0] : 0,
      }}
      transition={{
        bottom: { duration: isFlipAttacking ? 0.05 : 0.5, ease: 'easeOut' }, // Fast during flip
        duration: isSlashing ? 0.15 : isUltraMode ? 0.12 : 0.08,
        repeat: isEmpowered && !isFlipAttacking ? Infinity : 0,
      }}
    >
      {/* SWORD SLASH EFFECT */}
      {isSlashing && (
        <motion.div
          className="absolute pointer-events-none z-40"
          style={{ right: -40, top: '30%' }}
          initial={{ opacity: 0, rotate: -60, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], rotate: [60, -30], scale: [0.5, 1.3, 1.3, 0.8] }}
          transition={{ duration: 0.2 }}
        >
          <div
            style={{
              width: 60,
              height: 8,
              background: 'linear-gradient(90deg, transparent, #00ffff, #fff, #ffff00)',
              borderRadius: 4,
              boxShadow: '0 0 20px #00ffff, 0 0 40px #ffff00',
              filter: 'blur(1px)',
            }}
          />
        </motion.div>
      )}

      {/* Speech bubble */}
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute -top-16 left-0 z-30"
          style={{ width: 160 }}
        >
          <div 
            className="px-2.5 py-2 rounded-lg text-[10px] font-bold shadow-lg relative leading-tight"
            style={{
              background: speechBubble.type === 'help' 
                ? 'linear-gradient(135deg, #ff6b6b, #ff8888)' 
                : speechBubble.type === 'urgent'
                ? 'linear-gradient(135deg, #ff0000, #ff4400)'
                : 'linear-gradient(135deg, #fff, #f0f0f0)',
              color: ['help', 'urgent'].includes(speechBubble.type) ? '#fff' : '#333',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {speechBubble.text}
            <div 
              className="absolute bottom-0 left-6 translate-y-full w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: speechBubble.type === 'help' 
                  ? '8px solid #ff6b6b' 
                  : '8px solid white',
              }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Magic Dash glow */}
      {player.isMagicDashing && (
        <div 
          className="absolute -inset-6 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,255,0.4) 0%, rgba(0,255,255,0.2) 50%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      )}
      
      {/* POWER-UP AURA based on damage multiplier */}
      {damageMultiplier >= 1.5 && (() => {
        const powerStyle = getPowerUpStyle(damageMultiplier);
        if (!powerStyle) return null;
        return (
          <>
            {/* Outer pulsing aura */}
            <motion.div 
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: -powerStyle.auraSize,
                background: `radial-gradient(circle, ${powerStyle.glowColor}30 0%, ${powerStyle.glowColor}10 50%, transparent 70%)`,
                filter: 'blur(6px)',
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ duration: powerStyle.pulseSpeed * 3, repeat: Infinity }}
            />
            
            {/* Inner power ring */}
            <motion.div 
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: -8,
                border: `2px solid ${powerStyle.glowColor}`,
                boxShadow: `0 0 15px ${powerStyle.glowColor}, inset 0 0 10px ${powerStyle.glowColor}50`,
              }}
              animate={{
                scale: [0.95, 1.05, 0.95],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: powerStyle.pulseSpeed * 2, repeat: Infinity }}
            />
            
            {/* Energy sparks for high multipliers */}
            {damageMultiplier >= 2.0 && (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={`spark-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                    style={{
                      background: powerStyle.glowColor,
                      boxShadow: `0 0 6px ${powerStyle.glowColor}`,
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos(i * Math.PI / 2 + Date.now() / 200) * 35],
                      y: [0, Math.sin(i * Math.PI / 2 + Date.now() / 200) * 35],
                      opacity: [1, 0.3, 1],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{ 
                      duration: 0.5, 
                      repeat: Infinity, 
                      delay: i * 0.12,
                    }}
                  />
                ))}
              </>
            )}
            
            {/* Legendary crown effect */}
            {damageMultiplier >= 3.0 && (
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl pointer-events-none"
                animate={{
                  y: [0, -3, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.4, repeat: Infinity }}
                style={{
                  filter: `drop-shadow(0 0 8px ${powerStyle.glowColor})`,
                }}
              >
                👑
              </motion.div>
            )}
          </>
        );
      })()}
      
      {/* Shield bubble - Using electric shield GIF */}
      {player.shield > 0 && (
        <div
          className="absolute -inset-6 pointer-events-none"
          style={{
            opacity: Math.min(1, player.shield / 50),
          }}
        >
          {/* The animated electric shield GIF */}
          <img
            src={armorShieldGif}
            alt="Shield"
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 15px #00ffff) drop-shadow(0 0 30px #00aaff) brightness(1.2)',
              mixBlendMode: 'screen',
            }}
          />
          {/* Extra glow layer */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle, rgba(0,255,255,0.2) 0%, transparent 70%)',
            }}
          />
        </div>
      )}
      
      {/* Hero Character - Normal or SPACESHIP mode during ULT */}
      <motion.div
        className="relative w-full h-full"
      >
        {/* Shadow - smaller during spaceship mode */}
        <motion.div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full opacity-40"
          style={{ 
            background: 'radial-gradient(ellipse, #000, transparent)',
            width: isSpaceshipMode ? 70 : 50,
            height: isSpaceshipMode ? 15 : 10,
          }}
          animate={{
            scaleX: isWalking || isSpaceshipMode ? [1, 0.9, 1] : 1,
          }}
          transition={{ duration: 0.25, repeat: Infinity }}
        />
        
        {/* SPACESHIP MODE - Transforms hero into spaceship using asset during ULT */}
        {isSpaceshipMode ? (
          <motion.div
            className="relative w-full h-full"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            {/* ULT BACKGROUND EFFECT - Hyperspeed lines behind spaceship */}
            <motion.div
              className="absolute pointer-events-none z-0"
              style={{
                left: -400,
                top: -100,
                width: 800,
                height: 300,
              }}
            >
              <img
                src={ultBackgroundGif}
                alt="Hyperspeed"
                className="w-full h-full object-cover"
                style={{
                  filter: 'brightness(1.2)',
                  mixBlendMode: 'screen',
                  opacity: 0.7,
                }}
              />
            </motion.div>
            {/* Spaceship sprite image */}
            <motion.img
              src={spaceshipSprite}
              alt="Spaceship"
              className="w-full h-full object-contain"
              style={{
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 0 15px #00ffff) drop-shadow(0 0 25px #ff00ff)',
              }}
              animate={{
                y: [0, -3, 0],
                scaleX: [1, 1.02, 1], // Slight pulse when "attacking"
              }}
              transition={{ duration: 0.15, repeat: Infinity }}
            />
            
            {/* CONTINUOUS ATTACK EFFECT - Rapid fire lasers from front */}
            <motion.div
              className="absolute"
              style={{
                right: -50,
                top: '40%',
                width: 60,
                height: 8,
                background: 'linear-gradient(90deg, #ff00ff, #fff, #00ffff)',
                boxShadow: '0 0 15px #ff00ff, 0 0 30px #00ffff',
                filter: 'blur(1px)',
                borderRadius: 4,
              }}
              animate={{ 
                scaleX: [0.5, 1.5, 0.5],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 0.08, repeat: Infinity }}
            />
            
            {/* Secondary laser beam */}
            <motion.div
              className="absolute"
              style={{
                right: -30,
                top: '50%',
                width: 45,
                height: 5,
                background: 'linear-gradient(90deg, #00ffff, #fff, #ff00ff)',
                boxShadow: '0 0 10px #00ffff',
                filter: 'blur(1px)',
                borderRadius: 3,
              }}
              animate={{ 
                scaleX: [0.7, 1.2, 0.7],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 0.1, repeat: Infinity, delay: 0.05 }}
            />
            
            {/* Muzzle flash at front */}
            <motion.div
              className="absolute rounded-full"
              style={{
                right: -20,
                top: '40%',
                width: 20,
                height: 20,
                background: 'radial-gradient(circle, #fff, #ff00ff, transparent)',
                boxShadow: '0 0 20px #ff00ff',
              }}
              animate={{ 
                scale: [0.8, 1.5, 0.8],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 0.06, repeat: Infinity }}
            />
            
            {/* Engine boost trail behind spaceship */}
            <motion.div
              className="absolute"
              style={{
                left: -25,
                top: '35%',
                width: 35,
                height: '30%',
                background: 'linear-gradient(90deg, transparent, #00ffff, #fff)',
                filter: 'blur(4px)',
                borderRadius: 10,
              }}
              animate={{ 
                scaleX: [1, 1.8, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 0.08, repeat: Infinity }}
            />
            {/* Energy trail particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`trail-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 8 - i,
                  height: 8 - i,
                  left: -10 - i * 10,
                  top: '42%',
                  background: i % 2 === 0 ? '#00ffff' : '#ff00ff',
                  filter: 'blur(2px)',
                }}
                animate={{ 
                  x: [0, -25],
                  opacity: [0.9, 0],
                  scale: [1, 0.3],
                }}
                transition={{ duration: 0.15, repeat: Infinity, delay: i * 0.025 }}
              />
            ))}
            {/* ULT MODE text */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-xs px-2 py-0.5 rounded"
              style={{
                background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
                color: '#fff',
                textShadow: '0 0 5px #000',
                boxShadow: '0 0 15px #ff00ff',
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              🚀 ATTACKING! 🔥
            </motion.div>
          </motion.div>
        ) : (
          /* Normal Hero - Captain Squirbert Image with Walking Animation */
          <motion.div
            className="relative w-full h-full overflow-hidden rounded-lg"
            style={{
              filter: isUltraMode
                ? 'drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 35px #00ffff) brightness(1.2)' 
                : 'drop-shadow(0 0 12px #00ccff) drop-shadow(0 0 20px #0088ff)',
            }}
            animate={
              player.animationState === 'hurt' 
                ? { x: [-3, 3, -3, 0] } 
                : isWalking || isEmpowered
                  ? { 
                      y: [0, -4, 0],
                      rotate: [-2, 2, -2],
                    }
                  : {}
            }
            transition={
              isWalking || isEmpowered
                ? { duration: 0.25, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.1 }
            }
          >
            <motion.img
              src={heroSprite}
              alt="Hero"
              className="w-full h-full object-contain"
              style={{
                imageRendering: 'pixelated',
              }}
              // Walking/running animation - bob and lean
              animate={
                isShooting 
                  ? { scaleX: [1, 0.95, 1], x: [-2, 0] }
                  : isWalking || isEmpowered
                    ? {
                        scaleY: [1, 0.97, 1],
                        scaleX: [1, 1.03, 1],
                        rotate: [-1, 1, -1],
                      }
                    : { scaleY: 1, scaleX: 1 }
              }
              transition={{ 
                duration: isShooting ? 0.1 : 0.15, 
                repeat: isShooting ? 0 : Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Power glow overlay */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                background: isEmpowered
                  ? 'radial-gradient(ellipse at center, rgba(255,0,255,0.2) 0%, transparent 60%)'
                  : 'radial-gradient(ellipse at center, transparent 40%, rgba(0,200,255,0.1) 100%)',
                mixBlendMode: 'overlay',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            
            {/* Damage flash */}
            {player.animationState === 'hurt' && (
              <motion.div
                className="absolute inset-0 bg-red-500/50 rounded-lg"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              />
            )}
          </motion.div>
        )}
        
        {/* Shooting muzzle flash - FROM TORSO/CENTER POSITION */}
        {player.isShooting && !isSpaceshipMode && (
        <>
          {/* Muzzle flash at torso center */}
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.1 }}
            className="absolute"
            style={{ 
              right: -20, 
              top: '50%', // Exact center/torso
              transform: 'translateY(-50%)',
            }}
          >
              <div 
                className="w-10 h-10 rounded-full"
                style={{
                  background: player.isMagicDashing 
                    ? 'radial-gradient(circle, #fff, #ff00ff, #00ffff, transparent)'
                    : 'radial-gradient(circle, #fff, #00ffff, #0066ff, transparent)',
                  boxShadow: player.isMagicDashing
                    ? '0 0 25px #ff00ff, 0 0 45px #00ffff'
                    : '0 0 20px #00ffff, 0 0 35px #0088ff',
                }}
              />
            </motion.div>
            
            {/* Energy rings from torso */}
            {[0, 1].map(i => (
              <motion.div
                key={`ring-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  right: -10,
                  top: '50%', // Torso center
                  transform: 'translateY(-50%)',
                  width: 12,
                  height: 12,
                  borderColor: player.isMagicDashing ? '#ff00ff' : '#00ffff',
                }}
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 3 + i, opacity: 0 }}
                transition={{ duration: 0.15, delay: i * 0.05 }}
              />
            ))}
          </>
        )}
        
        {/* REMOVED LASER BEAM LINE - Now only projectiles show */}
        
        {/* Magic dash trail */}
        {player.isMagicDashing && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`dash-${i}`}
                className="absolute inset-0 overflow-hidden rounded-lg"
                initial={{ opacity: 0.4, x: 0 }}
                animate={{ opacity: 0, x: -15 - i * 8 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
              >
                <img 
                  src={heroSprite}
                  alt="Hero trail"
                  className="w-full h-full object-contain"
                  style={{ 
                    filter: `blur(${i * 2}px) hue-rotate(${i * 40}deg)`,
                    opacity: 0.3 - i * 0.08,
                    imageRendering: 'pixelated',
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
      
      {/* Speed lines */}
      {(player.isDashing || player.isMagicDashing || isWalking) && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`speed-${i}`}
              className="absolute h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                width: 20 + Math.random() * 20,
                top: 15 + i * 18,
                right: heroWidth,
              }}
              animate={{
                x: [-10, -50],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                delay: i * 0.03,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};