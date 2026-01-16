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
  
  // Idle animation state
  const isIdle = player.isGrounded && !player.isShooting;
  
  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: screenX,
        bottom: 480 - player.y - 80,
        width: 64,
        height: 80,
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
          className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
        >
          <div 
            className="px-4 py-2 rounded-xl text-sm font-bold shadow-xl relative"
            style={{
              background: 'linear-gradient(135deg, #fff, #f0f0f0)',
              color: '#333',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            {speechBubble.text}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '10px solid white',
              }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Ultra mode glow aura */}
      {isUltraMode && (
        <>
          <motion.div 
            className="absolute -inset-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,0,255,0.6) 0%, rgba(0,255,255,0.4) 50%, transparent 70%)',
              filter: 'blur(15px)',
            }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          {/* Energy rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                width: 60 + i * 30,
                height: 60 + i * 30,
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
          className="absolute -inset-4 rounded-full"
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
        >
          {/* Shield hex pattern */}
          <div 
            className="absolute inset-0 rounded-full opacity-50"
            style={{
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpolygon points='10,0 20,5 20,15 10,20 0,15 0,5' fill='none' stroke='%2300ffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      )}
      
      {/* Hero sprite image */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          y: isIdle ? [0, -3, 0] : 0,
          scaleX: player.facingRight ? 1 : -1,
        }}
        transition={{
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* Main sprite */}
        <motion.img
          src={heroSprite}
          alt="Hero"
          className="w-full h-full object-contain drop-shadow-lg"
          style={{
            filter: isUltraMode 
              ? 'drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 20px #00ffff) brightness(1.2)' 
              : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))',
          }}
          animate={{
            rotate: player.isJumping ? [-5, 5, -5] : 0,
          }}
          transition={{ duration: 0.3, repeat: player.isJumping ? Infinity : 0 }}
        />
        
        {/* Shooting muzzle flash */}
        {player.isShooting && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-1/2 -translate-y-1/2"
          >
            <div 
              className="w-8 h-8 rounded-full"
              style={{
                background: isUltraMode 
                  ? 'radial-gradient(circle, #ff00ff, #00ffff, transparent)'
                  : 'radial-gradient(circle, #ffff00, #ff8800, transparent)',
                boxShadow: isUltraMode
                  ? '0 0 30px #ff00ff, 0 0 60px #00ffff'
                  : '0 0 20px #ffff00, 0 0 40px #ff8800',
              }}
            />
          </motion.div>
        )}
        
        {/* Jump dust */}
        {!player.isGrounded && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 2, y: 20 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-400"
                  initial={{ opacity: 0.8 }}
                  animate={{ 
                    opacity: 0,
                    y: 10 + i * 5,
                    x: (i - 2) * 10,
                  }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Walking dust particles */}
        {player.isGrounded && !player.isShooting && (
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div className="w-4 h-1 bg-gray-500/50 rounded-full blur-sm" />
          </motion.div>
        )}
      </motion.div>
      
      {/* Ultra mode trail effect */}
      {isUltraMode && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`trail-${i}`}
              className="absolute inset-0"
              style={{
                background: `url(${heroSprite})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                opacity: 0.3 - i * 0.06,
                filter: `hue-rotate(${i * 30}deg) blur(${i}px)`,
              }}
              animate={{
                x: -10 - i * 5,
                opacity: [0.3 - i * 0.06, 0],
              }}
              transition={{
                duration: 0.3,
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
