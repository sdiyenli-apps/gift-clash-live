import { Particle } from '@/types/game';
import { useMemo, memo } from 'react';

interface OptimizedParticlesProps {
  particles: Particle[];
  cameraX: number;
  isBossFight?: boolean;
}

// PERFORMANCE: Hard limits for boss fights vs regular gameplay
const MAX_PARTICLES_NORMAL = 8;
const MAX_PARTICLES_BOSS = 4; // Reduced during boss fights for performance

// GPU-optimized particle using CSS transforms only
const OptimizedParticle = memo(({ particle, screenX }: { particle: Particle; screenX: number }) => {
  // Use will-change and transform3d for GPU acceleration
  const style: React.CSSProperties = {
    position: 'absolute',
    transform: `translate3d(${screenX}px, ${-(280 - particle.y)}px, 0)`,
    width: particle.size,
    height: particle.size,
    opacity: Math.min(particle.life, 0.8),
    background: particle.color,
    borderRadius: '50%',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
    // Use hardware acceleration
    backfaceVisibility: 'hidden',
    perspective: 1000,
  };
  
  return <div style={style} />;
});

OptimizedParticle.displayName = 'OptimizedParticle';

// Main optimized particles component with aggressive culling
export const OptimizedParticles = memo(({ particles, cameraX, isBossFight = false }: OptimizedParticlesProps) => {
  const maxParticles = isBossFight ? MAX_PARTICLES_BOSS : MAX_PARTICLES_NORMAL;
  
  // PERFORMANCE: Aggressive filtering and limiting
  const visibleParticles = useMemo(() => {
    return particles
      .filter(p => {
        const screenX = p.x - cameraX;
        // Tighter culling bounds during boss fights
        const bounds = isBossFight ? { min: 0, max: 600 } : { min: -30, max: 700 };
        return screenX >= bounds.min && screenX <= bounds.max && p.life > 0.05;
      })
      .slice(-maxParticles);
  }, [particles, cameraX, isBossFight, maxParticles]);
  
  if (visibleParticles.length === 0) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ 
        bottom: 0,
        // Container GPU acceleration
        transform: 'translateZ(0)',
        willChange: 'contents',
      }}
    >
      {visibleParticles.map((particle) => (
        <OptimizedParticle 
          key={particle.id} 
          particle={particle} 
          screenX={particle.x - cameraX}
        />
      ))}
    </div>
  );
});

OptimizedParticles.displayName = 'OptimizedParticles';

// Lightweight spark effect for Metal Slug style impacts
export const ImpactSpark = memo(({ x, y, color, cameraX }: { x: number; y: number; color: string; cameraX: number }) => {
  const screenX = x - cameraX;
  
  if (screenX < -20 || screenX > 680) return null;
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: screenX,
        bottom: 280 - y,
        width: 4,
        height: 4,
        background: color,
        borderRadius: '50%',
        boxShadow: `0 0 6px ${color}`,
        transform: 'translateZ(0)',
        animation: 'sparkFade 0.15s ease-out forwards',
      }}
    />
  );
});

ImpactSpark.displayName = 'ImpactSpark';

// Muzzle flash optimized for performance
export const OptimizedMuzzleFlash = memo(({ 
  x, 
  y, 
  cameraX, 
  size = 30,
  color = '#ffaa00'
}: { 
  x: number; 
  y: number; 
  cameraX: number;
  size?: number;
  color?: string;
}) => {
  const screenX = x - cameraX;
  
  if (screenX < -50 || screenX > 700) return null;
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: screenX - size / 2,
        bottom: 280 - y - size / 2,
        width: size,
        height: size,
        background: `radial-gradient(circle, #fff 20%, ${color} 50%, transparent 70%)`,
        borderRadius: '50%',
        transform: 'translateZ(0) scale(1)',
        animation: 'flashFade 0.1s ease-out forwards',
        willChange: 'transform, opacity',
      }}
    />
  );
});

OptimizedMuzzleFlash.displayName = 'OptimizedMuzzleFlash';

// Add keyframes to document if not present
if (typeof document !== 'undefined') {
  const styleId = 'optimized-particle-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes sparkFade {
        0% { transform: translateZ(0) scale(1); opacity: 1; }
        100% { transform: translateZ(0) scale(0.3); opacity: 0; }
      }
      @keyframes flashFade {
        0% { transform: translateZ(0) scale(0.5); opacity: 1; }
        50% { transform: translateZ(0) scale(1.5); opacity: 0.7; }
        100% { transform: translateZ(0) scale(2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
