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
  
  // Character dimensions - BIGGER
  const heroWidth = 120;
  const heroHeight = 150;
  
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
        scale: isUltraMode ? [1, 1.15, 1] : 1,
        rotate: player.isShooting ? [-2, 2, 0] : 0,
      }}
      transition={{
        duration: isUltraMode ? 0.2 : 0.1,
        repeat: isUltraMode ? Infinity : 0,
      }}
    >
      {/* Speech bubble */}
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
        >
          <div 
            className="px-4 py-2 rounded-xl text-sm font-bold shadow-xl relative"
            style={{
              background: speechBubble.type === 'help' 
                ? 'linear-gradient(135deg, #ff6b6b, #ff8888)' 
                : speechBubble.type === 'funny'
                ? 'linear-gradient(135deg, #ffee00, #ffaa00)'
                : 'linear-gradient(135deg, #fff, #f0f0f0)',
              color: speechBubble.type === 'help' ? '#fff' : '#333',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              animation: speechBubble.type === 'help' ? 'pulse 0.5s infinite' : 'none',
            }}
          >
            {speechBubble.text}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: speechBubble.type === 'help' ? '10px solid #ff6b6b' : '10px solid white',
              }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Ultra mode glow aura */}
      {isUltraMode && (
        <>
          <motion.div 
            className="absolute -inset-12 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,0,255,0.6) 0%, rgba(0,255,255,0.4) 50%, transparent 70%)',
              filter: 'blur(20px)',
            }}
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          {/* Energy rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                width: 100 + i * 40,
                height: 100 + i * 40,
                borderColor: i % 2 === 0 ? '#ff00ff' : '#00ffff',
              }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.8, 0, 0.8],
                rotate: [0, 180, 360],
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </>
      )}
      
      {/* Shield effect */}
      {player.shield > 0 && (
        <motion.div
          className="absolute -inset-6 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.3) 70%, rgba(0,255,255,0.5) 100%)',
            border: '3px solid #00ffff',
            boxShadow: '0 0 30px #00ffff, inset 0 0 30px rgba(0, 255, 255, 0.3)',
            opacity: player.shield / 100,
          }}
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      
      {/* VIDEO HERO CHARACTER */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          scaleX: player.facingRight ? 1 : -1, // Flip based on direction
        }}
      >
        {/* Shadow under character */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full opacity-50"
          style={{ background: 'radial-gradient(ellipse, #000, transparent)' }}
        />
        
        {/* The Video Character */}
        <motion.div
          className="relative w-full h-full overflow-hidden rounded-lg"
          style={{
            filter: isUltraMode ? 'hue-rotate(280deg) saturate(1.5) brightness(1.2)' : 'none',
            boxShadow: isUltraMode
              ? '0 0 40px rgba(255,0,255,0.8), 0 0 80px rgba(0,255,255,0.5)'
              : '0 8px 32px rgba(0,0,0,0.4)',
          }}
          animate={player.animationState === 'hurt' ? { x: [-5, 5, -5, 0] } : {}}
          transition={{ duration: 0.2 }}
        >
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{
              transform: 'scale(1.1)',
            }}
          />
          
          {/* Overlay effects */}
          {isUltraMode && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,0,255,0.3), rgba(0,255,255,0.3))',
                mixBlendMode: 'overlay',
              }}
            />
          )}
          
          {/* Damage flash */}
          {player.animationState === 'hurt' && (
            <motion.div
              className="absolute inset-0 bg-red-500/50"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
        
        {/* Shooting muzzle flash */}
        {player.isShooting && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2.5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/3"
          >
            <div 
              className="w-16 h-16 rounded-full"
              style={{
                background: isUltraMode 
                  ? 'radial-gradient(circle, #ff00ff, #00ffff, transparent)'
                  : 'radial-gradient(circle, #ffff00, #ff8800, transparent)',
                boxShadow: isUltraMode
                  ? '0 0 40px #ff00ff, 0 0 80px #00ffff'
                  : '0 0 30px #ffff00, 0 0 60px #ff8800',
              }}
            />
          </motion.div>
        )}
        
        {/* Jump dust */}
        {!player.isGrounded && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 2, y: 30 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
          >
            <div className="flex gap-1">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gray-400"
                  initial={{ opacity: 0.8 }}
                  animate={{ 
                    opacity: 0,
                    y: 15 + i * 5,
                    x: (i - 2.5) * 12,
                  }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Dash trail */}
        {player.isDashing && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0.6, x: 0 }}
            animate={{ opacity: 0, x: -50 }}
          >
            <div 
              className="w-full h-full rounded-lg"
              style={{ 
                background: isUltraMode ? '#ff00ff' : '#00ffff',
                filter: 'blur(10px)',
              }}
            />
          </motion.div>
        )}
      </motion.div>
      
      {/* Ultra mode trail effect */}
      {isUltraMode && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`trail-${i}`}
              className="absolute inset-0 rounded-lg overflow-hidden"
              style={{
                opacity: 0.4 - i * 0.08,
                filter: `blur(${i * 2}px)`,
              }}
              animate={{
                x: -15 - i * 8,
                opacity: [0.4 - i * 0.08, 0],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            >
              <video
                src={heroVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{
                  filter: 'hue-rotate(280deg) saturate(1.5)',
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
