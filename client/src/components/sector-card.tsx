import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SectorMinigame } from "@/components/sector-minigame";

interface SectorCardProps {
  id?: number;
  name?: string;
  description?: string;
  budget?: string;
  imageUrl?: string;
  color?: string;
  icon?: string;
  isLoading: boolean;
  villageId?: number;
}

export default function SectorCard({
  id,
  name,
  description,
  budget,
  imageUrl,
  color,
  icon,
  isLoading,
  villageId = 1 // Default to village ID 1 if none provided
}: SectorCardProps) {
  const [gameOpen, setGameOpen] = useState(false);
  
  const handlePlayNow = () => {
    setGameOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 animated-element">
        <Skeleton className="h-48 w-full" />
        <div className="p-4">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden card-shadow hover-scale animated-element">
        <div className={`h-48 relative overflow-hidden`} style={{ backgroundColor: color }}>
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">{name}</h3>
          </div>
          <div className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-lg">
            <i className={`fa-solid ${icon} text-lg`} style={{ color: color }}></i>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm mb-4 leading-relaxed">{description}</p>
          <div className="flex items-center justify-between">
            <span 
              className="text-xs px-3 py-1.5 rounded-full font-medium" 
              style={{ 
                backgroundColor: `${color}20`, 
                color: color 
              }}
            >
              Budget: ₹{parseInt(budget || "0").toLocaleString()}
            </span>
            <Button 
              className="text-white font-medium py-1.5 px-5 rounded-md text-sm transition-all duration-300 ripple"
              style={{ backgroundColor: color }}
              onClick={handlePlayNow}
            >
              Play Now <i className="fa-solid fa-arrow-right ml-1"></i>
            </Button>
          </div>
        </div>
      </div>
      
      {id !== undefined && name && description && budget && color && (
        <SectorMinigame 
          isOpen={gameOpen} 
          onClose={() => setGameOpen(false)} 
          sector={{ id, name, description, budget, color }}
          villageId={villageId}
        />
      )}
    </>
  );
}
