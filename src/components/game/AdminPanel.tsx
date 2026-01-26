import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AdminPanelProps {
  // Settings controls
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  audioOn: boolean;
  setAudioOn: (on: boolean) => void;
  musicVolume: number;
  setMusicVolume: (v: number) => void;
  
  // Edit mode
  editMode: boolean;
  setEditMode: (edit: boolean) => void;
  
  // Layout settings
  arenaScale: number;
  setArenaScale: (v: number) => void;
  arenaOffsetX: number;
  setArenaOffsetX: (v: number) => void;
  arenaOffsetY: number;
  setArenaOffsetY: (v: number) => void;
  hudScale: number;
  setHudScale: (v: number) => void;
  hudOffsetX: number;
  setHudOffsetX: (v: number) => void;
  hudOffsetY: number;
  setHudOffsetY: (v: number) => void;
  resetSettings: () => void;
}

export const AdminPanel = ({
  showControls,
  setShowControls,
  audioOn,
  setAudioOn,
  musicVolume,
  setMusicVolume,
  editMode,
  setEditMode,
  arenaScale,
  setArenaScale,
  arenaOffsetX,
  setArenaOffsetX,
  arenaOffsetY,
  setArenaOffsetY,
  hudScale,
  setHudScale,
  hudOffsetX,
  setHudOffsetX,
  hudOffsetY,
  setHudOffsetY,
  resetSettings,
}: AdminPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed right-2 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 pointer-events-auto">
      {/* Main toggle button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg touch-manipulation"
        style={{
          background: expanded ? 'linear-gradient(135deg, #00ffff22, #ff00ff22)' : 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          border: expanded ? '2px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.2)',
          boxShadow: expanded ? '0 0 20px rgba(0,255,255,0.3)' : 'none',
        }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        {expanded ? '✕' : '☰'}
      </motion.button>
      
      {/* Expanded admin buttons */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Settings button */}
            <motion.button
              onClick={() => {
                setShowControls(!showControls);
                if (!showControls) setEditMode(false);
              }}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg touch-manipulation"
              style={{
                background: showControls ? 'rgba(0,255,255,0.2)' : 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(12px)',
                border: showControls ? '2px solid rgba(0,255,255,0.6)' : '1px solid rgba(255,255,255,0.2)',
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              title="Settings"
            >
              ⚙️
            </motion.button>
            
            {/* Edit/Drag button */}
            <motion.button
              onClick={() => {
                setEditMode(!editMode);
                if (!editMode) setShowControls(false);
              }}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg touch-manipulation"
              style={{
                background: editMode ? 'rgba(255,200,0,0.3)' : 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(12px)',
                border: editMode ? '2px solid rgba(255,200,0,0.7)' : '1px solid rgba(255,255,255,0.2)',
                boxShadow: editMode ? '0 0 15px rgba(255,200,0,0.4)' : 'none',
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              title="Edit Layout"
            >
              ✋
            </motion.button>
            
            {/* Audio button */}
            <motion.button
              onClick={() => setAudioOn(!audioOn)}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg touch-manipulation"
              style={{
                background: audioOn ? 'rgba(0,255,100,0.2)' : 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(12px)',
                border: audioOn ? '2px solid rgba(0,255,100,0.6)' : '1px solid rgba(255,255,255,0.2)',
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              title="Audio"
            >
              {audioOn ? '🔊' : '🔇'}
            </motion.button>
            
            {/* Reset button */}
            <motion.button
              onClick={resetSettings}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg touch-manipulation"
              style={{
                background: 'rgba(255,50,50,0.2)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,100,100,0.4)',
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              title="Reset All"
            >
              🔄
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Settings Panel - appears when showControls is true */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute right-14 top-0 p-3 rounded-xl"
            style={{
              background: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0,255,255,0.3)',
              minWidth: '200px',
            }}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
          >
            <div className="text-cyan-400 text-xs font-bold mb-2 flex items-center gap-2">
              ⚙️ Layout Settings
            </div>
            
            {/* Arena Controls */}
            <div className="text-gray-400 text-[10px] mb-1">🎮 Arena</div>
            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-white text-[9px] w-8">Scale</span>
                <input
                  type="range"
                  min="0.3"
                  max="2.0"
                  step="0.05"
                  value={arenaScale}
                  onChange={(e) => setArenaScale(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400 h-1"
                />
                <span className="text-cyan-400 text-[9px] w-8">{Math.round(arenaScale * 100)}%</span>
              </div>
            </div>
            
            {/* HUD Controls */}
            <div className="text-gray-400 text-[10px] mb-1">🎁 HUD</div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-white text-[9px] w-8">Scale</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={hudScale}
                  onChange={(e) => setHudScale(parseFloat(e.target.value))}
                  className="flex-1 accent-yellow-400 h-1"
                />
                <span className="text-yellow-400 text-[9px] w-8">{Math.round(hudScale * 100)}%</span>
              </div>
            </div>
            
            {/* Music Volume Control */}
            <div className="text-gray-400 text-[10px] mb-1 mt-3">🔊 Music Volume</div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-white text-[9px] w-8">🎵</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-green-400 h-1"
                />
                <span className="text-green-400 text-[9px] w-8">{Math.round(musicVolume * 100)}%</span>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-700">
              <div className="text-gray-500 text-[8px] text-center">
                Use ✋ Edit mode to drag elements
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit mode indicator */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg pointer-events-none"
            style={{
              background: 'rgba(255,200,0,0.9)',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '12px',
              boxShadow: '0 0 20px rgba(255,200,0,0.5)',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            ✋ EDIT MODE - Drag Arena or HUD to reposition
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
