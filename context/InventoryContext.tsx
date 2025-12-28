import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Types ---

export type ItemRarity = 'grey' | 'green' | 'blue' | 'purple' | 'orange';
export type ItemCategory = 'material' | 'equipment' | 'consumable' | 'shard';
export type EquipmentSlot = 'weapon' | 'armor' | 'chip' | 'propulsion';

export interface BaseItem {
  id: string;
  templateId: string; // e.g. "speedup_1h", "nanosteel_pack"
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
}

export interface EquipmentItem extends BaseItem {
  category: 'equipment';
  slot: EquipmentSlot;
  level: number; // 1-40
  stats: {
    atk?: number;
    def?: number;
    hp?: number;
    spd?: number;
  };
  equippedToId?: string; // ID of the hero wearing it, undefined if free
}

export interface ConsumableItem extends BaseItem {
  category: 'consumable';
  effectType: 'speedup_build' | 'speedup_train' | 'resource_grant' | 'buff';
  effectValue: number; // Seconds for speedups, Amount for resources
}

export interface MaterialItem extends BaseItem {
  category: 'material';
  quantity: number;
}

export interface InventoryState {
  equipment: EquipmentItem[];
  consumables: ConsumableItem[]; // Stackable logic handled in manager
  materials: Record<string, number>; // key: templateId, value: quantity
}

// --- Context Definition ---

interface InventoryContextType {
  inventory: InventoryState;
  addItem: (item: BaseItem, quantity?: number) => void;
  removeItem: (templateId: string, quantity?: number) => boolean;
  equipItem: (itemId: string, heroId: string) => void;
  unequipItem: (itemId: string) => void;
  useConsumable: (itemId: string) => void;
  loadInventory: (newState: InventoryState) => void; // New function
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryState>(() => {
    const saved = localStorage.getItem('infinite_arena_inventory');
    return saved ? JSON.parse(saved) : {
      equipment: [],
      consumables: [],
      materials: {}
    };
  });

  useEffect(() => {
    localStorage.setItem('infinite_arena_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const loadInventory = (newState: InventoryState) => {
      console.log("Loading Cloud Save for Inventory...");
      setInventory(newState);
  };

  const addItem = (item: BaseItem, quantity = 1) => {
    setInventory(prev => {
      const newState = { ...prev };

      if (item.category === 'material') {
        newState.materials[item.templateId] = (newState.materials[item.templateId] || 0) + quantity;
      } else if (item.category === 'consumable') {
        for(let i=0; i<quantity; i++) {
           newState.consumables.push(item as ConsumableItem);
        }
      } else if (item.category === 'equipment') {
        newState.equipment.push({ ...item as EquipmentItem, id: crypto.randomUUID(), equippedToId: undefined });
      }

      return newState;
    });
  };

  const removeItem = (templateId: string, quantity = 1): boolean => {
    // Logic stub
    return true;
  };

  const equipItem = (itemId: string, heroId: string) => {
    setInventory(prev => ({
      ...prev,
      equipment: prev.equipment.map(item => 
        item.id === itemId ? { ...item, equippedToId: heroId } : item
      )
    }));
  };

  const unequipItem = (itemId: string) => {
    setInventory(prev => ({
      ...prev,
      equipment: prev.equipment.map(item => 
        item.id === itemId ? { ...item, equippedToId: undefined } : item
      )
    }));
  };

  const useConsumable = (itemId: string) => {
    // Logic stub
    console.log(`Using ${itemId}`);
  };

  return (
    <InventoryContext.Provider value={{ inventory, addItem, removeItem, equipItem, unequipItem, useConsumable, loadInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within InventoryProvider");
  return context;
};