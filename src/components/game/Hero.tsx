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
  // Fixed screen position - hero stays on LEFT side
  const screenX = 60; // Fixed at left edge of screen
  const isEmpowered = isUltraMode || player.isMagicDashing;

  // Hero sized for visibility on mobile
  const heroWidth = 48;
  const heroHeight = 60;

  return (
    <motion.div
      className="absolute z-30"
      style={{
        left: screenX,
        bottom: 50,
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
      {/* Speech bubble - text wraps properly */}
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
      
      {/* Magic Dash glow - simplified for performance */}
      {player.isMagicDashing && (
        <div 
          className="absolute -inset-4 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,255,0.4) 0%, rgba(0,255,255,0.2) 50%, transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
      )}
      
      {/* Shield bubble - simplified */}
      {player.shield > 0 && (
        <div
          className="absolute -inset-2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.3) 100%)',
            border: '1px solid #00ffff',
            boxShadow: '0 0 8px #00ffff',
            opacity: Math.min(1, player.shield / 50),
          }}
        />
      )}
      
      {/* Hero Character - mirrored to face right */}
      <motion.div
        className="relative w-full h-full"
        style={{ transform: 'scaleX(-1)' }}
      >
        {/* Shadow */}
        <motion.div 
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full opacity-35"
          style={{ 
            background: 'radial-gradient(ellipse, #000, transparent)',
            width: 35,
            height: 6,
          }}
        />
        
        {/* Video Hero - 8K QUALITY ENHANCED */}
        <motion.div
          className="relative w-full h-full overflow-hidden rounded-lg"
          style={{
            filter: isUltraMode || player.isMagicDashing
              ? 'drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 35px #00ffff) brightness(1.2) contrast(1.1)' 
              : 'drop-shadow(0 0 15px #00ccff) drop-shadow(0 0 25px #0088ff) brightness(1.1) contrast(1.05)',
          }}
          animate={player.animationState === 'hurt' ? { x: [-2, 2, -2, 0] } : {}}
          transition={{ duration: 0.1 }}
        >
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-lg"
            style={{
              transform: player.animationState === 'dash' ? 'rotate(-3deg) scale(1.08)' : 
                        player.isShooting ? 'rotate(2deg) scale(1.02)' : 'none',
              imageRendering: 'crisp-edges',
            }}
          />
          
          {/* 8K glow overlay for extra visibility */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,200,255,0.15) 100%)',
              mixBlendMode: 'overlay',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Damage flash */}
          {player.animationState === 'hurt' && (
            <motion.div
              className="absolute inset-0 bg-red-500/50 rounded-md"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            />
          )}
          
          {/* Magic dash overlay */}
          {player.isMagicDashing && (
            <motion.div
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,0,255,0.3), transparent)',
                mixBlendMode: 'screen',
              }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 0.15, repeat: Infinity }}
            />
          )}
        </motion.div>
        
        {/* Shooting muzzle flash - FROM HERO CENTER */}
        {player.isShooting && (
          <>
            {/* Muzzle flash at hero's body */}
            <motion.div
              initial={{ opacity: 1, scale: 0.3 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.08 }}
              className="absolute"
              style={{ 
                right: -2, 
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <div 
                className="w-6 h-6 rounded-full"
                style={{
                  background: player.isMagicDashing 
                    ? 'radial-gradient(circle, #fff, #ff00ff, #00ffff, transparent)'
                    : 'radial-gradient(circle, #fff, #ffff00, #ff8800, transparent)',
                  boxShadow: player.isMagicDashing
                    ? '0 0 15px #ff00ff, 0 0 25px #00ffff'
                    : '0 0 12px #ffff00, 0 0 20px #ff8800',
                }}
              />
            </motion.div>
            
            {/* Energy rings from body */}
            {[0, 1].map(i => (
              <motion.div
                key={`ring-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 8,
                  height: 8,
                  borderColor: player.isMagicDashing ? '#ff00ff' : '#ffff00',
                }}
                initial={{ scale: 0.3, opacity: 1 }}
                animate={{ scale: 2 + i, opacity: 0 }}
                transition={{ duration: 0.12, delay: i * 0.03 }}
              />
            ))}
          </>
        )}
        
        {/* Laser beam - EMANATING FROM HERO'S BODY */}
        {player.isShooting && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0.9 }}
            transition={{ duration: 0.08 }}
            className="absolute"
            style={{ 
              left: heroWidth - 5,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 250,
              height: 6,
              background: player.isMagicDashing
                ? 'linear-gradient(90deg, #fff 0%, #ff00ff 20%, #00ffff 60%, transparent 100%)'
                : 'linear-gradient(90deg, #fff 0%, #ffff00 20%, #ff6600 60%, transparent 100%)',
              transformOrigin: 'left center',
              filter: 'blur(1px)',
              boxShadow: player.isMagicDashing 
                ? '0 0 15px #ff00ff, 0 0 25px #00ffff' 
                : '0 0 12px #ffff00, 0 0 20px #ff6600',
              borderRadius: '0 50% 50% 0',
            }}
          />
        )}
        
        {/* Secondary laser glow */}
        {player.isShooting && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0.5 }}
            animate={{ scaleX: 1, opacity: 0.3 }}
            transition={{ duration: 0.1 }}
            className="absolute"
            style={{ 
              left: heroWidth - 5,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 200,
              height: 12,
              background: player.isMagicDashing
                ? 'linear-gradient(90deg, rgba(255,0,255,0.5), transparent)'
                : 'linear-gradient(90deg, rgba(255,255,0,0.5), transparent)',
              transformOrigin: 'left center',
              filter: 'blur(4px)',
              borderRadius: '0 50% 50% 0',
            }}
          />
        )}
        
        {/* Magic dash trail */}
        {player.isMagicDashing && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`dash-${i}`}
                className="absolute inset-0 overflow-hidden rounded-md"
                initial={{ opacity: 0.4, x: 0 }}
                animate={{ opacity: 0, x: -12 - i * 6 }}
                transition={{ duration: 0.15, delay: i * 0.015 }}
              >
                <video 
                  src={heroVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ 
                    filter: `blur(${i * 1.5}px) hue-rotate(${i * 30}deg)`,
                    opacity: 0.3 - i * 0.08,
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
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`speed-${i}`}
              className="absolute h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                width: 25 + Math.random() * 15,
                top: 8 + i * 15,
                right: heroWidth,
              }}
              animate={{
                x: [-15, -50],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 0.1,
                repeat: Infinity,
                delay: i * 0.02,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
