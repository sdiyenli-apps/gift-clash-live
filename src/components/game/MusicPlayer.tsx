import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MusicPlayerProps {
  isPlaying: boolean;
  isUltraMode: boolean;
}

// 8-bit style music using Web Audio API
export const MusicPlayer = ({ isPlaying, isUltraMode }: MusicPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  
  useEffect(() => {
    if (!isPlaying || isMuted) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      isPlayingRef.current = false;
      return;
    }
    
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15;
    gainNode.connect(audioContext.destination);
    gainNodeRef.current = gainNode;
    
    // 8-bit melody notes (frequencies in Hz)
    const melody = [
      { note: 440, duration: 0.15 },   // A4
      { note: 494, duration: 0.15 },   // B4
      { note: 523, duration: 0.15 },   // C5
      { note: 587, duration: 0.3 },    // D5
      { note: 523, duration: 0.15 },   // C5
      { note: 494, duration: 0.15 },   // B4
      { note: 440, duration: 0.3 },    // A4
      { note: 392, duration: 0.15 },   // G4
      { note: 440, duration: 0.15 },   // A4
      { note: 523, duration: 0.3 },    // C5
      { note: 587, duration: 0.15 },   // D5
      { note: 659, duration: 0.15 },   // E5
      { note: 587, duration: 0.15 },   // D5
      { note: 523, duration: 0.3 },    // C5
      { note: 440, duration: 0.3 },    // A4
      { note: 0, duration: 0.15 },     // rest
    ];
    
    const ultraMelody = [
      { note: 659, duration: 0.1 },    // E5
      { note: 784, duration: 0.1 },    // G5
      { note: 880, duration: 0.1 },    // A5
      { note: 988, duration: 0.2 },    // B5
      { note: 880, duration: 0.1 },    // A5
      { note: 784, duration: 0.1 },    // G5
      { note: 659, duration: 0.1 },    // E5
      { note: 784, duration: 0.2 },    // G5
      { note: 880, duration: 0.1 },    // A5
      { note: 988, duration: 0.1 },    // B5
      { note: 1047, duration: 0.2 },   // C6
      { note: 988, duration: 0.1 },    // B5
      { note: 880, duration: 0.1 },    // A5
      { note: 784, duration: 0.2 },    // G5
    ];
    
    const bass = [
      { note: 110, duration: 0.3 },    // A2
      { note: 110, duration: 0.15 },   // A2
      { note: 130.81, duration: 0.3 }, // C3
      { note: 146.83, duration: 0.3 }, // D3
      { note: 130.81, duration: 0.15 },// C3
      { note: 110, duration: 0.3 },    // A2
      { note: 98, duration: 0.3 },     // G2
      { note: 110, duration: 0.3 },    // A2
    ];
    
    let melodyIndex = 0;
    let bassIndex = 0;
    let melodyTime = audioContext.currentTime;
    let bassTime = audioContext.currentTime;
    
    const playNote = (frequency: number, startTime: number, duration: number, type: OscillatorType = 'square', volumeMult: number = 1) => {
      if (frequency === 0) return;
      
      const oscillator = audioContext.createOscillator();
      const noteGain = audioContext.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      noteGain.gain.setValueAtTime(0.3 * volumeMult, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.9);
      
      oscillator.connect(noteGain);
      noteGain.connect(gainNode);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const scheduleNotes = () => {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
      
      const currentMelody = isUltraMode ? ultraMelody : melody;
      const lookAhead = 0.5;
      
      while (melodyTime < audioContext.currentTime + lookAhead) {
        const { note, duration } = currentMelody[melodyIndex % currentMelody.length];
        playNote(note, melodyTime, duration, 'square', isUltraMode ? 1.2 : 1);
        melodyTime += duration;
        melodyIndex++;
      }
      
      while (bassTime < audioContext.currentTime + lookAhead) {
        const { note, duration } = bass[bassIndex % bass.length];
        playNote(note, bassTime, duration * (isUltraMode ? 0.7 : 1), 'triangle', 0.6);
        bassTime += duration * (isUltraMode ? 0.7 : 1);
        bassIndex++;
      }
      
      requestAnimationFrame(scheduleNotes);
    };
    
    scheduleNotes();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, [isPlaying, isMuted, isUltraMode]);
  
  return (
    <motion.button
      onClick={() => setIsMuted(!isMuted)}
      className={`
        px-3 py-2 rounded-lg border transition-all text-sm
        ${isMuted 
          ? 'border-gray-600 text-gray-500' 
          : 'border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.2)]'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isMuted ? '🔇 Sound Off' : '🎵 8-Bit Music'}
    </motion.button>
  );
};
