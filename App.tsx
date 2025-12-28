import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Loader2, RefreshCw, AlertTriangle, Copy, 
  CheckSquare, Square, Shield, Hammer, User, LayoutDashboard, Zap, Search, ChevronRight, Brain, Activity, Dumbbell,
  Coins, Leaf, Box, Gem, ArrowUpCircle, Clock, Terminal, ChevronUp, Construction, Sparkles, MessageSquare, Image as ImageIcon, Video, Eye, Wand2,
  Dice5, Layers, Book, Film, Cpu
} from 'lucide-react';
import { Hero, ExternalHero, ViewState } from './types';
import { fetchRawHeroes, listTables, SCHEMA_SQL, REQUIRED_TABLE_NAME, saveHero, fetchMyHeroes } from './services/supabaseService';
import { transformHero, generateStrategicAdvice, chatWithAi, analyzeImage, generateProImage, editImage, generateVeoVideo, animateHeroPortrait } from './services/geminiService';
import { FULL_HERO_DATA } from './services/fullHeroData';
import { GameProvider, useGame } from './context/GameContext';
import { InventoryProvider } from './context/InventoryContext';
import { BuildingType, Resources } from './types/economy';
import { calculateBuildingCost, calculateBuildTime, formatDuration } from './utils/formulas';
import { StatsRadar } from './components/StatsRadar';
import { Nanoforge } from './components/Nanoforge';

// Helper Component for Stat Bars (Still used for mini-views or list items if needed)
const StatBar = ({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: any }) => (
  <div className="flex items-center gap-2 text-[10px] w-full">
    <Icon className={`w-3 h-3 ${color}`} />
    <span className="w-6 text-slate-400 font-mono">{label}</span>
    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
      <div 
        className={`h-full rounded-full ${color.replace('text-', 'bg-')} shadow-[0_0_5px_currentColor]`} 
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
    <span className="w-6 text-right font-mono text-slate-300 font-bold">{value}</span>
  </div>
);

// --- Station Components ---

const ResourceDisplay = () => {
  const { state } = useGame();
  const res = state.resources;

  const Item = ({ icon: Icon, val, colorClass, label }: any) => (
    <div className="flex flex-col items-center relative group min-w-[70px]">
       <div className={`
         flex items-center gap-1.5 px-3 py-1.5 rounded-full border-b-2 
         bg-slate-800 border-slate-950 shadow-lg relative overflow-hidden w-full justify-center
       `}>
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shine pointer-events-none"/>
          
          <Icon className={`w-3.5 h-3.5 ${colorClass} drop-shadow-md`} />
          <span className="font-tech font-bold text-sm text-white tracking-wide shadow-black drop-shadow-sm">
             {val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}
          </span>
       </div>
       <span className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-[#0B1120] border-b border-slate-800/50 shadow-xl z-20 sticky top-0 backdrop-blur-md bg-opacity-90">
      <Item icon={Coins} val={res.credits} colorClass="text-yellow-400" label="Credits" />
      <Item icon={Leaf} val={res.biomass} colorClass="text-green-400" label="Biomasse" />
      <Item icon={Box} val={res.nanosteel} colorClass="text-blue-400" label="Nano" />
      <Item icon={Gem} val={res.gems} colorClass="text-purple-400" label="Gems" />
    </div>
  );
};

const KoraWidget = () => {
  const { state } = useGame();
  const [advice, setAdvice] = useState<{title: string, advice: string, priority: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     handleConsult();
  }, []); 

  const handleConsult = async () => {
    setLoading(true);
    try {
      const result = await generateStrategicAdvice(state);
      setAdvice(result);
    } catch (e) {
      setAdvice({ title: 'ERROR', advice: 'Verbindung unterbrochen.', priority: 'low' });
    } finally {
      setLoading(false);
    }
  };

  const isDanger = advice?.priority === 'high';

  return (
    <div className="px-4 py-4">
      <div className={`
        relative rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-2xl
        ${isDanger ? 'border-red-500/50 bg-red-950/20' : 'border-cyan-500/30 bg-slate-900'}
      `}>
         {/* CRT Effect Layers */}
         <div className="scanlines opacity-20"></div>
         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

         <div className="p-3 flex items-start gap-3 relative z-10">
            {/* Portrait Box */}
            <div className={`
              w-14 h-14 rounded-lg border-2 flex items-center justify-center shrink-0 bg-black/50 backdrop-blur
              ${isDanger ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'}
            `}>
               {loading ? (
                 <Loader2 className={`w-8 h-8 animate-spin ${isDanger ? 'text-red-500' : 'text-cyan-400'}`} />
               ) : (
                 <Terminal className={`w-8 h-8 ${isDanger ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`} />
               )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-center mb-1">
                  <span className={`font-tech font-bold tracking-widest text-xs uppercase
                    ${isDanger ? 'text-red-400' : 'text-cyan-400'}
                  `}>
                    // K.O.R.A. AI SYSTEM
                  </span>
                  {isDanger && <AlertTriangle className="w-3 h-3 text-red-500 animate-bounce" />}
               </div>
               <div className="min-h-[2.5rem] flex items-center">
                  <p className={`font-mono text-sm leading-tight ${isDanger ? 'text-red-200' : 'text-cyan-100'}`}>
                    {loading ? <span className="animate-pulse">_Analysiere Basis-Daten...</span> : `"${advice?.advice}"`}
                  </p>
               </div>
            </div>
         </div>

         {/* Refresh Button */}
         <button 
           onClick={handleConsult} 
           disabled={loading}
           className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/10"
         >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}/>
         </button>
      </div>
    </div>
  );
};

