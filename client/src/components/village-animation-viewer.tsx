import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Home, Users, Droplets, TreePine, Gauge } from "lucide-react";

// Create a simple Spinner component
const SimpleSpinner = ({ className }: { className?: string }) => (
  <div className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${className || ''}`}></div>
);

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

interface VillageAnimationViewerProps {
  villageId: number;
  dayMode: boolean;
}

// Map of village animations based on states (using direct image paths)
const stateImages: {[key: number]: string} = {
  // Tamil Nadu - South Indian Village
  26: "/village-images/tamil-nadu-village.jpg",
  // Rajasthan - Desert Village
  28: "/village-images/desert-village.jpg",
  // Andhra Pradesh - Coastal Village
  27: "/village-images/coastal-village.jpg",
  // Kerala - Tropical Village 
  29: "/village-images/rice-paddy-village.jpg",
  // Telangana - Rural Village
  30: "/village-images/temple-village.jpg",
};

// Default image if state ID is not found
const DEFAULT_IMAGE = "/village-poster.jpg";

export default function VillageAnimationViewer({ villageId, dayMode }: VillageAnimationViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Fetch village data
  const { data: villageData, isLoading: isLoadingVillage, error } = useQuery<VillageData>({
    queryKey: ["/api/villages", villageId],
  });

  // Get the image URL based on the state ID
  const getImageUrl = () => {
    if (!villageData) return DEFAULT_IMAGE;
    return stateImages[villageData.stateId] || DEFAULT_IMAGE;
  };

  // Reset loading state when village changes
  useEffect(() => {
    setIsLoaded(false);
  }, [villageId]);

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="relative h-[500px] overflow-hidden rounded-lg">
      {isLoadingVillage && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted bg-opacity-50 z-10">
          <SimpleSpinner className="h-12 w-12" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive bg-opacity-10 z-10">
          <div className="bg-white p-4 rounded shadow-lg text-center">
            <p className="text-destructive font-medium">Error loading village data</p>
            <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page.</p>
          </div>
        </div>
      )}
      
      <div className="w-full h-full bg-black overflow-hidden">
        {!isLoaded && !isLoadingVillage && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted bg-opacity-50 z-5">
            <SimpleSpinner className="h-8 w-8" />
            <span className="ml-2 text-sm text-muted-foreground">Loading village view...</span>
          </div>
        )}
        
        <div 
          className="w-full h-full"
          style={{ 
            filter: dayMode ? 'brightness(110%) saturate(110%)' : 'brightness(40%) contrast(120%) saturate(70%) hue-rotate(210deg)',
            backgroundColor: dayMode ? 'transparent' : '#071831'
          }}
        >
          <img 
            src={getImageUrl()} 
            alt={villageData?.name || "Village view"}
            className="w-full h-full object-cover transition-transform duration-30000 ease-linear animate-pan-slow hover:scale-110"
            style={{
              opacity: isLoaded ? 1 : 0.3,
              transition: 'opacity 1s ease-in-out, transform 0.5s ease-in-out',
            }}
            onLoad={handleImageLoad}
          />
          
          {/* Animated clouds overlay for day mode */}
          {dayMode && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-30 bg-repeat animate-clouds"
              style={{
                backgroundImage: 'url("/village-poster.jpg")',
                backgroundSize: 'cover',
                opacity: 0.15
              }}
            />
          )}
          
          {/* Animated stars overlay for night mode */}
          {!dayMode && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-50"
              style={{
                backgroundImage: 'radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 100px 150px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 200px 80px, #fff, rgba(0,0,0,0))',
                backgroundSize: '550px 550px'
              }}
            />
          )}
        </div>
      </div>
      
      {/* Village Info Overlay - Positioned at the bottom */}
      {villageData && !isLoadingVillage && (
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 px-3 py-2 shadow-lg z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-1">
              <Home className="w-4 h-4" /> {villageData.name}
            </h3>
            <div className="text-xs bg-primary text-white px-2 py-1 rounded-full">
              Development: {villageData.development}%
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-500 flex-shrink-0" /> 
              <span className="text-muted-foreground">Population:</span>
              <span className="font-medium">{villageData.population.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <TreePine className="w-3 h-3 text-green-600 flex-shrink-0" /> 
              <span className="text-muted-foreground">Green Cover:</span>
              <span className="font-medium">{villageData.greenCover}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-blue-500 flex-shrink-0" /> 
              <span className="text-muted-foreground">Water Bodies:</span>
              <span className="font-medium">{villageData.waterBodies}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}