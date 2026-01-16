import { motion } from 'framer-motion';
import { Player, SpeechBubble } from '@/types/game';
import heroVideo from '@/assets/hero-animated.mp4';

interface HeroProps {
  player: Player;
  cameraX: number;
  isUltraMode: boolean;
  speechBubble: SpeechBubble | null;
}

export const Hero = ({ player, cameraX, isUltraMode, speechBubble }: HeroProps) => {
  const screenX = player.x - cameraX;
  const isEmpowered = isUltraMode || player.isMagicDashing;

  // Character size
  const heroWidth = 60;
  const heroHeight = 75;

  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: screenX,
        bottom: 80,
        width: heroWidth,
        height: heroHeight,
      }}
      animate={{
        scale: isEmpowered ? [1, 1.04, 1] : 1,
        rotate: player.isShooting ? [-1, 1, 0] : 0,
      }}
      transition={{
        duration: isUltraMode ? 0.12 : 0.08,
        repeat: isEmpowered ? Infinity : 0,
      }}
    >
      {/* Speech bubble */}
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
        >
          <div 
            className="px-2 py-1.5 rounded-lg text-[10px] font-bold shadow-lg relative"
            style={{
              background: speechBubble.type === 'help' 
                ? 'linear-gradient(135deg, #ff6b6b, #ff8888)' 
                : speechBubble.type === 'urgent'
                ? 'linear-gradient(135deg, #ff0000, #ff4400)'
                : 'linear-gradient(135deg, #fff, #f0f0f0)',
              color: ['help', 'urgent'].includes(speechBubble.type) ? '#fff' : '#333',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
              maxWidth: 150,
            }}
          >
            {speechBubble.text}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
              style={{
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: speechBubble.type === 'help' 
                  ? '6px solid #ff6b6b' 
                  : '6px solid white',
              }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Magic Dash glow */}
      {player.isMagicDashing && (
        <>
          <motion.div 
            className="absolute -inset-6 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,0,255,0.5) 0%, rgba(0,255,255,0.3) 40%, transparent 70%)',
              filter: 'blur(10px)',
            }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 2 === 0 ? '#ff00ff' : '#00ffff',
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 3) * 25}%`,
              }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [-5, -15],
              }}
              transition={{ 
                duration: 0.4,
                repeat: Infinity,
                delay: i * 0.08,
              }}
            />
          ))}
        </>
      )}
      
      {/* Shield bubble */}
      {player.shield > 0 && (
        <motion.div
          className="absolute -inset-3 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.2) 80%, rgba(0,255,255,0.4) 100%)',
            border: '2px solid #00ffff',
            boxShadow: '0 0 15px #00ffff, inset 0 0 15px rgba(0, 255, 255, 0.2)',
            opacity: Math.min(1, player.shield / 50),
          }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
      
      {/* Hero Character - Video */}
      <motion.div
        className="relative w-full h-full"
      >
        {/* Shadow */}
        <motion.div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full opacity-40"
          style={{ 
            background: 'radial-gradient(ellipse, #000, transparent)',
            width: 50,
            height: 8,
          }}
        />
        
        {/* Hero Video */}
        <motion.div
          className="relative w-full h-full overflow-hidden rounded-md"
          style={{
            filter: isUltraMode || player.isMagicDashing
              ? 'drop-shadow(0 0 12px #ff00ff) drop-shadow(0 0 20px #00ffff)' 
              : 'drop-shadow(0 0 8px #00ccff)',
          }}
          animate={player.animationState === 'hurt' ? { x: [-3, 3, -3, 0] } : {}}
          transition={{ duration: 0.1 }}
        >
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
            style={{
              transform: player.animationState === 'dash' ? 'rotate(-5deg) scale(1.05)' : 
                        player.isShooting ? 'rotate(2deg)' : 'none',
            }}
          />
          
          {/* Damage flash */}
          {player.animationState === 'hurt' && (
            <motion.div
              className="absolute inset-0 bg-red-500/60 rounded-md"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
          
          {/* Magic dash overlay */}
          {player.isMagicDashing && (
            <motion.div
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,0,255,0.4), transparent)',
                mixBlendMode: 'screen',
              }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 0.15, repeat: Infinity }}
            />
          )}
        </motion.div>
        
        {/* Shooting muzzle flash - positioned at gun */}
        {player.isShooting && (
          <>
            <motion.div
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2.5 }}
              transition={{ duration: 0.12 }}
              className="absolute"
              style={{ right: -15, top: '40%' }}
            >
              <div 
                className="w-10 h-10 rounded-full"
                style={{
                  background: player.isMagicDashing 
                    ? 'radial-gradient(circle, #fff, #ff00ff, #00ffff, transparent)'
                    : 'radial-gradient(circle, #fff, #ffff00, #ff8800, transparent)',
                  boxShadow: player.isMagicDashing
                    ? '0 0 25px #ff00ff, 0 0 40px #00ffff'
                    : '0 0 20px #ffff00, 0 0 30px #ff8800',
                }}
              />
            </motion.div>
            
            {[0, 1].map(i => (
              <motion.div
                key={`ring-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  right: -8,
                  top: '38%',
                  width: 14,
                  height: 14,
                  borderColor: player.isMagicDashing ? '#ff00ff' : '#ffff00',
                }}
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2 + i, opacity: 0 }}
                transition={{ duration: 0.18, delay: i * 0.05 }}
              />
            ))}
          </>
        )}
        
        {/* Laser trail */}
        {player.isShooting && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0.8 }}
            transition={{ duration: 0.1 }}
            className="absolute h-2.5"
            style={{ 
              left: heroWidth, 
              top: '42%',
              width: 220,
              background: player.isMagicDashing
                ? 'linear-gradient(90deg, #fff, #ff00ff, #00ffff, transparent)'
                : 'linear-gradient(90deg, #fff, #ffff00, #ff6600, transparent)',
              transformOrigin: 'left center',
              filter: 'blur(1px)',
              boxShadow: player.isMagicDashing ? '0 0 12px #ff00ff' : '0 0 10px #ffff00',
            }}
          />
        )}
        
        {/* Magic dash trail - ghost videos */}
        {player.isMagicDashing && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`dash-${i}`}
                className="absolute inset-0 overflow-hidden rounded-md"
                initial={{ opacity: 0.5, x: 0 }}
                animate={{ opacity: 0, x: -15 - i * 8 }}
                transition={{ duration: 0.18, delay: i * 0.02 }}
              >
                <video 
                  src={heroVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                  style={{ 
                    filter: `blur(${i * 2}px) hue-rotate(${i * 40}deg)`,
                    opacity: 0.35 - i * 0.1,
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
      
      {/* Speed lines */}
      {(player.isDashing || player.isMagicDashing) && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`speed-${i}`}
              className="absolute h-0.5"
              style={{
                background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                width: 30 + Math.random() * 20,
                top: 10 + i * 18,
                right: heroWidth,
              }}
              animate={{
                x: [-20, -60],
                opacity: [0.7, 0],
              }}
              transition={{
                duration: 0.12,
                repeat: Infinity,
                delay: i * 0.025,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
