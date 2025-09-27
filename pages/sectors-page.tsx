import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectorCard from "@/components/sector-card";
import VillageSelector from "@/components/village-selector";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SectorsPage() {
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null); // We'll set this when countries load
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<number | null>(null);

  // Fetch sectors data
  const { data: sectors, isLoading: isLoadingSectors } = useQuery<any[]>({
    queryKey: ["/api/sectors"],
  });

  // Fetch countries
  const { data: countries, isLoading: isLoadingCountries } = useQuery<any[]>({
    queryKey: ["/api/countries"],
  });

  // Set India as the default country when countries load
  useEffect(() => {
    if (countries && countries.length > 0 && !selectedCountry) {
      const india = countries.find(country => country.name === "India");
      if (india) {
        setSelectedCountry(india.id);
      }
    }
  }, [countries, selectedCountry]);

  // Fetch states based on selected country
  const { data: states, isLoading: isLoadingStates } = useQuery<any[]>({
    queryKey: ["/api/states"],
    enabled: Boolean(selectedCountry)
  });

  // Fetch villages based on selected state
  const { data: villages, isLoading: isLoadingVillages } = useQuery<any[]>({
    queryKey: ["/api/states", selectedState, "villages"],
    enabled: Boolean(selectedState)
  });

  const handleCountryChange = (countryId: number) => {
    setSelectedCountry(countryId);
    setSelectedState(null);
    setSelectedVillage(null);
  };

  const handleStateChange = (stateId: number) => {
    setSelectedState(stateId);
    setSelectedVillage(null);
  };

  const handleVillageChange = (villageId: number) => {
    setSelectedVillage(villageId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <section className="py-16 bg-background flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center animated-element">Development Sectors</h2>
          
          <div className="bg-accent/20 p-6 rounded-lg mb-8 border-l-4 border-accent animated-element">
            <h3 className="text-xl font-bold text-accent mb-2">Enhanced Sector Games</h3>
            <p className="mb-2">We've implemented fun, interactive sector games with the following features:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Random challenges specific to each sector (agriculture, health, education, etc.)</li>
              <li>Unexpected events that test your decision-making skills</li>
              <li>Resource allocation minigames with strategic choices</li>
              <li>Environmental impact calculations for each decision</li>
              <li>Detailed village statistics showing your progress</li>
            </ul>
          </div>
          
          <Card className="mb-10 animated-element">
            <CardHeader>
              <CardTitle>Select Your Village</CardTitle>
              <CardDescription>
                Choose the village you want to develop. Each village has unique challenges and resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                onCountryChange={handleCountryChange}
                onStateChange={handleStateChange}
                onVillageChange={handleVillageChange}
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingSectors ? (
              // Loading skeletons
              Array(6).fill(0).map((_, index) => (
                <SectorCard key={index} isLoading={true} />
              ))
            ) : (
              // Actual sector cards
              sectors && sectors.map((sector: any) => (
                <SectorCard 
                  key={sector.id}
                  id={sector.id}
                  name={sector.name}
                  description={sector.description}
                  budget={sector.budget}
                  imageUrl={sector.imageUrl}
                  color={sector.color}
                  icon={sector.icon}
                  isLoading={false}
                  villageId={selectedVillage || 1}
                />
              ))
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