const BuildingGrid = () => {
  const { state, startUpgrade, speedUpBuilding } = useGame();

  const getStyle = (type: BuildingType) => {
    switch (type) {
      case BuildingType.COMMAND_CENTER: return { color: 'text-yellow-400', bg: 'from-slate-800 to-slate-900', border: 'border-yellow-500/30' };
      case BuildingType.HYDROPONICS: return { color: 'text-green-400', bg: 'from-green-950/40 to-slate-900', border: 'border-green-500/30' };
      case BuildingType.NANO_FOUNDRY: return { color: 'text-blue-400', bg: 'from-blue-950/40 to-slate-900', border: 'border-blue-500/30' };
      case BuildingType.CREDIT_TERMINAL: return { color: 'text-purple-400', bg: 'from-purple-950/40 to-slate-900', border: 'border-purple-500/30' };
      default: return { color: 'text-slate-400', bg: 'from-slate-800 to-slate-900', border: 'border-slate-700' };
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
    <div className="flex-1 overflow-y-auto px-4 pb-20 custom-scrollbar">
       <div className="grid grid-cols-2 gap-4">
          {state.buildings.map((b) => {
             const style = getStyle(b.type);
             const Icon = getIcon(b.type);
             const isUpgrading = b.status === 'UPGRADING';
             const nextCost = calculateBuildingCost(b.type, b.level);
             const buildTime = calculateBuildTime(b.level);
             
             let timeLeft = 0;
             if (isUpgrading && b.finishTime) {
                timeLeft = Math.max(0, Math.ceil((b.finishTime - Date.now()) / 1000));
             }

             return (
               <div key={b.id} className={`
                  relative rounded-2xl p-0.5 bg-gradient-to-b ${style.bg} shadow-lg group transition-transform
                  ${isUpgrading ? 'ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-black' : ''}
               `}>
                  <div className="h-full bg-[#131b2e] rounded-xl overflow-hidden flex flex-col border border-slate-700/50 relative">
                     
                     {/* Level Badge */}
                     <div className="absolute top-0 right-0 bg-slate-950/80 backdrop-blur rounded-bl-xl px-2 py-1 border-b border-l border-slate-700/50 z-10">
                        <div className="flex items-center gap-1">
                           <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                           <span className="font-tech font-bold text-xs text-white">LV {b.level}</span>
                        </div>
                     </div>

                     {/* Main Content */}
                     <div className="p-3 flex-1 flex flex-col items-center justify-center pt-6">
                        {/* Icon Circle */}
                        <div className={`
                           w-14 h-14 rounded-full bg-slate-900 border-2 ${style.border} 
                           flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]
                           group-hover:scale-110 transition-transform duration-300 relative
                        `}>
                           {!isUpgrading && (
                             <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900 animate-float shadow-lg">
                                <ArrowUpCircle className="w-4 h-4 text-white" />
                             </div>
                           )}
                           <Icon className={`w-7 h-7 ${style.color}`} />
                        </div>

                        <h4 className="font-comic text-white text-lg tracking-wide uppercase drop-shadow-md text-center leading-none mb-1">
                          {getLabel(b.type)}
                        </h4>
                        
                        <p className={`text-[10px] uppercase font-bold tracking-wider ${isUpgrading ? 'text-yellow-400' : 'text-slate-500'}`}>
                           {isUpgrading ? 'Baustelle' : 'Produktiv'}
                        </p>
                     </div>

                     {/* Action Footer */}
                     <div className="p-2 bg-slate-900/50 border-t border-white/5">
                        {isUpgrading ? (
                           <div className="w-full">
                              <div className="flex justify-between text-[10px] text-yellow-500 font-mono mb-1">
                                 <span>Upgrade</span>
                                 <span>{formatDuration(timeLeft)}</span>
                              </div>
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden w-full mb-2">
                                 <div className="h-full bg-yellow-500 progress-striped w-full animate-pulse"></div>
                              </div>
                              <button 
                                onClick={() => speedUpBuilding(b.id, 60)}
                                className="game-btn w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-1.5 rounded font-bold shadow-lg"
                              >
                                SCHNELL (-1m)
                              </button>
                           </div>
                        ) : (
                           <button 
                             onClick={() => startUpgrade(b.id)}
                             className="game-btn w-full bg-green-600 hover:bg-green-500 border-green-800 text-white py-1.5 rounded-lg font-bold text-xs shadow-lg flex items-center justify-center gap-1 group/btn"
                           >
                              <Construction className="w-3 h-3 group-hover/btn:rotate-12 transition-transform"/>
                              <span>UPGRADE</span>
                           </button>
                        )}
                        
                        {/* Cost Tooltip */}
                        {!isUpgrading && (
                           <div className="flex justify-center gap-2 mt-1.5 opacity-60">
                              {nextCost.credits > 0 && (
                                 <div className="flex items-center gap-0.5 text-[9px] text-white">
                                    <Coins className="w-2.5 h-2.5 text-yellow-400"/> {nextCost.credits}
                                 </div>
                              )}
                              {nextCost.nanosteel > 0 && (
                                 <div className="flex items-center gap-0.5 text-[9px] text-white">
                                    <Box className="w-2.5 h-2.5 text-blue-400"/> {nextCost.nanosteel}
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
};

// --- NEW AI LAB COMPONENTS ---

const AiLab = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'vision' | 'art' | 'video'>('chat');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  // Vision & Art State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [outputContent, setOutputContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setImageMime(file.type);
        // Clean base64 for API
        // const base64 = result.split(',')[1];
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    setIsThinking(true);
    const newHistory = [...chatHistory, {role: 'user' as const, text: chatInput}];
    setChatHistory(newHistory);
    setChatInput('');

    try {
        const formattedHist = chatHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
        const response = await chatWithAi(chatInput, formattedHist);
        setChatHistory([...newHistory, { role: 'model', text: response }]);
    } catch (e) {
        setChatHistory([...newHistory, { role: 'model', text: "Verbindungsfehler zur KI." }]);
    } finally {
        setIsThinking(false);
    }
  };

  const handleVision = async () => {
      if (!selectedImage) return;
      setIsProcessing(true);
      try {
          const base64 = selectedImage.split(',')[1];
          const result = await analyzeImage(base64, imageMime);
          setOutputContent(result);
      } catch (e) {
          setOutputContent("Fehler bei der Analyse.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleArt = async () => {
      if (!prompt) return;
      setIsProcessing(true);
      setOutputContent(null);
      try {
          if (selectedImage) {
              // Edit Mode (Flash Image)
              const base64 = selectedImage.split(',')[1];
              const result = await editImage(base64, imageMime, prompt);
              setOutputContent(result);
          } else {
              // Gen Mode (Pro Image)
              // Note: Need key selection check ideally
              if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
                  await window.aistudio.openSelectKey();
              }
              const result = await generateProImage(prompt, aspectRatio, imgSize);
              setOutputContent(result);
          }
      } catch (e: any) {
          setOutputContent("Fehler: " + e.message);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleVideo = async () => {
      setIsProcessing(true);
      setOutputContent(null);
      try {
          if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
              await window.aistudio.openSelectKey();
          }

          let result;
          if (selectedImage) {
             const base64 = selectedImage.split(',')[1];
             result = await generateVeoVideo(prompt, aspectRatio as any, base64, imageMime);
          } else {
             result = await generateVeoVideo(prompt, aspectRatio as any);
          }
          setOutputContent(result);
      } catch (e: any) {
          setOutputContent("Fehler: " + e.message);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-tech font-bold flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-5 h-5"/> AI LAB v4.0
            </h2>
            <div className="flex gap-2">
                {[
                  { id: 'chat', icon: MessageSquare },
                  { id: 'vision', icon: Eye },
                  { id: 'art', icon: ImageIcon },
                  { id: 'video', icon: Video },
                ].map((tab: any) => (
                    <button 
                       key={tab.id}
                       onClick={() => { setActiveTab(tab.id as any); setOutputContent(null); setSelectedImage(null); }}
                       className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-500'}`}
                    >
                        <tab.icon className="w-5 h-5"/>
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            {/* CHAT TAB */}
            {activeTab === 'chat' && (
                <div className="h-full flex flex-col">
                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                        {chatHistory.length === 0 && (
                            <div className="text-center text-slate-500 mt-10">
                                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                <p>Frag den Archivar alles über Helden...</p>
                                <p className="text-xs text-slate-600 mt-2">Powered by Gemini 3 Pro Thinking</p>
                            </div>
                        )}
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                                    msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 flex gap-2 items-center text-xs text-cyan-400">
                                    <Loader2 className="w-3 h-3 animate-spin"/>
                                    <span>Thinking Process (32k Tokens)...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                            placeholder="Nachricht eingeben..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500"
                        />
                        <button onClick={handleChat} disabled={isThinking} className="bg-cyan-600 p-2 rounded-xl text-white">
                            <ChevronRight className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
            )}

            {/* VISION / ART / VIDEO TABS */}
            {activeTab !== 'chat' && (
                <div className="space-y-6">
                    {/* File Upload Area */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-900 hover:border-cyan-500 transition-colors relative overflow-hidden group"
                    >
                        {selectedImage ? (
                            <img src={selectedImage} alt="Upload" className="max-h-64 mx-auto rounded-lg shadow-lg"/>
                        ) : (
                            <div className="py-8">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    {activeTab === 'vision' ? <Eye className="w-8 h-8 text-slate-400"/> : <ImageIcon className="w-8 h-8 text-slate-400"/>}
                                </div>
                                <p className="text-slate-400 font-bold">
                                    {activeTab === 'vision' ? 'Bild analysieren' : 'Referenzbild hochladen (Optional)'}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">Tap to select</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden"/>
                        {selectedImage && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500"
                            >
                                <div className="w-4 h-4 flex items-center justify-center">x</div>
                            </button>
                        )}
                    </div>

                    {/* Controls */}
                    {activeTab !== 'vision' && (
                        <div className="space-y-4">
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={activeTab === 'art' ? "Beschreibe das Bild oder 'Füge einen Retro Filter hinzu'..." : "Beschreibe das Video..."}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-cyan-500 min-h-[80px]"
                            />
                            
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => (
                                    <button 
                                        key={r}
                                        onClick={() => setAspectRatio(r)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${aspectRatio === r ? 'bg-cyan-900 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                                {activeTab === 'art' && !selectedImage && ['1K', '2K', '4K'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setImgSize(s as any)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${imgSize === s ? 'bg-purple-900 border-purple-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <button 
                        onClick={activeTab === 'vision' ? handleVision : activeTab === 'art' ? handleArt : handleVideo}
                        disabled={isProcessing || (activeTab === 'vision' && !selectedImage) || (activeTab !== 'vision' && !prompt)}
                        className={`
                            w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all
                            ${isProcessing ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-[1.02]'}
                        `}
                    >
                        {isProcessing ? (
                            <><Loader2 className="w-6 h-6 animate-spin"/> Verarbeitung...</>
                        ) : (
                            <>
                                {activeTab === 'vision' && <Eye className="w-6 h-6"/>}
                                {activeTab === 'art' && <Wand2 className="w-6 h-6"/>}
                                {activeTab === 'video' && <Video className="w-6 h-6"/>}
                                <span>
                                    {activeTab === 'vision' ? 'ANALYSIEREN' : 
                                     activeTab === 'art' ? (selectedImage ? 'BEARBEITEN' : 'GENERIEREN') : 
                                     'VIDEO ERSTELLEN'}
                                </span>
                            </>
                        )}
                    </button>

                    {/* Output */}
                    {outputContent && (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Resultat</h3>
                            {activeTab === 'vision' ? (
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{outputContent}</p>
                            ) : activeTab === 'video' ? (
                                <video src={outputContent} controls loop className="w-full rounded-lg shadow-lg" autoPlay muted />
                            ) : (
                                <img src={outputContent} alt="Result" className="w-full rounded-lg shadow-lg"/>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};


// --- Main Content Wrapper ---

const AppContent = () => {
  const [view, setView] = useState<ViewState | 'nanoforge'>('station');
  const [selectedHero, setSelectedHero] = useState<any | null>(null);
  
  // Forge State (Supabase Data)
  const [importedHeroes, setImportedHeroes] = useState<ExternalHero[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection & Processing
  const [selectedImportIds, setSelectedImportIds] = useState<Set<number>>(new Set());
  const [processedIndices, setProcessedIndices] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null);
  const [generationStep, setGenerationStep] = useState('');
  
  // My Heroes (Transformed IP)
  const [myHeroes, setMyHeroes] = useState<Hero[]>([]);
  
  // Animation State
  const [isAnimatingHero, setIsAnimatingHero] = useState(false);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingDb(true);
    setDbError(false);
    setImportedHeroes([]); 
    try {
      await listTables(); 
      // Parallel loading of both raw data and player data
      const [rawHeroes, playerHeroes] = await Promise.all([
          fetchRawHeroes(500),
          fetchMyHeroes()
      ]);
      
      setImportedHeroes(rawHeroes);
      setMyHeroes(playerHeroes);
    } catch (e: any) {
      console.error("Datenbank Fehler:", e.message || JSON.stringify(e));
      setDbError(true);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const toggleImportSelection = (idx: number) => {
    const newSet = new Set(selectedImportIds);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setSelectedImportIds(newSet);
  };

  // --- NEW BATCH SELECTION FUNCTIONS ---
  const handleSelectRandom = (count: number) => {
    // Only select from visible (filtered) and unprocessed items
    const available = importedHeroes
        .map((_, idx) => idx)
        .filter(idx => !processedIndices.has(idx) && 
            (importedHeroes[idx].name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             (importedHeroes[idx].publisher && importedHeroes[idx].publisher!.toLowerCase().includes(searchTerm.toLowerCase()))));
    
    // Shuffle
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    // Add to current selection
    const newSet = new Set(selectedImportIds);
    selected.forEach(id => newSet.add(id));
    setSelectedImportIds(newSet);
  };

  const handleSelectAll = () => {
     // Select all visible unprocessed
     const available = importedHeroes
        .map((_, idx) => idx)
        .filter(idx => !processedIndices.has(idx) && 
            (importedHeroes[idx].name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             (importedHeroes[idx].publisher && importedHeroes[idx].publisher!.toLowerCase().includes(searchTerm.toLowerCase()))));
     
     const newSet = new Set(selectedImportIds);
     available.forEach(id => newSet.add(id));
     setSelectedImportIds(newSet);
  };

  const handleBatchTransform = async () => {
    if (selectedImportIds.size === 0) return;
    
    setIsGenerating(true);
    setGenerationStep('Initialisiere Anti-Copyright-Schmiede...');
    let current = 0;
    const total = selectedImportIds.size;
    setBatchProgress({ current, total });
    
    const indices = Array.from(selectedImportIds);
    
    for (const idx of indices) {
      const sourceHero = importedHeroes[idx];
      setGenerationStep(`Reforging: ${sourceHero.name}...`);
      
      try {
        const newHero = await transformHero(sourceHero);
        
        // Save to DB immediately
        setGenerationStep(`Speichere: ${newHero.name}...`);
        await saveHero(newHero);

        setMyHeroes(prev => [newHero, ...prev]); 
        setProcessedIndices(prev => new Set(prev).add(idx));
        setSelectedImportIds(prev => {
            const next = new Set(prev);
            next.delete(idx);
            return next;
        });
      } catch (e: any) {
        console.error(`Error transforming ${sourceHero.name}:`, e.message || JSON.stringify(e));
      }
      
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
          
          const updatedHero = {
              ...hero,
              video: { url: videoUrl }
          };
          
          // Save locally
          setMyHeroes(prev => prev.map(h => h.id === hero.id ? updatedHero : h));
          setSelectedHero(updatedHero);
          
          // Save to DB
          await saveHero(updatedHero);
          
      } catch (e: any) {
          console.error("Animation failed", e);
          alert("Animation fehlgeschlagen: " + e.message);
      } finally {
          setIsAnimatingHero(false);
      }
  };

  // Filter Logic
  const filteredHeroes = importedHeroes.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (h.publisher && h.publisher.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderStation = () => (
    <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
      <ResourceDisplay />
      <KoraWidget />
      <div className="flex-1 overflow-hidden relative">
        <BuildingGrid />
      </div>
    </div>
  );

  const renderForge = () => {
    if (isGenerating) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 bg-[#0B1120]">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
          <h2 className="text-2xl font-bold font-comic text-white animate-pulse">
             {generationStep}
          </h2>
          {batchProgress && (
             <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                   <span>FORGING HEROES</span>
                   <span>{batchProgress.current} / {batchProgress.total}</span>
                </div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                   <div 
                     className="h-full bg-purple-600 transition-all duration-300 relative overflow-hidden"
                     style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                   >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                   </div>
                </div>
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-[#0B1120]">
        {/* Header / Search */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-4 shadow-xl z-10">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-comic text-white flex items-center gap-2">
                  <Hammer className="w-6 h-6 text-orange-500" />
                  HERO FORGE <span className="text-slate-600 text-sm">v2.1</span>
               </h2>
               {/* Connection Status */}
               <div className="flex items-center gap-2 text-[10px]">
                  <div className={`w-2 h-2 rounded-full ${isLoadingDb ? 'bg-yellow-500 animate-pulse' : dbError ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className="text-slate-500 uppercase font-bold">
                     {isLoadingDb ? 'SYNCING...' : dbError ? 'OFFLINE' : 'CONNECTED'}
                  </span>
               </div>
            </div>

            <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Suche in Datenbank..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors text-white placeholder-slate-600"
                  />
               </div>
               <button onClick={loadData} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700">
                  <RefreshCw className={`w-5 h-5 ${isLoadingDb ? 'animate-spin' : ''}`} />
               </button>
            </div>
            
            {/* Action Bar */}
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
               <button onClick={() => handleSelectRandom(5)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 whitespace-nowrap flex items-center gap-1 border border-slate-700">
                  <Dice5 className="w-3 h-3 text-purple-400" /> Random 5
               </button>
               <button onClick={handleSelectAll} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 whitespace-nowrap flex items-center gap-1 border border-slate-700">
                  <Layers className="w-3 h-3 text-blue-400" /> All Visible
               </button>
               <div className="flex-1" />
               {selectedImportIds.size > 0 && (
                  <button 
                    onClick={handleBatchTransform}
                    className="px-4 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:scale-105 transition-transform rounded-lg text-xs font-bold text-white shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-right-4"
                  >
                     <Hammer className="w-3 h-3" />
                     TRANSFORM ({selectedImportIds.size})
                  </button>
               )}
            </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           {filteredHeroes.length === 0 ? (
              <div className="text-center text-slate-500 mt-20">
                 <Database className="w-12 h-12 mx-auto mb-2 opacity-20" />
                 <p>Keine Einträge gefunden.</p>
                 {dbError && <p className="text-xs text-red-500 mt-2">Verbindung zur Datenbank fehlgeschlagen.</p>}
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-20">
                 {filteredHeroes.map((h, idx) => {
                    const originalIndex = importedHeroes.indexOf(h);
                    if (originalIndex === -1) return null;
                    const isSelected = selectedImportIds.has(originalIndex);
                    const isProcessed = processedIndices.has(originalIndex);

                    if (isProcessed) return null;

                    return (
                      <div 
                        key={originalIndex}
                        onClick={() => toggleImportSelection(originalIndex)}
                        className={`
                          relative p-3 rounded-xl border-2 cursor-pointer transition-all group
                          ${isSelected 
                             ? 'bg-orange-950/30 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                             : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                        `}
                      >
                         <div className="flex justify-between items-start">
                            <div>
                               <h3 className={`font-bold text-sm ${isSelected ? 'text-orange-200' : 'text-slate-300'}`}>{h.name}</h3>
                               <p className="text-[10px] text-slate-500 uppercase">{h.publisher} • {h.race}</p>
                            </div>
                            <div className={`
                               w-5 h-5 rounded flex items-center justify-center border transition-colors
                               ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-950 border-slate-700 text-transparent'}
                            `}>
                               <CheckSquare className="w-3.5 h-3.5" />
                            </div>
                         </div>
                         
                         {/* Mini Stats */}
                         <div className="mt-3 grid grid-cols-3 gap-1 opacity-70">
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden" title={`INT: ${h.intelligence}`}>
                               <div className="h-full bg-blue-500" style={{ width: `${h.intelligence}%` }}></div>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden" title={`STR: ${h.strength}`}>
                               <div className="h-full bg-red-500" style={{ width: `${h.strength}%` }}></div>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden" title={`SPD: ${h.speed}`}>
                               <div className="h-full bg-yellow-500" style={{ width: `${h.speed}%` }}></div>
                            </div>
                         </div>
                      </div>
                    );
                 })}
              </div>
           )}
        </div>
      </div>
    );
  };

  const renderHeroOverlay = () => {
      if (!selectedHero) return null;

      const isMyHero = selectedHero.powerstats !== undefined;
      const hasVideo = isMyHero && selectedHero.video?.url;
      
      const name = selectedHero.name;
      const universe = isMyHero ? 'INFINITE' : selectedHero.universe;
      
      // Determine Image/Video Display
      let visualContent;
      
      if (hasVideo) {
          visualContent = (
             <video 
                src={selectedHero.video.url} 
                className="w-full h-full object-cover" 
                autoPlay loop muted playsInline 
             />
          );
      } else if (isMyHero && selectedHero.image?.url) {
          visualContent = <img src={selectedHero.image.url} className="w-full h-full object-cover" />;
      } else {
          visualContent = <div className="text-9xl animate-float drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">{selectedHero.image}</div>;
      }

      const description = selectedHero.description;
      const reason = isMyHero ? selectedHero.biography.alignment : selectedHero.reason;
      const stats = isMyHero ? selectedHero.powerstats : selectedHero.stats;
      
      const abilities = isMyHero 
        ? [selectedHero.appearance.race, selectedHero.work.occupation, selectedHero.biography.alignment] 
        : selectedHero.abilities;

      return (
        <div className="fixed inset-0 z-50 bg-[#0B1120] flex flex-col animate-in slide-in-from-bottom-10">
            {/* Header Image Area */}
            <div className="h-80 relative bg-gradient-to-b from-purple-900/20 to-[#0B1120] flex items-center justify-center shrink-0 overflow-hidden group">
                {visualContent}
                
                {/* Generate Video Button (If My Hero, no video yet, and not currently generating) */}
                {isMyHero && !hasVideo && !isAnimatingHero && (
                   <button 
                     onClick={() => handleAnimateHero(selectedHero)}
                     className="absolute center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100 scale-95 hover:scale-100 z-20"
                   >
                       <Film className="w-5 h-5 text-cyan-400" />
                       <span className="font-bold text-sm">Motion Portrait erstellen</span>
                   </button>
                )}

                {isAnimatingHero && (
                   <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                       <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-2" />
                       <span className="text-white font-tech tracking-wider text-sm animate-pulse">GENERATING MOTION...</span>
                   </div>
                )}
                
                <button 
                    onClick={() => setSelectedHero(null)}
                    className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center border border-white/10 text-white z-10 active:scale-95"
                >
                    <ChevronUp className="w-6 h-6 rotate-[-90deg]" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-transparent pointer-events-none">
                    <h2 className="text-4xl font-comic text-white drop-shadow-md">{name}</h2>
                    <p className="text-purple-400 font-bold uppercase tracking-wider text-sm">{universe} Universe</p>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="flex-1 bg-[#0B1120] px-6 overflow-y-auto">
                <div className="space-y-6 pb-20">
                    {/* Description Box */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-300">
                        {description}
                        <div className="mt-2 text-xs text-slate-500 italic border-t border-slate-800 pt-2">
                            "{reason}"
                        </div>
                    </div>

                    {/* Stats */}
                    <div>
                        <h3 className="font-bold text-slate-500 uppercase text-xs mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4"/> Kampfdaten
                        </h3>
                        <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 h-64">
                            <StatsRadar stats={stats} />
                        </div>
                    </div>

                    {/* Abilities / Tags */}
                    <div>
                        <h3 className="font-bold text-slate-500 uppercase text-xs mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4"/> Merkmale
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {abilities.map((ability: string, idx: number) => (
                                <span key={idx} className="bg-purple-900/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-lg text-xs font-bold">
                                    {ability}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  const renderWiki = () => {
    return (
        <div className="h-full flex flex-col bg-[#0B1120] p-4 text-white">
            {/* List View */}
            <div className="mb-4">
                <h2 className="text-2xl font-comic text-white flex items-center gap-2 tracking-wide">
                <Book className="w-6 h-6 text-purple-500" />
                MULTIVERSE WIKI
                </h2>
                <p className="text-xs text-slate-500">Datenbank bekannter Entitäten ({FULL_HERO_DATA.length})</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-20 custom-scrollbar">
                {FULL_HERO_DATA.map(hero => (
                <button 
                    key={hero.id}
                    onClick={() => setSelectedHero(hero)}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all text-left group"
                >
                    <div className="w-14 h-14 rounded-lg bg-slate-950 flex items-center justify-center text-3xl shadow-inner border border-slate-800 group-hover:scale-105 transition-transform">
                        {hero.image}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors">{hero.name}</h3>
                        <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider mt-1">
                            <span className="text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{hero.universe}</span>
                            <span className={`px-1.5 py-0.5 rounded ${
                                hero.tier === 'S' || hero.tier === 'Cosmic' ? 'text-yellow-500 bg-yellow-950/30' : 'text-slate-400 bg-slate-800'
                            }`}>{hero.tier}-Tier</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-comic text-slate-700 group-hover:text-white transition-colors">{hero.power}</div>
                        <div className="text-[9px] text-slate-600 uppercase font-mono">PWR</div>
                    </div>
                </button>
                ))}
            </div>
        </div>
    );
  }

  const renderDetail = () => (
     <div className="p-4 h-full flex flex-col bg-[#0B1120] text-slate-200">
        <h2 className="text-2xl font-comic text-white mb-6 flex items-center gap-2 px-2 tracking-wide">
           <User className="w-6 h-6 text-blue-500" />
           KASERNE <span className="text-slate-600 text-lg">({myHeroes.length})</span>
        </h2>

        {myHeroes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
               <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-slate-700"/>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Keine Helden Rekrutiert</h3>
               <button onClick={() => setView('forge')} className="game-btn bg-orange-600 text-white px-6 py-2 rounded-full font-bold text-sm mt-4">
                  ZUR SCHMIEDE
               </button>
            </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 overflow-y-auto custom-scrollbar">
              {myHeroes.map((hero) => (
                 <div 
                    key={hero.id} 
                    onClick={() => setSelectedHero(hero)}
                    className="bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors group relative cursor-pointer active:scale-95"
                 >
                    <div className="h-32 bg-gradient-to-br from-slate-800 to-black relative overflow-hidden">
                       <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                       {/* Show Image (Video only plays in detail overlay) */}
                       {hero.image.url && (
                           <img src={hero.image.url} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                       )}
                       
                       <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between z-10">
                          <div>
                             <h3 className="text-xl font-comic text-white tracking-wide drop-shadow-lg leading-none">{hero.name}</h3>
                             <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider bg-blue-900/50 px-2 py-0.5 rounded inline-block mt-1 border border-blue-500/30">
                                {hero.appearance.race}
                             </p>
                          </div>
                          <div className={`
                             w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg border-2
                             ${hero.powerstats.power > 90 ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-slate-700 text-white border-slate-600'}
                          `}>
                             {hero.powerstats.power}
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-4 space-y-3 relative bg-[#151e32]">
                       <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
                          "{hero.description}"
                       </p>
                       
                       <div className="h-24 -mx-2 flex items-center justify-center pointer-events-none">
                          <StatsRadar stats={hero.powerstats} />
                       </div>
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
      <button 
        onClick={() => setView(viewName)} 
        className={`
          flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 w-16
          ${isActive ? 'bg-slate-800 text-white -translate-y-2 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-slate-600' : 'text-slate-500 hover:text-slate-300'}
        `}
      >
          <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce' : ''}`} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white font-sans overflow-hidden select-none">
        <main className="flex-1 overflow-hidden relative">
            {view === 'forge' && renderForge()}
            {view === 'station' && renderStation()}
            {view === 'detail' && renderDetail()}
            {view === 'ai_lab' && <AiLab />}
            {view === 'wiki' && renderWiki()}
            {view === 'nanoforge' && <Nanoforge />}
            
            {/* Global Overlay for Details */}
            {selectedHero && renderHeroOverlay()}
        </main>

        <nav className="h-16 bg-[#0f172a] border-t border-slate-800 flex justify-between items-center px-4 shrink-0 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] pb-safe-bottom">
            <NavButton viewName="station" label="Basis" icon={LayoutDashboard} />
            <NavButton viewName="forge" label="Schmiede" icon={Hammer} />
            <NavButton viewName="ai_lab" label="AI Lab" icon={Sparkles} />
            {/* Swapped Wiki for Nanoforge in quick nav for gameplay focus, moved Wiki to secondary? Or keep all 6? 
                Let's replace Wiki button with Nanoforge since we are focusing on gameplay now. */}
            <NavButton viewName="nanoforge" label="N-Forge" icon={Cpu} />
            <NavButton viewName="detail" label="Helden" icon={User} />
        </nav>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <InventoryProvider>
        <AppContent />
      </InventoryProvider>
    </GameProvider>
  );
}