export interface PowerStats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

export interface Appearance {
  gender: string;
  race: string;
  height: string;
  weight: string;
  eyeColor: string;
  hairColor: string;
}

export interface Biography {
  fullName: string;
  alterEgos: string;
  aliases: string[];
  placeOfBirth: string;
  firstAppearance: string;
  publisher: string;
  alignment: 'good' | 'bad' | 'neutral';
}

export interface Work {
  occupation: string;
  base: string;
}

export interface Connections {
  groupAffiliation: string;
  relatives: string;
}

export interface EquipmentLoadout {
  weapon?: string; // Item ID
  armor?: string;
  chip?: string;
  propulsion?: string;
}

export interface Hero {
  id: string;
  name: string;
  powerstats: PowerStats;
  appearance: Appearance;
  biography: Biography;
  work: Work;
  connections: Connections;
  image: {
    url: string; // URL or Base64 string
  };
  video?: {
    url: string; // URL to the Veo generated MP4
  };
  description?: string; // Short AI generated summary
  equipment?: EquipmentLoadout;
}

export interface WikiHero {
  id: number | string;
  name: string;
  universe: string;
  tier: string;
  power: number;
  image: string; // Emoji
  color?: string;
  abilities: string[];
  description: string;
  reason?: string;
  stats: {
    intelligence: number;
    strength: number;
    speed: number;
    durability: number;
    combat: number;
  };
}

export interface ExternalHero {
  name: string;
  full_name?: string;
  race: string;
  publisher?: string;
  alignment?: string;
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
  description?: string;
  image?: string;
}

// --- TOWER TYPES ---

export interface TowerEnemy {
  name: string;
  level: number;
  isBoss: boolean;
  hp: number;
  maxHp: number;
  atk: number;
  image?: string; // Emoji or URL
  color?: string;
}

export interface CombatLog {
  turn: number;
  message: string;
  damage: number;
  isPlayer: boolean;
  isCrit: boolean;
}

export type ViewState = 'wiki' | 'create' | 'detail' | 'forge' | 'station' | 'ai_lab' | 'spire' | 'nanoforge' | 'profile';
