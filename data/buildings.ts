import { BuildingDefinition, BuildingType } from '../types/economy';

export const BUILDING_DEFINITIONS: Record<string, BuildingDefinition> = {
  // --- 1. ZENTRALE ---
  [BuildingType.COMMAND_CENTER]: {
    id: 'COMMAND_CENTER',
    name: 'Neuronale Zitadelle (HQ)',
    description: 'Zentraler Knotenpunkt deiner Station. Bestimmt das maximale Level aller anderen Systeme.',
    type: 'HQ',
    maxLevel: 30,
    baseCost: { nanosteel: 500, biomass: 500 },
    costGrowth: 1.65,
    baseTime: 10,
    timeGrowth: 1.55,
    maxCount: 1
  },

  // --- 2. WIRTSCHAFT (PRODUKTION) ---
  [BuildingType.NANO_FOUNDRY]: {
    id: 'NANO_FOUNDRY',
    name: 'Quanten-Schmelze',
    description: 'Extrahiert Nanosteel aus orbitalen Trümmern. Essenziell für Gebäude und Waffen.',
    type: 'PRODUCTION',
    resource: 'nanosteel',
    maxLevel: 30,
    baseCost: { credits: 100 },
    costGrowth: 1.65,
    baseTime: 5,
    timeGrowth: 1.5,
    baseProduction: 100, // Balanced: 100
    prodGrowth: 1.45,
    maxCount: 5
  },
  [BuildingType.HYDROPONICS]: {
    id: 'HYDROPONICS',
    name: 'Bio-Farm',
    description: 'Kultiviert Biomasse in hyper-beschleunigten Wachstumskammern für Helden und Truppen.',
    type: 'PRODUCTION',
    resource: 'biomass',
    maxLevel: 30,
    baseCost: { credits: 100 },
    costGrowth: 1.65,
    baseTime: 5,
    timeGrowth: 1.5,
    baseProduction: 100, // Balanced: 100
    prodGrowth: 1.45,
    maxCount: 5
  },
  [BuildingType.CREDIT_TERMINAL]: {
    id: 'CREDIT_TERMINAL',
    name: 'Handels-Link',
    description: 'Automatisiertes Handelsterminal zur Generierung von Credits durch interstellare Transaktionen.',
    type: 'PRODUCTION',
    resource: 'credits',
    maxLevel: 30,
    baseCost: { nanosteel: 80 },
    costGrowth: 1.5,
    baseTime: 15,
    timeGrowth: 1.3,
    baseProduction: 120, // Balanced: 120
    prodGrowth: 1.35,
    maxCount: 5
  },

  // --- 3. LAGER (STORAGE) ---
  [BuildingType.NANO_VAULT]: {
    id: 'NANO_VAULT',
    name: 'Nanosteel-Depot',
    description: 'Erhöht die maximale Lagerkapazität für Nanosteel durch fortschrittliche Kompression.',
    type: 'STORAGE',
    storageResource: 'nanosteel',
    maxLevel: 30,
    baseCost: { credits: 200 },
    costGrowth: 1.5,
    baseTime: 60,
    timeGrowth: 1.4,
    baseCapacity: 10000,
    capGrowth: 1.6,
    maxCount: 3
  },
  [BuildingType.BIO_SILO]: {
    id: 'BIO_SILO',
    name: 'Biomasse-Tank',
    description: 'Kryogenische Silos zur Lagerung massiver Mengen an Biomasse ohne Qualitätsverlust.',
    type: 'STORAGE',
    storageResource: 'biomass',
    maxLevel: 30,
    baseCost: { credits: 200 },
    costGrowth: 1.5,
    baseTime: 60,
    timeGrowth: 1.4,
    baseCapacity: 10000,
    capGrowth: 1.6,
    maxCount: 3
  },

  // --- 4. MILITÄR (SUPPORT & DEFENSE) ---
  [BuildingType.BARRACKS]: {
    id: 'BARRACKS',
    name: 'Klon-Replikator',
    description: 'Optimiert die Replikationssequenzen deiner Support-Squads. Erhöht die Ausbildungsgeschwindigkeit.',
    type: 'MILITARY',
    statBonus: 'trainingSpeed',
    maxLevel: 30,
    baseCost: { biomass: 150 },
    costGrowth: 1.65,
    baseTime: 30,
    timeGrowth: 1.5,
    maxCount: 4
  },
  [BuildingType.MED_BAY]: {
    id: 'MED_BAY',
    name: 'Regenerations-Tank',
    description: 'Nutzt Nano-Bots zur schnellen Heilung verwundeter Einheiten nach Schlachten.',
    type: 'MILITARY',
    statBonus: 'healingRate',
    maxLevel: 30,
    baseCost: { biomass: 200 },
    costGrowth: 1.4,
    baseTime: 30,
    timeGrowth: 1.3,
    maxCount: 4
  },
  [BuildingType.SHIELD_GENERATOR]: {
    id: 'SHIELD_GENERATOR',
    name: 'Aegis Schutzschild',
    description: 'Erzeugt ein planetares Kraftfeld. Ein Upgrade ist zwingende Voraussetzung für HQ-Erweiterungen.',
    type: 'DEFENSE',
    maxLevel: 30,
    baseCost: { nanosteel: 200 },
    costGrowth: 1.65,
    baseTime: 60,
    timeGrowth: 1.52,
    maxCount: 1
  },

  // --- 5. FABRIKEN (EINHEITEN) ---
  [BuildingType.TERRA_FACTORY]: {
    id: 'TERRA_FACTORY',
    name: 'Titan-Montagewerk',
    description: 'Produziert schwere Terraguard-Einheiten (Panzer und Mechs) für die Frontlinie.',
    type: 'MILITARY',
    unitType: 'terraguard',
    maxLevel: 30,
    baseCost: { nanosteel: 500 },
    costGrowth: 1.55,
    baseTime: 300,
    timeGrowth: 1.45,
    maxCount: 2
  },
  [BuildingType.AERO_DOCK]: {
    id: 'AERO_DOCK',
    name: 'Himmels-Hangar',
    description: 'Konstruiert Aero-Vanguard Einheiten. Schnelle Abfangjäger und taktische Drohnen.',
    type: 'MILITARY',
    unitType: 'aero',
    maxLevel: 30,
    baseCost: { nanosteel: 400 },
    costGrowth: 1.55,
    baseTime: 300,
    timeGrowth: 1.45,
    maxCount: 2
  },
  [BuildingType.CYBER_UPLINK]: {
    id: 'CYBER_UPLINK',
    name: 'Cyber-Netzknoten',
    description: 'Kompiliert Cyber-Ops Einheiten für elektronische Kriegsführung und präzise Fernangriffe.',
    type: 'MILITARY',
    unitType: 'cyber',
    maxLevel: 30,
    baseCost: { nanosteel: 300 },
    costGrowth: 1.55,
    baseTime: 300,
    timeGrowth: 1.45,
    maxCount: 2
  },

  // --- 6. SPECIALS & UTILITY ---
  [BuildingType.RADAR_STATION]: {
    id: 'RADAR_STATION',
    name: 'Omni-Scanner Array',
    description: 'Erweitert die Sensor-Reichweite. Schaltet zusätzliche Slots für Radar-Missionen frei.',
    type: 'UTILITY',
    maxLevel: 10,
    baseCost: { nanosteel: 1000, credits: 500 },
    costGrowth: 2.5,
    baseTime: 600,
    timeGrowth: 2.0,
    maxCount: 1
  },
  [BuildingType.TECH_LAB]: {
    id: 'TECH_LAB',
    name: 'Quanten-Labor',
    description: 'Erforscht permanente Upgrades für die gesamte Flotte. Erhöht die Effektivität aller Helden.',
    type: 'RESEARCH',
    maxLevel: 30,
    baseCost: { nanosteel: 1000, biomass: 1000 },
    costGrowth: 1.7,
    baseTime: 1200,
    timeGrowth: 1.5,
    maxCount: 1
  },
  [BuildingType.ALLIANCE_HUB]: {
    id: 'ALLIANCE_HUB',
    name: 'Subraum-Relais',
    description: 'Ermöglicht koordinierte Hilfe durch Allianzmitglieder zur drastischen Verkürzung von Bauzeiten.',
    type: 'UTILITY',
    maxLevel: 10,
    baseCost: { credits: 2000 },
    costGrowth: 1.8,
    baseTime: 3600,
    timeGrowth: 1.6,
    maxCount: 1
  }
};