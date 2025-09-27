import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Flag, Home, Users, Droplets, TreePine, Gauge } from "lucide-react";

interface VillageSelectorProps {
  countries: any[];
  states: any[];
  villages: any[];
  selectedCountry: number | null;
  selectedState: number | null;
  selectedVillage: number | null;
  isLoadingCountries: boolean;
  isLoadingStates: boolean;
  isLoadingVillages: boolean;
  onCountryChange: (id: number) => void;
  onStateChange: (id: number) => void;
  onVillageChange: (id: number) => void;
}

export default function VillageSelector({
  countries,
  states,
  villages,
  selectedCountry,
  selectedState,
  selectedVillage,
  isLoadingCountries,
  isLoadingStates,
  isLoadingVillages,
  onCountryChange,
  onStateChange,
  onVillageChange
}: VillageSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animated-element">
      <div className="col-span-1">
        <label htmlFor="country" className="flex items-center text-sm font-medium mb-2">
          <Flag className="w-4 h-4 mr-1 text-primary" /> Country
        </label>
        {isLoadingCountries ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <Select
            value={selectedCountry?.toString() || ""}
            onValueChange={(value) => onCountryChange(parseInt(value))}
          >
            <SelectTrigger className="w-full bg-white/75 border-primary/20 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-primary" />
                    <span className="font-medium">{country.name}</span>
                    {country.name === "India" && <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">Recommended</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="col-span-1">
        <label htmlFor="state" className="flex items-center text-sm font-medium mb-2">
          <MapPin className="w-4 h-4 mr-1 text-primary" /> State <span className="text-accent ml-1">(5 states available)</span>
        </label>
        {isLoadingStates || !selectedCountry ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <>
            {states.length === 0 && (
              <div className="bg-primary/5 p-3 rounded-md mb-2 animate-pulse">
                <p className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" /> Available States:
                </p>
                <ul className="mt-1 space-y-1 text-sm list-none">
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Tamil Nadu</li>
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Telangana</li>
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Rajasthan <span className="bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">Popular</span></li>
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Andhra Pradesh</li>
                  <li className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Kerala <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">Eco-friendly</span></li>
                </ul>
              </div>
            )}
            <Select
              value={selectedState?.toString() || ""}
              onValueChange={(value) => onStateChange(parseInt(value))}
              disabled={states.length === 0}
            >
              <SelectTrigger className="w-full bg-white/75 border-primary/20 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{state.name}</span>
                      {state.name === "Rajasthan" && <span className="bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">Popular</span>}
                      {state.name === "Kerala" && <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">Eco-friendly</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      
      <div className="col-span-1">
        <label htmlFor="village" className="flex items-center text-sm font-medium mb-2">
          <Home className="w-4 h-4 mr-1 text-primary" /> Village <span className="text-accent ml-1">(10 villages per state)</span>
        </label>
        {isLoadingVillages || !selectedState ? (
          <>
            <div className="bg-accent/5 p-3 rounded-md mb-2 border border-accent/10">
              <p className="text-sm flex items-center gap-1">
                <Home className="w-4 h-4 text-primary" />
                Please select a state first to see its 10 unique villages.
              </p>
              <p className="text-xs mt-2 text-muted-foreground font-medium">Each village has unique stats including:</p>
              <ul className="mt-1 text-xs grid grid-cols-2 gap-1.5">
                <li className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-500" /> Population counts
                </li>
                <li className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" /> Water resources
                </li>
                <li className="flex items-center gap-1">
                  <TreePine className="w-3 h-3 text-green-600" /> Green cover %
                </li>
                <li className="flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-accent" /> Development level
                </li>
              </ul>
            </div>
            <Skeleton className="h-12 w-full" />
          </>
        ) : (
          <>
            {selectedState && villages && villages.length > 0 && (
              <div className="bg-accent/5 p-3 rounded-md mb-2 border border-accent/10">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Home className="w-4 h-4 text-primary" /> Village Statistics Range:
                </p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-xs flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-500" /> Population: <span className="font-medium">
                      {Math.min(...villages.map(v => v.population || 0))}-
                      {Math.max(...villages.map(v => v.population || 3000))}
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-accent" /> Development: <span className="font-medium">
                      {Math.min(...villages.map(v => v.development || 0))}%-
                      {Math.max(...villages.map(v => v.development || 100))}%
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" /> Water Bodies: <span className="font-medium">
                      {Math.min(...villages.map(v => v.waterBodies || 0))}-
                      {Math.max(...villages.map(v => v.waterBodies || 100))}
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-1">
                    <TreePine className="w-3 h-3 text-green-600" /> Green Cover: <span className="font-medium">
                      {Math.min(...villages.map(v => v.greenCover || 0))}%-
                      {Math.max(...villages.map(v => v.greenCover || 100))}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            <Select
              value={selectedVillage?.toString() || ""}
              onValueChange={(value) => onVillageChange(parseInt(value))}
              disabled={villages.length === 0}
            >
              <SelectTrigger className="w-full bg-white/75 border-primary/20 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Select a village" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {villages.map((village) => (
                  <SelectItem key={village.id} value={village.id.toString()}>
                    <div className="flex flex-col py-1">
                      <div className="flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{village.name}</span>
                        {village.population > 2500 && 
                          <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">Large</span>
                        }
                        {village.greenCover > 60 && 
                          <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">Green</span>
                        }
                      </div>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Users className="w-3 h-3 text-blue-500" /> {village.population}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Gauge className="w-3 h-3 text-accent" /> {village.development}%
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <TreePine className="w-3 h-3 text-green-600" /> {village.greenCover}%
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}
