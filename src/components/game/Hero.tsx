import { motion } from 'framer-motion';
import { Player, SpeechBubble } from '@/types/game';

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
  
  // Character dimensions - BIGGER and FATTER
  const heroWidth = 90;
  const heroHeight = 100;
  
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
                width: 80 + i * 40,
                height: 80 + i * 40,
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
        >
          <div 
            className="absolute inset-0 rounded-full opacity-50"
            style={{
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpolygon points='10,0 20,5 20,15 10,20 0,15 0,5' fill='none' stroke='%2300ffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      )}
      
      {/* FAT MAN WITH BIG NOSE - 3D-ish Premium Character */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          y: isIdle ? [0, -4, 0] : 0,
          scaleX: player.facingRight ? -1 : 1, // FACE LEFT (towards enemies)
        }}
        transition={{
          y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* Shadow under character */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full opacity-40"
          style={{ background: 'radial-gradient(ellipse, #000, transparent)' }}
        />
        
        {/* Body - Fat round shape with 3D gradient */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 70,
            height: 75,
            background: isUltraMode 
              ? 'linear-gradient(135deg, #ff00ff, #8800ff, #ff00ff)'
              : 'linear-gradient(135deg, #ffd699, #ffb347, #ff8c00)',
            boxShadow: isUltraMode
              ? '0 4px 20px rgba(255,0,255,0.6), inset -10px -10px 30px rgba(0,0,0,0.3), inset 10px 10px 30px rgba(255,255,255,0.3)'
              : '0 4px 15px rgba(0,0,0,0.4), inset -10px -10px 30px rgba(0,0,0,0.2), inset 10px 10px 30px rgba(255,255,255,0.4)',
            border: '3px solid',
            borderColor: isUltraMode ? '#ff00ff' : '#cc7000',
          }}
          animate={player.animationState === 'run' ? { 
            scaleX: [1, 1.05, 1],
            scaleY: [1, 0.95, 1],
          } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          {/* Belly highlight */}
          <div 
            className="absolute top-4 left-4 w-8 h-8 rounded-full opacity-40"
            style={{ background: 'radial-gradient(ellipse, #fff, transparent)' }}
          />
          
          {/* Belly button */}
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3 h-4 rounded-full"
            style={{ background: '#cc6600' }}
          />
        </motion.div>
        
        {/* Head - Round with 3D effect */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 55,
            height: 50,
            background: isUltraMode
              ? 'linear-gradient(135deg, #ff66ff, #cc00cc)'
              : 'linear-gradient(135deg, #ffe4c9, #ffd4a3, #ffb870)',
            boxShadow: isUltraMode
              ? '0 4px 15px rgba(255,0,255,0.5), inset -8px -8px 20px rgba(0,0,0,0.2), inset 8px 8px 20px rgba(255,255,255,0.3)'
              : '0 4px 10px rgba(0,0,0,0.3), inset -8px -8px 20px rgba(0,0,0,0.1), inset 8px 8px 20px rgba(255,255,255,0.4)',
            border: '2px solid',
            borderColor: isUltraMode ? '#ff00ff' : '#cc8844',
          }}
          animate={player.animationState === 'hurt' ? { x: [-3, 3, -3, 0] } : {}}
          transition={{ duration: 0.2 }}
        >
          {/* Eyes */}
          <div className="absolute top-3 left-2 flex gap-4">
            <motion.div 
              className="w-4 h-5 rounded-full bg-white border border-gray-300"
              style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)' }}
            >
              <motion.div 
                className="w-2 h-2 bg-black rounded-full mt-1 ml-1"
                animate={{ x: player.facingRight ? 0 : 1 }}
              />
            </motion.div>
            <motion.div 
              className="w-4 h-5 rounded-full bg-white border border-gray-300"
              style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)' }}
            >
              <motion.div 
                className="w-2 h-2 bg-black rounded-full mt-1 ml-1"
                animate={{ x: player.facingRight ? 0 : 1 }}
              />
            </motion.div>
          </div>
          
          {/* BIG NOSE - The signature feature! */}
          <motion.div
            className="absolute top-5 left-1/2 -translate-x-1/2"
            style={{
              width: 28,
              height: 35,
              background: isUltraMode
                ? 'linear-gradient(135deg, #ff88ff, #dd44dd)'
                : 'linear-gradient(135deg, #ffccaa, #ff9966)',
              borderRadius: '50% 50% 60% 60%',
              boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
              border: '2px solid',
              borderColor: isUltraMode ? '#ff00ff' : '#cc6633',
            }}
            animate={isIdle ? { rotate: [-2, 2, -2] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Nose highlight */}
            <div 
              className="absolute top-1 left-1 w-3 h-3 rounded-full opacity-50"
              style={{ background: 'radial-gradient(ellipse, #fff, transparent)' }}
            />
            {/* Nostrils */}
            <div className="absolute bottom-2 left-2 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-black/30" />
              <div className="w-2 h-2 rounded-full bg-black/30" />
            </div>
          </motion.div>
          
          {/* Mouth - Happy when shooting */}
          <motion.div
            className="absolute bottom-2 left-1/2 -translate-x-1/2"
            style={{
              width: player.isShooting ? 12 : 16,
              height: player.isShooting ? 12 : 6,
              background: '#cc4444',
              borderRadius: player.isShooting ? '50%' : '0 0 50% 50%',
              border: '1px solid #aa3333',
            }}
          />
          
          {/* Eyebrows */}
          <div className="absolute top-1 left-2 flex gap-5">
            <motion.div 
              className="w-4 h-1 bg-amber-800 rounded"
              style={{ transform: 'rotate(-10deg)' }}
              animate={player.animationState === 'attack' ? { rotate: -20 } : {}}
            />
            <motion.div 
              className="w-4 h-1 bg-amber-800 rounded"
              style={{ transform: 'rotate(10deg)' }}
              animate={player.animationState === 'attack' ? { rotate: 20 } : {}}
            />
          </div>
        </motion.div>
        
        {/* Arms */}
        <motion.div
          className="absolute top-14 -left-2 w-5 h-10 rounded-full"
          style={{
            background: isUltraMode
              ? 'linear-gradient(135deg, #ff66ff, #cc00cc)'
              : 'linear-gradient(135deg, #ffd699, #ffb347)',
            border: '2px solid',
            borderColor: isUltraMode ? '#ff00ff' : '#cc7000',
            transformOrigin: 'top center',
          }}
          animate={player.isShooting ? { rotate: -45, x: 5 } : player.animationState === 'run' ? { rotate: [20, -20, 20] } : { rotate: 15 }}
          transition={{ duration: player.animationState === 'run' ? 0.3 : 0.1, repeat: player.animationState === 'run' ? Infinity : 0 }}
        />
        <motion.div
          className="absolute top-14 -right-2 w-5 h-10 rounded-full"
          style={{
            background: isUltraMode
              ? 'linear-gradient(135deg, #ff66ff, #cc00cc)'
              : 'linear-gradient(135deg, #ffd699, #ffb347)',
            border: '2px solid',
            borderColor: isUltraMode ? '#ff00ff' : '#cc7000',
            transformOrigin: 'top center',
          }}
          animate={player.animationState === 'run' ? { rotate: [-20, 20, -20] } : { rotate: -15 }}
          transition={{ duration: 0.3, repeat: player.animationState === 'run' ? Infinity : 0 }}
        />
        
        {/* Legs - Short and stubby */}
        <motion.div
          className="absolute bottom-0 left-4 w-5 h-6 rounded-b-lg"
          style={{
            background: '#333',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.5)',
          }}
          animate={player.animationState === 'run' ? { rotate: [-15, 15, -15], y: [0, -2, 0] } : {}}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-4 w-5 h-6 rounded-b-lg"
          style={{
            background: '#333',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.5)',
          }}
          animate={player.animationState === 'run' ? { rotate: [15, -15, 15], y: [-2, 0, -2] } : {}}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
        
        {/* Shooting muzzle flash */}
        {player.isShooting && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2.5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/3"
          >
            <div 
              className="w-12 h-12 rounded-full"
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
              className="w-full h-full rounded-full"
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
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(135deg, #ff00ff${Math.floor(80 - i * 15).toString(16)}, #00ffff${Math.floor(60 - i * 10).toString(16)})`,
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
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
