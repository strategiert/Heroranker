import { BuildingType } from '../types/economy';

// Path to building images: /assets/buildings/TYPE_skin.png
export const getBuildingAssetPath = (type: BuildingType, skinId: string = 'default'): string => {
  return `/assets/buildings/${type}_${skinId}.png`;
};

// Path to map background
export const getMapAssetPath = (): string => {
  return `/assets/map/station_map.png`;
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