import { motion } from 'framer-motion';
import { Player, SpeechBubble } from '@/types/game';
import heroSprite from '@/assets/hero-sprite.png';

interface HeroProps {
  player: Player;
  cameraX: number;
  isUltraMode: boolean;
  speechBubble: SpeechBubble | null;
}

export const Hero = ({ player, cameraX, isUltraMode, speechBubble }: HeroProps) => {
  const screenX = player.x - cameraX;
  
  // Character dimensions - BIG CHUNKY BOY
  const heroWidth = 140;
  const heroHeight = 160;
  
  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: screenX,
        bottom: 480 - player.y - heroHeight,
        width: heroWidth,
        height: heroHeight,
      }}
      animate={{
        scale: isUltraMode ? [1, 1.08, 1] : 1,
        rotate: player.isShooting ? [-3, 3, 0] : 0,
      }}
      transition={{
        duration: isUltraMode ? 0.15 : 0.1,
        repeat: isUltraMode ? Infinity : 0,
      }}
    >
      {/* Speech bubble */}
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-28 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
        >
          <div 
            className="px-4 py-3 rounded-2xl text-sm font-bold shadow-xl relative"
            style={{
              background: speechBubble.type === 'help' 
                ? 'linear-gradient(135deg, #ff6b6b, #ff8888)' 
                : speechBubble.type === 'funny'
                ? 'linear-gradient(135deg, #ffee00, #ffaa00)'
                : speechBubble.type === 'urgent'
                ? 'linear-gradient(135deg, #ff0000, #ff4400)'
                : 'linear-gradient(135deg, #fff, #f0f0f0)',
              color: ['help', 'urgent'].includes(speechBubble.type) ? '#fff' : '#333',
              boxShadow: '0 6px 30px rgba(0,0,0,0.4)',
              animation: speechBubble.type === 'help' ? 'pulse 0.5s infinite' : 'none',
              maxWidth: 280,
            }}
          >
            {speechBubble.text}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
              style={{
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: speechBubble.type === 'help' 
                  ? '12px solid #ff6b6b' 
                  : speechBubble.type === 'urgent'
                  ? '12px solid #ff0000'
                  : '12px solid white',
              }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Ultra mode EPIC glow aura */}
      {isUltraMode && (
        <>
          <motion.div 
            className="absolute -inset-16 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,0,255,0.7) 0%, rgba(0,255,255,0.5) 40%, transparent 70%)',
              filter: 'blur(25px)',
            }}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 0.25, repeat: Infinity }}
          />
          {/* Lightning bolts */}
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 w-1 h-20"
              style={{
                background: 'linear-gradient(180deg, #ff00ff, #00ffff)',
                transformOrigin: 'center bottom',
                rotate: `${i * 90}deg`,
                filter: 'blur(1px)',
              }}
              animate={{ 
                scaleY: [0.5, 1.2, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{ 
                duration: 0.2,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </>
      )}
      
      {/* Shield bubble effect */}
      {player.shield > 0 && (
        <motion.div
          className="absolute -inset-8 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.15) 0%, rgba(0,255,255,0.4) 80%, rgba(0,255,255,0.6) 100%)',
            border: '4px solid #00ffff',
            boxShadow: '0 0 40px #00ffff, inset 0 0 40px rgba(0, 255, 255, 0.4)',
            opacity: Math.min(1, player.shield / 50),
          }}
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 3, -3, 0],
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
      
      {/* THE HERO - CUTOUT SPRITE */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          scaleX: player.facingRight ? 1 : -1,
          y: player.animationState === 'run' ? [0, -5, 0] : 0,
        }}
        transition={{
          y: { duration: 0.15, repeat: player.animationState === 'run' ? Infinity : 0 },
        }}
      >
        {/* Shadow under character */}
        <motion.div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full opacity-50"
          style={{ 
            background: 'radial-gradient(ellipse, #000, transparent)',
            width: player.isGrounded ? 100 : 60,
            height: 12,
          }}
          animate={{ scale: player.isGrounded ? [1, 1.05, 1] : 0.6 }}
        />
        
        {/* The Cutout Hero Character */}
        <motion.div
          className="relative w-full h-full"
          style={{
            filter: isUltraMode 
              ? 'drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 40px #00ffff) brightness(1.2)' 
              : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
          }}
          animate={player.animationState === 'hurt' ? { x: [-8, 8, -8, 0] } : {}}
          transition={{ duration: 0.15 }}
        >
          <motion.img
            src={heroSprite}
            alt="Hero"
            className="w-full h-full object-contain"
            animate={{
              rotate: player.animationState === 'dash' ? -10 : 
                      player.animationState === 'jump' ? -5 :
                      player.isShooting ? 3 : 0,
              scale: player.animationState === 'attack' ? 1.05 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
          
          {/* Damage flash overlay */}
          {player.animationState === 'hurt' && (
            <motion.div
              className="absolute inset-0 bg-red-500/60 rounded-full"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
          
          {/* Ultra mode overlay glow */}
          {isUltraMode && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,0,255,0.3), transparent)',
                mixBlendMode: 'screen',
              }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
          )}
        </motion.div>
        
        {/* Shooting muzzle flash - from gun position */}
        {player.isShooting && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 3 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-1/3"
            style={{ right: -10 }}
          >
            <div 
              className="w-20 h-20 rounded-full"
              style={{
                background: isUltraMode 
                  ? 'radial-gradient(circle, #ff00ff, #00ffff, transparent)'
                  : 'radial-gradient(circle, #ffff00, #ff8800, transparent)',
                boxShadow: isUltraMode
                  ? '0 0 50px #ff00ff, 0 0 100px #00ffff'
                  : '0 0 40px #ffff00, 0 0 80px #ff8800',
              }}
            />
          </motion.div>
        )}
        
        {/* Laser beam trail when shooting */}
        {player.isShooting && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/3 h-3"
            style={{ 
              left: heroWidth - 10, 
              width: 400,
              background: isUltraMode
                ? 'linear-gradient(90deg, #ff00ff, #00ffff, transparent)'
                : 'linear-gradient(90deg, #ffff00, #ff6600, transparent)',
              transformOrigin: 'left center',
              filter: 'blur(2px)',
            }}
          />
        )}
        
        {/* Jump dust cloud */}
        {!player.isGrounded && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 2.5, y: 40 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
          >
            <div className="flex gap-2">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 rounded-full bg-gray-400/70"
                  initial={{ opacity: 0.9 }}
                  animate={{ 
                    opacity: 0,
                    y: 20 + i * 8,
                    x: (i - 3.5) * 15,
                  }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Dash trail effect */}
        {player.isDashing && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`dash-${i}`}
                className="absolute inset-0"
                initial={{ opacity: 0.6, x: 0 }}
                animate={{ opacity: 0, x: -30 - i * 15 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <img 
                  src={heroSprite} 
                  alt="" 
                  className="w-full h-full object-contain"
                  style={{ 
                    filter: `blur(${i * 2}px) hue-rotate(${i * 30}deg)`,
                    opacity: 0.5 - i * 0.08,
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
      
      {/* Ultra mode afterimage trail */}
      {isUltraMode && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`ultra-trail-${i}`}
              className="absolute inset-0"
              style={{
                opacity: 0.5 - i * 0.12,
                filter: `blur(${i * 3}px)`,
              }}
              animate={{
                x: -20 - i * 12,
                opacity: [0.5 - i * 0.12, 0],
              }}
              transition={{
                duration: 0.25,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            >
              <img 
                src={heroSprite} 
                alt="" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'hue-rotate(280deg) saturate(2)',
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Speed lines when moving fast */}
      {(player.isDashing || player.speedMultiplier > 1) && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`speed-${i}`}
              className="absolute h-0.5"
              style={{
                background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                width: 80 + Math.random() * 40,
                top: 20 + i * 30,
                right: heroWidth,
              }}
              animate={{
                x: [-50, -150],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
