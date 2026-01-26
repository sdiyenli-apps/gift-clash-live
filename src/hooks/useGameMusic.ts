// Game Music Manager - Auto-plays background music with track rotation
import { useRef, useCallback, useEffect } from 'react';

// Import music tracks
import track1 from '@/assets/music/track-1.mp3';
import track2 from '@/assets/music/track-2.mp3';
import track3 from '@/assets/music/track-3.mp3';
import track4 from '@/assets/music/track-4.mp3';

const MUSIC_TRACKS = [track1, track2, track3, track4];

export const useGameMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const hasUserInteractedRef = useRef(false);

  // Play next track in rotation
  const playNextTrack = useCallback(() => {
    if (!audioRef.current) return;
    
    currentTrackIndexRef.current = (currentTrackIndexRef.current + 1) % MUSIC_TRACKS.length;
    audioRef.current.src = MUSIC_TRACKS[currentTrackIndexRef.current];
    audioRef.current.play().catch(() => {
      // Browser may block autoplay - wait for user interaction
    });
  }, []);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.3; // 30% volume for background music
    audio.loop = false; // We handle track rotation manually
    
    audio.addEventListener('ended', playNextTrack);
    
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('ended', playNextTrack);
      audio.pause();
      audio.src = '';
    };
  }, [playNextTrack]);

  // Start music (called when game starts)
  const startMusic = useCallback(() => {
    if (!audioRef.current || isPlayingRef.current) return;
    
    // Shuffle start track for variety
    currentTrackIndexRef.current = Math.floor(Math.random() * MUSIC_TRACKS.length);
    audioRef.current.src = MUSIC_TRACKS[currentTrackIndexRef.current];
    
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlayingRef.current = true;
        })
        .catch(() => {
          // Autoplay blocked - will try again on user interaction
          console.log('Music autoplay blocked - waiting for user interaction');
        });
    }
  }, []);

  // Stop music
  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
    }
  }, []);

  // Set volume (0-1)
  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Try to start music on user interaction if autoplay was blocked
  const handleUserInteraction = useCallback(() => {
    if (hasUserInteractedRef.current) return;
    hasUserInteractedRef.current = true;
    
    if (audioRef.current && !isPlayingRef.current) {
      startMusic();
    }
  }, [startMusic]);

  // Listen for user interaction to enable audio
  useEffect(() => {
    const events = ['click', 'touchstart', 'keydown'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [handleUserInteraction]);

  return { startMusic, stopMusic, setVolume };
};
