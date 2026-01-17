import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

interface BackgroundVideoProps {
  distance: number;
  cameraX: number;
  isUltraMode: boolean;
  isBossFight: boolean;
}

// Cyberpunk battlefield zones - progressively darker and more evil
const ZONES = [
  { 
    name: 'NEON CITY', 
    start: 0, 
    color: '#00ffff', 
    skyGradient: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 30%, #0a0a1a 100%)',
    buildingColor: '#0a1628',
    neonColors: ['#00ffff', '#ff00ff', '#00ff88'],
  },
  { 
    name: 'INDUSTRIAL ZONE', 
    start: 2000, 
    color: '#ff8800', 
    skyGradient: 'linear-gradient(180deg, #1a1208 0%, #2a1a0a 40%, #0a0804 100%)',
    buildingColor: '#1a1008',
    neonColors: ['#ff8800', '#ff4400', '#ffaa00'],
  },
  { 
    name: 'DARK SECTOR', 
    start: 4000, 
    color: '#8800ff', 
    skyGradient: 'linear-gradient(180deg, #0a0018 0%, #1a0a30 40%, #050008 100%)',
    buildingColor: '#0a0518',
    neonColors: ['#8800ff', '#ff00aa', '#aa00ff'],
  },
  { 
    name: 'DEATH ZONE', 
    start: 6000, 
    color: '#ff0044', 
    skyGradient: 'linear-gradient(180deg, #1a0505 0%, #2a0808 30%, #0a0202 100%)',
    buildingColor: '#1a0808',
    neonColors: ['#ff0044', '#ff0000', '#aa0022'],
  },
  { 
    name: 'EVIL CASTLE', 
    start: 8000, 
    color: '#ff0000', 
    skyGradient: 'linear-gradient(180deg, #0a0000 0%, #1a0505 20%, #330000 60%, #0a0000 100%)',
    buildingColor: '#0a0000',
    neonColors: ['#ff0000', '#880000', '#ff4400'],
  },
];

const getZone = (distance: number) => {
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (distance >= ZONES[i].start) return { zone: ZONES[i], index: i };
  }
  return { zone: ZONES[0], index: 0 };
};

