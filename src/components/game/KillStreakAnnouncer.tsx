import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState, useRef } from 'react';

interface KillStreakAnnouncerProps {
  killStreak: number;
}

// Mortal Kombat-style evil announcements
const KILL_STREAK_TIERS = [
  { threshold: 5, label: 'KILLING SPREE', color: '#ff6600', voiceLine: 'KILLING SPREE!' },
  { threshold: 10, label: 'RAMPAGE', color: '#ff0066', voiceLine: 'RAMPAGE!' },
  { threshold: 15, label: 'UNSTOPPABLE', color: '#ff00ff', voiceLine: 'UNSTOPPABLE!' },
  { threshold: 20, label: 'GODLIKE', color: '#aa00ff', voiceLine: 'GODLIKE!' },
  { threshold: 25, label: 'MASSACRE', color: '#ff0000', voiceLine: 'MASSACRE!' },
  { threshold: 30, label: 'BRUTALITY', color: '#880000', voiceLine: 'BRUTALITY!' },
  { threshold: 50, label: 'APOCALYPSE', color: '#440000', voiceLine: 'APOCALYPSE!' },
];

// Evil voice synthesizer using Web Speech API
const speakEvil = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.7; // Slow and menacing
  utterance.pitch = 0.3; // Deep evil voice
  utterance.volume = 0.9;
  
  // Try to find a deep male voice
  const voices = window.speechSynthesis.getVoices();
  const evilVoice = voices.find(v => 
    v.name.toLowerCase().includes('male') || 
    v.name.toLowerCase().includes('daniel') ||
    v.name.toLowerCase().includes('alex') ||
    v.name.toLowerCase().includes('fred')
  ) || voices[0];
  
  if (evilVoice) utterance.voice = evilVoice;
  
  window.speechSynthesis.speak(utterance);
};

export const KillStreakAnnouncer = memo(({ killStreak }: KillStreakAnnouncerProps) => {
  const [activeAnnouncement, setActiveAnnouncement] = useState<typeof KILL_STREAK_TIERS[0] | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const lastAnnouncedTier = useRef<number>(-1);

  useEffect(() => {
    // Find the current tier
    let currentTierIndex = -1;
    for (let i = KILL_STREAK_TIERS.length - 1; i >= 0; i--) {
      if (killStreak >= KILL_STREAK_TIERS[i].threshold) {
        currentTierIndex = i;
        break;
      }
    }

    // Only announce if we've reached a NEW tier
    if (currentTierIndex >= 0 && currentTierIndex !== lastAnnouncedTier.current) {
      lastAnnouncedTier.current = currentTierIndex;
      const tier = KILL_STREAK_TIERS[currentTierIndex];
      
      setActiveAnnouncement(tier);
      setShowAnnouncement(true);
      
      // Speak the evil voice line
      speakEvil(tier.voiceLine);
      
      // Hide after 2.5 seconds
      const timer = setTimeout(() => {
        setShowAnnouncement(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
    
    // Reset tier tracking when killstreak resets
    if (killStreak === 0) {
      lastAnnouncedTier.current = -1;
    }
  }, [killStreak]);

  return (
    <AnimatePresence>
      {showAnnouncement && activeAnnouncement && (
        <motion.div
          className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Full screen flash effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${activeAnnouncement.color}40, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.3, 0.6, 0.2] }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Blood drip effect from top */}
          <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 rounded-full"
                style={{
                  left: `${5 + i * 5}%`,
                  background: `linear-gradient(180deg, ${activeAnnouncement.color}, transparent)`,
                  height: 40 + Math.random() * 60,
                }}
                initial={{ y: -100 }}
                animate={{ y: 80 }}
                transition={{ 
                  duration: 0.6 + Math.random() * 0.4,
                  delay: Math.random() * 0.2,
                }}
              />
            ))}
          </div>
          
          {/* Main announcement */}
          <motion.div
            className="relative"
            initial={{ scale: 3, opacity: 0 }}
            animate={{ 
              scale: [3, 0.9, 1.1, 1],
              opacity: 1,
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Skull icon above */}
            <motion.div
              className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl"
              animate={{ 
                rotate: [-5, 5, -5],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              💀
            </motion.div>
            
            {/* Kill streak count */}
            <motion.div
              className="text-center mb-2 font-black text-7xl tracking-tighter"
              style={{
                color: activeAnnouncement.color,
                textShadow: `
                  0 0 20px ${activeAnnouncement.color},
                  0 0 40px ${activeAnnouncement.color},
                  0 0 60px ${activeAnnouncement.color},
                  2px 2px 0 #000,
                  -2px -2px 0 #000,
                  2px -2px 0 #000,
                  -2px 2px 0 #000
                `,
                WebkitTextStroke: '2px #000',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              {killStreak}
            </motion.div>
            
            {/* Tier label */}
            <motion.div
              className="text-center font-black text-4xl tracking-widest uppercase"
              style={{
                color: '#fff',
                textShadow: `
                  0 0 10px ${activeAnnouncement.color},
                  0 0 20px ${activeAnnouncement.color},
                  0 0 40px ${activeAnnouncement.color}80,
                  3px 3px 0 #000
                `,
              }}
              animate={{ 
                letterSpacing: ['0.2em', '0.25em', '0.2em'],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {activeAnnouncement.label}
            </motion.div>
            
            {/* Subtitle */}
            <motion.div
              className="text-center mt-2 text-lg font-bold tracking-wide"
              style={{
                color: activeAnnouncement.color,
                textShadow: `0 0 10px ${activeAnnouncement.color}`,
              }}
            >
              KEEP THEM COMING! 🔥
            </motion.div>
            
            {/* Electric sparks around the text */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-8"
                style={{
                  left: '50%',
                  top: '50%',
                  background: `linear-gradient(90deg, transparent, ${activeAnnouncement.color}, transparent)`,
                  transformOrigin: 'center',
                }}
                initial={{ rotate: i * 45, scale: 0 }}
                animate={{ 
                  rotate: i * 45 + 360,
                  scale: [0, 1.5, 0],
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
          
          {/* Corner flames */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos, i) => (
            <motion.div
              key={pos}
              className={`absolute ${
                pos.includes('top') ? 'top-4' : 'bottom-4'
              } ${
                pos.includes('left') ? 'left-4' : 'right-4'
              } text-4xl`}
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: pos.includes('left') ? [0, -10, 0] : [0, 10, 0],
              }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.1 }}
            >
              🔥
            </motion.div>
          ))}
          
          {/* Shaking vignette */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 150px 50px rgba(0,0,0,0.8)`,
            }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

KillStreakAnnouncer.displayName = 'KillStreakAnnouncer';
