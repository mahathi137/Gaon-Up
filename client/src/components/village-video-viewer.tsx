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

interface VillageVideoViewerProps {
  villageId: number;
  dayMode: boolean;
}

export default function VillageVideoViewer({ villageId, dayMode }: VillageVideoViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Fetch village data
  const { data: villageData, isLoading: isLoadingVillage, error } = useQuery<VillageData>({
    queryKey: ["/api/villages", villageId],
  });

  // Handle video loading
  useEffect(() => {
    if (videoRef.current) {
      const handleVideoLoaded = () => {
        setIsVideoLoaded(true);
      };
      
      // Try different event listeners to catch when the video is ready
      videoRef.current.addEventListener('loadeddata', handleVideoLoaded);
      videoRef.current.addEventListener('canplay', handleVideoLoaded);
      
      // Set a timeout to show the video even if events don't fire
      const timer = setTimeout(() => {
        setIsVideoLoaded(true);
      }, 3000);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadeddata', handleVideoLoaded);
          videoRef.current.removeEventListener('canplay', handleVideoLoaded);
        }
        clearTimeout(timer);
      };
    }
  }, []);

  // Handle day/night mode
  useEffect(() => {
    if (videoRef.current) {
      // Adjust brightness based on day/night mode
      if (dayMode) {
        videoRef.current.style.filter = "brightness(100%)";
      } else {
        videoRef.current.style.filter = "brightness(40%) sepia(50%) hue-rotate(190deg)";
      }
    }
  }, [dayMode]);

  return (
    <div className="relative h-96">
      {isLoadingVillage && (
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
        {!isVideoLoaded && !isLoadingVillage && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted bg-opacity-50 z-5">
            <Spinner className="h-8 w-8 text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading video...</span>
          </div>
        )}
        
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
          preload="auto"
          poster="/village-poster.jpg"
          style={{ visibility: isVideoLoaded ? 'visible' : 'hidden' }}
        >
          <source src="/village-view-small.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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