export const BackgroundVideo = ({ distance, cameraX, isUltraMode, isBossFight }: BackgroundVideoProps) => {
  const { zone: currentZone, index: zoneIndex } = getZone(distance);
  const zoneProgress = (distance - currentZone.start) / 2000;
  
  // Parallax offset - scroll left as player moves
  const parallaxFar = -(cameraX * 0.02) % 800;
  const parallaxMid = -(cameraX * 0.05) % 600;
  const parallaxNear = -(cameraX * 0.1) % 400;
  
  // Planes fly every 10 seconds cycle
  const [planeKey, setPlaneKey] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaneKey(k => k + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Cyberpunk buildings for parallax layers
  const farBuildings = useMemo(() => {
    const buildings: JSX.Element[] = [];
    for (let i = 0; i < 12; i++) {
      const height = 60 + Math.random() * 80;
      const width = 30 + Math.random() * 40;
      buildings.push(
        <div
          key={`far-${i}`}
          className="absolute"
          style={{
            left: i * 70 + parallaxFar,
            bottom: 0,
            width: width,
            height: height,
            background: `linear-gradient(180deg, ${currentZone.buildingColor} 0%, #000 100%)`,
            boxShadow: `0 0 20px ${currentZone.neonColors[i % 3]}22`,
          }}
        >
          {/* Windows */}
          {[...Array(Math.floor(height / 15))].map((_, j) => (
            <div
              key={j}
              className="absolute"
              style={{
                left: '30%',
                top: 10 + j * 15,
                width: '40%',
                height: 6,
                background: Math.random() > 0.5 ? currentZone.neonColors[j % 3] : 'transparent',
                opacity: 0.6,
                boxShadow: Math.random() > 0.5 ? `0 0 8px ${currentZone.neonColors[j % 3]}` : 'none',
              }}
            />
          ))}
        </div>
      );
    }
    return buildings;
  }, [currentZone, parallaxFar]);
  
  const midBuildings = useMemo(() => {
    const buildings: JSX.Element[] = [];
    for (let i = 0; i < 10; i++) {
      const height = 80 + Math.random() * 100;
      const width = 40 + Math.random() * 50;
      buildings.push(
        <div
          key={`mid-${i}`}
          className="absolute"
          style={{
            left: i * 85 + parallaxMid,
            bottom: 0,
            width: width,
            height: height,
            background: `linear-gradient(180deg, ${currentZone.buildingColor} 0%, #000 100%)`,
          }}
        >
          {/* Neon sign */}
          {Math.random() > 0.5 && (
            <motion.div
              className="absolute text-[8px] font-bold"
              style={{
                left: '10%',
                top: 10,
                color: currentZone.neonColors[(i + 1) % 3],
                textShadow: `0 0 8px ${currentZone.neonColors[(i + 1) % 3]}`,
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ▓▓▓
            </motion.div>
          )}
          {/* Windows */}
          {[...Array(Math.floor(height / 12))].map((_, j) => (
            <div
              key={j}
              className="absolute"
              style={{
                left: '20%',
                top: 25 + j * 12,
                width: '60%',
                height: 5,
                background: Math.random() > 0.4 ? currentZone.neonColors[j % 3] : 'transparent',
                opacity: 0.7,
                boxShadow: Math.random() > 0.4 ? `0 0 10px ${currentZone.neonColors[j % 3]}` : 'none',
              }}
            />
          ))}
        </div>
      );
    }
    return buildings;
  }, [currentZone, parallaxMid]);
  
  // Evil castle elements for boss zone
  const castleElements = useMemo(() => {
    if (zoneIndex < 4) return null;
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Castle silhouette */}
        <motion.div
          className="absolute"
          style={{
            right: 100 + parallaxNear,
            bottom: 0,
            width: 200,
            height: 180,
            background: 'linear-gradient(180deg, #1a0000 0%, #0a0000 100%)',
            clipPath: 'polygon(0 100%, 0 60%, 10% 60%, 10% 40%, 20% 40%, 20% 20%, 30% 20%, 30% 40%, 40% 40%, 40% 30%, 50% 10%, 60% 30%, 60% 40%, 70% 40%, 70% 20%, 80% 20%, 80% 40%, 90% 40%, 90% 60%, 100% 60%, 100% 100%)',
          }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Evil glowing windows */}
          <motion.div
            className="absolute"
            style={{
              left: '45%',
              top: '30%',
              width: 20,
              height: 20,
              background: 'radial-gradient(circle, #ff0000, #660000)',
              borderRadius: '50%',
              boxShadow: '0 0 30px #ff0000, 0 0 60px #ff0000',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Flying bats/demons silhouettes */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={`bat-${i}`}
            className="absolute text-lg"
            style={{
              top: `${10 + i * 8}%`,
              filter: 'drop-shadow(0 0 5px #ff0000)',
            }}
            animate={{
              x: [800, -100],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 3,
              ease: 'linear',
            }}
          >
            🦇
          </motion.div>
        ))}
      </div>
    );
  }, [zoneIndex, parallaxNear]);
  
  // Calculate transition progress between zones
  const nextZone = ZONES[Math.min(zoneIndex + 1, ZONES.length - 1)];
  const transitionProgress = Math.min(1, Math.max(0, (zoneProgress - 0.7) / 0.3));
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base sky gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: currentZone.skyGradient,
          filter: isBossFight ? 'brightness(0.6) saturate(1.4)' : 'brightness(0.9)',
        }}
      />
      
      {/* Next zone crossfade for smooth transition */}
      {transitionProgress > 0 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: nextZone.skyGradient,
            opacity: transitionProgress,
          }}
        />
      )}
      
      {/* Far parallax buildings */}
      <div 
        className="absolute bottom-[50px] left-0 w-[200%] h-[140px] opacity-40"
        style={{ transform: `translateX(${parallaxFar}px)` }}
      >
        {farBuildings}
      </div>
      
      {/* Mid parallax buildings */}
      <div 
        className="absolute bottom-[50px] left-0 w-[200%] h-[180px] opacity-60"
        style={{ transform: `translateX(${parallaxMid}px)` }}
      >
        {midBuildings}
      </div>
      
      {/* Evil castle for boss zone */}
      {castleElements}
      
      {/* Flying planes - every 10 seconds */}
      <motion.div
        key={`plane-${planeKey}`}
        className="absolute pointer-events-none"
        style={{
          top: '12%',
          width: 80,
          height: 25,
        }}
        initial={{ x: '110vw' }}
        animate={{ x: '-120px' }}
        transition={{ 
          duration: 4,
          ease: 'linear',
        }}
      >
        {/* Jet body - flat */}
        <div 
          className="absolute w-full h-4"
          style={{
            background: 'linear-gradient(90deg, #444 0%, #666 50%, #444 100%)',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
        {/* Jet nose */}
        <div 
          className="absolute w-5 h-3"
          style={{
            background: '#777',
            left: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            borderRadius: '50% 0 0 50%',
          }}
        />
        {/* Tail fin */}
        <div 
          className="absolute"
          style={{
            right: 0,
            top: -8,
            width: 0,
            height: 0,
            borderLeft: '15px solid transparent',
            borderRight: '15px solid #555',
            borderBottom: '12px solid transparent',
          }}
        />
        {/* Burning afterburner */}
        <motion.div
          className="absolute"
          style={{
            right: -50,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 60,
            height: 10,
            background: 'linear-gradient(90deg, #ff6600, #ff4400, #ff2200, transparent)',
            filter: 'blur(3px)',
            borderRadius: '0 50% 50% 0',
          }}
          animate={{
            scaleX: [1, 1.4, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.08,
            repeat: Infinity,
          }}
        />
        {/* Smoke trail */}
        <motion.div
          className="absolute"
          style={{
            right: -100,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 80,
            height: 15,
            background: 'linear-gradient(90deg, rgba(100,100,100,0.6), transparent)',
            filter: 'blur(5px)',
          }}
          animate={{
            scaleY: [1, 1.6, 1],
          }}
          transition={{
            duration: 0.15,
            repeat: Infinity,
          }}
        />
      </motion.div>
      
      {/* Second plane staggered */}
      <motion.div
        key={`plane2-${planeKey}`}
        className="absolute pointer-events-none"
        style={{
          top: '25%',
          width: 60,
          height: 20,
        }}
        initial={{ x: '110vw' }}
        animate={{ x: '-100px' }}
        transition={{ 
          duration: 5,
          ease: 'linear',
          delay: 2,
        }}
      >
        <div 
          className="absolute w-full h-3"
          style={{
            background: 'linear-gradient(90deg, #333 0%, #555 50%, #333 100%)',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
        <div 
          className="absolute w-4 h-2"
          style={{
            background: '#666',
            left: -4,
            top: '50%',
            transform: 'translateY(-50%)',
            borderRadius: '50% 0 0 50%',
          }}
        />
        <motion.div
          className="absolute"
          style={{
            right: -40,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 50,
            height: 8,
            background: 'linear-gradient(90deg, #ff6600, #ff4400, #ff2200, transparent)',
            filter: 'blur(2px)',
            borderRadius: '0 50% 50% 0',
          }}
          animate={{
            scaleX: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
          }}
        />
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${10 + i * 15}%`,
            top: `${20 + (i * 10) % 50}%`,
            background: currentZone.color,
            boxShadow: `0 0 8px ${currentZone.color}`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
      
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-1 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${currentZone.color}33, transparent)`,
        }}
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Color overlay based on zone */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${currentZone.color}33, transparent 60%)`,
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
        }}
      />
      
      {/* Ultra mode overlay */}
      {isUltraMode && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,0,255,0.3), transparent 50%)',
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      )}
      
      {/* Boss fight red overlay */}
      {isBossFight && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,0,0,0.4) 100%)',
          }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  );
};
