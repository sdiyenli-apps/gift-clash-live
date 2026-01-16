import { motion } from 'framer-motion';
import { Particle } from '@/types/game';

interface ParticlesProps {
  particles: Particle[];
  cameraX: number;
}

export const Particles = ({ particles, cameraX }: ParticlesProps) => {
  return (
    <>
      {particles.map((particle) => {
        const screenX = particle.x - cameraX;
        
        if (screenX < -50 || screenX > 1000) return null;
        
        const getParticleStyle = () => {
          switch (particle.type) {
            case 'ultra':
              return {
                background: `radial-gradient(circle, ${particle.color}, transparent)`,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                borderRadius: '50%',
              };
            case 'explosion':
            case 'death':
              return {
                background: particle.color,
                boxShadow: `0 0 ${particle.size}px ${particle.color}`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              };
            case 'muzzle':
              return {
                background: `radial-gradient(circle, white, ${particle.color})`,
                boxShadow: `0 0 ${particle.size}px ${particle.color}`,
                borderRadius: '50%',
              };
            default:
              return {
                background: particle.color,
                boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
                borderRadius: '2px',
              };
          }
        };
        
        return (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              left: screenX,
              bottom: 280 - particle.y,
              width: particle.size,
              height: particle.size,
              opacity: particle.life,
              ...getParticleStyle(),
            }}
          />
        );
      })}
    </>
  );
};
