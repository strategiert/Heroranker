import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Resources, BuildingState, TroopState, GameState, INITIAL_RESOURCES, BuildingType, BuildingStatus } from '../types/economy';
import { calculateBuildingCost, calculateBuildTime, calculateProductionRate } from '../utils/formulas';

interface GameContextType {
  state: GameState;
  startUpgrade: (buildingId: string) => void;
  speedUpBuilding: (buildingId: string, seconds: number) => void;
  collectResources: () => void;
  deductResources: (cost: Partial<Resources>) => boolean;
  debugAddResources: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('infinite_arena_gamestate');
    if (saved) {
      return JSON.parse(saved);
    }
    // Initial State
    return {
      resources: INITIAL_RESOURCES,
      buildings: [
        { id: 'hq_1', type: BuildingType.COMMAND_CENTER, level: 1, status: 'IDLE' },
        { id: 'hydro_1', type: BuildingType.HYDROPONICS, level: 1, status: 'IDLE' },
        { id: 'foundry_1', type: BuildingType.NANO_FOUNDRY, level: 1, status: 'IDLE' },
      ],
      troops: { count: 0, tier: 1, wounded: 0 },
      builderDroids: 1,
      lastSaveTime: Date.now()
    };
  });

  // Ref to access state inside intervals without closure issues
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // --- Persistence & Offline Calculation ---
  useEffect(() => {
    const now = Date.now();
    const lastSave = state.lastSaveTime;
    const secondsOffline = (now - lastSave) / 1000;

    if (secondsOffline > 10) {
      console.log(`Offline for ${secondsOffline.toFixed(0)}s. Calculating production...`);
      
      let biomassGained = 0;
      let nanosteelGained = 0;
      let creditsGained = 0;

      state.buildings.forEach(b => {
        if (b.status === 'IDLE') {
           const prod = calculateProductionRate(b.type, b.level);
           // Production is per hour, so divide by 3600
           if (prod.biomass) biomassGained += (prod.biomass / 3600) * secondsOffline;
           if (prod.nanosteel) nanosteelGained += (prod.nanosteel / 3600) * secondsOffline;
           if (prod.credits) creditsGained += (prod.credits / 3600) * secondsOffline;
        }
      });

      setState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          biomass: prev.resources.biomass + Math.floor(biomassGained),
          nanosteel: prev.resources.nanosteel + Math.floor(nanosteelGained),
          credits: prev.resources.credits + Math.floor(creditsGained),
        },
        lastSaveTime: now
      }));
    }
  }, []); // Run once on mount

  // --- Save Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      const stateToSave = { ...stateRef.current, lastSaveTime: Date.now() };
      localStorage.setItem('infinite_arena_gamestate', JSON.stringify(stateToSave));
    }, 5000); // Save every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // --- Game Loop (The Tick) ---
  useEffect(() => {
    const tick = setInterval(() => {
      const now = Date.now();
      
      setState(prev => {
        let hasChanges = false;
        const newBuildings = prev.buildings.map(b => {
          if (b.status === 'UPGRADING' && b.finishTime && now >= b.finishTime) {
            hasChanges = true;
            console.log(`Upgrade Finished: ${b.type} -> Lvl ${b.level + 1}`);
            // Upgrade finished!
            return {
              ...b,
              level: b.level + 1,
              status: 'IDLE' as BuildingStatus,
              finishTime: undefined
            };
          }
          return b;
        });

        if (hasChanges) {
          return { ...prev, buildings: newBuildings };
        }
        return prev;
      });

    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // --- Actions ---

  const startUpgrade = (buildingId: string) => {
    setState(prev => {
      const buildingIndex = prev.buildings.findIndex(b => b.id === buildingId);
      if (buildingIndex === -1) return prev;

      const building = prev.buildings[buildingIndex];
      const cost = calculateBuildingCost(building.type, building.level);
      const time = calculateBuildTime(building.level);

      // 1. Check Resources
      if (prev.resources.credits < cost.credits || 
          prev.resources.nanosteel < cost.nanosteel || 
          prev.resources.biomass < cost.biomass) {
        alert("Nicht genug Ressourcen!");
        return prev;
      }

      // 2. Check Builder Droids
      const activeBuilders = prev.buildings.filter(b => b.status === 'UPGRADING').length;
      if (activeBuilders >= prev.builderDroids) {
        alert("Alle Bau-Droiden sind beschäftigt!");
        return prev;
      }

      // Execute
      const newResources = {
        ...prev.resources,
        credits: prev.resources.credits - cost.credits,
        nanosteel: prev.resources.nanosteel - cost.nanosteel,
        biomass: prev.resources.biomass - cost.biomass,
      };

      const newBuildings = [...prev.buildings];
      newBuildings[buildingIndex] = {
        ...building,
        status: 'UPGRADING',
        finishTime: Date.now() + (time * 1000)
      };

      return {
        ...prev,
        resources: newResources,
        buildings: newBuildings
      };
    });
  };

  const speedUpBuilding = (buildingId: string, seconds: number) => {
    setState(prev => {
      const newBuildings = prev.buildings.map(b => {
        if (b.id === buildingId && b.status === 'UPGRADING' && b.finishTime) {
          return { ...b, finishTime: b.finishTime - (seconds * 1000) };
        }
        return b;
      });
      return { ...prev, buildings: newBuildings };
    });
  };

  const collectResources = () => {
    console.log("Collecting resources...");
  };

  const deductResources = (cost: Partial<Resources>): boolean => {
      let canAfford = true;
      if (cost.credits && state.resources.credits < cost.credits) canAfford = false;
      if (cost.nanosteel && state.resources.nanosteel < cost.nanosteel) canAfford = false;
      if (cost.biomass && state.resources.biomass < cost.biomass) canAfford = false;
      if (cost.gems && state.resources.gems < cost.gems) canAfford = false;

      if (!canAfford) return false;

      setState(prev => ({
          ...prev,
          resources: {
              credits: prev.resources.credits - (cost.credits || 0),
              nanosteel: prev.resources.nanosteel - (cost.nanosteel || 0),
              biomass: prev.resources.biomass - (cost.biomass || 0),
              gems: prev.resources.gems - (cost.gems || 0),
              dark_matter: prev.resources.dark_matter - (cost.dark_matter || 0),
          }
      }));
      return true;
  };

  const debugAddResources = () => {
    setState(prev => ({
      ...prev,
      resources: {
        credits: prev.resources.credits + 1000,
        nanosteel: prev.resources.nanosteel + 1000,
        biomass: prev.resources.biomass + 1000,
        gems: prev.resources.gems + 10,
        dark_matter: prev.resources.dark_matter
      }
    }));
  };

  return (
    <GameContext.Provider value={{ state, startUpgrade, speedUpBuilding, collectResources, deductResources, debugAddResources }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};