export type ResourceType = 'credits' | 'biomass' | 'nanosteel' | 'gems';

export interface Resources {
  credits: number;
  biomass: number;
  nanosteel: number;
  gems: number;
}

export enum BuildingType {
  // HQ
  COMMAND_CENTER = 'COMMAND_CENTER',
  
  // PRODUCTION
  NANO_FOUNDRY = 'NANO_FOUNDRY',
  HYDROPONICS = 'HYDROPONICS',
  CREDIT_TERMINAL = 'CREDIT_TERMINAL',
  
  // STORAGE
  NANO_VAULT = 'NANO_VAULT',
  BIO_SILO = 'BIO_SILO',
  
  // MILITARY
  BARRACKS = 'BARRACKS',
  MED_BAY = 'MED_BAY',
  SHIELD_GENERATOR = 'SHIELD_GENERATOR',
  
  // FACTORIES
  TERRA_FACTORY = 'TERRA_FACTORY',
  AERO_DOCK = 'AERO_DOCK',
  CYBER_UPLINK = 'CYBER_UPLINK',
  
  // UTILITY & RESEARCH
  RADAR_STATION = 'RADAR_STATION',
  TECH_LAB = 'TECH_LAB',
  ALLIANCE_HUB = 'ALLIANCE_HUB'
}

export type BuildingCategory = 
  | 'HQ' 
  | 'PRODUCTION' 
  | 'STORAGE' 
  | 'MILITARY' 
  | 'DEFENSE' 
  | 'UTILITY' 
  | 'RESEARCH';

export type BuildingStatus = 'IDLE' | 'UPGRADING';

export interface BuildingState {
  id: string; // Unique Instance ID (e.g. "hydro_1")
  type: BuildingType;
  level: number;
  status: BuildingStatus;
  finishTime?: number; // Timestamp in ms when upgrade finishes
  activeSkin?: string; // ID of the equipped skin
}

export interface BuildingDefinition {
  id: string;
  name: string;
  description: string;
  type: BuildingCategory;
  maxLevel: number;
  baseCost: Partial<Record<ResourceType, number>>;
  costGrowth: number;
  baseTime: number; // in seconds
  timeGrowth: number;
  baseProduction?: number; // Amount per hour at lvl 1
  prodGrowth?: number;
  resource?: ResourceType; // Which resource it produces
  baseCapacity?: number;
  capGrowth?: number;
  storageResource?: ResourceType;
  unitType?: 'terraguard' | 'aero' | 'cyber';
  statBonus?: string;
  maxCount?: number; // Optional limit
}

export interface TroopState {
  count: number;
  tier: number;
  wounded: number;
}

export interface GameState {
  resources: Resources;
  buildings: BuildingState[];
  troops: TroopState;
  builderDroids: number;
  lastSaveTime: number;
  totalHeroes: number;
  unlockedSkins: string[]; // List of purchased skin IDs
}

// START RESOURCES
export const INITIAL_RESOURCES: Resources = {
  credits: 5000,
  biomass: 5000,
  nanosteel: 2500,
  gems: 100
};