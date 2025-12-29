import React, { useState } from 'react';
import { 
  X, Zap, Shield, Users, BarChart3, Lock, 
  Unlock, Timer, ArrowUpCircle, Activity, 
  Sword, Crosshair, Plane, Radio, Settings, Palette, Check, Gem
} from 'lucide-react';
import { BuildingState, BuildingType } from '../types/economy';
import { BUILDING_DEFINITIONS } from '../data/buildings';
import { SKIN_DATABASE } from '../data/skins';
import { calculateCost, calculateBuildTime, formatDuration } from '../utils/engine';
import { useGame } from '../context/GameContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BuildingDetailModalProps {
  building: BuildingState;
  onClose: () => void;
}

// --- SUB-COMPONENTS FOR SPECIFIC BUILDING TYPES ---

const ShieldConsole = () => {
  const [mode, setMode] = useState<'reflect' | 'absorb'>('absorb');
  const [frequency, setFrequency] = useState(50);

  return (
    <div className="space-y-4">
      <div className="bg-blue-950/50 border border-blue-500/30 p-4 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent animate-pulse"></div>
        <div className="relative z-10 flex justify-between items-center mb-2">
          <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Schild-Integrität</span>
          <span className="text-white font-mono font-bold">100%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_#3b82f6]"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setMode('reflect')}
          className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'reflect' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
        >
          <Zap className="w-6 h-6" />
          <span className="text-xs font-bold uppercase">Reflektion</span>
        </button>
        <button 
          onClick={() => setMode('absorb')}
          className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'absorb' ? 'bg-green-600 border-green-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
        >
          <Shield className="w-6 h-6" />
          <span className="text-xs font-bold uppercase">Absorption</span>
        </button>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <label className="text-xs text-slate-400 uppercase font-bold mb-2 block flex justify-between">
          <span>Modulations-Frequenz</span>
          <span className="text-blue-400 font-mono">{frequency} Hz</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={frequency} 
          onChange={(e) => setFrequency(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>ALPHA</span>
          <span>OMEGA</span>
        </div>
      </div>
    </div>
  );
};

const AllianceHubConsole = () => {
  const members = [
    { name: "NeonViper", action: "Baut Nano-Vault", time: "12m" },
    { name: "CyberGoth", action: "Forscht Laser V", time: "45m" },
    { name: "IronLotus", action: "Repariert Schild", time: "02m" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-purple-900/20 p-3 rounded-xl border border-purple-500/30">
        <div className="flex items-center gap-2 text-purple-400">
          <Radio className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm uppercase">Subraum-Netzwerk</span>
        </div>
        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded font-bold">ONLINE</span>
      </div>

      <div className="space-y-2">
        {members.map((m, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
            <div>
              <div className="text-sm font-bold text-white">{m.name}</div>
              <div className="text-xs text-slate-400">{m.action}</div>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg uppercase transition-colors">
              Helfen ({m.time})
            </button>
          </div>
        ))}
      </div>

      <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg uppercase tracking-wide active:scale-95 transition-all">
        Allen Helfen (+150 Credits)
      </button>
    </div>
  );
};

const ProductionConsole = ({ resource }: { resource: string }) => {
  // Dummy Data for Graph
  const data = [
    { name: '00:00', prod: 40 },
    { name: '04:00', prod: 30 },
    { name: '08:00', prod: 20 },
    { name: '12:00', prod: 65 },
    { name: '16:00', prod: 80 },
    { name: '20:00', prod: 95 },
    { name: '24:00', prod: 100 },
  ];

  const color = resource === 'nanosteel' ? '#3b82f6' : resource === 'biomass' ? '#22c55e' : '#eab308';

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-48">
        <div className="text-xs text-slate-400 uppercase font-bold mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Output Effizienz (24h)
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${resource}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#fff', fontSize: '10px' }}
            />
            <Area type="monotone" dataKey="prod" stroke={color} fillOpacity={1} fill={`url(#color${resource})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Stündlich</div>
            <div className="text-lg font-black text-white" style={{ color }}>+350</div>
        </div>
        <div className="flex-1 bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Lager</div>
            <div className="text-lg font-black text-white">85%</div>
        </div>
      </div>
    </div>
  );
};

const StorageConsole = () => {
  const [locked, setLocked] = useState(false);

  return (
    <div className="space-y-4">
      <div className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all ${locked ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-800 border-slate-700'}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${locked ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-slate-700 text-slate-400'}`}>
          {locked ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
        </div>
        <div className="text-center">
          <h3 className={`text-lg font-black uppercase ${locked ? 'text-red-400' : 'text-slate-200'}`}>
            {locked ? 'Sektoren Verriegelt' : 'Zugriff Offen'}
          </h3>
          <p className="text-xs text-slate-500 max-w-[200px] mt-1">
            {locked ? 'Keine Entnahme möglich. Schutz vor Plünderung aktiv.' : 'Standard Betriebsmodus.'}
          </p>
        </div>
        <button 
          onClick={() => setLocked(!locked)}
          className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${locked ? 'bg-red-500 text-white' : 'bg-slate-600 text-white hover:bg-slate-500'}`}
        >
          {locked ? 'Entriegeln' : 'Verriegeln (8h)'}
        </button>
      </div>
    </div>
  );
};

const BarracksConsole = () => {
  return (
    <div className="space-y-3">
      {['T1 Infanterie', 'T2 Exoskelett', 'T3 Mech-Suit'].map((unit, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-600">
            <Sword className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white uppercase">{unit}</div>
            <div className="text-xs text-slate-400">Kampfkraft: {(i+1)*50}</div>
          </div>
          <button className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-black rounded-lg uppercase">
            Trainieren
          </button>
        </div>
      ))}
    </div>
  );
};

const DesignStudio = ({ buildingId }: { buildingId: string }) => {
    const { state, unlockSkin, equipSkin } = useGame();
    const activeSkinId = state.buildings.find(b => b.id === buildingId)?.activeSkin || 'default';
    const [previewSkin, setPreviewSkin] = useState(activeSkinId);

    const activeDef = SKIN_DATABASE[previewSkin];
    const isUnlocked = state.unlockedSkins.includes(previewSkin);
    const isEquipped = activeSkinId === previewSkin;

    const handleAction = () => {
        if (isUnlocked) {
            equipSkin(buildingId, previewSkin);
        } else {
            unlockSkin(previewSkin);
        }
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Preview Box */}
            <div className={`
                flex-1 rounded-2xl flex items-center justify-center relative transition-all duration-500
                ${activeDef.styleClass} border-2 overflow-hidden min-h-[180px]
            `}>
                {/* Simulated Banana Particles */}
                {activeDef.effect === 'banana' && (
                    <>
                        <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
                        {[...Array(5)].map((_,i) => (
                            <div key={i} className="absolute text-xl animate-float opacity-50" style={{
                                left: `${Math.random()*80 + 10}%`,
                                top: `${Math.random()*80 + 10}%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: '3s'
                            }}>🍌</div>
                        ))}
                    </>
                )}
                {/* Glitch Effect */}
                {activeDef.effect === 'glitch' && (
                    <div className="absolute inset-0 bg-fuchsia-500/10 animate-pulse" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 10%, 0 10%)' }}></div>
                )}

                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl`}>
                    <Settings className={`w-12 h-12 ${activeDef.iconClass}`} />
                </div>

                <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/10">
                        {activeDef.name}
                    </span>
                </div>
            </div>

            {/* Skin Selector */}
            <div className="space-y-2">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {Object.values(SKIN_DATABASE).map(skin => (
                        <button 
                            key={skin.id}
                            onClick={() => setPreviewSkin(skin.id)}
                            className={`
                                relative w-16 h-16 rounded-xl border-2 shrink-0 flex items-center justify-center transition-all
                                ${previewSkin === skin.id ? 'border-white scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'}
                                ${skin.id === 'banana' ? 'bg-yellow-900' : 'bg-slate-800'}
                            `}
                        >
                            <div className={`w-8 h-8 rounded-full ${skin.styleClass.split(' ')[0]}`}></div>
                            {state.unlockedSkins.includes(skin.id) && (
                                <div className="absolute -top-1 -right-1 bg-green-500 text-black rounded-full p-0.5 border border-black">
                                    <Check className="w-2 h-2" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="mb-2">
                        <h4 className="text-white font-bold">{activeDef.name}</h4>
                        <p className="text-slate-400 text-xs">{activeDef.description}</p>
                    </div>
                    
                    <button 
                        onClick={handleAction}
                        disabled={isEquipped}
                        className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wide shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2
                            ${isEquipped 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                : isUnlocked 
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                    : 'bg-green-600 hover:bg-green-500 text-white'
                            }
                        `}
                    >
                        {isEquipped ? (
                            <>Aktiviert</>
                        ) : isUnlocked ? (
                            <>Ausrüsten</>
                        ) : (
                            <>
                                Kaufen 
                                {activeDef.cost.credits && <span className="bg-black/20 px-1.5 py-0.5 rounded ml-1">{activeDef.cost.credits} Cr</span>}
                                {activeDef.cost.nanosteel && <span className="bg-black/20 px-1.5 py-0.5 rounded ml-1">{activeDef.cost.nanosteel} Ns</span>}
                                {activeDef.cost.gems && <span className="bg-yellow-900/40 text-yellow-300 px-1.5 py-0.5 rounded ml-1 flex items-center gap-1"><Gem className="w-3 h-3"/> {activeDef.cost.gems}</span>}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN MODAL ---

export const BuildingDetailModal: React.FC<BuildingDetailModalProps> = ({ building, onClose }) => {
  const { state, startUpgrade, deductResources } = useGame();
  const def = BUILDING_DEFINITIONS[building.type];
  const [tab, setTab] = useState<'manage' | 'upgrade' | 'design'>('manage');

  if (!def) return null;

  const nextCost = calculateCost(def, building.level);
  const nextTime = calculateBuildTime(def, building.level);
  const canAfford = state.resources.credits >= (nextCost.credits || 0) &&
                    state.resources.nanosteel >= (nextCost.nanosteel || 0) &&
                    state.resources.biomass >= (nextCost.biomass || 0);

  const handleUpgrade = () => {
    startUpgrade(building.id);
    onClose();
  };

  // Determine special console content based on type
  const renderConsole = () => {
    switch (def.type) {
      case 'DEFENSE': return <ShieldConsole />;
      case 'UTILITY': 
        if (def.id === 'ALLIANCE_HUB') return <AllianceHubConsole />;
        return <div className="p-8 text-center text-slate-500">Radar Systeme online.</div>;
      case 'PRODUCTION': return <ProductionConsole resource={def.resource || 'credits'} />;
      case 'STORAGE': return <StorageConsole />;
      case 'MILITARY': return <BarracksConsole />;
      case 'HQ': return (
        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-center">
          <div className="w-20 h-20 bg-slate-700 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <div className="text-white font-bold">Commander Level {building.level}</div>
          <div className="text-slate-400 text-xs mt-1">Nächster Meilenstein: Level {building.level + 1}</div>
        </div>
      );
      default: return <div className="p-8 text-center text-slate-500 italic">Systeme laufen im Normalbetrieb.</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-950 w-full max-w-lg h-[85vh] sm:h-auto sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl border border-slate-800 overflow-hidden animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> ONLINE
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wide leading-none">{def.name}</h2>
            <div className="text-slate-400 text-xs font-mono mt-1">LVL {building.level} // ID: {building.id.split('_')[1]}</div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button 
            onClick={() => setTab('manage')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${tab === 'manage' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Settings className="w-4 h-4" /> Konsole
          </button>
          <button 
            onClick={() => setTab('design')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${tab === 'design' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Palette className="w-4 h-4" /> Design
          </button>
          <button 
            onClick={() => setTab('upgrade')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${tab === 'upgrade' ? 'text-green-400 border-b-2 border-green-400 bg-green-500/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ArrowUpCircle className="w-4 h-4" /> Upgrade
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-950">
          {tab === 'manage' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {renderConsole()}
              
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Gebäude Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-600 uppercase">Energieverbrauch</div>
                    <div className="text-white font-mono font-bold">120 kW/h</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-600 uppercase">Effizienz</div>
                    <div className="text-green-400 font-mono font-bold">100%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'design' && (
             <div className="h-full animate-in slide-in-from-right-4 duration-300">
                 <DesignStudio buildingId={building.id} />
             </div>
          )}

          {tab === 'upgrade' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Stats Preview */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Aktuelles Level</div>
                  <div className="text-2xl font-black text-white">{building.level}</div>
                </div>
                <div className="text-slate-600">➜</div>
                <div className="text-right">
                  <div className="text-xs text-green-500 uppercase font-bold">Nächstes Level</div>
                  <div className="text-2xl font-black text-green-400">{building.level + 1}</div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Baukosten</h4>
                {Object.entries(nextCost).map(([res, amount]) => {
                  if (!amount) return null;
                  const myRes = state.resources[res as keyof typeof state.resources];
                  const enough = myRes >= amount;
                  
                  return (
                    <div key={res} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-sm font-bold text-slate-300 capitalize">{res}</span>
                      <div className={`font-mono font-bold ${enough ? 'text-white' : 'text-red-500'}`}>
                        {amount} <span className="text-slate-600 text-xs">/ {Math.floor(myRes)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2 justify-center text-slate-400 text-xs font-bold uppercase">
                  <Timer className="w-4 h-4" /> Bauzeit: {formatDuration(nextTime)}
                </div>
                <button 
                  onClick={handleUpgrade}
                  disabled={!canAfford || building.status === 'UPGRADING'}
                  className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider shadow-lg transition-all active:scale-95 
                    ${building.status === 'UPGRADING' 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : canAfford 
                        ? 'bg-green-600 hover:bg-green-500 text-white' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  {building.status === 'UPGRADING' 
                    ? 'Wird gebaut...' 
                    : canAfford 
                      ? 'Upgrade Starten' 
                      : 'Ressourcen fehlen'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};