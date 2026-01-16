import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gameTheme from '@/assets/cpt-squirbert-theme.mp3';

interface MusicPlayerProps {
  isPlaying: boolean;
  isUltraMode: boolean;
  isBossFight?: boolean;
}

// Play the Captain Squirbert theme song
export const MusicPlayer = ({ isPlaying, isUltraMode, isBossFight = false }: MusicPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false); // Default to playing (not muted)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!isPlaying || isMuted) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }
    
    // Create and play the theme audio
    if (!audioRef.current) {
      audioRef.current = new Audio(gameTheme);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }
    
    audioRef.current.play().catch(console.error);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPlaying, isMuted]);
  
  // Adjust volume based on game state
  useEffect(() => {
    if (audioRef.current) {
      if (isBossFight) {
        audioRef.current.volume = 0.6;
        audioRef.current.playbackRate = 1.2;
      } else if (isUltraMode) {
        audioRef.current.volume = 0.5;
        audioRef.current.playbackRate = 1.1;
      } else {
        audioRef.current.volume = 0.4;
        audioRef.current.playbackRate = 1.0;
      }
    }
  }, [isBossFight, isUltraMode]);
  
  return (
    <motion.button
      onClick={() => setIsMuted(!isMuted)}
      className={`
        px-4 py-2 rounded-lg border transition-all text-sm font-bold
        ${isMuted 
          ? 'border-gray-600 text-gray-500 bg-gray-800/50' 
          : isBossFight
            ? 'border-red-500/50 text-red-400 bg-red-900/30 shadow-[0_0_15px_rgba(255,0,0,0.3)]'
            : 'border-cyan-500/50 text-cyan-400 bg-cyan-900/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isMuted ? '🔇 Muted' : isBossFight ? '🎸 Boss Theme' : '🎵 Squirbert Theme'}
    </motion.button>
  );
};
