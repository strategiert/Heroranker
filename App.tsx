import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Loader2, RefreshCw, AlertTriangle, Copy, 
  CheckSquare, Square, Shield, Hammer, User, LayoutDashboard, Zap, Search, ChevronRight, Brain, Activity, Dumbbell,
  Coins, Leaf, Box, Gem, ArrowUpCircle, Clock, Terminal, ChevronUp, Construction, Sparkles, MessageSquare, Image as ImageIcon, Video, Eye, Wand2,
  Dice5, Layers, Book, Film, Cpu, Sword, Rocket, Trash2, Unlock, Lock, Star, TowerControl as Tower
} from 'lucide-react';
import { Hero, ExternalHero, ViewState, EquipmentLoadout, WikiHero } from './types';
import { fetchRawHeroes, listTables, SCHEMA_SQL, REQUIRED_TABLE_NAME, saveHero, fetchMyHeroes } from './services/supabaseService';
import { transformHero, generateStrategicAdvice, chatWithAi, analyzeImage, generateProImage, editImage, generateVeoVideo, animateHeroPortrait } from './services/geminiService';
import { FULL_HERO_DATA } from './services/fullHeroData';
import { GameProvider, useGame } from './context/GameContext';
import { InventoryProvider, useInventory, EquipmentItem, EquipmentSlot, ItemRarity } from './context/InventoryContext';
// TowerProvider removed, handled in SpireScreen
import { BuildingType, Resources } from './types/economy';
import { calculateBuildingCost, calculateBuildTime, formatDuration } from './utils/formulas';
import { StatsRadar } from './components/StatsRadar';
import { Nanoforge } from './components/Nanoforge';
import { SpireScreen } from './components/SpireScreen';
import { SaveManager } from './components/SaveManager';
import { AuthModal } from './components/AuthModal';
import { SpireProvider, Item } from './context/SpireContext';

// --- Station Components ---

const ResourceDisplay = () => {
  const { state } = useGame();
  const res = state.resources;

  const Item = ({ icon: Icon, val, bg, text }: any) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bg} border border-white/10 shadow-sm`}>
       <Icon className={`w-4 h-4 ${text}`} />
       <span className="font-bold text-sm text-slate-800">
          {val >= 10000 ? (val / 1000).toFixed(1) + 'k' : val}
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

const BuildingGrid = () => {
  const { state, startUpgrade, speedUpBuilding } = useGame();

  const getStyle = (type: BuildingType) => {
    switch (type) {
      case BuildingType.COMMAND_CENTER: return { iconBg: 'bg-yellow-500', iconColor: 'text-white' };
      case BuildingType.HYDROPONICS: return { iconBg: 'bg-green-500', iconColor: 'text-white' };
      case BuildingType.NANO_FOUNDRY: return { iconBg: 'bg-blue-500', iconColor: 'text-white' };
      case BuildingType.CREDIT_TERMINAL: return { iconBg: 'bg-purple-500', iconColor: 'text-white' };
      default: return { iconBg: 'bg-slate-500', iconColor: 'text-white' };
    }
  };

  const getIcon = (type: BuildingType) => {
    switch (type) {
      case BuildingType.COMMAND_CENTER: return Shield;
      case BuildingType.HYDROPONICS: return Leaf;
      case BuildingType.NANO_FOUNDRY: return Box;
      case BuildingType.CREDIT_TERMINAL: return Coins;
      default: return Square;
    }
  };

  const getLabel = (type: BuildingType) => {
      switch (type) {
        case BuildingType.COMMAND_CENTER: return 'Zentrale';
        case BuildingType.HYDROPONICS: return 'Farm';
        case BuildingType.NANO_FOUNDRY: return 'Schmiede';
        case BuildingType.CREDIT_TERMINAL: return 'Bank';
        default: return type;
      }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 custom-scrollbar">
       <div className="grid grid-cols-2 gap-4">
          {state.buildings.map((b) => {
             const style = getStyle(b.type);
             const Icon = getIcon(b.type);
             const isUpgrading = b.status === 'UPGRADING';
             
             let timeLeft = 0;
             if (isUpgrading && b.finishTime) {
                timeLeft = Math.max(0, Math.ceil((b.finishTime - Date.now()) / 1000));
             }

             return (
               <div key={b.id} className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 relative overflow-hidden group active:scale-[0.98] transition-transform">
                  
                  {/* Header Level Badge */}
                  <div className="flex justify-between items-start mb-3">
                      <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center shadow-md`}>
                          <Icon className={`w-7 h-7 ${style.iconColor}`} />
                      </div>
                      <div className="bg-slate-100 text-slate-600 text-xs font-black px-2 py-1 rounded-md">
                          LV {b.level}
                      </div>
                  </div>

                  <h4 className="font-black text-slate-800 text-lg uppercase mb-1">{getLabel(b.type)}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">
                      {isUpgrading ? 'WIRD GEBAUT...' : 'PRODUKTIV'}
                  </p>

                  {isUpgrading ? (
                      <div>
                          <div className="flex justify-between text-xs font-bold text-blue-600 mb-1">
                              <span>Fertig in:</span>
                              <span>{formatDuration(timeLeft)}</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-full mb-3">
                             <div className="h-full bg-blue-500 w-full animate-pulse"></div>
                          </div>
                          <button 
                             onClick={() => speedUpBuilding(b.id, 60)}
                             className="w-full py-2 bg-blue-500 text-white rounded-xl font-black text-xs shadow-sm uppercase"
                          >
                             Beschleunigen
                          </button>
                      </div>
                  ) : (
                      <button 
                         onClick={() => startUpgrade(b.id)}
                         className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[4px] transition-all uppercase flex items-center justify-center gap-2"
                      >
                         <Construction className="w-4 h-4" /> Upgrade
                      </button>
                  )}
               </div>
             );
          })}
       </div>
    </div>
  );
};

