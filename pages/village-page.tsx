import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VillageSelector from "@/components/village-selector";
import DroneDataViewer from "@/components/drone-data-viewer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function VillagePage() {
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<number | null>(null);
  const [dayMode, setDayMode] = useState(true);
  
  // Fetch countries
  const { data: countries = [], isLoading: isLoadingCountries } = useQuery<any[]>({
    queryKey: ["/api/countries"],
  });

  // Fetch states for selected country
  const { data: states = [], isLoading: isLoadingStates } = useQuery<any[]>({
    queryKey: ["/api/countries", selectedCountry, "states"],
    enabled: selectedCountry !== null,
  });

  // Fetch villages for selected state
  const { data: villages = [], isLoading: isLoadingVillages } = useQuery<any[]>({
    queryKey: ["/api/states", selectedState, "villages"],
    enabled: selectedState !== null,
  });

  // Fetch selected village details
  const { data: village, isLoading: isLoadingVillage } = useQuery<any>({
    queryKey: ["/api/villages", selectedVillage],
    enabled: selectedVillage !== null,
  });

  // Auto-select India (find its ID from the fetched countries)
  useEffect(() => {
    if (countries && countries.length > 0 && !selectedCountry) {
      const india = countries.find((country: any) => country.name === "India");
      if (india) {
        setSelectedCountry(india.id);
      }
    }
  }, [countries, selectedCountry]);

  // Auto-select Rajasthan if countries are loaded
  useEffect(() => {
    if (states && states.length > 0 && !selectedState) {
      const rajasthan = states.find((state: any) => state.name === "Rajasthan");
      if (rajasthan) {
        setSelectedState(rajasthan.id);
      } else {
        // Fallback to first state if Rajasthan not found
        setSelectedState(states[0].id);
      }
    }
  }, [states, selectedState]);

  // Auto-select first village if no village is selected
  useEffect(() => {
    if (villages && villages.length > 0 && !selectedVillage) {
      setSelectedVillage(villages[0].id);
    }
  }, [villages, selectedVillage]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <section className="pt-16 pb-16 bg-neutral flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-10 text-center animated-element">Select Your Village</h2>
          
          <VillageSelector 
            countries={countries || []}
            states={states || []}
            villages={villages || []}
            selectedCountry={selectedCountry}
            selectedState={selectedState}
            selectedVillage={selectedVillage}
            isLoadingCountries={isLoadingCountries}
            isLoadingStates={isLoadingStates}
            isLoadingVillages={isLoadingVillages}
            onCountryChange={setSelectedCountry}
            onStateChange={setSelectedState}
            onVillageChange={setSelectedVillage}
          />
          
          {/* Village Map Preview */}
          <div className="rounded-lg overflow-hidden shadow-lg bg-white p-4 mt-8 animated-element">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/3 relative">
                {selectedVillage && village ? (
                  <DroneDataViewer villageId={selectedVillage} dayMode={dayMode} />
                ) : (
                  <div className="map-placeholder relative h-96 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    <div className="text-center p-8 relative z-10">
                      {isLoadingVillage ? (
                        <Skeleton className="h-[300px] w-full" />
                      ) : (
                        <>
                          <i className="fa-solid fa-map-marked-alt text-6xl text-primary mb-4"></i>
                          <h3 className="text-2xl font-bold text-primary mb-2">Select a Village</h3>
                          <p className="text-sm mb-4">Choose a village from the dropdown menu above</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center mt-4 space-x-3">
                  <Button 
                    variant={dayMode ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setDayMode(true)}
                    className="flex items-center"
                  >
                    <i className="fa-solid fa-sun mr-2"></i> Day
                  </Button>
                  <Button 
                    variant={!dayMode ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setDayMode(false)}
                    className="flex items-center"
                  >
                    <i className="fa-solid fa-moon mr-2"></i> Night
                  </Button>
                </div>
              </div>
              
              <div className="w-full md:w-1/3 mt-4 md:mt-0 md:pl-6">
                <h3 className="text-xl font-bold text-primary mb-3">Village Information</h3>
                
                {village ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Population</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${village.population / 20}%` }}></div>
                      </div>
                      <p className="text-sm mt-1">{village.population.toLocaleString()} residents</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Water Bodies</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${village.waterBodies}%` }}></div>
                      </div>
                      <p className="text-sm mt-1">{Math.floor(village.waterBodies / 10)} pond(s), seasonal streams</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Green Cover</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${village.greenCover}%` }}></div>
                      </div>
                      <p className="text-sm mt-1">{village.greenCover}% tree coverage</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Current Development</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-accent h-2.5 rounded-full" style={{ width: `${village.development}%` }}></div>
                      </div>
                      <p className="text-sm mt-1">{village.description}</p>
                    </div>
                    
                    <div className="mt-6">
                      <Link href="/sectors">
                        <Button className="w-full bg-secondary hover:bg-secondary/90 flex items-center justify-center">
                          <i className="fa-solid fa-play-circle mr-2"></i> Start Developing
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    
                    <Skeleton className="h-10 w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
