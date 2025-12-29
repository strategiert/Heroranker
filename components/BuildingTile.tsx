import React, { useState, useEffect } from 'react';
import { BuildingState, BuildingType } from '../types/economy';
import { BUILDING_DEFINITIONS } from '../data/buildings';
import { SKIN_DATABASE } from '../data/skins';
import { BuildingVisuals } from './BuildingVisuals';
import { getBuildingAssetPath } from '../utils/assets';
import { Settings, Home, Factory, Warehouse, User, Shield, Radio, FlaskConical, Square, PlusCircle } from 'lucide-react';
import { formatDuration } from '../utils/engine';

interface BuildingTileProps {
  building: BuildingState;
  onSelect: (b: BuildingState) => void;
  onSpeedUp: (id: string, seconds: number) => void;
}

const getIcon = (type: string) => {
    switch (type) {
      case 'HQ': return Home;
      case 'PRODUCTION': return Factory;
      case 'STORAGE': return Warehouse;
      case 'MILITARY': return User; 
      case 'DEFENSE': return Shield;
      case 'UTILITY': return Radio;
      case 'RESEARCH': return FlaskConical;
      default: return Square;
    }
};

export const BuildingTile: React.FC<BuildingTileProps> = ({ building, onSelect, onSpeedUp }) => {
  const def = BUILDING_DEFINITIONS[building.type];
  const [imgError, setImgError] = useState(false);
  
  // Reset error state if skin or building type changes, to try loading the new image
  useEffect(() => {
      setImgError(false);
  }, [building.type, building.activeSkin]);

  if (!def) return null;

  const skin = SKIN_DATABASE[building.activeSkin || 'default'];
  const isUpgrading = building.status === 'UPGRADING';
  const isConstruction = building.level === 0;
  const imagePath = getBuildingAssetPath(building.type, building.activeSkin);
  const Icon = getIcon(def.type);
  
  let timeLeft = 0;
  if (isUpgrading && building.finishTime) {
     timeLeft = Math.max(0, Math.ceil((building.finishTime - Date.now()) / 1000));
  }

  return (
    <div 
        onClick={() => onSelect(building)}
        className={`
            relative aspect-square rounded-2xl p-2 shadow-lg border-2 cursor-pointer transition-all active:scale-95 group overflow-hidden
            ${skin.styleClass}
            ${isConstruction ? 'opacity-90 border-dashed bg-slate-800/50' : ''}
        `}
    >
        {/* === RENDERER: HYBRID SYSTEM === */}
        <div className="absolute inset-0 p-2 flex items-center justify-center">
            {!imgError ? (
                // Try loading the Image from /assets/buildings/
                <img 
                    src={imagePath} 
                    alt={def.name} 
                    className="w-full h-full object-contain drop-shadow-xl z-10"
                    onError={() => setImgError(true)} 
                />
            ) : (
                // Fallback to Procedural SVG
                <div className="w-full h-full">
                    <BuildingVisuals type={building.type} skinId={building.activeSkin || 'default'} level={building.level} />
                </div>
            )}
        </div>

        {/* Level Badge Overlay */}
        <div className="absolute top-0 right-0 z-20 bg-black/60 backdrop-blur text-white text-[10px] font-black px-1.5 py-0.5 rounded-bl-lg border-l border-b border-white/20 shadow-md">
            {isConstruction ? 'BAU' : `LV ${building.level}`}
        </div>

        {/* Icon Badge Overlay (Only show if using image to help ID, or always if you prefer) */}
        {!imgError && (
            <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10">
                <Icon className={`w-3 h-3 ${skin.iconClass}`} />
            </div>
        )}

        {/* Name Label */}
        <div className="absolute bottom-2 left-2 right-2 z-20 bg-black/70 backdrop-blur rounded px-2 py-1 text-center">
            <div className="text-[9px] font-bold text-white uppercase truncate">{def.name}</div>
        </div>

        {/* Selection Ring on Hover */}
        <div className="absolute inset-0 rounded-xl border-2 border-white/0 group-hover:border-white/40 transition-colors pointer-events-none z-30"></div>

        {/* Construction Overlay */}
        {isUpgrading && (
            <div className="absolute inset-2 bg-slate-900/90 backdrop-blur rounded-lg p-2 border border-blue-500/50 shadow-xl z-30 flex flex-col justify-center">
                <div className="flex justify-between text-[9px] font-bold text-blue-400 mb-1">
                    <span>{isConstruction ? 'BAU' : 'UPGRADE'}</span>
                    <span>{formatDuration(timeLeft)}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden w-full mb-2">
                    <div className="h-full bg-blue-500 w-full animate-pulse"></div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onSpeedUp(building.id, 60); }}
                  className="w-full py-1 bg-blue-500 text-white rounded text-[9px] font-bold uppercase shadow-sm active:scale-95"
                >
                  Speed (+1m)
                </button>
            </div>
        )}
    </div>
  );
};