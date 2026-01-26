import { motion } from 'framer-motion';
import { Enemy as EnemyType, ENEMY_DEATH_SOUNDS } from '@/types/game';
import { useState, useEffect } from 'react';
// NEW GROUND ENEMY SPRITES (ground-1 through ground-6)
import ground1Sprite from '@/assets/ground-1.png';
import ground2Sprite from '@/assets/ground-2.png';
import ground3Sprite from '@/assets/ground-3.png';
import ground4Sprite from '@/assets/ground-4.png';
import ground5Sprite from '@/assets/ground-5.png';
import ground6Sprite from '@/assets/ground-6.png';
// Flying enemy sprites - NEW LARGER DRONES
import enemyDroneNew1 from '@/assets/enemy-drone-new1.png';
import enemyDroneNew2 from '@/assets/enemy-drone-new2.png';
import enemyJetRobot from '@/assets/enemy-jet-robot.png';
// Boss sprites for each level (1-10)
import bossLevel1 from '@/assets/boss-level-1.png';
import bossLevel2 from '@/assets/boss-level-2.png';
import bossLevel3 from '@/assets/boss-level-3.png';
import bossLevel4 from '@/assets/boss-level-4.png';
import bossLevel5 from '@/assets/boss-level-5.png';
import bossLevel6 from '@/assets/boss-level-6.png';
import bossLevel7 from '@/assets/boss-level-7.png';
import bossLevel8 from '@/assets/boss-level-8.png';
import bossLevel9 from '@/assets/boss-level-9.png';
import bossLevel10 from '@/assets/boss-level-10.png';

// Level-specific boss sprites array
const BOSS_SPRITES_BY_LEVEL = [
  bossLevel1, bossLevel2, bossLevel3, bossLevel4, bossLevel5,
  bossLevel6, bossLevel7, bossLevel8, bossLevel9, bossLevel10,
];

// Get drone sprite - NEW LARGER DRONE VARIANTS
// variant 0 = Heavy drone with missiles (drone_1), variant 1+ = Insect drone (drone_2)
const getDroneSprite = (variant?: number) => {
  // Alternate between the two new drone types
  return (variant ?? 0) % 2 === 0 ? enemyDroneNew1 : enemyDroneNew2;
};

interface EnemyProps {
  enemy: EnemyType;
  cameraX: number;
  isTankActive?: boolean;
  currentWave?: number;
}

// Get boss sprite based on current wave/level (1-10)
const getBossSprite = (wave: number = 1) => {
  const levelIndex = Math.max(0, Math.min(wave - 1, 9)); // Clamp to 0-9
  return BOSS_SPRITES_BY_LEVEL[levelIndex];
};

// NEW GROUND ENEMY SPRITE MAPPING - Images face LEFT (toward hero)
// Ground 1 & 2: Smaller cyber soldiers (~140px)
// Ground 3: Medium alien beast (~180px)
// Ground 4: Large spider tank with armor (~220px)
// Ground 5: LARGEST heavy mech with armor (~260px)
const GROUND_SPRITES: Record<string, string> = {
  robot: ground1Sprite,    // Ground 1 - Cyan cyber soldier with cannon (SMALLER)
  mech: ground2Sprite,     // Ground 2 - Purple soldier with rifle (SMALLER)
  ninja: ground3Sprite,    // Ground 3 - Dark alien beast with tentacles (MEDIUM)
  sentinel: ground4Sprite, // Ground 4 - Spider tank with turret (LARGE + ARMOR)
  giant: ground5Sprite,    // Ground 5 - LARGEST - Heavy mech (LARGEST + ARMOR)
  tank: ground6Sprite,     // Ground 4 alt - Beast tank (same as sentinel for now)
};

const ENEMY_SPRITES: Record<string, string> = {
  robot: ground1Sprite,
  drone: enemyDroneNew1, // Will be overridden by getDroneSprite
  mech: ground2Sprite,
  boss: bossLevel1, // Default, will be overridden by getBossSprite with level-specific
  ninja: ground3Sprite,
  tank: ground6Sprite,
  flyer: enemyDroneNew2, // Will be overridden by getDroneSprite  
  giant: ground5Sprite, // Giant is the LARGEST ground unit
  bomber: enemyDroneNew1, // Bomber uses heavy drone sprite
  jetrobot: enemyJetRobot, // Jet robot enemy
  sentinel: ground4Sprite,
};

const ENEMY_COLORS: Record<string, string> = {
  robot: '#00ffff',     // Cyan glow (matches ground-1 cyber soldier)
  drone: '#00ffff',
  mech: '#00ffff',      // Cyan glow (matches ground-2 purple soldier)
  boss: '#ff0000',
  ninja: '#ff3333',     // Red glow (matches ground-3 alien beast)
  tank: '#ff3333',      // Red glow (matches ground-4 spider tank)
  flyer: '#ff66ff',
  chicken: '#ffaa00',
  giant: '#ff3333',     // Red glow (matches ground-5 heavy mech)
  bomber: '#ff6600',
  jetrobot: '#00ff88',
  sentinel: '#ff3333',  // Red glow (matches ground-4 spider tank)
};

