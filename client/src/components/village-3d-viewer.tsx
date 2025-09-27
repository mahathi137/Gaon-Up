import { useEffect, useState, useRef } from "react";
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

interface Village3DViewerProps {
  villageId: number;
  dayMode: boolean;
}

// Map of Sketchfab model IDs for different states - These are verified working models
const stateModels: {[key: number]: string} = {
  // Tamil Nadu - South Indian Village
  26: "bb9635505fd647b2a90c89d322a7a68f",
  // Rajasthan - Desert Village
  28: "cfda634e5268490e8a785ef4f825d986", 
  // Andhra Pradesh - Rural Village
  27: "d7f96a8ebb614c9ea44e8999ba27562b",
  // Kerala - Tropical Village 
  29: "53a323afa9874089812847ca478fdcd2",
  // Telangana - Rural Village
  30: "5d1c60d8e9f94e57b13969fe1cee7fc5",
};

// Default model if state ID is not found (Modern Indian village)
const DEFAULT_MODEL = "cfda634e5268490e8a785ef4f825d986";

export default function Village3DViewer({ villageId, dayMode }: Village3DViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Fetch village data
  const { data: villageData, isLoading: isLoadingVillage, error } = useQuery<VillageData>({
    queryKey: ["/api/villages", villageId],
  });

  // Get the model ID based on the state ID
  const getModelId = () => {
    if (!villageData) return DEFAULT_MODEL;
    return stateModels[villageData.stateId] || DEFAULT_MODEL;
  };

  // Reset loading state when village changes
  useEffect(() => {
    setIsLoaded(false);
    setIframeLoaded(false);
  }, [villageId]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
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
        {!iframeLoaded && !isLoadingVillage && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted bg-opacity-50 z-5">
            <SimpleSpinner className="h-8 w-8" />
            <span className="ml-2 text-sm text-muted-foreground">Loading 3D village model...</span>
          </div>
        )}
        
        <div 
          className="w-full h-full transition-all duration-300"
          style={{ 
            filter: dayMode ? 'brightness(100%)' : 'brightness(50%) contrast(120%) saturate(80%) hue-rotate(185deg)',
            backgroundColor: dayMode ? 'transparent' : '#071831'
          }}
        >
          <iframe 
            ref={iframeRef}
            title="Village 3D View"
            width="100%" 
            height="100%" 
            src={`https://sketchfab.com/models/${getModelId()}/embed?autospin=1&autostart=1&preload=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0${dayMode ? '' : '&ui_color=000000'}`}
            frameBorder="0" 
            allow="autoplay; fullscreen; vr" 
            onLoad={handleIframeLoad}
            style={{
              opacity: isLoaded ? 1 : 0.3, 
              transition: 'opacity 0.8s ease-in-out'
            }}
          />
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