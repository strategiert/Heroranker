import { BuildingType } from '../types/economy';

const REPO_BASE = 'https://raw.githubusercontent.com/strategiert/Heroranker/main/public/assets';

// Path to building images: /assets/buildings/TYPE_skin.png
export const getBuildingAssetPath = (type: BuildingType, skinId: string = 'default'): string => {
  // First try local path
  return `/assets/buildings/${type}_${skinId}.png`;
};

export const getRemoteBuildingPath = (type: BuildingType, skinId: string = 'default'): string => {
    return `${REPO_BASE}/buildings/${type}_${skinId}.png`;
};

// Path to map background
export const getMapAssetPath = (): string => {
  return `/assets/map/station_map.png`;
};

export const getRemoteMapPath = (): string => {
    return `${REPO_BASE}/map/station_map.png`;
};

export const getLogoPath = (): string => {
    return `${REPO_BASE}/logo/logo_nobg.png`; // Assuming naming convention based on folder provided
};

// Fallback CSS background if no image is found
export const getMapBackgroundStyle = () => {
  return {
      backgroundImage: `
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%),
        linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.05) 25%, rgba(59, 130, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.05) 75%, rgba(59, 130, 246, 0.05) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.05) 25%, rgba(59, 130, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.05) 75%, rgba(59, 130, 246, 0.05) 76%, transparent 77%, transparent)
      `,
      backgroundSize: '100% 100%, 60px 60px, 60px 60px',
      backgroundColor: '#0f172a'
  };
};