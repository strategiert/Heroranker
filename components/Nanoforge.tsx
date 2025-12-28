import React, { useState } from 'react';
import { Hammer, Zap, Shield, Cpu, Rocket, Sword, Box, AlertCircle, Info } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useInventory, EquipmentItem, ItemRarity, EquipmentSlot } from '../context/InventoryContext';

// Blueprints Configuration
const BLUEPRINTS: { 
    id: string; 
    name: string; 
    slot: EquipmentSlot; 
    cost: { nanosteel: number, credits: number }; 
    desc: string 
}[] = [
    { id: 'bp_wpn_basic', name: 'Plasma Rifle', slot: 'weapon', cost: { nanosteel: 150, credits: 50 }, desc: 'Standard issue energy weapon.' },
    { id: 'bp_arm_basic', name: 'Alloy Plate', slot: 'armor', cost: { nanosteel: 200, credits: 100 }, desc: 'Lightweight nanofiber armor.' },
    { id: 'bp_chp_basic', name: 'Targeting Chip', slot: 'chip', cost: { nanosteel: 100, credits: 200 }, desc: 'Increases processing speed.' },
    { id: 'bp_prp_basic', name: 'Ion Thrusters', slot: 'propulsion', cost: { nanosteel: 150, credits: 150 }, desc: 'Standard mobility enhancement.' },
];

const RARITY_CONFIG: Record<ItemRarity, { color: string, chance: number, multi: number }> = {
    'grey': { color: 'border-slate-600 text-slate-400', chance: 50, multi: 1 },
    'green': { color: 'border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]', chance: 30, multi: 1.2 },
    'blue': { color: 'border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]', chance: 15, multi: 1.5 },
    'purple': { color: 'border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]', chance: 4, multi: 2.0 },
    'orange': { color: 'border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)]', chance: 1, multi: 3.0 },
};

const rollRarity = (): ItemRarity => {
    const roll = Math.random() * 100;
    let sum = 0;
    // Order matters: grey, green, blue, purple, orange
    if (roll < RARITY_CONFIG.grey.chance) return 'grey';
    sum += RARITY_CONFIG.grey.chance;
    if (roll < sum + RARITY_CONFIG.green.chance) return 'green';
    sum += RARITY_CONFIG.green.chance;
    if (roll < sum + RARITY_CONFIG.blue.chance) return 'blue';
    sum += RARITY_CONFIG.blue.chance;
    if (roll < sum + RARITY_CONFIG.purple.chance) return 'purple';
    return 'orange';
};

