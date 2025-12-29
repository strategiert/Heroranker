import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Database, Loader2, RefreshCw, AlertTriangle, Copy, 
  CheckSquare, Square, Shield, Hammer, User, LayoutDashboard, Zap, Search, ChevronRight, Brain, Activity, Dumbbell,
  Coins, Leaf, Box, Gem, ArrowUpCircle, Clock, Terminal, ChevronUp, Construction, Sparkles, MessageSquare, Image as ImageIcon, Video, Eye, Wand2,
  Dice5, Layers, Book, Film, Cpu, Sword, Rocket, Trash2, Unlock, Lock, Star, TowerControl as Tower, Settings, X, 
  Home, Factory, Warehouse, Radio, FlaskConical, Container, Signal, PlusCircle, Move, ZoomIn, ZoomOut, Maximize, AlertCircle, RefreshCcw
} from 'lucide-react';
import { Hero, ExternalHero, ViewState, EquipmentLoadout, WikiHero } from './types';
import { fetchRawHeroes, listTables, SCHEMA_SQL, REQUIRED_TABLE_NAME, saveHero, fetchMyHeroes, updateConnection, isConfigured } from './services/supabaseService';
import { transformHero, generateStrategicAdvice, chatWithAi, analyzeImage, generateProImage, editImage, generateVeoVideo, animateHeroPortrait } from './services/geminiService';
import { FULL_HERO_DATA } from './services/fullHeroData';
import { GameProvider, useGame } from './context/GameContext';
import { InventoryProvider, useInventory, EquipmentItem, EquipmentSlot, ItemRarity } from './context/InventoryContext';
import { BuildingType, Resources, BuildingCategory, BuildingState } from './types/economy';
import { calculateCost, calculateBuildTime, formatDuration } from './utils/engine';
import { BUILDING_DEFINITIONS } from './data/buildings';
import { SKIN_DATABASE } from './data/skins';
import { getMapBackgroundStyle, getMapAssetPath } from './utils/assets';
import { StatsRadar } from './components/StatsRadar';
import { Nanoforge } from './components/Nanoforge';
import { SpireScreen } from './components/SpireScreen';
import { SaveManager } from './components/SaveManager';
import { ProfileScreen } from './components/ProfileScreen'; 
import { RecruitmentCenter } from './components/RecruitmentCenter';
import { MissionGuide } from './components/MissionGuide'; 
import { BuildingDetailModal } from './components/BuildingDetailModal';
import { BuildingTile } from './components/BuildingTile'; 
import { SpireProvider, Item } from './context/SpireContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MissionProvider } from './context/MissionContext'; 

