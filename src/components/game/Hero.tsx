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
  // Fixed screen position - hero on LEFT side in the movement zone
  const screenX = 60; // Left side of arena
  const isEmpowered = isUltraMode || player.isMagicDashing;
  const isSlashing = player.isAutoSlashing || player.animationState === 'sword_slash';
  const isWalking = player.animationState === 'run' || player.animationState === 'dash';
  const isShooting = player.isShooting;

  // Hero sized LARGER for visibility - Metal Slug style proportions
  const heroWidth = 80;
  const heroHeight = 85;
  
  // Hero positioned lower on ground (reduced from 110)
  const flyingHeight = player.isMagicDashing ? 250 : 95; // Lower ground position

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
      
      {/* Hero Character - Captain Squirbert with walking animation */}
      <motion.div
        className="relative w-full h-full"
      >
        {/* Shadow */}
        <motion.div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full opacity-40"
          style={{ 
            background: 'radial-gradient(ellipse, #000, transparent)',
            width: 50,
            height: 10,
          }}
          animate={{
            scaleX: isWalking ? [1, 0.9, 1] : 1,
          }}
          transition={{ duration: 0.25, repeat: Infinity }}
        />
        
        {/* Captain Squirbert Image with Walking Animation */}
        <motion.div
          className="relative w-full h-full overflow-hidden rounded-lg"
          style={{
            filter: isUltraMode || player.isMagicDashing
              ? 'drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 35px #00ffff) brightness(1.2)' 
              : 'drop-shadow(0 0 12px #00ccff) drop-shadow(0 0 20px #0088ff)',
          }}
          animate={
            player.animationState === 'hurt' 
              ? { x: [-3, 3, -3, 0] } 
              : isWalking || isEmpowered
                ? { 
                    y: [0, -4, 0], // Bobbing up and down
                    rotate: [-2, 2, -2], // Slight rotation for walking feel
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
              // Hero faces right (GIF already faces right direction)
            }}
            // Walking/running animation - bob and lean
            animate={
              isShooting 
                ? { scaleX: [1, 0.95, 1], x: [-2, 0] } // Recoil on shoot
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
          
          {/* Magic dash overlay */}
          {player.isMagicDashing && (
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,0,255,0.3), transparent)',
                mixBlendMode: 'screen',
              }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 0.15, repeat: Infinity }}
            />
          )}
        </motion.div>
        
      {/* Shooting muzzle flash - FROM ARMOR/CHEST POSITION */}
      {player.isShooting && (
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