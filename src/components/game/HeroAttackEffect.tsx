import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';
import heroAttackVideo from '@/assets/hero-attack-effect.mp4';

interface HeroAttackEffectProps {
  isAttacking: boolean;
  x: number;
  y: number;
  cameraX: number;
  facingRight: boolean;
}

// Hero attack animation using the video effect
export const HeroAttackEffect = memo(({ isAttacking, x, y, cameraX, facingRight }: HeroAttackEffectProps) => {
  const screenX = x - cameraX;
  
  if (!isAttacking) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        key="attack-effect"
        className="absolute pointer-events-none z-40"
        style={{
          left: screenX + (facingRight ? 40 : -120),
          bottom: 280 - y - 50,
          width: 160,
          height: 100,
          transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.1 }}
      >
        <video
          src={heroAttackVideo}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain"
          style={{
            filter: 'brightness(1.2) contrast(1.1)',
            mixBlendMode: 'screen',
          }}
          onEnded={(e) => {
            // Reset video for next attack
            (e.target as HTMLVideoElement).currentTime = 0;
          }}
        />
        
        {/* Additional glow overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,255,255,0.3), transparent 70%)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.15, repeat: 2 }}
        />
      </motion.div>
    </AnimatePresence>
  );
});

HeroAttackEffect.displayName = 'HeroAttackEffect';
