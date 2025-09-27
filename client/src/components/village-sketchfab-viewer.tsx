import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Home, Users, Droplets, TreePine, Gauge } from "lucide-react";

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

interface VillageSketchfabViewerProps {
  villageId: number;
  dayMode: boolean;
}

// Map of village IDs to Sketchfab model UIDs - using verified working models
const villageModels: {[key: number]: string} = {
  // Tamil Nadu villages - South India models
  171: "7w7pAfrCfjovwyYEUv8UwZBORG", // Rural South Indian village
  172: "d2a41fc0eb5c43d8969728b87e85797c", // Temple village
  173: "4aa101f6332f42c4a7967127aac5d925", // Coastal fishing village

  // Rajasthan villages - Desert/fort models
  185: "9d754af004b644c5967a39d45abde2c5", // Desert village
  186: "c8fdd5742dad4010a7cfe198c35bad89", // Jaisalmer Fort village
  187: "c98f4d613aed4fb3911f10c7eac9d879", // Rajasthani desert settlement

  // Andhra Pradesh villages - Varied terrain
  176: "36fb4d41bd224c1a87f657d9bd465bc0", // Araku Valley - Mountain village
  177: "4aa101f6332f42c4a7967127aac5d925", // Coastal village
  178: "bf6f595530a64d2583c173c417ad8e8a", // Rice paddy village
};

// Default model if village ID is not found
const DEFAULT_MODEL = "bf6f595530a64d2583c173c417ad8e8a"; // Default Indian village model

export default function VillageSketchfabViewer({ villageId, dayMode }: VillageSketchfabViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Fetch village data
  const { data: villageData, isLoading: isLoadingVillage, error } = useQuery<VillageData>({
    queryKey: ["/api/villages", villageId],
  });

  // Get the model UID based on the village ID
  const getModelUid = (villageId: number) => {
    return villageModels[villageId] || DEFAULT_MODEL;
  };

  // Initialize Sketchfab iframe
  useEffect(() => {
    setIsModelLoaded(false);
    setIsInitializing(true);
    
    // Set a timeout to stop showing the initializing spinner after a certain time
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [villageId]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsModelLoaded(true);
    setIsInitializing(false);
  };

  return (
    <div className="relative h-96">
      {(isLoadingVillage || isInitializing) && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted bg-opacity-50 z-10">
          <Spinner className="h-12 w-12 text-primary" />
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
      
      <div className="w-full h-full rounded-lg overflow-hidden bg-black">
        <iframe
          ref={iframeRef}
          title="Sketchfab Village Model"
          className="w-full h-full border-0"
          src={`https://sketchfab.com/models/${getModelUid(villageId)}/embed?autospin=0&autostart=1&ui_theme=${dayMode ? 'light' : 'dark'}&ui_animations=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&preload=1`}
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          onLoad={handleIframeLoad}
        ></iframe>
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