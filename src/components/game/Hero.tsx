import { motion } from 'framer-motion';
import { Player, SpeechBubble } from '@/types/game';
import heroSprite from '@/assets/hero-sprite.gif';

interface HeroProps {
  player: Player;
  cameraX: number;
  isUltraMode: boolean;
  speechBubble: SpeechBubble | null;
}

export const Hero = ({ player, cameraX, isUltraMode, speechBubble }: HeroProps) => {
  // Fixed screen position - hero on LEFT side
  const screenX = 60;
  const isEmpowered = isUltraMode || player.isMagicDashing;
  const isSlashing = player.isAutoSlashing || player.animationState === 'sword_slash';
  const isWalking = player.animationState === 'run' || player.animationState === 'dash';
  const isShooting = player.isShooting;
  
  // Check if hero is in spaceship mode (during magic dash/ULT)
  const isSpaceshipMode = player.isMagicDashing;

  // Hero sized LARGER for visibility - Metal Slug style proportions
  const heroWidth = isSpaceshipMode ? 100 : 80;
  const heroHeight = isSpaceshipMode ? 60 : 85;
  
  // Hero positioned lower on ground (reduced to 85), flies high in spaceship mode
  const flyingHeight = isSpaceshipMode ? 200 : 85;

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
        scale: isEmpowered ? [1, 1.04, 1] : isSlashing ? [1, 1.1, 1] : 1,
        rotate: isSlashing ? [0, 8, 0] : player.isShooting ? [-1, 1, 0] : 0,
      }}
      transition={{
        bottom: { duration: 0.5, ease: 'easeOut' }, // Smooth fly up/down
        duration: isSlashing ? 0.15 : isUltraMode ? 0.12 : 0.08,
        repeat: isEmpowered ? Infinity : 0,
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
      
      {/* Shield bubble */}
      {player.shield > 0 && (
        <div
          className="absolute -inset-3 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.3) 100%)',
            border: '2px solid #00ffff',
            boxShadow: '0 0 12px #00ffff, 0 0 24px rgba(0,255,255,0.5)',
            opacity: Math.min(1, player.shield / 50),
          }}
        />
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
        
        {/* SPACESHIP MODE - Transforms hero into a spaceship during ULT */}
        {isSpaceshipMode ? (
          <motion.div
            className="relative w-full h-full"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            {/* Spaceship body */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #00ffff 0%, #0088ff 30%, #4400ff 60%, #ff00ff 100%)',
                clipPath: 'polygon(100% 50%, 70% 15%, 20% 20%, 0% 50%, 20% 80%, 70% 85%)',
                boxShadow: '0 0 30px #00ffff, 0 0 60px #ff00ff',
              }}
            />
            {/* Cockpit */}
            <div
              className="absolute rounded-full"
              style={{
                width: '30%',
                height: '40%',
                left: '50%',
                top: '30%',
                background: 'radial-gradient(circle, #fff 0%, #00ffff 50%, #0066ff 100%)',
                boxShadow: 'inset 0 0 10px #fff, 0 0 15px #00ffff',
              }}
            />
            {/* Engine glow */}
            <motion.div
              className="absolute"
              style={{
                left: -20,
                top: '35%',
                width: 40,
                height: '30%',
                background: 'linear-gradient(90deg, transparent, #ff00ff, #ffff00, #fff)',
                filter: 'blur(4px)',
                borderRadius: 10,
              }}
              animate={{ 
                scaleX: [1, 1.5, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 0.1, repeat: Infinity }}
            />
            {/* Wing lights */}
            {[0, 1].map(i => (
              <motion.div
                key={`wing-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  right: '25%',
                  top: i === 0 ? '15%' : '75%',
                  background: '#ff0000',
                  boxShadow: '0 0 10px #ff0000',
                }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
            {/* Hero inside cockpit (tiny) */}
            <img
              src={heroSprite}
              alt="Hero"
              className="absolute"
              style={{
                width: 20,
                height: 25,
                left: '52%',
                top: '28%',
                transform: 'translateX(-50%)',
                filter: 'brightness(1.2)',
                imageRendering: 'pixelated',
              }}
            />
            {/* Energy trail */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`trail-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 10 - i * 1.5,
                  height: 10 - i * 1.5,
                  left: -15 - i * 12,
                  top: '45%',
                  background: i % 2 === 0 ? '#ff00ff' : '#00ffff',
                  filter: 'blur(2px)',
                }}
                animate={{ 
                  x: [0, -20],
                  opacity: [0.8, 0],
                  scale: [1, 0.5],
                }}
                transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.03 }}
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
              🚀 SPACESHIP MODE 🚀
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
        
        {/* Shooting muzzle flash - FROM ARMOR/CHEST POSITION */}
        {player.isShooting && !isSpaceshipMode && (
        <>
          {/* Muzzle flash at armor */}
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.1 }}
            className="absolute"
            style={{ 
              right: -20, 
              top: '45%', // Center of armor/chest
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
            
            {/* Energy rings */}
            {[0, 1].map(i => (
              <motion.div
                key={`ring-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  right: -10,
                  top: '35%',
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