// ... (AiLab component unchanged) ...
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

// --- DATABASE SETUP MODAL ---
const DbSetupModal = ({ onClose }: { onClose: () => void }) => {
    const [copied, setCopied] = useState(false);
    const userId = localStorage.getItem('infinite_arena_user_id') || 'Wird geladen...';

    const handleCopy = () => {
        navigator.clipboard.writeText(SCHEMA_SQL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
                    <div className="flex items-center gap-2 text-red-400">
                        <Terminal className="w-5 h-5" />
                        <h2 className="font-bold font-mono">SYSTEM INITIALIZATION REQUIRED</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase">Deine User ID:</span>
                        <code className="text-blue-400 text-xs font-mono bg-slate-900 px-2 py-1 rounded">{userId}</code>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-200 text-sm leading-relaxed">
                        <strong>Datenbank-Status:</strong> Tabellen fehlen oder sind veraltet. Automatische Speicherung ist pausiert.
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-slate-300 font-bold text-sm uppercase tracking-wide">Anleitung:</h3>
                        <ol className="list-decimal list-inside text-slate-400 text-sm space-y-1 ml-2">
                            <li>Kopiere den SQL-Code unten.</li>
                            <li>Öffne dein Supabase Dashboard.</li>
                            <li>Gehe zum <strong>SQL Editor</strong>.</li>
                            <li>Füge den Code ein und klicke auf <strong>RUN</strong>.</li>
                        </ol>
                    </div>

                    <div className="relative group">
                        <div className="absolute top-2 right-2">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                            >
                                {copied ? <CheckSquare className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'KOPIERT' : 'COPY SQL'}
                            </button>
                        </div>
                        <pre className="bg-black rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto border border-slate-800 shadow-inner">
                            {SCHEMA_SQL}
                        </pre>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wide shadow-lg active:scale-95 transition-all"
                    >
                        System Neustarten
                    </button>
                </div>
            </div>
        </div>
    );
};

const AppContent = () => {
  const [view, setView] = useState<ViewState>('station');
  const [selectedHero, setSelectedHero] = useState<Hero | WikiHero | null>(null);
  
  // Forge State
  const [importedHeroes, setImportedHeroes] = useState<ExternalHero[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [showDbSetup, setShowDbSetup] = useState(false); 
  const [showAuth, setShowAuth] = useState(false); // NEW AUTH STATE
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection & Processing
  const [selectedImportIds, setSelectedImportIds] = useState<Set<number>>(new Set());
  const [processedIndices, setProcessedIndices] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null);
  const [generationStep, setGenerationStep] = useState('');
  
  // My Heroes & Inventory
  const [myHeroes, setMyHeroes] = useState<Hero[]>([]);
  const { inventory, equipItem, unequipItem } = useInventory();
  
  // Animation State
  const [isAnimatingHero, setIsAnimatingHero] = useState(false);

  // Initial Load
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoadingDb(true);
    setDbError(false);
    setImportedHeroes([]); 
    try {
      await listTables(); 
      // Fetch concurrently, but handle specific errors for my_heroes separately
      const rawHeroes = await fetchRawHeroes(500);
      setImportedHeroes(rawHeroes);
      
      try {
          const playerHeroes = await fetchMyHeroes();
          setMyHeroes(playerHeroes);
      } catch (e: any) {
          // If my_heroes fetch fails specifically (likely table missing), trigger DB Error mode
          if (e.message === 'TABLE_MISSING' || e.message.includes('relation "my_heroes" does not exist')) {
              console.error("Critical: Heroes table missing");
              setDbError(true);
          }
      }
    } catch (e: any) {
      console.error("Datenbank Fehler:", e.message);
      // General DB error
      setDbError(true);
    } finally { setIsLoadingDb(false); }
  };

  // ... (Other handlers kept same as existing) ...
  const toggleImportSelection = (idx: number) => {
    const newSet = new Set(selectedImportIds);
    if (newSet.has(idx)) newSet.delete(idx); else newSet.add(idx);
    setSelectedImportIds(newSet);
  };

  const handleSelectRandom = (count: number) => {
    const available = importedHeroes.map((_, idx) => idx).filter(idx => !processedIndices.has(idx) && (importedHeroes[idx].name.toLowerCase().includes(searchTerm.toLowerCase()) || (importedHeroes[idx].publisher && importedHeroes[idx].publisher!.toLowerCase().includes(searchTerm.toLowerCase()))));
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    const newSet = new Set(selectedImportIds);
    selected.forEach(id => newSet.add(id));
    setSelectedImportIds(newSet);
  };

  const handleSelectAll = () => {
     const available = importedHeroes.map((_, idx) => idx).filter(idx => !processedIndices.has(idx) && (importedHeroes[idx].name.toLowerCase().includes(searchTerm.toLowerCase()) || (importedHeroes[idx].publisher && importedHeroes[idx].publisher!.toLowerCase().includes(searchTerm.toLowerCase()))));
     const newSet = new Set(selectedImportIds);
     available.forEach(id => newSet.add(id));
     setSelectedImportIds(newSet);
  };

  const handleBatchTransform = async () => {
    if (selectedImportIds.size === 0) return;
    setIsGenerating(true);
    setGenerationStep('Verarbeite...');
    let current = 0;
    const total = selectedImportIds.size;
    setBatchProgress({ current, total });
    const indices = Array.from(selectedImportIds);
    
    for (const idx of indices) {
      const sourceHero = importedHeroes[idx];
      setGenerationStep(`${sourceHero.name}...`);
      try {
        const newHero = await transformHero(sourceHero);
        setGenerationStep(`Speichere...`);
        await saveHero(newHero);
        setMyHeroes(prev => [newHero, ...prev]); 
        setProcessedIndices(prev => new Set(prev).add(idx));
        setSelectedImportIds(prev => { const next = new Set(prev); next.delete(idx); return next; });
      } catch (e: any) { console.error(`Error transforming ${sourceHero.name}:`, e); }
      current++;
      setBatchProgress({ current, total });
    }
    setIsGenerating(false);
    setBatchProgress(null);
    setGenerationStep('');
    setView('detail'); 
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
          await saveHero(updatedHero);
      } catch (e: any) { alert("Animation fehlgeschlagen: " + e.message); } finally { setIsAnimatingHero(false); }
  };

  const filteredHeroes = importedHeroes.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || (h.publisher && h.publisher.toLowerCase().includes(searchTerm.toLowerCase())));

  const renderStation = () => (
    <div className="h-full flex flex-col bg-[#f0f4f8] overflow-hidden">
      <ResourceDisplay />
      <div className="flex-1 overflow-hidden relative">
        <BuildingGrid />
      </div>
    </div>
  );

  const renderForge = () => {
    if (isGenerating) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-black text-slate-800">{generationStep}</h2>
          {batchProgress && (
             <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-bold uppercase"><span>Verarbeitung</span><span>{batchProgress.current} / {batchProgress.total}</span></div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}></div></div>
             </div>
          )}
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col bg-[#f0f4f8]">
        <div className="p-4 bg-white border-b border-slate-200 space-y-4 shadow-sm z-10">
            <div className="flex justify-between items-center">
               <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Hammer className="w-6 h-6 text-orange-500" /> REKRUTIERUNG</h2>
               <div className="flex items-center gap-2 text-[10px]">
                   <div className={`w-2 h-2 rounded-full ${isLoadingDb ? 'bg-yellow-500 animate-pulse' : dbError ? 'bg-red-500' : 'bg-green-500'}`}></div>
                   <span className="text-slate-400 uppercase font-bold">{isLoadingDb ? 'LADEN...' : dbError ? 'FEHLER' : 'ONLINE'}</span>
                   {dbError && (
                       <button 
                         onClick={() => setShowDbSetup(true)}
                         className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 hover:bg-red-200 transition-colors animate-pulse"
                       >
                           REPARIEREN
                       </button>
                   )}
               </div>
            </div>
            <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Datenbank durchsuchen..." className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 font-medium"/></div></div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
               <button onClick={() => handleSelectRandom(5)} className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1 active:scale-95"><Dice5 className="w-3 h-3" /> Zufall (5)</button>
               <button onClick={handleSelectAll} className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1 active:scale-95"><Layers className="w-3 h-3" /> Alle</button>
               <div className="flex-1" />
               {selectedImportIds.size > 0 && <button onClick={handleBatchTransform} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-right-4 game-btn border-blue-800"><Hammer className="w-3 h-3" /> START ({selectedImportIds.size})</button>}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           {filteredHeroes.length === 0 ? <div className="text-center text-slate-400 mt-20"><Database className="w-12 h-12 mx-auto mb-2 opacity-20" /><p className="font-bold">Keine Daten.</p></div> : <div className="grid grid-cols-1 gap-3 pb-24">{filteredHeroes.map((h, idx) => { const originalIndex = importedHeroes.indexOf(h); if (originalIndex === -1 || processedIndices.has(originalIndex)) return null; const isSelected = selectedImportIds.has(originalIndex); return (<div key={originalIndex} onClick={() => toggleImportSelection(originalIndex)} className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.99] ${isSelected ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-slate-100 shadow-sm'}`}><div className="flex justify-between items-start"><div><h3 className={`font-black text-sm uppercase ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{h.name}</h3><p className="text-[10px] text-slate-400 uppercase font-bold mt-1">{h.publisher} • {h.race}</p></div><div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-200 text-transparent'}`}><CheckSquare className="w-4 h-4" /></div></div></div>); })}</div>}
        </div>
      </div>
    );
  };

  // ... (renderHeroOverlay, renderDetail helpers omitted for brevity) ...
  const renderHeroOverlay = () => {
      if (!selectedHero) return null;

      const isMyHero = 'powerstats' in selectedHero;
      const hasVideo = isMyHero && 'video' in selectedHero && (selectedHero as Hero).video?.url;
      const name = selectedHero.name;
      const universe = isMyHero ? 'INFINITE' : (selectedHero as WikiHero).universe;
      
      return (
        <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col animate-in slide-in-from-bottom-10">
            {/* Full Screen Portrait View */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {hasVideo ? (
                    <video src={(selectedHero as Hero).video!.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : isMyHero && (selectedHero as Hero).image?.url ? (
                    <img src={(selectedHero as Hero).image.url} className="w-full h-full object-cover" />
                ) : typeof selectedHero.image === 'string' ? (
                    <div className="text-9xl animate-float">{selectedHero.image}</div>
                ) : null}
                
                {/* Gradient Overlay for Text */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none"></div>

                {/* Hero Info Overlay */}
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

                {/* Close Button Top Left */}
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
                    {/* Hero Image */}
                    {hero.image.url ? (
                        <img src={hero.image.url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 font-black text-4xl bg-slate-200">?</div>
                    )}
                    
                    {/* Gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    {/* Level Badge Top Right */}
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/20">
                        LV 1
                    </div>

                    {/* Bottom Info */}
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
            <SaveManager 
                onSchemaError={() => setShowDbSetup(true)} 
                onProfileClick={() => setShowAuth(true)}
            />
            {view === 'forge' && renderForge()}
            {view === 'station' && renderStation()}
            {view === 'detail' && renderDetail()}
            {view === 'ai_lab' && <AiLab />}
            {view === 'wiki' && <div className="p-8">Wiki Hidden</div>}
            {view === 'nanoforge' && <Nanoforge />}
            {view === 'spire' && <SpireScreen myHeroes={myHeroes} onNavigateToRecruit={() => setView('forge')} onNavigateToInventory={() => setView('nanoforge')} />}
            {selectedHero && renderHeroOverlay()}
            {showDbSetup && <DbSetupModal onClose={() => setShowDbSetup(false)} />}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </main>
        <nav className="h-[70px] bg-white border-t border-slate-200 flex justify-around items-center px-2 shrink-0 z-30 pb-safe-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <NavButton viewName="station" label="Basis" icon={LayoutDashboard} />
            <NavButton viewName="forge" label="Rekrut" icon={Search} />
            <NavButton viewName="spire" label="Turm" icon={Tower} />
            <NavButton viewName="detail" label="Armee" icon={User} />
            <NavButton viewName="nanoforge" label="Inventar" icon={Box} />
        </nav>
    </div>
  );
};

export const App = () => {
  return (
    <GameProvider>
      <InventoryProvider>
          <AppContentWithSpire />
      </InventoryProvider>
    </GameProvider>
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
            <AppContent />
        </SpireProvider>
    );
};