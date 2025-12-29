import React, { useEffect, useState } from 'react';
import { Item } from '../context/SpireContext';
import { Box, CheckCircle2 } from 'lucide-react';

interface VictoryScreenProps {
  floor: number;
  loot: Item[];
  onCollect: () => void;
  onNextFloor: () => void;
}

const RARITY_COLORS = {
  common: { bg: 'bg-slate-700', border: 'border-slate-500', text: 'text-slate-300' },
  uncommon: { bg: 'bg-green-900/50', border: 'border-green-500', text: 'text-green-400' },
  rare: { bg: 'bg-blue-900/50', border: 'border-blue-500', text: 'text-blue-400' },
  epic: { bg: 'bg-purple-900/50', border: 'border-purple-500', text: 'text-purple-400' },
  legendary: { bg: 'bg-yellow-900/50', border: 'border-yellow-500', text: 'text-yellow-400' },
};

export function VictoryScreen({ floor, loot, onCollect, onNextFloor }: VictoryScreenProps) {
  const [showLoot, setShowLoot] = useState(false);
  const [collected, setCollected] = useState(false);

  useEffect(() => {
    // Reveal loot after delay
    const timer = setTimeout(() => setShowLoot(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCollect = () => {
      onCollect();
      setCollected(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-black rounded-2xl border border-yellow-500/30 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-yellow-500/20 to-transparent" />
        
        <div className="relative p-6 flex flex-col items-center text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-3xl font-black text-yellow-400 italic tracking-wider mb-1">SIEGE!</h2>
          <p className="text-slate-400 text-sm font-bold uppercase mb-6">Stockwerk {floor} gesäubert</p>

          <div className="w-full space-y-3 mb-6">
            {showLoot ? (
                loot.length > 0 ? (
                    loot.map((item, index) => {
                        const style = RARITY_COLORS[item.rarity];
                        return (
                            <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border ${style.bg} ${style.border} animate-in slide-in-from-bottom-4`} style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="text-2xl">{item.icon}</div>
                                <div className="flex-1 text-left">
                                    <div className={`font-bold text-sm ${style.text}`}>{item.name}</div>
                                    <div className="text-xs text-slate-400 uppercase">{item.rarity}</div>
                                </div>
                                <div className="font-mono font-bold text-white">x{item.quantity}</div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-slate-500 font-bold italic">Keine Beute gefunden...</div>
                )
            ) : (
                <div className="h-20 flex items-center justify-center">
                    <Box className="w-8 h-8 text-slate-600 animate-pulse" />
                </div>
            )}
          </div>

          {!collected ? (
              <button 
                onClick={handleCollect}
                disabled={!showLoot}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg uppercase rounded-xl shadow-lg active:scale-95 transition-all"
              >
                  Einsammeln
              </button>
          ) : (
              <button 
                onClick={onNextFloor}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg uppercase rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                  Weiter <CheckCircle2 className="w-5 h-5"/>
              </button>
          )}
        </div>
      </div>
    </div>
  );
}