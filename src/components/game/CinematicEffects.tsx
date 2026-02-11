import { memo } from 'react';

interface CinematicEffectsProps {
  isBossFight: boolean;
  killStreak: number;
  giftDamageMultiplier: number;
  screenShake: number;
}

// =============================================
// LIGHTWEIGHT CINEMATIC EFFECTS - Performance optimized
// Pure CSS animations only, no framer-motion, no intervals
// =============================================

export const CinematicEffects = memo(({
  isBossFight,
  killStreak,
  giftDamageMultiplier,
}: CinematicEffectsProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* NEON EDGE GLOW - CSS only */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `
            inset 0 0 30px rgba(0,255,255,0.08),
            inset 0 0 60px rgba(255,0,255,0.04)
          `,
        }}
      />
      
      {/* BOTTOM GLOW - CSS only */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{
          background: `linear-gradient(180deg, transparent 0%, rgba(0,255,255,0.08) 50%, rgba(255,0,255,0.12) 100%)`,
          filter: 'blur(8px)',
        }}
      />
      
      {/* MULTIPLIER POWER GLOW - only when active */}
      {giftDamageMultiplier > 1 && (
        <div
          className="absolute inset-0 animate-pulse-glow"
          style={{
            boxShadow: `inset 0 0 ${50 + (giftDamageMultiplier - 1) * 60}px rgba(255,${Math.floor(200 - (giftDamageMultiplier - 1) * 80)},0,${0.1 + (giftDamageMultiplier - 1) * 0.15})`,
          }}
        />
      )}
      
      {/* BOSS DANGER AURA - CSS animation only */}
      {isBossFight && (
        <div
          className="absolute inset-0 animate-pulse-glow"
          style={{
            boxShadow: 'inset 0 0 80px rgba(255,0,0,0.2), inset 0 0 150px rgba(100,0,0,0.15)',
          }}
        />
      )}
    </div>
  );
});

CinematicEffects.displayName = 'CinematicEffects';