const ItemCard = ({ item }: { item: EquipmentItem }) => {
    const style = RARITY_CONFIG[item.rarity];
    const SlotIcon = item.slot === 'weapon' ? Sword : item.slot === 'armor' ? Shield : item.slot === 'chip' ? Cpu : Rocket;

    return (
        <div className={`bg-slate-900 border-2 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden group ${style.color}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            <div className={`w-12 h-12 rounded-lg bg-slate-950 flex items-center justify-center border border-white/10`}>
                <SlotIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm truncate">{item.name}</h4>
                    <span className="text-[9px] uppercase font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-white/10">LV {item.level}</span>
                </div>
                <div className="flex gap-2 text-[10px] opacity-70 mt-1">
                    {item.stats.atk && <span>ATK +{item.stats.atk}</span>}
                    {item.stats.def && <span>DEF +{item.stats.def}</span>}
                    {item.stats.hp && <span>HP +{item.stats.hp}</span>}
                    {item.stats.spd && <span>SPD +{item.stats.spd}</span>}
                </div>
            </div>
        </div>
    );
};

export const Nanoforge = () => {
    const { deductResources, state } = useGame();
    const { addItem, inventory } = useInventory();
    const [selectedBP, setSelectedBP] = useState(BLUEPRINTS[0]);
    const [isCrafting, setIsCrafting] = useState(false);
    const [lastCrafted, setLastCrafted] = useState<EquipmentItem | null>(null);

    const handleCraft = async () => {
        if (isCrafting) return;
        
        if (!deductResources(selectedBP.cost)) {
            alert("Nicht genug Ressourcen!");
            return;
        }

        setIsCrafting(true);
        setLastCrafted(null);

        // Fake crafting delay
        await new Promise(r => setTimeout(r, 1000));

        const rarity = rollRarity();
        const multiplier = RARITY_CONFIG[rarity].multi;
        const baseStat = Math.floor(10 * multiplier); // Simplified stat logic

        const newItem: EquipmentItem = {
            id: crypto.randomUUID(),
            templateId: selectedBP.id,
            name: `${selectedBP.name} ${rarity === 'orange' ? 'MK-V' : rarity === 'purple' ? 'MK-IV' : ''}`,
            category: 'equipment',
            rarity: rarity,
            slot: selectedBP.slot,
            level: 1,
            description: selectedBP.desc,
            stats: {}
        };

        // Assign Stats based on Slot
        if (selectedBP.slot === 'weapon') newItem.stats = { atk: baseStat };
        if (selectedBP.slot === 'armor') newItem.stats = { def: baseStat, hp: baseStat * 5 };
        if (selectedBP.slot === 'chip') newItem.stats = { atk: Math.floor(baseStat/2), spd: Math.floor(baseStat/2) };
        if (selectedBP.slot === 'propulsion') newItem.stats = { spd: baseStat, hp: baseStat * 2 };

        addItem(newItem);
        setLastCrafted(newItem);
        setIsCrafting(false);
    };

    const myItems = inventory.equipment;

    return (
        <div className="h-full flex flex-col bg-[#0B1120] text-white">
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 shadow-xl z-10 flex justify-between items-center">
                <h2 className="text-xl font-tech font-bold flex items-center gap-2 text-blue-400">
                    <Hammer className="w-6 h-6" /> NANOFORGE v1.0
                </h2>
                <div className="flex gap-3 text-xs font-mono">
                    <div className="flex items-center gap-1 text-blue-400"><Box className="w-3 h-3"/> {state.resources.nanosteel}</div>
                    <div className="flex items-center gap-1 text-yellow-400"><Zap className="w-3 h-3"/> {state.resources.credits}</div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Blueprints (Left) */}
                <div className="w-1/3 bg-slate-900/50 border-r border-slate-800 overflow-y-auto custom-scrollbar p-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 px-2">Blueprints</h3>
                    <div className="space-y-2">
                        {BLUEPRINTS.map(bp => (
                            <button 
                                key={bp.id}
                                onClick={() => { setSelectedBP(bp); setLastCrafted(null); }}
                                className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden group
                                    ${selectedBP.id === bp.id 
                                        ? 'bg-blue-900/30 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                                `}
                            >
                                <div className="relative z-10">
                                    <div className="font-bold text-sm text-slate-200">{bp.name}</div>
                                    <div className="text-[10px] text-slate-500 flex gap-2 mt-1">
                                        <span>Nano: {bp.cost.nanosteel}</span>
                                        <span>Cr: {bp.cost.credits}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Crafting Area (Center/Right) */}
                <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                    
                    {/* Workstation */}
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] relative mb-6">
                        
                        {/* Blueprint Info */}
                        <div className="absolute top-4 left-4">
                            <h3 className="text-lg font-bold text-white">{selectedBP.name}</h3>
                            <p className="text-xs text-slate-400 max-w-[200px]">{selectedBP.desc}</p>
                        </div>

                        {/* Crafting Animation / Result */}
                        {isCrafting ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <Hammer className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
                                <span className="font-tech text-blue-400 tracking-widest">ASSEMBLING...</span>
                            </div>
                        ) : lastCrafted ? (
                            <div className="w-full max-w-sm animate-in zoom-in duration-300">
                                <div className="text-center text-xs font-bold text-green-400 mb-2">CRAFTING SUCCESSFUL</div>
                                <ItemCard item={lastCrafted} />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center opacity-50">
                                <Hammer className="w-8 h-8 text-slate-600" />
                            </div>
                        )}

                        {/* Craft Button */}
                        <div className="absolute bottom-4 right-4">
                            <button 
                                onClick={handleCraft}
                                disabled={isCrafting}
                                className="game-btn bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Hammer className="w-4 h-4" />
                                <span>CRAFT</span>
                            </button>
                        </div>
                    </div>

                    {/* Inventory List */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                <Box className="w-4 h-4"/> INVENTORY ({myItems.length})
                            </h3>
                        </div>
                        
                        {myItems.length === 0 ? (
                            <div className="text-center text-slate-600 py-10 text-xs italic">
                                Inventory empty. Start crafting!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-20">
                                {myItems.map(item => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};