// --- OFFLINE TOAST COMPONENT ---
const OfflineToast = () => {
    const { offlineGains, clearOfflineGains } = useGame();
    if (!offlineGains) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-slate-900/95 border border-green-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-green-400">
                        <Clock className="w-5 h-5" />
                        <h3 className="font-bold font-mono">WELCOME BACK COMMANDER</h3>
                    </div>
                    <button onClick={clearOfflineGains} className="text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                <p className="text-slate-400 text-xs mb-3">
                    Systeme liefen für <span className="text-white font-bold">{formatDuration(offlineGains.seconds)}</span> im Autopilot.
                </p>
                <div className="flex gap-3">
                    {offlineGains.resources.credits > 0 && (
                        <div className="bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-2 border border-slate-700">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="text-white font-bold text-sm">+{offlineGains.resources.credits}</span>
                        </div>
                    )}
                    {offlineGains.resources.biomass > 0 && (
                        <div className="bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-2 border border-slate-700">
                            <Leaf className="w-4 h-4 text-green-500" />
                            <span className="text-white font-bold text-sm">+{offlineGains.resources.biomass}</span>
                        </div>
                    )}
                    {offlineGains.resources.nanosteel > 0 && (
                        <div className="bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-2 border border-slate-700">
                            <Box className="w-4 h-4 text-blue-500" />
                            <span className="text-white font-bold text-sm">+{offlineGains.resources.nanosteel}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- CONSTRUCTION MODAL ---
const ConstructionModal = ({ onClose }: { onClose: () => void }) => {
    const { state, constructBuilding } = useGame();
    
    // Group available buildings
    const available = Object.values(BUILDING_DEFINITIONS).filter(def => {
        // Exclude HQ, it's unique
        if (def.type === 'HQ') return false;
        
        // Exclude if max count reached
        const count = state.buildings.filter(b => b.type === def.id).length;
        if (def.maxCount && count >= def.maxCount) return false;
        
        return true;
    });

    const handleBuild = (type: BuildingType) => {
        constructBuilding(type);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#f0f4f8] sm:rounded-2xl rounded-t-2xl w-full max-w-lg h-[80vh] sm:h-auto sm:max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Hammer className="w-5 h-5 text-blue-600" />
                        <h2 className="font-black text-lg uppercase tracking-wide">Bau-Menü</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {available.map(def => {
                        const cost = calculateCost(def, 0); // Cost for Level 0 -> 1
                        const time = calculateBuildTime(def, 0);
                        const canAfford = state.resources.credits >= cost.credits && state.resources.nanosteel >= cost.nanosteel && state.resources.biomass >= cost.biomass;

                        return (
                            <div key={def.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-black text-slate-800 text-sm uppercase">{def.name}</h3>
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                        {formatDuration(time)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-snug">{def.description}</p>
                                
                                <div className="flex items-center gap-2 mt-1">
                                    {cost.credits > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${state.resources.credits >= cost.credits ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>{cost.credits} Cr</span>}
                                    {cost.nanosteel > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${state.resources.nanosteel >= cost.nanosteel ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>{cost.nanosteel} Ns</span>}
                                    {cost.biomass > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${state.resources.biomass >= cost.biomass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{cost.biomass} Bio</span>}
                                </div>

                                <button 
                                    onClick={() => handleBuild(def.id as BuildingType)}
                                    disabled={!canAfford}
                                    className={`w-full py-3 mt-1 rounded-lg font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] ${
                                        canAfford 
                                        ? 'bg-blue-600 text-white hover:bg-blue-500' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {canAfford ? 'Errichten' : 'Ressourcen fehlen'}
                                </button>
                            </div>
                        );
                    })}
                    {available.length === 0 && (
                        <div className="text-center py-10 text-slate-400 text-sm font-bold">
                            Maximale Gebäudekapazität erreicht.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ResourceDisplay = () => {
  const { state } = useGame();
  const res = state.resources;

  const Item = ({ icon: Icon, val, bg, text }: any) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bg} border border-white/10 shadow-sm whitespace-nowrap`}>
       <Icon className={`w-4 h-4 ${text}`} />
       <span className="font-bold text-sm text-slate-800">
          {val >= 10000 ? (val / 1000).toFixed(1) + 'k' : Math.floor(val)}
       </span>
    </div>
  );

  return (
    <div className="flex overflow-x-auto gap-3 p-3 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm no-scrollbar">
      <Item icon={Coins} val={res.credits} bg="bg-yellow-100" text="text-yellow-600" />
      <Item icon={Leaf} val={res.biomass} bg="bg-green-100" text="text-green-600" />
      <Item icon={Box} val={res.nanosteel} bg="bg-blue-100" text="text-blue-600" />
      <Item icon={Gem} val={res.gems} bg="bg-purple-100" text="text-purple-600" />
    </div>
  );
};

// --- INTERACTIVE MAP COMPONENT ---
const InteractiveMap = () => {
  const { state, speedUpBuilding } = useGame();
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingState | null>(null);
  
  const [mapError, setMapError] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // For cache busting/retry
  
  // Viewport & Transform State
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: -200, y: -200, scale: 0.6 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Center Map on Mount
  useEffect(() => {
      if (containerRef.current) {
          const parent = containerRef.current.parentElement;
          if (parent) {
              const x = (parent.clientWidth - 1920 * 0.6) / 2;
              const y = (parent.clientHeight - 1080 * 0.6) / 2;
              setTransform({ x, y, scale: 0.6 }); 
          }
      }
  }, []);

  const handleRetryMap = () => {
      setMapError(false);
      setRetryCount(prev => prev + 1);
  };

  // Mouse Handlers for Panning
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setStartPos({ x: clientX - transform.x, y: clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setTransform(prev => ({
        ...prev,
        x: clientX - startPos.x,
        y: clientY - startPos.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Zoom Handlers
  const handleZoom = (delta: number) => {
      setTransform(prev => ({
          ...prev,
          scale: Math.min(3, Math.max(0.3, prev.scale + delta))
      }));
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-[#0f172a] h-full cursor-grab active:cursor-grabbing touch-none select-none">
        
        {/* MAP CONTAINER */}
        <div 
            ref={containerRef}
            className="absolute origin-top-left transition-transform duration-75 ease-linear"
            style={{ 
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                width: '1920px', // Fixed large size for map (16:9 1080p)
                height: '1080px' 
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
        >
            {/* BACKGROUND IMAGE */}
            {!mapError ? (
                <img 
                    key={retryCount}
                    src={`${getMapAssetPath()}?v=${retryCount}`} 
                    alt="Station Map" 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    onError={() => {
                        console.error("Failed to load map image from: ", getMapAssetPath());
                        setMapError(true);
                    }}
                />
            ) : (
                // Fallback Grid Visual (Simulation Mode)
                <div 
                    className="absolute inset-0 w-full h-full" 
                    style={getMapBackgroundStyle()} 
                >
                    <div className="absolute top-4 left-4 pointer-events-auto">
                        <div className="bg-slate-900/80 border border-blue-500/30 p-2 rounded-lg flex items-center gap-3 backdrop-blur-md shadow-lg">
                            <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                            <div>
                                <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Holo-Simulation</div>
                                <div className="text-[8px] text-slate-500">Video-Link unterbrochen</div>
                            </div>
                            <button 
                                onClick={handleRetryMap}
                                className="ml-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                                title="Verbindung neu aufbauen"
                            >
                                <RefreshCcw className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BUILDING GRID OVERLAY */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="grid grid-cols-4 gap-12 p-20 w-full max-w-[1400px] pointer-events-auto">
                    {state.buildings.map((b) => (
                        <div key={b.id} className="transition-transform hover:scale-105 active:scale-95 duration-200">
                            <BuildingTile 
                                building={b}
                                onSelect={setSelectedBuilding}
                                onSpeedUp={speedUpBuilding}
                            />
                        </div>
                    ))}
                    
                    {/* ADD BUTTON */}
                    <button 
                        onClick={() => setShowBuildModal(true)} 
                        className="aspect-square rounded-2xl p-4 flex flex-col items-center justify-center text-slate-500/50 gap-3 border-4 border-dashed border-slate-600/30 hover:bg-slate-800/50 hover:border-blue-500/50 hover:text-blue-400 transition-all bg-slate-900/40 backdrop-blur-sm group hover:scale-105 active:scale-95"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <PlusCircle className="w-8 h-8 group-hover:text-blue-400" />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wide">Neues Gebäude</span>
                    </button>
                </div>
            </div>
        </div>

        {/* HUD CONTROLS */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
            <button onClick={() => handleZoom(0.2)} className="w-10 h-10 bg-slate-900/80 backdrop-blur border border-slate-700 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95"><ZoomIn className="w-5 h-5"/></button>
            <button onClick={() => handleZoom(-0.2)} className="w-10 h-10 bg-slate-900/80 backdrop-blur border border-slate-700 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95"><ZoomOut className="w-5 h-5"/></button>
            <button onClick={() => setTransform({x: -200, y: -200, scale: 0.6})} className="w-10 h-10 bg-blue-600 border border-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95"><Maximize className="w-5 h-5"/></button>
        </div>

        {showBuildModal && <ConstructionModal onClose={() => setShowBuildModal(false)} />}
        {selectedBuilding && (
            <BuildingDetailModal 
                building={selectedBuilding} 
                onClose={() => setSelectedBuilding(null)} 
            />
        )}
    </div>
  );
};

// ... AiLab ... (No change)
const AiLab = () => {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');

  const handleAction = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setOutput(null);
    try {
      if (mode === 'chat') {
        const response = await chatWithAi(prompt, []);
        setOutput(response);
      } else {
        const response = await generateProImage(prompt, '1:1', '1K');
        setOutput(response);
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="font-black text-slate-800">AI LAB</h2>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setMode('chat')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'chat' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500'}`}>CHAT</button>
             <button onClick={() => setMode('image')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'image' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500'}`}>VISION</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
           {isLoading ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
               <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
               <span className="text-xs font-bold uppercase tracking-wider">Processing Neural Net...</span>
             </div>
           ) : output ? (
             mode === 'image' ? (
                <div className="flex justify-center">
                  <img src={output} alt="Generated" className="rounded-xl shadow-lg max-h-[60vh] object-contain" />
                </div>
             ) : (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {output}
                </div>
             )
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
               <Sparkles className="w-12 h-12 opacity-50" />
               <span className="font-bold text-sm">Awaiting Input Protocol</span>
             </div>
           )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
           <div className="flex gap-2">
             <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                placeholder={mode === 'chat' ? "Enter query..." : "Describe visual subject..."}
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
             />
             <button 
               onClick={handleAction}
               disabled={isLoading || !prompt.trim()}
               className="w-12 h-12 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 transition-all active:scale-95"
             >
               <Zap className="w-5 h-5 fill-current" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// ... DbSetupModal ... (No change)
const DbSetupModal = ({ onClose }: { onClose: () => void }) => {
    const [copied, setCopied] = useState(false);
    const [url, setUrl] = useState(localStorage.getItem('sb_url') || 'https://uwzmldtoiulcezexsclo.supabase.co');
    const [key, setKey] = useState(localStorage.getItem('sb_key') || '');
    const [view, setView] = useState<'config' | 'schema'>('config');

    const handleCopy = () => {
        navigator.clipboard.writeText(SCHEMA_SQL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveConfig = () => {
        const cleanUrl = url.trim();
        const cleanKey = key.trim();
        if (!cleanUrl || !cleanKey) {
            alert("Bitte URL und Key eingeben.");
            return;
        }
        updateConnection(cleanUrl, cleanKey);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Settings className="w-5 h-5" />
                        <h2 className="font-bold font-mono">SYSTEM CONFIGURATION</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
                </div>
                <div className="p-2 bg-slate-950 border-b border-slate-800 flex gap-2">
                    <button onClick={() => setView('config')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${view === 'config' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>VERBINDUNG</button>
                    <button onClick={() => setView('schema')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${view === 'schema' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>DATENBANK REPARATUR</button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    {view === 'config' ? (
                        <div className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm leading-relaxed">
                                <h3 className="font-bold mb-1 text-blue-400">API Verbindung fehlt</h3>
                                Damit die App funktioniert, müssen die Supabase Zugangsdaten hinterlegt werden.
                            </div>
                            <div className="space-y-3">
                                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Project URL</label><input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-black border border-slate-700 rounded-lg p-3 text-sm text-white font-mono focus:border-blue-500 outline-none"/></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Anon Public Key</label><input type="text" value={key} onChange={(e) => setKey(e.target.value)} className="w-full bg-black border border-slate-700 rounded-lg p-3 text-sm text-white font-mono focus:border-blue-500 outline-none"/></div>
                            </div>
                            <button onClick={handleSaveConfig} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold uppercase tracking-wide shadow-lg active:scale-95 transition-all">Speichern & Verbinden</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-xs text-slate-400">Kopiere diesen SQL-Code und führe ihn im <strong>Supabase SQL Editor</strong> aus.</div>
                            <div className="relative group">
                                <div className="absolute top-2 right-2"><button onClick={handleCopy} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{copied ? <CheckSquare className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? 'KOPIERT' : 'COPY SQL'}</button></div>
                                <pre className="bg-black rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto border border-slate-800 shadow-inner h-64">{SCHEMA_SQL}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AppContent = () => {
  const [view, setView] = useState<ViewState>('station');
  const [selectedHero, setSelectedHero] = useState<Hero | WikiHero | null>(null);
  
  const [importedHeroes, setImportedHeroes] = useState<ExternalHero[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [dbErrorMsg, setDbErrorMsg] = useState('');
  const [showDbSetup, setShowDbSetup] = useState(false); 
  
  const [myHeroes, setMyHeroes] = useState<Hero[]>([]);
  const { inventory, equipItem, unequipItem } = useInventory();
  
  const { user, guestId } = useAuth();
  const effectiveUserId = user ? user.id : guestId;
  const [isAnimatingHero, setIsAnimatingHero] = useState(false);

  useEffect(() => { 
      if (!isConfigured()) {
          setShowDbSetup(true);
          setDbError(true);
          setDbErrorMsg("Setup Required");
      } else {
          loadData(); 
      }
  }, [effectiveUserId]);

  const loadData = async () => {
    setIsLoadingDb(true);
    setDbError(false);
    setDbErrorMsg('');
    setImportedHeroes([]); 
    try {
      const rawHeroes = await fetchRawHeroes(500);
      setImportedHeroes(rawHeroes);
      
      try {
          const playerHeroes = await fetchMyHeroes(effectiveUserId);
          setMyHeroes(playerHeroes);
      } catch (e: any) {
          if (e.message === 'TABLE_MISSING' || e.message.includes('relation "my_heroes" does not exist')) {
              console.error("Critical: Heroes table missing");
              setDbError(true);
              setDbErrorMsg("Tabellen fehlen");
          } else if (e.message === 'API_KEY_MISSING') {
              setDbError(true);
              setDbErrorMsg("API Key fehlt");
              setShowDbSetup(true);
          } else if (e.message === 'SCHEMA_MISMATCH') {
              setDbError(true);
              setDbErrorMsg("DB Schema Update nötig");
              setShowDbSetup(true);
          } else {
              throw e;
          }
      }
    } catch (e: any) {
      console.error("Datenbank Fehler:", e.message);
      setDbError(true);
      setDbErrorMsg(e.message || "Verbindungsfehler");
      if (e.message === 'API_KEY_MISSING') setShowDbSetup(true);
    } finally { setIsLoadingDb(false); }
  };
  
  const handleAnimateHero = async (hero: Hero) => {
      if (isAnimatingHero || !hero.image?.url) return;
      setIsAnimatingHero(true);
      try {
          const base64Data = hero.image.url.split(',')[1];
          const mimeType = hero.image.url.split(';')[0].split(':')[1];
          const videoUrl = await animateHeroPortrait(base64Data, mimeType);
          const updatedHero = { ...hero, video: { url: videoUrl } };
          setMyHeroes(prev => prev.map(h => h.id === hero.id ? updatedHero : h));
          setSelectedHero(updatedHero);
          await saveHero(updatedHero, effectiveUserId);
      } catch (e: any) { alert("Animation fehlgeschlagen: " + e.message); } finally { setIsAnimatingHero(false); }
  };

  const handleHeroRecruited = (newHero: Hero) => {
      setMyHeroes(prev => [newHero, ...prev]);
  };

  const renderStation = () => (
    <div className="h-full flex flex-col bg-[#f0f4f8] overflow-hidden">
      <ResourceDisplay />
      <InteractiveMap />
    </div>
  );

  const renderHeroOverlay = () => {
      if (!selectedHero) return null;
      const isMyHero = 'powerstats' in selectedHero;
      const hasVideo = isMyHero && 'video' in selectedHero && (selectedHero as Hero).video?.url;
      const name = selectedHero.name;
      const universe = isMyHero ? 'INFINITE' : (selectedHero as WikiHero).universe;
      
      return (
        <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col animate-in slide-in-from-bottom-10">
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {hasVideo ? (
                    <video src={(selectedHero as Hero).video!.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : isMyHero && (selectedHero as Hero).image?.url ? (
                    <img src={(selectedHero as Hero).image.url} className="w-full h-full object-cover" />
                ) : typeof selectedHero.image === 'string' ? (
                    <div className="text-9xl animate-float">{selectedHero.image}</div>
                ) : null}
                
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none"></div>

                <div className="absolute bottom-0 left-0 right-0 p-8 pb-12">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="bg-yellow-500 text-black font-black text-xs px-2 py-0.5 rounded uppercase">legendary</span>
                        <span className="bg-white/20 backdrop-blur text-white font-bold text-xs px-2 py-0.5 rounded uppercase border border-white/20">{universe}</span>
                     </div>
                     <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2 drop-shadow-lg">{name}</h2>
                     <p className="text-slate-300 text-sm line-clamp-3 mb-6 font-medium leading-relaxed max-w-md">{selectedHero.description}</p>
                     
                     <div className="flex gap-4">
                         {isMyHero && !hasVideo && (
                            <button onClick={() => handleAnimateHero(selectedHero as Hero)} className="flex-1 bg-white text-black font-black py-3 rounded-xl uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                {isAnimatingHero ? <Loader2 className="w-5 h-5 animate-spin"/> : <Video className="w-5 h-5" />}
                                <span>Motion</span>
                            </button>
                         )}
                         <button onClick={() => setSelectedHero(null)} className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/20 active:scale-95">
                             <ChevronUp className="w-6 h-6 rotate-180" />
                         </button>
                     </div>
                </div>

                <button onClick={() => setSelectedHero(null)} className="absolute top-safe-top left-4 w-10 h-10 bg-black/20 backdrop-blur rounded-full flex items-center justify-center text-white z-20">
                    <ChevronUp className="w-6 h-6 -rotate-90" />
                </button>
            </div>
        </div>
      );
  };

  const renderDetail = () => (
     <div className="h-full flex flex-col bg-[#f0f4f8]">
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 sticky top-0">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
               <User className="w-6 h-6 text-blue-500" />
               Kaserne <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-bold">{myHeroes.length}</span>
            </h2>
        </div>

        {myHeroes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-8">
               <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-slate-400"/>
               </div>
               <h3 className="text-xl font-black text-slate-700 mb-2">Keine Truppen</h3>
               <button onClick={() => setView('forge')} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold uppercase shadow-md game-btn border-blue-700">
                  Rekrutieren
               </button>
            </div>
        ) : (
           <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3 pb-24 overflow-y-auto custom-scrollbar">
              {myHeroes.map((hero) => (
                 <div 
                    key={hero.id} 
                    onClick={() => setSelectedHero(hero)}
                    className="aspect-[3/4] rounded-2xl overflow-hidden relative shadow-md bg-slate-900 group cursor-pointer active:scale-95 transition-transform"
                 >
                    {hero.image.url ? (
                        <img src={hero.image.url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 font-black text-4xl bg-slate-200">?</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/20">
                        LV 1
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex gap-0.5 mb-1">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <h3 className="text-white font-black uppercase text-sm leading-tight truncate">{hero.name}</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase">{hero.appearance.race}</p>
                    </div>
                 </div>
              ))}
           </div>
        )}
     </div>
  );

  const NavButton = ({ viewName, label, icon: Icon }: any) => {
    const isActive = view === viewName;
    return (
      <button onClick={() => setView(viewName)} className="flex-1 flex flex-col items-center justify-center gap-1 py-1 relative">
          {isActive && <div className="absolute top-0 w-8 h-1 bg-blue-500 rounded-b-full"></div>}
          <div className={`transition-transform duration-200 ${isActive ? '-translate-y-1' : ''}`}>
             <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600 fill-blue-100' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#f0f4f8] text-slate-900 font-sans overflow-hidden select-none">
        <main className="flex-1 overflow-hidden relative">
            <OfflineToast />
            <MissionGuide onNavigate={(v) => setView(v as ViewState)} />
            <SaveManager 
                onSchemaError={() => setShowDbSetup(true)} 
                onProfileClick={() => setView('profile')} 
            />
            {view === 'forge' && (
                <RecruitmentCenter 
                    importedHeroes={importedHeroes} 
                    onHeroRecruited={handleHeroRecruited} 
                />
            )}
            {view === 'station' && renderStation()}
            {view === 'detail' && renderDetail()}
            {view === 'ai_lab' && <AiLab />}
            {view === 'wiki' && <div className="p-8">Wiki Hidden</div>}
            {view === 'nanoforge' && <Nanoforge />}
            {view === 'spire' && <SpireScreen myHeroes={myHeroes} onNavigateToRecruit={() => setView('forge')} />}
            {view === 'profile' && <ProfileScreen onClose={() => setView('station')} />}
            {selectedHero && renderHeroOverlay()}
            {showDbSetup && <DbSetupModal onClose={() => setShowDbSetup(false)} />}
        </main>
        <nav className="h-[70px] bg-white border-t border-slate-200 flex justify-around items-center px-2 shrink-0 z-30 pb-safe-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <NavButton viewName="station" label="Basis" icon={LayoutDashboard} />
            <NavButton viewName="forge" label="Portal" icon={Zap} />
            <NavButton viewName="spire" label="Turm" icon={Tower} />
            <NavButton viewName="detail" label="Armee" icon={User} />
            <NavButton viewName="nanoforge" label="Inventar" icon={Box} />
        </nav>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
        <GameProvider>
        <InventoryProvider>
            <AppContentWithSpire />
        </InventoryProvider>
        </GameProvider>
    </AuthProvider>
  );
};

const rarityMap: Record<string, ItemRarity> = {
  'common': 'grey',
  'uncommon': 'green',
  'rare': 'blue',
  'epic': 'purple',
  'legendary': 'orange'
};

const AppContentWithSpire = () => {
    const { addItem } = useInventory();
    
    useEffect(() => {
        // Initial setup hook
    }, []);

    return (
        <SpireProvider unlockedHeroes={[]} onAddItem={(item) => {
            addItem({
                id: crypto.randomUUID(),
                templateId: item.id,
                name: item.name,
                category: 'material', 
                rarity: rarityMap[item.rarity] || 'grey',
                description: item.description
            }, item.quantity);
        }}>
            <MissionProvider>
                <AppContent />
            </MissionProvider>
        </SpireProvider>
    );
};