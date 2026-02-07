/**
 * Game Constants - Centralized configuration for game mechanics
 * Organized by category for easy maintenance
 */

// =============================================================================
// HERO DEPTH MOVEMENT CONSTANTS
// Creates visual depth feeling without affecting attack paths
// =============================================================================
export const HERO_DEPTH_MOVEMENT = {
  // Primary wave - slow vertical bob
  PRIMARY_AMPLITUDE: 6,      // Pixels of vertical movement
  PRIMARY_FREQUENCY: 0.015,  // How fast the wave cycles (based on x position)
  
  // Secondary wave - faster subtle movement for organic feel
  SECONDARY_AMPLITUDE: 3,
  SECONDARY_FREQUENCY: 0.04,
  
  // Running bob - additional movement when walking
  RUNNING_AMPLITUDE: 4,
  RUNNING_SPEED: 0.02,       // Based on time
} as const;

// =============================================================================
// GROUND Y POSITIONS - Attack paths for different lanes
// These remain FIXED regardless of visual hero position
// =============================================================================
export const GROUND_LANES = {
  // Hero always fires from this Y position (visual depth is separate)
  HERO_FIRE_Y: 85,
  
  // Ground enemy lanes (5-lane system)
  LANE_1: 20,   // Closest to camera
  LANE_2: 30,
  LANE_3: 40,   // Middle lane (GROUND_Y_MIDDLE)
  LANE_4: 50,
  LANE_5: 60,   // Furthest from camera
  
  // Flying enemy heights
  DRONE_MIN_HEIGHT: 140,
  DRONE_MAX_HEIGHT: 200,
  BOMBER_HEIGHT: 180,
} as const;

// Alias for backward compatibility
export const GROUND_Y_MIDDLE = GROUND_LANES.LANE_3;

// =============================================================================
// ENTITY SIZES
// =============================================================================
export const ENTITY_SIZES = {
  HERO: { width: 90, height: 95 },
  HERO_SPACESHIP: { width: 110, height: 70 },
  
  // Standard enemies
  ROBOT: { width: 40, height: 50 },
  DRONE: { width: 35, height: 30 },
  MECH: { width: 60, height: 70 },
  
  // Boss sizes scale with wave
  BOSS_BASE: { width: 100, height: 120 },
} as const;

// =============================================================================
// PROJECTILE SPEEDS
// =============================================================================
export const PROJECTILE_SPEEDS = {
  HERO_BULLET: 12,
  ENEMY_LASER: 6,
  DRONE_FIRE: 5,
  TANK_SHELL: 15,
  MECH_MISSILE: 8,
  BOSS_FIREBALL: 7,
  BOSS_LASER: 10,
} as const;

// =============================================================================
// TIMING CONSTANTS
// =============================================================================
export const TIMING = {
  // Attack cooldowns
  HERO_SHOOT_COOLDOWN: 0.15,
  ENEMY_ATTACK_COOLDOWN: 1.5,
  DRONE_ATTACK_COOLDOWN: 2.0,
  BOSS_ATTACK_COOLDOWN: 3.0,
  
  // Effect durations
  ULT_DURATION: 6,
  RAY_CANNON_DURATION: 3,
  SHIELD_DURATION: 10,
  
  // Cleanup intervals
  PARTICLE_CLEANUP: 0.5,
  PROJECTILE_MAX_AGE: 3,
} as const;

// =============================================================================
// VISUAL LIMITS - Performance optimization
// =============================================================================
export const VISUAL_LIMITS = {
  MAX_ENEMY_LASERS: 10,
  MAX_FIREBALLS: 6,
  MAX_PROJECTILES: 5,
  MAX_PARTICLES: 50,
  MAX_DAMAGE_NUMBERS: 20,
} as const;

// =============================================================================
// POWER-UP TIERS - Visual styling based on damage multiplier
// =============================================================================
export const POWER_UP_TIERS = {
  SUPER: { threshold: 1.5, glowColor: '#ffaa00', pulseSpeed: 0.3, auraSize: 10 },
  ULTRA: { threshold: 2.0, glowColor: '#ff6600', pulseSpeed: 0.25, auraSize: 15 },
  MYTHIC: { threshold: 2.5, glowColor: '#ff4400', pulseSpeed: 0.2, auraSize: 20 },
  LEGENDARY: { threshold: 3.0, glowColor: '#ff00ff', pulseSpeed: 0.15, auraSize: 25 },
} as const;

// Helper function to get power-up tier
export const getPowerUpTier = (multiplier: number) => {
  if (multiplier >= POWER_UP_TIERS.LEGENDARY.threshold) return POWER_UP_TIERS.LEGENDARY;
  if (multiplier >= POWER_UP_TIERS.MYTHIC.threshold) return POWER_UP_TIERS.MYTHIC;
  if (multiplier >= POWER_UP_TIERS.ULTRA.threshold) return POWER_UP_TIERS.ULTRA;
  if (multiplier >= POWER_UP_TIERS.SUPER.threshold) return POWER_UP_TIERS.SUPER;
  return null;
};