export const EnemySprite = ({ enemy, cameraX, isTankActive = false, currentWave = 1 }: EnemyProps) => {
  const screenX = enemy.x - cameraX;
  const [deathSound, setDeathSound] = useState('');
  
  useEffect(() => {
    if (enemy.isDying && !deathSound) {
      setDeathSound(ENEMY_DEATH_SOUNDS[Math.floor(Math.random() * ENEMY_DEATH_SOUNDS.length)]);
    }
  }, [enemy.isDying, deathSound]);
  
  if (screenX < -150 || screenX > 1000) return null;
  
  const color = ENEMY_COLORS[enemy.type] || '#ff4444';
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  
  // Get sprite - for boss, use level-specific sprite; for drones, use variant
  const isBoss = enemy.type === 'boss';
  const bossPhase = enemy.bossPhase || 1;
  const isDrone = enemy.type === 'drone' || enemy.type === 'flyer' || enemy.type === 'bomber';
  const isJetRobot = enemy.type === 'jetrobot';
  const sprite = isBoss 
    ? getBossSprite(currentWave) // Use level-specific boss sprite
    : isDrone 
      ? getDroneSprite(enemy.droneVariant)
      : ENEMY_SPRITES[enemy.type];
  
  // Scale enemies based on their STRENGTH (health + damage)
  // Stronger enemies are bigger, weaker enemies are smaller
  const isGiant = enemy.type === 'giant' || enemy.isGiant;
  
  // Calculate strength-based scale multiplier
  // Base scale varies by enemy type and their actual stats
  const strengthRatio = (enemy.maxHealth + enemy.damage * 5) / 200; // Normalize to ~1.0 for average
  const strengthScale = Math.max(0.5, Math.min(1.5, 0.6 + strengthRatio * 0.4)); // Range 0.5-1.5
  
  // Boss grows bigger with each phase, giants get extra scale
  const bossPhaseScale = isBoss ? (1 + (bossPhase - 1) * 0.2) : 1;
  const giantScale = isGiant ? 1.4 : 1;
  
  // Type-based base sizes - HERO is ~90x95px
  // Ground 1 & 2 (robot, mech): SLIGHTLY BIGGER than hero (~110-120px)
  // Ground 3 (ninja): MEDIUM (~180px)  
  // Ground 4 (sentinel/tank): LARGE (~220px) + 5s ARMOR
  // Ground 5 (giant): LARGEST (~260px) + 5s ARMOR
  // DRONES: LARGER for better visibility (~160-180px)
  const typeSizeMultiplier: Record<string, number> = {
    robot: 2.4,       // Ground 1 - Cyan soldier (DOUBLED - now ~216x228)
    drone: 2.2,       // Flying - BIGGER DRONES (~198x207)
    mech: 2.6,        // Ground 2 - Purple soldier (DOUBLED - now ~234x247)
    ninja: 1.9,       // Ground 3 - Alien beast (MEDIUM ~171x180)
    tank: 2.4,        // Ground 4 alt - Beast tank (LARGE ~216x228)
    sentinel: 2.4,    // Ground 4 - Spider tank (LARGE + ARMOR ~216x228)
    giant: 2.8,       // Ground 5 - LARGEST heavy mech + ARMOR (~252x266)
    bomber: 2.0,      // Flying bomber - BIGGER (~180x190)
    flyer: 1.9,       // Flying insect drone - BIGGER (~171x180)
    jetrobot: 1.2,    // Flying - medium
    boss: 1.0,        // Boss - scaled separately
  };
  
  const baseTypeScale = typeSizeMultiplier[enemy.type] || 0.7;
  const scaleFactor = baseTypeScale * strengthScale * bossPhaseScale * giantScale;
  const displayWidth = enemy.width * scaleFactor;
  const displayHeight = enemy.height * scaleFactor;
  
  // Flying enemies (drones) hover higher - GROUND UNITS positioned lower
  const isFlying = enemy.isFlying || enemy.type === 'drone' || enemy.type === 'bomber' || enemy.type === 'flyer';
  const isGroundUnit = !isFlying && enemy.type !== 'boss';
  const flyOffset = isFlying ? (enemy.flyHeight || 50) : 0;
  
  // Ground units positioned LOWER on screen
  const enemyGroundY = enemy.groundY || 115;
  const baseBottom = isFlying 
    ? 140 + flyOffset  // Flying units above ground
    : 65 + (enemyGroundY - 80) * 0.4; // Ground units spread lower (65-93 range)
  
  // Portal spawn animation OR drop-from-top animation for jet robots
  const isSpawning = enemy.isSpawning && (enemy.spawnTimer ?? 0) > 0;
  const spawnProgress = isSpawning ? 1 - ((enemy.spawnTimer ?? 0) / 0.8) : 1;
  const isDropping = enemy.isDropping && (enemy.dropTimer ?? 0) > 0;
  const dropProgress = isDropping ? 1 - ((enemy.dropTimer ?? 0) / 1.0) : 1;
  
  // Calculate drop position - starts from top of screen
  const dropStartY = 400;
  const dropEndY = 140 + flyOffset;
  const currentDropY = isDropping ? dropStartY - (dropStartY - dropEndY) * dropProgress : baseBottom;
  // Fear effect REMOVED - tank no longer causes fear
  const showFear = false;
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: screenX,
        bottom: isDropping ? currentDropY : baseBottom, // Ground units on ground, flying units above
        width: displayWidth,
        height: displayHeight,
        zIndex: isBoss ? 26 : 25, // Boss slightly above other enemies
      }}
      initial={isSpawning ? { scale: 0, opacity: 0 } : isDropping ? { y: -300 } : {}}
      animate={enemy.isDying ? {
        scale: [1, 1.3, 0],
        rotate: [0, -30, 30, 0],
        opacity: [1, 1, 0],
      } : isSpawning ? {
        scale: spawnProgress,
        opacity: spawnProgress,
      } : isDropping ? {
        y: 0,
        opacity: dropProgress,
      } : showFear ? {
        // Trembling/shaking effect when tank is active
        x: [-2, 2, -2, 2, 0],
        scale: 0.9, // Shrink slightly in fear
        opacity: 1,
      } : {
        scale: 1,
        opacity: 1,
      }}
      transition={{ 
        duration: enemy.isDying ? 0.4 : isDropping ? 0.5 : showFear ? 0.15 : 0.1,
        repeat: showFear ? Infinity : 0,
      }}
    >
      {/* FEAR INDICATOR - When tank is active */}
      {showFear && (
        <>
          {/* Fear sweat drops */}
          <motion.div
            className="absolute -top-4 left-1/4 text-[10px]"
            animate={{ y: [-2, 2, -2], opacity: [1, 0.6, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            💧
          </motion.div>
          <motion.div
            className="absolute -top-6 right-1/4 text-[10px]"
            animate={{ y: [0, -3, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.25, repeat: Infinity, delay: 0.1 }}
          >
            💧
          </motion.div>
          {/* Fear text */}
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 text-[8px] font-black whitespace-nowrap px-1 py-0.5 rounded"
            style={{
              background: 'rgba(255,100,0,0.8)',
              color: '#fff',
              textShadow: '0 0 3px #000',
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              y: [-1, 1, -1],
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            😱 FEAR!
          </motion.div>
        </>
      )}
      
      {/* Portal spawn effect */}
      {isSpawning && (
        <>
          <motion.div
            className="absolute inset-0 -m-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, #8800ff, #4400aa, transparent)',
              filter: 'blur(10px)',
            }}
            initial={{ scale: 2, opacity: 1 }}
            animate={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute inset-0 -m-6 rounded-full border-4 border-purple-500"
            initial={{ scale: 2.5, opacity: 1, rotate: 0 }}
            animate={{ scale: 0.3, opacity: 0, rotate: 360 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute inset-0 -m-4"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #ff00ff, #8800ff, transparent)',
              borderRadius: '50%',
              filter: 'blur(3px)',
            }}
            initial={{ rotate: 0, scale: 2 }}
            animate={{ rotate: 720, scale: 0.5 }}
            transition={{ duration: 0.8 }}
          />
        </>
      )}
      
      {/* Drop from top effect for jet robots */}
      {isDropping && enemy.type === 'jetrobot' && (
        <>
          {/* Jet trail from above */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: -100,
              width: 20,
              height: 120,
              background: 'linear-gradient(180deg, transparent, #00ff88, #00ffff)',
              filter: 'blur(8px)',
            }}
            animate={{ opacity: [0.8, 0.4, 0.8], height: [120, 80, 120] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
          {/* Warning indicator */}
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2 text-lg font-black"
            style={{ color: '#00ff88', textShadow: '0 0 10px #00ff88' }}
            animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            ⚠️ INCOMING ⚠️
          </motion.div>
          {/* Thruster flames */}
          <motion.div
            className="absolute left-1/4 -top-8"
            style={{
              width: 10,
              height: 30,
              background: 'linear-gradient(180deg, #fff, #00ff88, transparent)',
              filter: 'blur(2px)',
              borderRadius: '50%',
            }}
            animate={{ height: [30, 45, 30], opacity: [1, 0.7, 1] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          <motion.div
            className="absolute right-1/4 -top-8"
            style={{
              width: 10,
              height: 30,
              background: 'linear-gradient(180deg, #fff, #00ff88, transparent)',
              filter: 'blur(2px)',
              borderRadius: '50%',
            }}
            animate={{ height: [30, 45, 30], opacity: [1, 0.7, 1] }}
            transition={{ duration: 0.1, repeat: Infinity, delay: 0.05 }}
          />
        </>
      )}
      
      {/* EMP ONLY indicator for jet robots - always visible when not dropping */}
      {enemy.type === 'jetrobot' && !isDropping && !enemy.isDying && (
        <>
          {/* EMP ONLY text */}
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-xs px-2 py-0.5 rounded"
            style={{ 
              background: 'linear-gradient(135deg, #ff0066, #ff00ff)',
              color: '#fff',
              textShadow: '0 0 5px #000',
              boxShadow: '0 0 10px #ff00ff, 0 0 20px rgba(255,0,255,0.5)',
              border: '1px solid #fff',
            }}
            animate={{ 
              y: [0, -3, 0],
              boxShadow: [
                '0 0 10px #ff00ff, 0 0 20px rgba(255,0,255,0.5)',
                '0 0 15px #00ffff, 0 0 25px rgba(0,255,255,0.5)',
                '0 0 10px #ff00ff, 0 0 20px rgba(255,0,255,0.5)',
              ]
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ⚡ EMP ONLY ⚡
          </motion.div>
          
          {/* Shield icon indicator */}
          <motion.div
            className="absolute -top-4 left-1/2 -translate-x-1/2"
            style={{
              width: 16,
              height: 16,
              background: 'radial-gradient(circle, rgba(255,0,255,0.6), transparent)',
              borderRadius: '50%',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </>
      )}
      
      {/* ENEMY ARMOR INDICATOR - Shows when ground enemy has activated armor */}
      {/* Type-specific colors: Giant (orange), Sentinel (magenta/cyan), Others (magenta) */}
      {enemy.hasArmor && enemy.armorTimer && enemy.armorTimer > 0 && !enemy.isDying && (
        <>
          {/* Armor shield effect - color based on enemy type */}
          <motion.div
            className="absolute -inset-4 rounded-full pointer-events-none"
            style={{
              background: enemy.type === 'giant' 
                ? 'radial-gradient(circle, rgba(255,100,0,0.4), rgba(255,100,0,0.2), transparent)'
                : enemy.type === 'sentinel'
                ? 'radial-gradient(circle, rgba(255,0,255,0.4), rgba(255,0,255,0.2), transparent)'
                : 'radial-gradient(circle, rgba(255,0,255,0.4), rgba(255,0,255,0.2), transparent)',
              border: `3px solid ${enemy.type === 'giant' ? '#ff6600' : '#ff00ff'}`,
              boxShadow: enemy.type === 'giant'
                ? '0 0 25px #ff6600, inset 0 0 20px rgba(255,100,0,0.5)'
                : '0 0 20px #ff00ff, inset 0 0 15px rgba(255,0,255,0.5)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          {/* ARMOR text with type-specific styling */}
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-xs px-2 py-0.5 rounded"
            style={{ 
              background: enemy.type === 'giant'
                ? 'linear-gradient(135deg, #ff6600, #ff8800)'
                : enemy.type === 'sentinel'
                ? 'linear-gradient(135deg, #ff00ff, #8800ff)'
                : 'linear-gradient(135deg, #ff00ff, #8800ff)',
              color: '#fff',
              textShadow: '0 0 4px #000',
              boxShadow: `0 0 12px ${enemy.type === 'giant' ? '#ff6600' : '#ff00ff'}`,
            }}
            animate={{ y: [0, -2, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            🛡️ {enemy.type === 'giant' ? 'HEAVY ARMOR' : enemy.type === 'sentinel' ? 'SPIDER ARMOR' : 'ARMOR'} {enemy.armorTimer.toFixed(1)}s
          </motion.div>
          {/* Additional armor glow rings for giant and sentinel (the last 2 with 5s armor) */}
          {(enemy.type === 'giant' || enemy.type === 'sentinel') && (
            <>
              <motion.div
                className="absolute -inset-8 rounded-full pointer-events-none"
                style={{
                  border: `2px solid ${enemy.type === 'giant' ? 'rgba(255,100,0,0.5)' : 'rgba(255,0,255,0.5)'}`,
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute -inset-12 rounded-full pointer-events-none"
                style={{
                  border: `1px solid ${enemy.type === 'giant' ? 'rgba(255,100,0,0.3)' : 'rgba(255,0,255,0.3)'}`,
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
              />
            </>
          )}
        </>
      )}
      
      {/* ============ FLYING ENEMY (DRONE) SPECIAL VFX ============ */}
      {/* Each drone type has unique weapon visuals and movement trails */}
      {!enemy.isDying && !isSpawning && isFlying && (
        <>
          {/* DRONE - Heavy combat drone with missiles (drone_1) */}
          {enemy.type === 'drone' && (enemy.droneVariant ?? 0) % 2 === 0 && (
            <>
              {/* Blue engine glow */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: '30%',
                  right: '10%',
                  width: 16,
                  height: 16,
                  background: 'radial-gradient(circle, #00aaff, #0066ff88, transparent)',
                  boxShadow: '0 0 20px #00aaff, 0 0 40px #0066ff',
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
              {/* Second engine */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: '40%',
                  right: '15%',
                  width: 14,
                  height: 14,
                  background: 'radial-gradient(circle, #00aaff, #0066ff88, transparent)',
                  boxShadow: '0 0 15px #00aaff',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 0.25, repeat: Infinity, delay: 0.1 }}
              />
              {/* Missile pods glow (red) */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`missile-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    bottom: '25%',
                    left: `${30 + i * 12}%`,
                    width: 6,
                    height: 6,
                    background: '#ff3333',
                    boxShadow: '0 0 8px #ff0000',
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
              {/* Forward gun barrels */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: '-10%',
                  top: '50%',
                  width: 25,
                  height: 3,
                  background: 'linear-gradient(90deg, #ff6666, #333)',
                }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              />
            </>
          )}
          
          {/* DRONE - Insect drone with claws (drone_2) */}
          {enemy.type === 'drone' && (enemy.droneVariant ?? 0) % 2 === 1 && (
            <>
              {/* Red eye glow */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: '35%',
                  left: '25%',
                  width: 12,
                  height: 12,
                  background: 'radial-gradient(circle, #ff0000, #ff000088, transparent)',
                  boxShadow: '0 0 15px #ff0000, 0 0 30px #ff0000',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              {/* Wing glow trails */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`wing-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    top: `${20 + i * 5}%`,
                    right: `${20 + i * 8}%`,
                    width: 20 - i * 3,
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, rgba(150,200,255,0.6))',
                    transform: `rotate(${-30 + i * 15}deg)`,
                  }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
              {/* Claw tips glow */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`claw-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    bottom: '10%',
                    left: `${35 + i * 8}%`,
                    width: 5,
                    height: 5,
                    background: '#aa3333',
                    boxShadow: '0 0 6px #ff0000',
                  }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
              {/* Forward gun */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: '-5%',
                  top: '45%',
                  width: 18,
                  height: 2,
                  background: 'linear-gradient(90deg, #666, #333)',
                  boxShadow: '0 0 4px #666',
                }}
              />
            </>
          )}
          
          {/* BOMBER - Heavy bomber with targeting */}
          {enemy.type === 'bomber' && (
            <>
              {/* Bomb bay glow */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  bottom: '20%',
                  left: '45%',
                  width: 20,
                  height: 10,
                  background: 'radial-gradient(ellipse, #ff6600, #ff330066, transparent)',
                  boxShadow: '0 0 15px #ff6600',
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              {/* Target laser */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  bottom: -50,
                  left: '48%',
                  width: 3,
                  height: 60,
                  background: 'linear-gradient(180deg, #ff0000, #ff000033, transparent)',
                  boxShadow: '0 0 8px #ff0000',
                }}
                animate={{ opacity: [0.3, 0.7, 0.3], height: [50, 70, 50] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              {/* Engine trails */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={`trail-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    top: '40%',
                    right: -30,
                    width: 40,
                    height: 8,
                    background: 'linear-gradient(90deg, #ff660066, transparent)',
                    filter: 'blur(3px)',
                    transform: `translateY(${(i - 0.5) * 15}px)`,
                  }}
                  animate={{ width: [30, 50, 30], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </>
          )}
          
          {/* FLYER - Fast scout drone */}
          {enemy.type === 'flyer' && (
            <>
              {/* Speed trail */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  right: -40,
                  top: '40%',
                  width: 50,
                  height: 4,
                  background: 'linear-gradient(90deg, #ff66ff44, transparent)',
                  filter: 'blur(2px)',
                }}
                animate={{ width: [40, 60, 40] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              />
              {/* Pulse effect */}
              <motion.div
                className="absolute -inset-2 rounded-full pointer-events-none"
                style={{
                  border: '1px solid #ff66ff44',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </>
          )}
        </>
      )}
      
      {/* ============ GROUND ENEMY SPECIAL VFX ============ */}
      {/* Each ground enemy type has unique visual effects */}
      {!enemy.isDying && !isSpawning && isGroundUnit && (
        <>
          {/* GROUND 1 & 2 (robot, mech) - Cyan energy lines and scanner effect */}
          {(enemy.type === 'robot' || enemy.type === 'mech') && (
            <>
              {/* Scanning laser line */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: -20,
                  top: '40%',
                  width: 40,
                  height: 2,
                  background: 'linear-gradient(90deg, #00ffff, #fff, #00ffff)',
                  boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
                }}
                animate={{ 
                  top: ['35%', '60%', '35%'],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {/* Energy pulse at feet */}
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: displayWidth * 0.8,
                  height: 8,
                  background: 'radial-gradient(ellipse, #00ffff88, transparent)',
                }}
                animate={{ scaleX: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </>
          )}
          
          {/* GROUND 3 (ninja - alien beast) - Red/orange tentacle glow and threat aura */}
          {enemy.type === 'ninja' && (
            <>
              {/* Menacing red aura */}
              <motion.div
                className="absolute -inset-4 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255,50,50,0.3), transparent)',
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              {/* Tentacle glow tips */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`tentacle-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 8,
                    height: 8,
                    background: '#00ffff',
                    boxShadow: '0 0 15px #00ffff, 0 0 25px #00ffff',
                    top: `${15 + i * 10}%`,
                    right: `${-5 + i * 5}%`,
                  }}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </>
          )}
          
          {/* GROUND 4 (sentinel - spider tank) - Red laser targeting and heavy glow */}
          {enemy.type === 'sentinel' && (
            <>
              {/* Red targeting laser */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: -80,
                  top: '25%',
                  width: 100,
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #ff3333, #ff0000)',
                  boxShadow: '0 0 8px #ff0000',
                }}
                animate={{ 
                  opacity: [0.4, 0.9, 0.4],
                  width: [80, 120, 80],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              {/* Turret charging glow */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: '15%',
                  left: '30%',
                  width: 20,
                  height: 20,
                  background: 'radial-gradient(circle, #ff0000, #ff000088, transparent)',
                  boxShadow: '0 0 20px #ff0000',
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              {/* Ground impact dust */}
              <motion.div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                style={{
                  width: displayWidth * 1.2,
                  height: 12,
                  background: 'radial-gradient(ellipse, rgba(100,100,100,0.5), transparent)',
                }}
                animate={{ scaleX: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </>
          )}
          
          {/* GROUND 5 (giant - heavy mech) - LARGEST with steam, power aura, and heavy FX */}
          {enemy.type === 'giant' && (
            <>
              {/* Power core glow */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: '30%',
                  left: '40%',
                  width: 30,
                  height: 30,
                  background: 'radial-gradient(circle, #ff6600, #ff330088, transparent)',
                  boxShadow: '0 0 30px #ff6600, 0 0 50px #ff330088',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              {/* Steam vents from shoulders */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={`steam-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    top: '10%',
                    left: i === 0 ? '20%' : '70%',
                    width: 15,
                    height: 30,
                    background: 'linear-gradient(180deg, rgba(200,200,200,0.6), transparent)',
                    filter: 'blur(3px)',
                  }}
                  animate={{ 
                    height: [20, 40, 20],
                    opacity: [0.4, 0.8, 0.4],
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
              {/* Heavy footstep impact zone */}
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                style={{
                  width: displayWidth * 1.4,
                  height: 15,
                  background: 'radial-gradient(ellipse, rgba(255,100,0,0.4), rgba(100,100,100,0.3), transparent)',
                }}
                animate={{ scaleX: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              {/* Intimidation aura */}
              <motion.div
                className="absolute -inset-8 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255,100,0,0.2), transparent)',
                  border: '1px solid rgba(255,100,0,0.3)',
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </>
          )}
          
          {/* GROUND 4 alt (tank) - Similar to sentinel */}
          {enemy.type === 'tank' && (
            <>
              {/* Red targeting laser */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: -60,
                  top: '30%',
                  width: 80,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #ff3333)',
                  boxShadow: '0 0 6px #ff0000',
                }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              {/* Turret glow */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: '20%',
                  left: '35%',
                  width: 15,
                  height: 15,
                  background: 'radial-gradient(circle, #ff3333, transparent)',
                  boxShadow: '0 0 15px #ff3333',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              />
            </>
          )}
        </>
      )}
      
      {/* Death effects */}
      {enemy.isDying && (
        <>
          <motion.div
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, #fff, ${color}, transparent)`,
              filter: 'blur(8px)',
            }}
          />
          {[0, 1, 2].map(i => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 2.5 + i, opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="absolute inset-0 rounded-full border-3"
              style={{ borderColor: i % 2 === 0 ? color : '#ffff00' }}
            />
          ))}
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1.3 }}
            animate={{ opacity: 0, y: -80, scale: 1.6 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-lg"
            style={{ color: '#ff4400', textShadow: '0 0 15px #ff0000, 0 0 30px #ff4400' }}
          >
            {deathSound}
          </motion.div>
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -100 }}
            transition={{ duration: 1 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-xl"
            style={{ color: '#ffff00', textShadow: '0 0 15px #ffff00, 0 0 30px #ff8800' }}
          >
            +{enemy.type === 'boss' ? 2500 : enemy.type === 'tank' ? 300 : enemy.type === 'mech' ? 180 : 60}
          </motion.div>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`debris-${i}`}
              className="absolute w-3 h-3 rounded"
              style={{ 
                background: color,
                left: '50%',
                top: '50%',
              }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ 
                x: (Math.random() - 0.5) * 150,
                y: (Math.random() - 0.5) * 150,
                rotate: Math.random() * 540,
                opacity: 0,
              }}
              transition={{ duration: 0.5, delay: i * 0.015 }}
            />
          ))}
        </>
      )}
      
      {/* Enemy Sprite - Original Style */}
      <motion.div
        className="relative w-full h-full"
        animate={enemy.isDying ? {} : {
          y: ['drone', 'flyer'].includes(enemy.type) ? [0, -10, 0] : [0, -3, 0],
          rotate: enemy.type === 'drone' ? [-3, 3, -3] : 0,
          scaleX: enemy.type === 'boss' ? [1, 1.02, 1] : 1,
        }}
        transition={{ duration: ['drone', 'flyer'].includes(enemy.type) ? 0.7 : 0.35, repeat: Infinity }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            filter: `drop-shadow(0 0 ${isBoss ? (bossPhase === 3 ? 40 : 25) : 10}px ${bossPhase === 3 ? '#ff0000' : color})`,
          }}
        >
        {sprite ? (
            <img 
              src={sprite} 
              alt={enemy.type}
              className="w-full h-full object-contain"
              style={{
                // ALL enemies face LEFT toward hero - use scaleX(-1) to flip
                transform: 'scaleX(-1)',
                // Remove any white background - use transparency
                background: 'transparent',
                // Ensure PNG transparency is preserved  
                mixBlendMode: 'normal',
                // Make boss phase 3 image super bright and visible
                filter: isBoss && bossPhase === 3 
                  ? 'brightness(1.4) saturate(1.5) contrast(1.2)' 
                  : isBoss && bossPhase === 2 
                    ? 'brightness(1.2) saturate(1.2)' 
                    : 'none',
              }}
            />
          ) : (
            <div
              className="w-full h-full rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}88)`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 15px ${color}`,
              }}
            >
              <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full"
                style={{ background: '#ff0000', boxShadow: '0 0 15px #ff0000' }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.25, repeat: Infinity }}
              />
            </div>
          )}
          
          {/* Glowing eye effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            <div 
              className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, #ff0000, #ff000088)',
                boxShadow: '0 0 15px #ff0000, 0 0 30px #ff0000',
              }}
            />
          </motion.div>
          
          {/* SLASH ATTACK - Melee visual effect */}
          {enemy.isSlashing && (
            <motion.div
              className="absolute pointer-events-none"
              style={{ 
                left: -40,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
              initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], rotate: [45, -30], scale: [0.5, 1.2, 1.2, 0.8] }}
              transition={{ duration: 0.25 }}
            >
              {/* Slash arc */}
              <div
                style={{
                  width: 50,
                  height: 8,
                  background: 'linear-gradient(90deg, transparent, #ff4400, #ffff00, #fff, transparent)',
                  borderRadius: 4,
                  boxShadow: '0 0 15px #ff4400, 0 0 25px #ffff00',
                  filter: 'blur(1px)',
                }}
              />
              {/* Slash sparks */}
              {[0, 1, 2].map(i => (
                <motion.div
                  key={`slash-spark-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    background: '#ffff00',
                    boxShadow: '0 0 6px #ffff00',
                    left: 10 + i * 15,
                    top: -5 + i * 5,
                  }}
                  animate={{ 
                    x: [-10 - i * 20, -30 - i * 30], 
                    y: [-5 + i * 10, -15 + i * 15],
                    opacity: [1, 0],
                    scale: [1, 0.5],
                  }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                />
              ))}
            </motion.div>
          )}
          
          {/* Enemy shooting muzzle flash - from TORSO CENTER */}
          {enemy.attackCooldown <= 0.5 && enemy.attackCooldown > 0 && !enemy.isSlashing && (
            <motion.div
              className="absolute"
              style={{ 
                left: enemy.type === 'sentinel' ? -80 : -25,
                top: '50%', // Torso center
                transform: 'translateY(-50%)',
              }}
              initial={{ scale: 0 }}
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.8, 1.4, 0.8] }}
              transition={{ duration: 0.1, repeat: Infinity }}
            >
              {/* SENTINEL LASER BEAM - wide, hot pink laser with screen flash */}
              {enemy.type === 'sentinel' && (
                <>
                  {/* Main laser beam */}
                  <motion.div
                    style={{
                      width: 120,
                      height: 12,
                      background: 'linear-gradient(90deg, #fff, #ff0066, #ff0044, #ff0066, #fff)',
                      boxShadow: '0 0 30px #ff0066, 0 0 60px #ff0066, 0 0 100px rgba(255,0,102,0.5)',
                      borderRadius: 6,
                    }}
                    animate={{ 
                      scaleY: [1, 1.5, 1],
                      opacity: [0.9, 1, 0.9],
                    }}
                    transition={{ duration: 0.08, repeat: Infinity }}
                  />
                  {/* Laser core - white hot center */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{
                      width: 110,
                      height: 4,
                      left: 5,
                      background: 'linear-gradient(90deg, #fff, #ffaacc, #fff)',
                      filter: 'blur(1px)',
                      borderRadius: 4,
                    }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 0.05, repeat: Infinity }}
                  />
                  {/* Screen flash effect around laser origin */}
                  <motion.div
                    className="absolute -inset-20 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,0,102,0.4), transparent 70%)',
                    }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [0.5, 1.5], opacity: [0.8, 0] }}
                    transition={{ duration: 0.15, repeat: Infinity }}
                  />
                  {/* Laser impact sparks */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`laser-spark-${i}`}
                      className="absolute rounded-full"
                      style={{
                        width: 4 + Math.random() * 4,
                        height: 4 + Math.random() * 4,
                        left: 110,
                        top: -10 + i * 5,
                        background: i % 2 === 0 ? '#ff0066' : '#fff',
                        boxShadow: `0 0 8px ${i % 2 === 0 ? '#ff0066' : '#ffaacc'}`,
                      }}
                      animate={{
                        x: [0, 20 + Math.random() * 20],
                        y: [(i - 2) * 5, (i - 2) * 15],
                        opacity: [1, 0],
                        scale: [1, 0.3],
                      }}
                      transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.03 }}
                    />
                  ))}
                </>
              )}
              
              {/* Regular muzzle flash for other enemies */}
              {/* ENHANCED MUZZLE FLASH FX - Type-specific effects */}
              {enemy.type !== 'sentinel' && (
                <>
                  {/* Main muzzle flash */}
                  <motion.div 
                    className="w-8 h-8 rounded-full"
                    style={{
                      background: enemy.type === 'drone' 
                        ? 'radial-gradient(circle, #fff, #00ffff, #0088ff, transparent)'
                        : enemy.type === 'giant'
                        ? 'radial-gradient(circle, #fff, #ff6600, #ff4400, transparent)'
                        : enemy.type === 'tank'
                        ? 'radial-gradient(circle, #fff, #00ffff, #00aaff, transparent)'
                        : enemy.type === 'mech'
                        ? 'radial-gradient(circle, #fff, #ff0066, #ff0044, transparent)'
                        : 'radial-gradient(circle, #fff, #ff8800, #ff4400, transparent)',
                      boxShadow: enemy.type === 'drone'
                        ? '0 0 25px #00ffff, 0 0 50px #0088ff'
                        : enemy.type === 'giant'
                        ? '0 0 35px #ff6600, 0 0 70px #ff4400'
                        : enemy.type === 'tank'
                        ? '0 0 30px #00ffff, 0 0 60px #00aaff'
                        : enemy.type === 'mech'
                        ? '0 0 30px #ff0066, 0 0 60px #ff0044'
                        : '0 0 20px #ff8800, 0 0 40px #ff4400',
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.8, 1] }}
                    transition={{ duration: 0.08, repeat: Infinity }}
                  />
                  {/* Energy discharge sparks */}
                  {(enemy.type === 'giant' || enemy.type === 'tank' || enemy.type === 'mech') && (
                    <>
                      {[0, 1, 2, 3].map(i => (
                        <motion.div
                          key={`spark-${i}`}
                          className="absolute rounded-full"
                          style={{
                            width: 4 + (enemy.type === 'giant' ? 2 : 0),
                            height: 4 + (enemy.type === 'giant' ? 2 : 0),
                            background: enemy.type === 'giant' ? '#ffff00' : enemy.type === 'tank' ? '#00ffff' : '#ff0066',
                            boxShadow: `0 0 8px ${enemy.type === 'giant' ? '#ffff00' : enemy.type === 'tank' ? '#00ffff' : '#ff0066'}`,
                          }}
                          initial={{ x: 0, y: 0 }}
                          animate={{
                            x: [0, -30 - i * 10, -50 - i * 15],
                            y: [0, (i - 1.5) * 12, (i - 1.5) * 20],
                            opacity: [1, 0.7, 0],
                            scale: [1, 0.7, 0.2],
                          }}
                          transition={{ duration: 0.25, repeat: Infinity, delay: i * 0.04 }}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
              {/* Flash rings - enhanced for all types */}
              {[0, 1].map(i => (
                <motion.div
                  key={`flash-${i}`}
                  className="absolute rounded-full border-2"
                  style={{
                    left: enemy.type === 'sentinel' ? 100 - i * 5 : -5 - i * 5,
                    top: -5 - i * 5,
                    width: 16 + i * 10 + (enemy.type === 'giant' ? 8 : 0),
                    height: 16 + i * 10 + (enemy.type === 'giant' ? 8 : 0),
                    borderColor: enemy.type === 'sentinel' ? '#ff0066' 
                      : enemy.type === 'drone' ? '#00ffff' 
                      : enemy.type === 'giant' ? '#ff6600'
                      : enemy.type === 'tank' ? '#00ffff'
                      : enemy.type === 'mech' ? '#ff0066'
                      : '#ff8800',
                  }}
                  animate={{ scale: [1, 2.5], opacity: [1, 0] }}
                  transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.04 }}
                />
              ))}
              {/* Smoke/energy trail */}
              {enemy.type !== 'drone' && enemy.type !== 'sentinel' && (
                <motion.div
                  className="absolute"
                  style={{
                    left: -25,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: enemy.type === 'giant' ? 50 : 35,
                    height: enemy.type === 'giant' ? 20 : 14,
                    background: enemy.type === 'giant' 
                      ? 'linear-gradient(90deg, transparent, rgba(255,100,0,0.7), rgba(255,200,0,0.5))'
                      : enemy.type === 'tank'
                      ? 'linear-gradient(90deg, transparent, rgba(0,200,255,0.6), rgba(0,255,255,0.4))'
                      : enemy.type === 'mech'
                      ? 'linear-gradient(90deg, transparent, rgba(255,0,100,0.6), rgba(255,100,100,0.4))'
                      : 'linear-gradient(90deg, transparent, rgba(100,100,100,0.6), rgba(200,200,200,0.4))',
                    filter: 'blur(4px)',
                    borderRadius: '50%',
                  }}
                  animate={{ opacity: [0.9, 0.4], x: [-5, -35] }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </motion.div>
          )}
        </motion.div>
        
        {/* Boss special effects - SCARY with phases */}
        {enemy.type === 'boss' && !enemy.isDying && (
          <>
            {/* BOSS SHIELD - glowing protective barrier - SCALED TO HITBOX */}
            {enemy.bossShieldTimer && enemy.bossShieldTimer > 0 && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  // FIXED: Shield scaled to 90% of boss dimensions - not oversized!
                  top: '5%',
                  left: '5%',
                  right: '5%',
                  bottom: '5%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,255,255,0.1), rgba(0,200,255,0.2), transparent 60%)',
                  border: '2px solid rgba(0,255,255,0.8)',
                  boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff60, inset 0 0 15px rgba(0,255,255,0.15)',
                }}
                animate={{ 
                  scale: [1, 1.03, 1],
                  opacity: [0.7, 0.9, 0.7],
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                {/* Shield timer indicator - positioned at top of shield */}
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ 
                    color: '#00ffff', 
                    textShadow: '0 0 5px #00ffff',
                    background: 'rgba(0,0,0,0.7)',
                    border: '1px solid #00ffff',
                  }}
                >
                  🛡️ {enemy.bossShieldTimer.toFixed(1)}s
                </motion.div>
              </motion.div>
            )}
            
            {/* BOSS JUMP ATTACK INDICATOR - Shows when boss is off screen */}
            {enemy.isJumpAttacking && (
              <>
                <motion.div
                  className="absolute -top-20 left-1/2 -translate-x-1/2 text-lg font-black whitespace-nowrap"
                  style={{ 
                    color: '#ff4400', 
                    textShadow: '0 0 12px #ff0000, 0 0 24px #ff4400',
                  }}
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                >
                  {enemy.jumpAttackPhase === 'jumping' ? '⬆️ JUMPING!' : 
                   enemy.jumpAttackPhase === 'bombing' ? '💣 BOMBS INCOMING! 💣' : 
                   '⬇️ LANDING!'}
                </motion.div>
                
                {/* Warning shadow on ground during jump */}
                {enemy.jumpAttackPhase === 'bombing' && (
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      bottom: -50,
                      width: displayWidth * 1.5,
                      height: 30,
                      background: 'radial-gradient(ellipse, rgba(255,0,0,0.5), rgba(255,100,0,0.3), transparent)',
                      filter: 'blur(5px)',
                    }}
                    animate={{ 
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </>
            )}
            
            {/* Menacing aura - subtle for all phases */}
            <motion.div
              className="absolute rounded-full -z-10"
              style={{
                inset: -10,
                background: bossPhase === 3 
                  ? 'radial-gradient(circle, rgba(255,50,0,0.3), rgba(255,0,0,0.15), transparent)'
                  : bossPhase === 2
                  ? 'radial-gradient(circle, rgba(255,50,0,0.25), rgba(75,0,0,0.15), transparent)'
                  : 'radial-gradient(circle, rgba(255,0,0,0.2), rgba(50,0,0,0.1), transparent)',
                filter: 'blur(8px)',
              }}
              animate={{ 
                opacity: [0.4, 0.6, 0.4] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* PHASE 3 - Subtle glow layer behind boss - reduced for visibility */}
            {bossPhase === 3 && (
              <motion.div
                className="absolute -inset-12 rounded-full -z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(255,100,0,0.2), rgba(255,0,0,0.1), transparent)',
                  filter: 'blur(15px)',
                }}
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            
            {/* Phase 2+ evil eyes */}
            {bossPhase >= 2 && (
              <>
                <motion.div
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    left: '30%',
                    top: '20%',
                    background: 'radial-gradient(circle, #ff0000, #aa0000)',
                    boxShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    right: '30%',
                    top: '20%',
                    background: 'radial-gradient(circle, #ff0000, #aa0000)',
                    boxShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: 0.15 }}
                />
              </>
            )}
            
            {/* Phase 3 rage flames - REDUCED for visibility */}
            {bossPhase === 3 && (
              <>
                {/* Subtle outer glow ring - much less intense */}
                <motion.div
                  className="absolute -inset-8 rounded-full -z-10"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,50,0,0.3), transparent)',
                    filter: 'blur(10px)',
                  }}
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Small rage flames at top only */}
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={`flame-${i}`}
                    className="absolute -z-10"
                    style={{
                      left: `${25 + i * 25}%`,
                      top: '-15%',
                      width: 10,
                      height: 20,
                      background: 'linear-gradient(0deg, #ff4400, #ffff00, transparent)',
                      borderRadius: '50%',
                      filter: 'blur(3px)',
                    }}
                    animate={{ 
                      height: [20, 30, 20], 
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
                {/* Rage text indicator - smaller and less intrusive */}
                <motion.div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black whitespace-nowrap"
                  style={{ 
                    color: '#ff4400', 
                    textShadow: '0 0 10px #ff0000',
                  }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ☠️ RAGE ☠️
                </motion.div>
              </>
            )}
            
            {/* Fire breathing - faster with phase */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ left: -50 - bossPhase * 10 }}
              animate={{ scaleX: [0.4, 1 + bossPhase * 0.2, 0.4], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 0.25 / bossPhase, repeat: Infinity }}
            >
              <div 
                className="w-16 h-8 rounded-full"
                style={{
                  width: 64 + bossPhase * 16,
                  background: bossPhase === 3 
                    ? 'linear-gradient(90deg, transparent, #ff0000, #ff4400, #ffff00)'
                    : 'linear-gradient(90deg, transparent, #ff4400, #ffff00)',
                  filter: 'blur(4px)',
                }}
              />
            </motion.div>
            
            {/* Dripping biomass effect */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={`drip-${i}`}
                className="absolute w-1 rounded-full"
                style={{
                  left: `${30 + i * 25}%`,
                  top: '80%',
                  height: 10 + Math.random() * 8 + bossPhase * 4,
                  background: bossPhase === 3 
                    ? 'linear-gradient(180deg, #ff0000, #660000)'
                    : 'linear-gradient(180deg, #ff2200, #aa0000)',
                }}
                animate={{
                  height: [10, 18 + bossPhase * 4, 10],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 0.8 + i * 0.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </>
        )}
        
        {/* Drone propeller */}
        {enemy.type === 'drone' && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-3"
            style={{ background: 'linear-gradient(90deg, transparent, #00ffff88, transparent)' }}
            animate={{ scaleX: [0.3, 1.2, 0.3], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.05, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Health bar - NOT on boss (use BossHUD instead) */}
      {!isBoss && (
        <div 
          className="absolute left-0 w-full rounded-full overflow-hidden -top-5 h-3"
          style={{ 
            background: 'rgba(0,0,0,0.9)', 
            border: `1px solid ${color}`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        >
          <motion.div
            className="h-full"
            style={{ 
              width: `${healthPercent}%`,
              background: `linear-gradient(90deg, ${color}, ${color}cc)`,
              boxShadow: `0 0 10px ${color}`,
            }}
            animate={{ opacity: healthPercent < 30 ? [1, 0.5, 1] : 1 }}
            transition={{ duration: 0.2, repeat: healthPercent < 30 ? Infinity : 0 }}
          />
        </div>
      )}
      
      {/* TARGETING INDICATOR - shows who enemy is targeting (ALL RED) */}
      {!isBoss && !enemy.isDying && !enemy.isSpawning && enemy.targetType && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold px-1 py-0.5 rounded whitespace-nowrap"
          style={{
            fontSize: '8px',
            background: 'linear-gradient(135deg, #ff0000, #cc0000)',
            color: '#fff',
            boxShadow: '0 0 6px #ff0000',
            border: '1px solid #ff4444',
          }}
          animate={{ 
            y: [0, -1, 0],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          {enemy.targetType === 'ally' ? '🎯ALLY' : '🎯HERO'}
        </motion.div>
      )}
      
      {/* Damage sparks */}
      {healthPercent < 35 && !enemy.isDying && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: '#ffff00',
                left: `${20 + i * 25}%`,
                top: `${20 + (i * 20) % 50}%`,
                boxShadow: '0 0 8px #ffff00',
              }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.4], y: [-3, 3, -3] }}
              transition={{ duration: 0.25, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-500/40"
            animate={{ y: [-8, -20], opacity: [0.4, 0], scale: [0.4, 1.2] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        </>
      )}
    </motion.div>
  );
};
