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
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: screenX,
        bottom: 480 - player.y - 64,
        width: 48,
        height: 64,
      }}
      animate={{
        scale: isUltraMode ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 0.3,
        repeat: isUltraMode ? Infinity : 0,
      }}
    >
      {/* Speech bubble */}
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <div className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg relative">
            {speechBubble.text}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-white" />
          </div>
        </motion.div>
      )}
      
      {/* Ultra mode glow */}
      {isUltraMode && (
        <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-xl opacity-70 animate-pulse" />
      )}
      
      {/* Shield effect */}
      {player.shield > 0 && (
        <motion.div
          className="absolute inset-0 -m-3 rounded-full border-2 border-cyan-400"
          style={{
            boxShadow: '0 0 20px #00ffff, inset 0 0 20px rgba(0, 255, 255, 0.3)',
            opacity: player.shield / 100,
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
      
      {/* Hero character - Pixel art style funny guy with big nose */}
      <div className="relative w-full h-full">
        {/* Body */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-md"
          style={{
            background: isUltraMode 
              ? 'linear-gradient(135deg, #ff00ff, #00ffff)' 
              : 'linear-gradient(135deg, #4a90d9, #2a5298)',
            boxShadow: isUltraMode 
              ? '0 0 20px #ff00ff, 0 0 40px #00ffff' 
              : '2px 2px 0 #1a3a68',
          }}
        />
        
        {/* Head */}
        <div 
          className="absolute bottom-9 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#ffd5b4]"
          style={{
            boxShadow: '2px 2px 0 #d4a574',
          }}
        />
        
        {/* BIG NOSE - the signature feature! */}
        <div 
          className="absolute bottom-10 left-1/2 translate-x-1 w-4 h-5 rounded-full bg-[#ffb894]"
          style={{
            boxShadow: '1px 1px 0 #e5a07a',
          }}
        />
        
        {/* Eyes */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2">
          <motion.div 
            className="w-2 h-2 bg-black rounded-full"
            animate={player.isShooting ? { scale: [1, 0.5, 1] } : {}}
          />
          <motion.div 
            className="w-2 h-2 bg-black rounded-full"
            animate={player.isShooting ? { scale: [1, 0.5, 1] } : {}}
          />
        </div>
        
        {/* Eyebrows */}
        <div className="absolute bottom-[58px] left-1/2 -translate-x-1/2 flex gap-3">
          <div className="w-2.5 h-1 bg-[#5a3d2b] rounded -rotate-12" />
          <div className="w-2.5 h-1 bg-[#5a3d2b] rounded rotate-12" />
        </div>
        
        {/* Hair tuft */}
        <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2">
          <div className="w-1.5 h-3 bg-[#5a3d2b] rounded-t -rotate-12 -translate-x-1" />
          <div className="w-1.5 h-4 bg-[#5a3d2b] rounded-t absolute -top-1 left-1" />
          <div className="w-1.5 h-3 bg-[#5a3d2b] rounded-t rotate-12 absolute left-3" />
        </div>
        
        {/* Smile/expression */}
        <motion.div 
          className="absolute bottom-[42px] left-1/2 -translate-x-1/2 w-3 h-1.5 border-b-2 border-[#333] rounded-b-full"
          animate={player.isShooting ? { scaleY: 0.5 } : {}}
        />
        
        {/* Arms */}
        <motion.div 
          className="absolute bottom-4 -right-3 w-3 h-6 bg-[#4a90d9] rounded origin-top"
          animate={{ 
            rotate: player.isShooting ? -20 : 0,
          }}
          style={{
            boxShadow: isUltraMode ? '0 0 10px #ff00ff' : '1px 1px 0 #2a5298',
          }}
        />
        
        {/* Cyberpunk Gun */}
        <motion.div 
          className="absolute bottom-5 -right-4 origin-left"
          animate={{ 
            rotate: player.isShooting ? [-5, 10, 0] : 0,
            x: player.isShooting ? [0, -3, 0] : 0,
          }}
          transition={{ duration: 0.1 }}
        >
          <div 
            className="w-10 h-4 rounded-r-sm"
            style={{
              background: isUltraMode 
                ? 'linear-gradient(90deg, #ff00ff, #00ffff)' 
                : 'linear-gradient(90deg, #444, #666)',
              boxShadow: isUltraMode 
                ? '0 0 15px #ff00ff' 
                : '0 2px 0 #222',
            }}
          />
          {/* Gun barrel glow */}
          {player.isShooting && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400"
              style={{ boxShadow: '0 0 20px #ffff00' }}
            />
          )}
        </motion.div>
        
        {/* Legs - simple walking animation */}
        <motion.div
          className="absolute -bottom-1 left-2 w-2.5 h-3 bg-[#333] rounded-b"
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-1 right-2 w-2.5 h-3 bg-[#333] rounded-b"
          animate={{ rotate: [5, -5, 5] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
};
