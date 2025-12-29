import { BuildingState, Resources, BuildingDefinition, ResourceType } from '../types/economy';
import { BUILDING_DEFINITIONS } from '../data/buildings';

/**
 * ENGINE: Pure functions for game logic.
 */

// 1. Calculate Cost for NEXT Level
export const calculateCost = (def: BuildingDefinition, currentLevel: number): Resources => {
  // Logic: Cost to go FROM currentLevel TO currentLevel + 1
  const multiplier = Math.pow(def.costGrowth, currentLevel);
  
  return {
    credits: Math.floor((def.baseCost.credits || 0) * multiplier),
    biomass: Math.floor((def.baseCost.biomass || 0) * multiplier),
    nanosteel: Math.floor((def.baseCost.nanosteel || 0) * multiplier),
    gems: 0
  };
};

// 2. Calculate Production Rate (Per Hour) for CURRENT Level
export const calculateProduction = (def: BuildingDefinition, currentLevel: number): Resources => {
  const result: Resources = { credits: 0, biomass: 0, nanosteel: 0, gems: 0 };
  
  if (!def.baseProduction || !def.resource || !def.prodGrowth) return result;

  // Formula: Base * (Growth ^ (Level - 1))
  const multiplier = Math.pow(def.prodGrowth, Math.max(0, currentLevel - 1));
  const amount = Math.floor(def.baseProduction * multiplier);

  if (def.resource === 'credits') result.credits = amount;
  if (def.resource === 'biomass') result.biomass = amount;
  if (def.resource === 'nanosteel') result.nanosteel = amount;
  if (def.resource === 'gems') result.gems = amount;

  return result;
};

// 3. Calculate Build Time (Seconds) for NEXT Level
export const calculateBuildTime = (def: BuildingDefinition, currentLevel: number): number => {
  // Linear for first few levels to keep game fast
  if (currentLevel < 3) return def.baseTime * currentLevel;

  // Exponential afterwards
  // Formula: BaseTime * (Growth ^ (Level - 1))
  const multiplier = Math.pow(def.timeGrowth, currentLevel - 1);
  return Math.floor(def.baseTime * multiplier);
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

// 4. Calculate Offline Production
const MAX_OFFLINE_SECONDS = 12 * 60 * 60; // 12 Hours Cap

export const calculateOfflineProduction = (
  buildings: BuildingState[],
  lastSaveTime: number
): { resources: Resources, seconds: number } => {
  const now = Date.now();
  const diff = (now - lastSaveTime) / 1000;
  
  if (diff < 10) return { resources: { credits: 0, biomass: 0, nanosteel: 0, gems: 0 }, seconds: 0 };

  const secondsCalculated = Math.min(diff, MAX_OFFLINE_SECONDS);
  
  let totalCredits = 0;
  let totalBiomass = 0;
  let totalNanosteel = 0;

  buildings.forEach(b => {
    // Only finished buildings produce
    if (b.status === 'IDLE' || (b.finishTime && b.finishTime < now)) {
        const def = BUILDING_DEFINITIONS[b.type];
        if (def && def.baseProduction) {
            const prodPerHour = calculateProduction(def, b.level);
            
            // Production per second * seconds offline
            totalCredits += (prodPerHour.credits / 3600) * secondsCalculated;
            totalBiomass += (prodPerHour.biomass / 3600) * secondsCalculated;
            totalNanosteel += (prodPerHour.nanosteel / 3600) * secondsCalculated;
        }
    }
  });

  return {
    resources: {
        credits: Math.floor(totalCredits),
        biomass: Math.floor(totalBiomass),
        nanosteel: Math.floor(totalNanosteel),
        gems: 0
    },
    seconds: Math.floor(secondsCalculated)
  };
};