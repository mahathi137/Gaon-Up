import { useQuery } from "@tanstack/react-query";
import { Home, Users, Droplets, TreePine, Sun, Moon } from "lucide-react";

interface VillageData {
  id: number;
  name: string;
  stateId: number;
  population: number;
  waterBodies: number;
  greenCover: number;
  development: number;
  description: string;
}

interface SVGVillageViewerProps {
  villageId: number;
  dayMode: boolean;
}

// Maps state IDs to colors for village representation
const STATE_COLORS: Record<number, {primary: string, secondary: string, accent: string}> = {
  26: { primary: "#8B4513", secondary: "#228B22", accent: "#1E88E5" }, // Tamil Nadu
  27: { primary: "#1565C0", secondary: "#2E7D32", accent: "#0277BD" }, // Andhra Pradesh
  28: { primary: "#E65100", secondary: "#33691E", accent: "#00838F" }, // Rajasthan
  29: { primary: "#004D40", secondary: "#33691E", accent: "#0277BD" }, // Kerala
  30: { primary: "#4A148C", secondary: "#33691E", accent: "#0277BD" }, // Telangana
};

// Default colors
const DEFAULT_COLORS = { primary: "#795548", secondary: "#388E3C", accent: "#1976D2" };

export default function SVGVillageViewer({ villageId, dayMode }: SVGVillageViewerProps) {
  // Fetch village data
  const { data: village, isLoading, error } = useQuery<VillageData>({
    queryKey: ["/api/villages", villageId],
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="relative h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !village) {
    return (
      <div className="relative h-[500px] bg-red-100 rounded-lg flex items-center justify-center">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-red-600 font-medium">Error loading village data</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
  
  // Get appropriate colors for this state
  const colors = STATE_COLORS[village.stateId] || DEFAULT_COLORS;
  
  // Calculate elements based on village data
  const numHouses = Math.max(3, Math.floor(village.population / 1000));
  const numTrees = Math.max(2, Math.floor(village.greenCover / 10));
  const numPonds = Math.max(1, Math.floor(village.waterBodies / 20));
  
  return (
    <div className="relative h-[500px] overflow-hidden rounded-lg">
      {/* SVG Village Representation */}
      <svg 
        viewBox="0 0 1000 500" 
        className="w-full h-full"
        style={{ 
          filter: dayMode ? 'brightness(100%)' : 'brightness(40%) saturate(70%) hue-rotate(210deg)',
          backgroundColor: dayMode ? '#87CEEB' : '#071831'
        }}
      >
        {/* Sky/Background */}
        <rect x="0" y="0" width="1000" height="500" fill={dayMode ? "#87CEEB" : "#071831"} />
        
        {/* Sun/Moon */}
        {dayMode ? (
          <circle cx="850" cy="80" r="60" fill="#FDB813" />
        ) : (
          <>
            <circle cx="850" cy="80" r="40" fill="#E1E1E1" />
            <circle cx="830" cy="60" r="10" fill="#071831" />
            <circle cx="870" cy="70" r="8" fill="#071831" />
            <circle cx="840" cy="90" r="12" fill="#071831" />
            
            {/* Stars */}
            {Array(50).fill(0).map((_, i) => (
              <circle 
                key={i} 
                cx={Math.random() * 1000} 
                cy={Math.random() * 200} 
                r={Math.random() * 2 + 1} 
                fill="white" 
                opacity={Math.random() * 0.8 + 0.2}
              />
            ))}
          </>
        )}
        
        {/* Ground */}
        <rect x="0" y="300" width="1000" height="200" fill={dayMode ? "#8B4513" : "#3E2723"} />
        
        {/* Water Bodies */}
        {Array(numPonds).fill(0).map((_, i) => {
          const width = 80 + Math.random() * 100;
          const x = 100 + (i * 200) + (Math.random() * 100);
          return (
            <ellipse 
              key={`pond-${i}`} 
              cx={x} 
              cy="350" 
              rx={width/2} 
              ry="30" 
              fill={colors.accent} 
              opacity={dayMode ? 0.8 : 0.5}
            />
          );
        })}
        
        {/* Village Houses */}
        {Array(numHouses).fill(0).map((_, i) => {
          const x = 150 + (i * 120) + (Math.random() * 50);
          const houseHeight = 70 + Math.random() * 30;
          return (
            <g key={`house-${i}`} transform={`translate(${x}, ${280 - houseHeight})`}>
              {/* House Base */}
              <rect 
                width="80" 
                height={houseHeight} 
                fill={colors.primary} 
                stroke="#000" 
                strokeWidth="2"
              />
              {/* Roof */}
              <polygon 
                points="0,0 40,-30 80,0" 
                fill={dayMode ? "#8B4513" : "#5D4037"} 
                stroke="#000" 
                strokeWidth="2"
              />
              {/* Door */}
              <rect 
                x="30" 
                y={houseHeight - 40} 
                width="20" 
                height="40" 
                fill={dayMode ? "#5D4037" : "#3E2723"} 
              />
              {/* Windows */}
              <rect x="15" y="30" width="15" height="15" fill={dayMode ? "#FFF9C4" : "#455A64"} />
              <rect x="50" y="30" width="15" height="15" fill={dayMode ? "#FFF9C4" : "#455A64"} />
            </g>
          );
        })}
        
        {/* Trees */}
        {Array(numTrees).fill(0).map((_, i) => {
          const x = 50 + (i * 150) + (Math.random() * 100);
          return (
            <g key={`tree-${i}`} transform={`translate(${x}, 280)`}>
              {/* Trunk */}
              <rect x="-7" y="-40" width="14" height="40" fill="#795548" />
              {/* Foliage */}
              <circle cx="0" cy="-60" r="30" fill={colors.secondary} />
              <circle cx="-15" cy="-80" r="20" fill={colors.secondary} />
              <circle cx="15" cy="-80" r="20" fill={colors.secondary} />
              <circle cx="0" cy="-90" r="20" fill={colors.secondary} />
            </g>
          );
        })}
        
        {/* Main Temple or Community Building */}
        <g transform="translate(500, 180)">
          {/* Base */}
          <rect 
            x="-60" 
            y="0" 
            width="120" 
            height="100" 
            fill={colors.primary} 
            stroke="#000" 
            strokeWidth="2"
          />
          {/* Roof/Dome */}
          <path 
            d="M-60,0 C-60,-40 60,-40 60,0 Z" 
            fill={dayMode ? "#FFB74D" : "#5D4037"} 
            stroke="#000" 
            strokeWidth="2"
          />
          {/* Pillars */}
          <rect x="-50" y="20" width="10" height="80" fill={dayMode ? "#E0E0E0" : "#757575"} />
          <rect x="40" y="20" width="10" height="80" fill={dayMode ? "#E0E0E0" : "#757575"} />
          {/* Door */}
          <rect x="-15" y="50" width="30" height="50" fill={dayMode ? "#5D4037" : "#3E2723"} />
          {/* Windows */}
          <rect x="-40" y="30" width="15" height="15" fill={dayMode ? "#FFF9C4" : "#455A64"} />
          <rect x="25" y="30" width="15" height="15" fill={dayMode ? "#FFF9C4" : "#455A64"} />
        </g>
      </svg>
      
      {/* Village Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 p-3 z-10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-1">
            <Home className="w-4 h-4" /> {village.name}
          </h3>
          <div className="text-xs bg-primary text-white px-2 py-1 rounded-full">
            Development: {village.development}%
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-500 flex-shrink-0" /> 
            <span className="text-muted-foreground">Population:</span>
            <span className="font-medium">{village.population.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <TreePine className="w-3 h-3 text-green-600 flex-shrink-0" /> 
            <span className="text-muted-foreground">Green Cover:</span>
            <span className="font-medium">{village.greenCover}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-500 flex-shrink-0" /> 
            <span className="text-muted-foreground">Water Bodies:</span>
            <span className="font-medium">{village.waterBodies}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}