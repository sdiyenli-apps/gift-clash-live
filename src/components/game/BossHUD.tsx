import { motion, AnimatePresence } from 'framer-motion';

interface BossHUDProps {
  bossHealth: number;
  bossMaxHealth: number;
  bossName: string;
  isVisible: boolean;
  bossTaunt?: string | null;
}

export const BossHUD = ({ bossHealth, bossMaxHealth, bossName, isVisible, bossTaunt }: BossHUDProps) => {
  const healthPercent = (bossHealth / bossMaxHealth) * 100;
  const isRaging = healthPercent <= 30;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          {/* Boss Name */}
          <motion.div
            className="text-center mb-1"
            animate={isRaging ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            <span 
              className="font-bold text-sm tracking-widest"
              style={{ 
                color: isRaging ? '#ff0000' : '#ff4400',
                textShadow: `0 0 10px ${isRaging ? '#ff0000' : '#ff4400'}, 0 0 20px ${isRaging ? '#ff0000' : '#ff4400'}`,
              }}
            >
              👹 {bossName} 👹
            </span>
          </motion.div>
          
          {/* Health Bar */}
          <div 
            className="h-4 rounded-full overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.9)',
              border: `2px solid ${isRaging ? '#ff0000' : '#ff4400'}`,
              boxShadow: `0 0 15px ${isRaging ? '#ff0000' : '#ff4400'}66`,
            }}
          >
            <motion.div
              className="h-full"
              style={{ 
                width: `${healthPercent}%`,
                background: isRaging 
                  ? 'linear-gradient(90deg, #ff0000, #ff4400)'
                  : 'linear-gradient(90deg, #ff4400, #ff8800, #ffff00)',
                boxShadow: `0 0 10px ${isRaging ? '#ff0000' : '#ff4400'}, inset 0 2px 4px rgba(255,255,255,0.3)`,
              }}
              animate={isRaging ? { opacity: [1, 0.6, 1] } : {}}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
            
            {/* Shine effect */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
              }}
            />
          </div>
          
          {/* Health Percentage */}
          <div className="text-center mt-0.5">
            <span 
              className="text-xs font-bold"
              style={{ 
                color: isRaging ? '#ff0000' : '#fff',
                textShadow: isRaging ? '0 0 10px #ff0000' : 'none',
              }}
            >
              {Math.round(healthPercent)}%
            </span>
          </div>
          
          {/* Boss Taunt Bubble */}
          {bossTaunt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <div 
                className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, #330000, #660000)',
                  color: '#fff',
                  border: '1px solid #ff0000',
                  boxShadow: '0 0 10px #ff000066',
                }}
              >
                💀 {bossTaunt}
              </div>
            </motion.div>
          )}
          
          {/* Rage indicator */}
          {isRaging && (
            <motion.div
              className="absolute -top-1 -left-2 -right-2 -bottom-1 pointer-events-none rounded-lg"
              style={{
                border: '2px solid #ff0000',
                boxShadow: '0 0 20px #ff0000, inset 0 0 20px #ff000033',
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
