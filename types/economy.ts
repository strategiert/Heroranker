export type ResourceType = 'credits' | 'biomass' | 'nanosteel' | 'gems' | 'dark_matter';

export interface Resources {
  credits: number;
  biomass: number;
  nanosteel: number;
  gems: number;
  dark_matter: number;
}

export enum BuildingType {
  COMMAND_CENTER = 'COMMAND_CENTER',
  HYDROPONICS = 'HYDROPONICS',
  NANO_FOUNDRY = 'NANO_FOUNDRY',
  CREDIT_TERMINAL = 'CREDIT_TERMINAL',
  BARRACKS = 'BARRACKS',
  MED_BAY = 'MED_BAY',
  RADAR = 'RADAR',
  TECH_LAB = 'TECH_LAB',
  SHIELD_GENERATOR = 'SHIELD_GENERATOR',
  ALLIANCE_HUB = 'ALLIANCE_HUB'
}

export type BuildingStatus = 'IDLE' | 'UPGRADING' | 'BUILDING';

export interface BuildingState {
  id: string;
  type: BuildingType;
  level: number;
  status: BuildingStatus;
  finishTime?: number; // Timestamp in ms
  lastCollectionTime?: number; // Timestamp in ms for passive production
}

export interface TroopState {
  count: number;
  tier: number; // 1-10
  wounded: number;
}

export interface GameState {
  resources: Resources;
  buildings: BuildingState[];
  troops: TroopState;
  builderDroids: number;
  lastSaveTime: number;
}

export const INITIAL_RESOURCES: Resources = {
  credits: 1000,
  biomass: 1000,
  nanosteel: 500,
  gems: 50,
  dark_matter: 0
};

// Configuration for building limits and requirements
export const BUILDING_LIMITS: Record<BuildingType, number> = {
  [BuildingType.COMMAND_CENTER]: 1,
  [BuildingType.SHIELD_GENERATOR]: 1,
  [BuildingType.HYDROPONICS]: 5,
  [BuildingType.NANO_FOUNDRY]: 5,
  [BuildingType.CREDIT_TERMINAL]: 5,
  [BuildingType.BARRACKS]: 4,
  [BuildingType.MED_BAY]: 4,
  [BuildingType.RADAR]: 1,
  [BuildingType.TECH_LAB]: 1,
  [BuildingType.ALLIANCE_HUB]: 1,
};