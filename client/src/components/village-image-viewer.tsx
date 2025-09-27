import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Home, Users, Droplets, TreePine, Gauge } from "lucide-react";

// Create a simple Spinner component if it doesn't exist
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

interface VillageImageViewerProps {
  villageId: number;
  dayMode: boolean;
}

// Map of image backgrounds based on states
const stateImages: {[key: number]: string} = {
  // Tamil Nadu
  26: "/village-images/tamil-nadu-village.jpg",
  // Rajasthan
  28: "/village-images/desert-village.jpg",
  // Andhra Pradesh
  27: "/village-images/coastal-village.jpg",
  // Kerala
  29: "/village-images/rice-paddy-village.jpg",
  // Telangana
  30: "/village-images/temple-village.jpg",
};

// Default image if village ID is not found
const DEFAULT_IMAGE = "/village-poster.jpg";

export default function VillageImageViewer({ villageId, dayMode }: VillageImageViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Fetch village data
  const { data: villageData, isLoading: isLoadingVillage, error } = useQuery<VillageData>({
    queryKey: ["/api/villages", villageId],
  });

  // Get the image path based on the state ID
  const getImagePath = (villageId: number) => {
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
    <div className="relative h-96 overflow-hidden rounded-lg">
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
          className="w-full h-full transition-transform duration-500 ease-in-out transform hover:scale-110"
          style={{ 
            filter: dayMode ? 'brightness(100%)' : 'brightness(40%) sepia(50%) hue-rotate(190deg)'
          }}
        >
          <img 
            src={getImagePath(villageId)} 
            alt={`Village ${villageId} view`}
            className="w-full h-full object-cover"
            style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
            onLoad={handleImageLoad}
          />
        </div>
      </div>
      
      {/* Village Info Overlay */}
      {villageData && !isLoadingVillage && (
        <div className="absolute bottom-2 left-2 right-2 lg:right-auto lg:w-72 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 rounded-lg p-3 shadow-lg z-10">
          <h3 className="text-lg font-semibold mb-1 text-primary flex items-center gap-1">
            <Home className="w-4 h-4" /> {villageData.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{villageData.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-500" /> Population
              </p>
              <p className="font-medium">{villageData.population.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Gauge className="w-3 h-3 text-orange-500" /> Development
              </p>
              <p className="font-medium">{villageData.development}%</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <TreePine className="w-3 h-3 text-green-600" /> Green Cover
              </p>
              <p className="font-medium">{villageData.greenCover}%</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-500" /> Water Bodies
              </p>
              <p className="font-medium">{villageData.waterBodies}%</p>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-muted flex gap-2">
            <button 
              className="flex-1 text-xs py-1 px-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1"
            >
              <Gauge className="w-3 h-3" /> Develop
            </button>
            <button 
              className="flex-1 text-xs py-1 px-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center justify-center gap-1"
            >
              <TreePine className="w-3 h-3" /> View Sectors
            </button>
          </div>
        </div>
      )}
    </div>
  );
}