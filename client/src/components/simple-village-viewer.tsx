import { useQuery } from "@tanstack/react-query";
import { Home, Users, Droplets, TreePine } from "lucide-react";

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

interface SimpleVillageViewerProps {
  villageId: number;
  dayMode: boolean;
}

// Simple mapping of state IDs to image paths
const STATE_IMAGES: Record<number, string> = {
  26: "/village-images/tamil-nadu-village.jpg",  // Tamil Nadu
  27: "/village-images/coastal-village.jpg",     // Andhra Pradesh
  28: "/village-images/desert-village.jpg",      // Rajasthan
  29: "/village-images/rice-paddy-village.jpg",  // Kerala
  30: "/village-images/temple-village.jpg",      // Telangana
};

// Fallback image
const DEFAULT_IMAGE = "/village-poster.jpg";

export default function SimpleVillageViewer({ villageId, dayMode }: SimpleVillageViewerProps) {
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
  
  // Get the appropriate image based on state ID
  const imageUrl = STATE_IMAGES[village.stateId] || DEFAULT_IMAGE;
  
  return (
    <div className="relative h-[500px] overflow-hidden rounded-lg">
      {/* Village Image */}
      <div 
        className="w-full h-full bg-black"
        style={{ 
          filter: dayMode ? 'brightness(110%) saturate(110%)' : 'brightness(40%) saturate(70%) hue-rotate(210deg)',
          backgroundColor: dayMode ? 'transparent' : '#071831' 
        }}
      >
        <img 
          src={imageUrl}
          alt={village.name}
          className="w-full h-full object-cover"
        />
        
        {/* Night sky effect */}
        {!dayMode && (
          <div className="absolute inset-0 bg-opacity-50" style={{ 
            backgroundImage: 'radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 100px 150px, #fff, rgba(0,0,0,0))',
            backgroundSize: '550px 550px'
          }}/>
        )}
      </div>
      
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