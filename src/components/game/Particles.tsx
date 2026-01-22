import { Particle } from '@/types/game';

interface ParticlesProps {
  particles: Particle[];
  cameraX: number;
}

export const Particles = ({ particles, cameraX }: ParticlesProps) => {
  // PERFORMANCE: Limit rendered particles
  const visibleParticles = particles.slice(-10);
  
  return (
    <>
      {visibleParticles.map((particle) => {
        const screenX = particle.x - cameraX;
        
        // Skip off-screen particles
        if (screenX < -50 || screenX > 800) return null;
        
        const getParticleStyle = (): React.CSSProperties => {
          const baseStyle: React.CSSProperties = {
            position: 'absolute',
            left: screenX,
            bottom: 280 - particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.life,
            pointerEvents: 'none',
          };
          
          switch (particle.type) {
            case 'ultra':
            case 'magic':
              return {
                ...baseStyle,
                background: `radial-gradient(circle, ${particle.color}, transparent)`,
                borderRadius: '50%',
              };
            case 'explosion':
            case 'death':
              return {
                ...baseStyle,
                background: particle.color,
                borderRadius: '50%',
              };
            case 'muzzle':
            case 'impact':
            case 'spark':
              return {
                ...baseStyle,
                background: particle.color,
                borderRadius: '50%',
              };
            case 'laser':
              return {
                ...baseStyle,
                background: particle.color,
                borderRadius: '2px',
                width: particle.size * 2,
                height: particle.size,
              };
            default:
              return {
                ...baseStyle,
                background: particle.color,
                borderRadius: '2px',
              };
          }
        };
        
        return (
          <div
            key={particle.id}
            style={getParticleStyle()}
          />
        );
      })}
    </>
  );
};
