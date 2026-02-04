import { motion, AnimatePresence } from 'framer-motion';
import { memo, useState, useEffect } from 'react';

interface UpbeatFXProps {
  killStreak: number;
  score: number;
  isBossFight: boolean;
  giftDamageMultiplier: number;
}

// Upbeat kill streak emojis and phrases
const STREAK_EMOJIS = ['💥', '🔥', '⚡', '💀', '🎯', '💣', '🚀'];
const STREAK_PHRASES = [
  "AWESOME!",
  "EPIC!",
  "INSANE!",
  "LEGENDARY!",
  "GODLIKE!",
  "UNSTOPPABLE!",
];

// Celebratory confetti colors
const CONFETTI_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff6600', '#00ff88', '#ff0066'];

export const UpbeatFX = memo(({ killStreak, score, isBossFight, giftDamageMultiplier }: UpbeatFXProps) => {
  const [showStreak, setShowStreak] = useState(false);
  const [lastStreak, setLastStreak] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);

  // Trigger streak popup every 5 kills
  useEffect(() => {
    if (killStreak > 0 && killStreak % 5 === 0 && killStreak !== lastStreak) {
      setShowStreak(true);
      setLastStreak(killStreak);
      setConfettiActive(true);
      
      // Hide after animation
      const timer = setTimeout(() => {
        setShowStreak(false);
      }, 1500);
      
      const confettiTimer = setTimeout(() => {
        setConfettiActive(false);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(confettiTimer);
      };
    }
  }, [killStreak, lastStreak]);

  const streakLevel = Math.floor(killStreak / 5);
  const phrase = STREAK_PHRASES[Math.min(streakLevel - 1, STREAK_PHRASES.length - 1)] || "NICE!";
  const emoji = STREAK_EMOJIS[Math.floor(Math.random() * STREAK_EMOJIS.length)];

  return (
    <>
      {/* Streak Announcement */}
      <AnimatePresence>
        {showStreak && killStreak >= 5 && (
          <motion.div
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none text-center"
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <motion.div
              className="text-4xl font-black whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #ff00ff, #00ffff, #ffff00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 20px rgba(255,0,255,0.8))',
              }}
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 0.3, repeat: 2 }}
            >
              {emoji} {phrase} {emoji}
            </motion.div>
            <motion.div
              className="text-xl font-bold text-yellow-300 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {killStreak} KILL STREAK!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini confetti burst on streaks */}
      <AnimatePresence>
        {confettiActive && (
          <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: '30%',
                  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  boxShadow: `0 0 6px ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]}`,
                }}
                initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                animate={{
                  y: [0, 200 + Math.random() * 150],
                  x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
                  opacity: [1, 1, 0],
                  rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                  scale: [1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut',
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Multiplier Glow Border when active */}
      {giftDamageMultiplier > 1.5 && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            boxShadow: `inset 0 0 ${30 + (giftDamageMultiplier - 1) * 20}px ${
              giftDamageMultiplier >= 2.5 ? 'rgba(255,0,255,0.3)' 
              : giftDamageMultiplier >= 2 ? 'rgba(255,136,0,0.25)'
              : 'rgba(255,204,0,0.2)'
            }`,
          }}
        />
      )}

      {/* Boss Fight Intensity Pulse */}
      {isBossFight && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-20"
          animate={{
            boxShadow: [
              'inset 0 0 80px rgba(255,0,0,0.1)',
              'inset 0 0 120px rgba(255,0,0,0.2)',
              'inset 0 0 80px rgba(255,0,0,0.1)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Screen corner energy sparks during high action */}
      {killStreak > 10 && (
        <>
          <motion.div
            className="fixed top-0 left-0 w-20 h-20 pointer-events-none z-30"
            style={{
              background: 'radial-gradient(circle at top left, rgba(0,255,255,0.4), transparent)',
            }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.div
            className="fixed top-0 right-0 w-20 h-20 pointer-events-none z-30"
            style={{
              background: 'radial-gradient(circle at top right, rgba(255,0,255,0.4), transparent)',
            }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
          />
        </>
      )}
    </>
  );
});

UpbeatFX.displayName = 'UpbeatFX';
