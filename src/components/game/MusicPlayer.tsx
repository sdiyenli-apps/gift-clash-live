import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MusicPlayerProps {
  isPlaying: boolean;
  isUltraMode: boolean;
  isBossFight?: boolean;
}

// Premium 8-bit orchestral style music using Web Audio API
export const MusicPlayer = ({ isPlaying, isUltraMode, isBossFight = false }: MusicPlayerProps) => {
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
    gainNode.gain.value = 0.12;
    gainNode.connect(audioContext.destination);
    gainNodeRef.current = gainNode;
    
    // Hero Adventure Theme - Epic and inspiring
    const heroMelody = [
      { note: 523, duration: 0.2 },   // C5
      { note: 587, duration: 0.2 },   // D5
      { note: 659, duration: 0.3 },   // E5
      { note: 784, duration: 0.4 },   // G5
      { note: 659, duration: 0.2 },   // E5
      { note: 587, duration: 0.2 },   // D5
      { note: 523, duration: 0.4 },   // C5
      { note: 392, duration: 0.2 },   // G4
      { note: 440, duration: 0.2 },   // A4
      { note: 523, duration: 0.3 },   // C5
      { note: 587, duration: 0.3 },   // D5
      { note: 659, duration: 0.4 },   // E5
      { note: 587, duration: 0.2 },   // D5
      { note: 523, duration: 0.4 },   // C5
      { note: 0, duration: 0.2 },     // rest
    ];
    
    // Ultra Mode - Fast paced action
    const ultraMelody = [
      { note: 784, duration: 0.1 },    // G5
      { note: 880, duration: 0.1 },    // A5
      { note: 988, duration: 0.1 },    // B5
      { note: 1047, duration: 0.15 },  // C6
      { note: 988, duration: 0.1 },    // B5
      { note: 880, duration: 0.1 },    // A5
      { note: 784, duration: 0.1 },    // G5
      { note: 880, duration: 0.15 },   // A5
      { note: 988, duration: 0.1 },    // B5
      { note: 1047, duration: 0.1 },   // C6
      { note: 1175, duration: 0.15 },  // D6
      { note: 1047, duration: 0.1 },   // C6
      { note: 988, duration: 0.1 },    // B5
      { note: 880, duration: 0.15 },   // A5
    ];
    
    // Boss Fight - Dark and scary orchestral
    const bossMelody = [
      { note: 220, duration: 0.3 },    // A3
      { note: 233, duration: 0.3 },    // Bb3
      { note: 220, duration: 0.3 },    // A3
      { note: 196, duration: 0.5 },    // G3
      { note: 220, duration: 0.2 },    // A3
      { note: 262, duration: 0.2 },    // C4
      { note: 233, duration: 0.4 },    // Bb3
      { note: 196, duration: 0.3 },    // G3
      { note: 175, duration: 0.5 },    // F3
      { note: 196, duration: 0.3 },    // G3
      { note: 220, duration: 0.3 },    // A3
      { note: 262, duration: 0.4 },    // C4
      { note: 233, duration: 0.3 },    // Bb3
      { note: 220, duration: 0.5 },    // A3
    ];
    
    const heroBass = [
      { note: 131, duration: 0.4 },    // C3
      { note: 131, duration: 0.2 },    // C3
      { note: 147, duration: 0.4 },    // D3
      { note: 165, duration: 0.4 },    // E3
      { note: 147, duration: 0.2 },    // D3
      { note: 131, duration: 0.4 },    // C3
      { note: 98, duration: 0.4 },     // G2
      { note: 110, duration: 0.4 },    // A2
    ];
    
    const bossBass = [
      { note: 55, duration: 0.5 },     // A1 (deep rumble)
      { note: 58, duration: 0.5 },     // Bb1
      { note: 55, duration: 0.4 },     // A1
      { note: 49, duration: 0.6 },     // G1
      { note: 55, duration: 0.4 },     // A1
      { note: 65, duration: 0.5 },     // C2
      { note: 58, duration: 0.5 },     // Bb1
      { note: 55, duration: 0.6 },     // A1
    ];
    
    // Percussion for boss
    const drums = [
      { note: 80, duration: 0.15 },
      { note: 0, duration: 0.15 },
      { note: 120, duration: 0.1 },
      { note: 0, duration: 0.2 },
      { note: 80, duration: 0.15 },
      { note: 80, duration: 0.1 },
      { note: 120, duration: 0.15 },
    ];
    
    let melodyIndex = 0;
    let bassIndex = 0;
    let drumIndex = 0;
    let melodyTime = audioContext.currentTime;
    let bassTime = audioContext.currentTime;
    let drumTime = audioContext.currentTime;
    
    const playNote = (frequency: number, startTime: number, duration: number, type: OscillatorType = 'square', volumeMult: number = 1) => {
      if (frequency === 0) return;
      
      const oscillator = audioContext.createOscillator();
      const noteGain = audioContext.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      noteGain.gain.setValueAtTime(0.25 * volumeMult, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.85);
      
      oscillator.connect(noteGain);
      noteGain.connect(gainNode);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const playDrum = (frequency: number, startTime: number, duration: number) => {
      if (frequency === 0) return;
      
      const oscillator = audioContext.createOscillator();
      const noteGain = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(30, startTime + duration * 0.5);
      
      noteGain.gain.setValueAtTime(0.4, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.8);
      
      oscillator.connect(noteGain);
      noteGain.connect(gainNode);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const scheduleNotes = () => {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
      
      let currentMelody = heroMelody;
      let currentBass = heroBass;
      let tempoMult = 1;
      
      if (isBossFight) {
        currentMelody = bossMelody;
        currentBass = bossBass;
        tempoMult = 0.9;
      } else if (isUltraMode) {
        currentMelody = ultraMelody;
        tempoMult = 0.6;
      }
      
      const lookAhead = 0.5;
      
      // Melody
      while (melodyTime < audioContext.currentTime + lookAhead) {
        const { note, duration } = currentMelody[melodyIndex % currentMelody.length];
        const adjustedDuration = duration * tempoMult;
        playNote(note, melodyTime, adjustedDuration, isBossFight ? 'sawtooth' : 'square', isUltraMode ? 1.3 : 1);
        melodyTime += adjustedDuration;
        melodyIndex++;
      }
      
      // Bass
      while (bassTime < audioContext.currentTime + lookAhead) {
        const { note, duration } = currentBass[bassIndex % currentBass.length];
        const adjustedDuration = duration * tempoMult;
        playNote(note, bassTime, adjustedDuration, 'triangle', isBossFight ? 0.8 : 0.5);
        bassTime += adjustedDuration;
        bassIndex++;
      }
      
      // Drums for boss fight
      if (isBossFight) {
        while (drumTime < audioContext.currentTime + lookAhead) {
          const { note, duration } = drums[drumIndex % drums.length];
          playDrum(note, drumTime, duration * tempoMult);
          drumTime += duration * tempoMult;
          drumIndex++;
        }
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
  }, [isPlaying, isMuted, isUltraMode, isBossFight]);
  
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
      {isMuted ? '🔇 Muted' : isBossFight ? '🎻 Boss Theme' : '🎵 Adventure Music'}
    </motion.button>
  );
};
