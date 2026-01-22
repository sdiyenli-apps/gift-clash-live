import { Particle } from '@/types/game';
import { useMemo } from 'react';

interface ParticlesProps {
  particles: Particle[];
  cameraX: number;
}

// PARTICLE POOLING: Reuse DOM elements, limit total rendered
const MAX_RENDERED_PARTICLES = 6;

export const Particles = ({ particles, cameraX }: ParticlesProps) => {
  // PERFORMANCE: Only render most recent particles within limit
  const visibleParticles = useMemo(() => {
    return particles
      .filter(p => {
        const screenX = p.x - cameraX;
        // Skip off-screen and expired particles
        return screenX >= -30 && screenX <= 700 && p.life > 0.01;
      })
      .slice(-MAX_RENDERED_PARTICLES);
  }, [particles, cameraX]);
  
  // Skip rendering entirely if no particles
  if (visibleParticles.length === 0) return null;
  
  return (
    <>
      {visibleParticles.map((particle) => {
        const screenX = particle.x - cameraX;
        
        // Simple inline styles - no CSS transforms for performance
        const style: React.CSSProperties = {
          position: 'absolute',
          left: screenX,
          bottom: 280 - particle.y,
          width: particle.size,
          height: particle.size,
          opacity: Math.min(particle.life, 0.8),
          background: particle.color,
          borderRadius: '50%',
          pointerEvents: 'none',
        };
        
        return <div key={particle.id} style={style} />;
      })}
    </>
  );
};
