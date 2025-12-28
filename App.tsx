import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Loader2, RefreshCw, AlertTriangle, Copy, 
  CheckSquare, Square, Shield, Hammer, User, LayoutDashboard, Zap, Search, ChevronRight, Brain, Activity, Dumbbell,
  Coins, Leaf, Box, Gem, ArrowUpCircle, Clock, Terminal, ChevronUp, Construction, Sparkles, MessageSquare, Image as ImageIcon, Video, Eye, Wand2,
  Dice5, Layers
} from 'lucide-react';
import { Hero, ExternalHero, ViewState } from './types';
import { fetchRawHeroes, listTables, SCHEMA_SQL, REQUIRED_TABLE_NAME } from './services/supabaseService';
import { transformHero, generateStrategicAdvice, chatWithAi, analyzeImage, generateProImage, editImage, generateVeoVideo } from './services/geminiService';
import { GameProvider, useGame } from './context/GameContext';
import { InventoryProvider } from './context/InventoryContext';
import { BuildingType, Resources } from './types/economy';
import { calculateBuildingCost, calculateBuildTime, formatDuration } from './utils/formulas';

// Helper Component for Stat Bars
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
  const [view, setView] = useState<ViewState>('station');
  
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
  const [myHeroes, setMyHeroes] = useState<Hero[]>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('infinite_arena_my_heroes');
        return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist My Heroes
  useEffect(() => {
    localStorage.setItem('infinite_arena_my_heroes', JSON.stringify(myHeroes));
  }, [myHeroes]);

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
      const heroes = await fetchRawHeroes(500); 
      setImportedHeroes(heroes);
    } catch (e: any) {
      console.error("Datenbank Fehler:", e);
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
        setMyHeroes(prev => [newHero, ...prev]); 
        setProcessedIndices(prev => new Set(prev).add(idx));
        setSelectedImportIds(prev => {
            const next = new Set(prev);
            next.delete(idx);
            return next;
        });
      } catch (e) {
        console.error(`Error transforming ${sourceHero.name}`, e);
      }
      
      current++;
      setBatchProgress({ current, total });
    }
    
    setIsGenerating(false);
    setBatchProgress(null);
    setGenerationStep('');
    setView('detail'); 
  };

  // Filter Logic
  const filteredHeroes = importedHeroes.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (h.publisher && h.publisher.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderForge = () => (
     <div className="p-4 pb-24 h-full flex flex-col bg-[#0B1120] text-slate-200">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
           
           {/* Header Area */}
           <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm z-10 sticky top-0">
              <div className="flex justify-between items-center mb-3">
                 <h2 className="text-xl font-comic tracking-wider text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-500"/> 
                    ROHDATEN
                    <span className="bg-slate-800 text-slate-400 font-mono text-xs px-2 py-0.5 rounded-full ml-2">{importedHeroes.length}</span>
                 </h2>
                 <div className="flex gap-2">
                    {selectedImportIds.size > 0 && (
                       <button onClick={handleBatchTransform} className="game-btn bg-orange-600 hover:bg-orange-500 border-orange-800 text-white px-4 py-2 rounded-lg text-sm font-bold animate-pulse shadow-lg">
                          {selectedImportIds.size} TRANSFORMIEREN
                       </button>
                    )}
                    <button onClick={loadData} className="game-btn bg-slate-700 hover:bg-slate-600 border-slate-900 p-2 rounded-lg text-white transition-colors">
                       {isLoadingDb ? <Loader2 className="w-5 h-5 animate-spin"/> : <RefreshCw className="w-5 h-5"/>}
                    </button>
                 </div>
              </div>

              {/* Tools & Search Bar */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                    type="text" 
                    placeholder="Suche Datenbank..." 
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Batch Tools */}
                <div className="flex gap-2 text-xs">
                    <button onClick={() => handleSelectRandom(10)} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
                        <Dice5 className="w-3 h-3 text-purple-400"/>
                        +10 Zufällig
                    </button>
                    <button onClick={() => handleSelectRandom(50)} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
                        <Dice5 className="w-3 h-3 text-purple-400"/>
                        +50 Zufällig
                    </button>
                    <button onClick={handleSelectAll} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 ml-auto">
                        <Layers className="w-3 h-3 text-blue-400"/>
                        Alle ({filteredHeroes.length})
                    </button>
                </div>
              </div>
           </div>

           {/* Grid List */}
           <div className="flex-1 overflow-y-auto p-2 md:p-4 custom-scrollbar">
              {dbError && (
                 <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-xl text-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-300 text-sm font-bold">Verbindung fehlgeschlagen</p>
                    <button onClick={() => navigator.clipboard.writeText(SCHEMA_SQL)} className="mt-2 text-xs bg-red-900 px-2 py-1 rounded text-white border border-red-700">
                       Schema Kopieren
                    </button>
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredHeroes.map((hero, idx) => {
                   const originalIdx = importedHeroes.indexOf(hero);
                   const isSelected = selectedImportIds.has(originalIdx);
                   const isProcessed = processedIndices.has(originalIdx);

                   return (
                     <div key={idx} 
                        onClick={() => !isProcessed && toggleImportSelection(originalIdx)}
                        className={`
                          relative overflow-hidden cursor-pointer rounded-xl border-2 transition-all duration-200 group
                          ${isSelected ? 'bg-orange-900/20 border-orange-500' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'}
                          ${isProcessed ? 'opacity-40 grayscale pointer-events-none' : ''}
                        `}
                     >
                        <div className="flex p-3 gap-3 items-center">
                          {/* Avatar */}
                          <div className={`
                             w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0
                             ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-black' : ''}
                          `}>
                             {hero.image ? (
                                <img src={hero.image} alt={hero.name} className="w-full h-full object-cover rounded-lg" />
                             ) : (
                                <span className="text-xl">?</span>
                             )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                             <h3 className="font-bold text-slate-200 text-sm truncate">{hero.name}</h3>
                             <p className="text-[10px] text-slate-500 truncate">{hero.publisher}</p>
                             
                             <div className="flex gap-2 mt-1">
                                <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500" style={{ width: `${hero.intelligence}%` }}></div>
                                </div>
                                <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                   <div className="h-full bg-red-500" style={{ width: `${hero.strength}%` }}></div>
                                </div>
                             </div>
                          </div>
                          
                          {isSelected && <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_orange]"></div>}
                        </div>
                     </div>
                   );
                })}
              </div>

              {isLoadingDb && (
                 <div className="text-center py-20 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2"/>
                    <p className="text-slate-500 text-xs font-mono">DOWNLOADING...</p>
                 </div>
              )}
           </div>
        </div>
        
        {/* Processing Overlay */}
        {isGenerating && (
           <div className="absolute inset-0 bg-[#0B1120]/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-orange-500/30 blur-2xl rounded-full animate-pulse"></div>
                <Construction className="relative w-20 h-20 text-orange-500 animate-bounce"/>
              </div>
              <h3 className="text-3xl font-comic text-white mb-2 tracking-widest uppercase">
                Schmiede Aktiv
              </h3>
              
              <div className="w-full max-w-xs bg-slate-800 rounded-full h-4 overflow-hidden mb-2 border border-slate-700">
                 <div 
                    className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 progress-striped animate-shine transition-all duration-300"
                    style={{ width: batchProgress && batchProgress.total > 0 ? `${(batchProgress.current / batchProgress.total) * 100}%` : '0%' }}
                 />
              </div>
              <p className="text-orange-400 font-mono text-xs mb-8">
                 BATCH {batchProgress?.current} / {batchProgress?.total}
              </p>
              
              <div className="font-mono text-xs text-slate-400 border border-slate-800 bg-black/50 p-2 rounded w-full max-w-sm">
                 > {generationStep}
                 <span className="animate-pulse">_</span>
              </div>
           </div>
        )}
     </div>
  );

  const renderStation = () => (
     <div className="flex flex-col h-full bg-[#0B1120]">
        <ResourceDisplay />
        
        {/* Decorative Grid Background */}
        <div className="fixed inset-0 pointer-events-none opacity-5" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>

        <KoraWidget />
        <BuildingGrid />
     </div>
  );

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
                 <div key={hero.id} className="bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors group relative">
                    <div className="h-32 bg-gradient-to-br from-slate-800 to-black relative overflow-hidden">
                       <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                       
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
                       
                       <div className="space-y-1.5 pt-2">
                          <StatBar icon={Brain} label="INT" value={hero.powerstats.intelligence} color="text-blue-500" />
                          <StatBar icon={Dumbbell} label="STR" value={hero.powerstats.strength} color="text-red-500" />
                          <StatBar icon={Activity} label="SPD" value={hero.powerstats.speed} color="text-yellow-500" />
                       </div>

                       <div className="pt-3 mt-2 border-t border-slate-800 flex justify-between items-center">
                          <span className="text-[9px] text-slate-600 font-mono">ID: {hero.id.slice(0, 6)}</span>
                          <button className="text-[10px] font-bold text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-slate-600">
                             DETAILS <ChevronRight className="w-3 h-3"/>
                          </button>
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
          flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 w-20
          ${isActive ? 'bg-slate-800 text-white -translate-y-2 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-slate-600' : 'text-slate-500 hover:text-slate-300'}
        `}
      >
          <Icon className={`w-6 h-6 ${isActive ? 'animate-bounce' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
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
        </main>

        <nav className="h-20 bg-[#0f172a] border-t border-slate-800 flex justify-around items-center px-6 shrink-0 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] pb-safe-bottom">
            <NavButton viewName="station" label="Basis" icon={LayoutDashboard} />
            <NavButton viewName="forge" label="Schmiede" icon={Hammer} />
            <NavButton viewName="ai_lab" label="AI Lab" icon={Sparkles} />
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