import { motion } from 'framer-motion';
import { Player, SpeechBubble } from '@/types/game';
import heroVideo from '@/assets/hero-video.mp4';

interface HeroProps {
  player: Player;
  cameraX: number;
  isUltraMode: boolean;
  speechBubble: SpeechBubble | null;
}

export const Hero = ({ player, cameraX, isUltraMode, speechBubble }: HeroProps) => {
  const screenX = player.x - cameraX;
  
  // Compact hero size for mobile
  const heroWidth = 80;
  const heroHeight = 100;
  
  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: screenX,
        bottom: 280 - player.y - heroHeight,
        width: heroWidth,
        height: heroHeight,
      }}
      animate={{
        scale: isUltraMode || player.isMagicDashing ? [1, 1.05, 1] : 1,
        rotate: player.isShooting ? [-2, 2, 0] : 0,
      }}
      transition={{
        duration: isUltraMode ? 0.15 : 0.1,
        repeat: isUltraMode || player.isMagicDashing ? Infinity : 0,
      }}
    >
      {/* Speech bubble */}
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
        >
          <div 
            className="px-2 py-1.5 rounded-xl text-xs font-bold shadow-xl relative"
            style={{
              background: speechBubble.type === 'help' 
                ? 'linear-gradient(135deg, #ff6b6b, #ff8888)' 
                : speechBubble.type === 'urgent'
                ? 'linear-gradient(135deg, #ff0000, #ff4400)'
                : 'linear-gradient(135deg, #fff, #f0f0f0)',
              color: ['help', 'urgent'].includes(speechBubble.type) ? '#fff' : '#333',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              maxWidth: 180,
            }}
          >
            {speechBubble.text}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
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
      
      {/* Magic Dash EPIC glow aura */}
      {player.isMagicDashing && (
        <>
          <motion.div 
            className="absolute -inset-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,0,255,0.6) 0%, rgba(0,255,255,0.4) 40%, transparent 70%)',
              filter: 'blur(15px)',
            }}
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
          {/* Magic sparkles */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 ? '#ff00ff' : '#00ffff',
                left: `${20 + i * 10}%`,
                top: `${10 + (i % 3) * 30}%`,
              }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [-10, -30],
              }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </>
      )}
      
      {/* Shield bubble effect */}
      {player.shield > 0 && (
        <motion.div
          className="absolute -inset-4 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.3) 80%, rgba(0,255,255,0.5) 100%)',
            border: '2px solid #00ffff',
            boxShadow: '0 0 20px #00ffff, inset 0 0 20px rgba(0, 255, 255, 0.3)',
            opacity: Math.min(1, player.shield / 50),
          }}
          animate={{ 
            scale: [1, 1.03, 1],
          }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
      
      {/* THE HERO - VIDEO CHARACTER */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          scaleX: player.facingRight ? 1 : -1,
        }}
      >
        {/* Shadow under character */}
        <motion.div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full opacity-40"
          style={{ 
            background: 'radial-gradient(ellipse, #000, transparent)',
            width: 60,
            height: 8,
          }}
        />
        
        {/* The Video Hero Character */}
        <motion.div
          className="relative w-full h-full overflow-hidden rounded-lg"
          style={{
            filter: isUltraMode || player.isMagicDashing
              ? 'drop-shadow(0 0 15px #ff00ff) drop-shadow(0 0 30px #00ffff) brightness(1.2)' 
              : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
          }}
          animate={player.animationState === 'hurt' ? { x: [-4, 4, -4, 0] } : {}}
          transition={{ duration: 0.15 }}
        >
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{
              transform: player.animationState === 'dash' ? 'rotate(-5deg)' : 
                        player.isShooting ? 'rotate(2deg)' : 'none',
            }}
          />
          
          {/* Damage flash overlay */}
          {player.animationState === 'hurt' && (
            <motion.div
              className="absolute inset-0 bg-red-500/50 rounded-lg"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
          
          {/* Magic dash overlay glow */}
          {player.isMagicDashing && (
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,0,255,0.3), transparent)',
                mixBlendMode: 'screen',
              }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
          )}
        </motion.div>
        
        {/* Shooting muzzle flash */}
        {player.isShooting && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-1/3"
            style={{ right: -8 }}
          >
            <div 
              className="w-10 h-10 rounded-full"
              style={{
                background: player.isMagicDashing 
                  ? 'radial-gradient(circle, #ff00ff, #00ffff, transparent)'
                  : 'radial-gradient(circle, #ffff00, #ff8800, transparent)',
                boxShadow: player.isMagicDashing
                  ? '0 0 30px #ff00ff'
                  : '0 0 20px #ffff00',
              }}
            />
          </motion.div>
        )}
        
        {/* Laser beam trail when shooting */}
        {player.isShooting && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-1/3 h-2"
            style={{ 
              left: heroWidth - 5, 
              width: 200,
              background: player.isMagicDashing
                ? 'linear-gradient(90deg, #ff00ff, #00ffff, transparent)'
                : 'linear-gradient(90deg, #ffff00, #ff6600, transparent)',
              transformOrigin: 'left center',
              filter: 'blur(1px)',
            }}
          />
        )}
        
        {/* Magic dash trail effect */}
        {player.isMagicDashing && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`dash-${i}`}
                className="absolute inset-0 overflow-hidden rounded-lg"
                initial={{ opacity: 0.5, x: 0 }}
                animate={{ opacity: 0, x: -20 - i * 10 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <video 
                  src={heroVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ 
                    filter: `blur(${i * 2}px) hue-rotate(${i * 40}deg)`,
                    opacity: 0.4 - i * 0.1,
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
      
      {/* Speed lines when dashing */}
      {(player.isDashing || player.isMagicDashing) && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`speed-${i}`}
              className="absolute h-0.5"
              style={{
                background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                width: 40 + Math.random() * 20,
                top: 15 + i * 20,
                right: heroWidth,
              }}
              animate={{
                x: [-30, -80],
                opacity: [0.7, 0],
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
