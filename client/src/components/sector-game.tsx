import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Building, AlertCircle, Droplet, Award, CheckCircle, Lightbulb } from "lucide-react";
import ResourceAllocationGame from "./resource-allocation-game";

interface SectorGameProps {
  isOpen: boolean;
  onClose: () => void;
  sector: {
    id: number;
    name: string;
    description: string;
    budget: string;
    color: string;
  };
  villageId: number;
}

type MiniGameType = 'resourceAllocation' | 'challenge' | 'quiz';
type GameStage = 'planning' | 'allocate' | 'minigame' | 'implement' | 'results';

type ChallengeType = {
  id: number;
  title: string;
  description: string;
  options: {
    id: number;
    text: string;
    impact: {
      development: number;
      budget: number;
      environment: number;
    }
  }[];
}

export function SectorGame({ isOpen, onClose, sector, villageId }: SectorGameProps) {
  const [gameStage, setGameStage] = useState<GameStage>('planning');
  const [budgetAllocation, setBudgetAllocation] = useState<number>(50);
  const [sustainabilityFocus, setSustainabilityFocus] = useState<number>(50);
  const [laborAllocation, setLaborAllocation] = useState<number>(50);
  const [techAllocation, setTechAllocation] = useState<number>(50);
  const [progress, setProgress] = useState<number>(0);
  const [miniGameType, setMiniGameType] = useState<MiniGameType>('resourceAllocation');
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeType | null>(null);
  const [gameType, setGameType] = useState<MiniGameType | null>(null);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [challengeResults, setChallengeResults] = useState<Array<{
    challengeId: number;
    optionId: number;
    impact: {
      development: number;
      budget: number;
      environment: number;
    }
  }>>([]);
  
  // Village building game features
  const [villageCoins, setVillageCoins] = useState<number>(1000);
  const [unlockedBuildings, setUnlockedBuildings] = useState<string[]>([]);
  const [villageResources, setVillageResources] = useState<{
    wood: number;
    stone: number;
    crops: number;
    water: number;
    energy: number;
  }>({
    wood: 100,
    stone: 50,
    crops: 20,
    water: 100,
    energy: 10
  });
  
  const [villageBuildingQueue, setVillageBuildingQueue] = useState<Array<{
    name: string;
    cost: number;
    timeRemaining: number;
    buildTime: number;
    benefitType: string;
    benefitValue: number;
  }>>([]);
  
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [bonusEvents, setBonusEvents] = useState<string[]>([]);
  const [villageTips, setVillageTips] = useState<string[]>([]);
  const [animateScore, setAnimateScore] = useState<boolean>(false);
  const [score, setScore] = useState<{
    developmentScore: number;
    budgetEfficiency: number;
    environmentalImpact: string;
  }>({
    developmentScore: 0,
    budgetEfficiency: 0,
    environmentalImpact: 'Neutral'
  });
  
  // Calculate remaining budget
  const totalBudget = parseInt(sector.budget);
  const allocatedBudget = (totalBudget * budgetAllocation) / 100;
  const remainingBudget = totalBudget - allocatedBudget;

  // Handle start planning
  const handleStartPlanning = () => {
    setGameStage('allocate');
  };
  
  // Handle challenge option selection
  const handleChallengeOption = (challengeId: number, optionId: number, impact: any) => {
    setChallengeResults([...challengeResults, {
      challengeId,
      optionId,
      impact
    }]);
    
    // Update score based on impact
    setScore({
      developmentScore: score.developmentScore + impact.development,
      budgetEfficiency: score.budgetEfficiency + impact.budget,
      environmentalImpact: impact.environment > 0 ? 'Positive' : impact.environment < 0 ? 'Negative' : 'Neutral'
    });
    
    // 50% chance of another challenge, or if only 1 challenge has been done
    if (challengeResults.length < 1 || Math.random() > 0.5) {
      const availableChallenges = getSectorChallenges().filter(
        challenge => !challengeResults.find(result => result.challengeId === challenge.id)
      );
      
      if (availableChallenges.length > 0) {
        const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
        setCurrentChallenge(randomChallenge);
      } else {
        // No more challenges, move to implementation
        setGameStage('implement');
        startImplementation();
      }
    } else {
      // Move to implementation
      setGameStage('implement');
      startImplementation();
    }
  };
  
  // Implementation simulation
  const startImplementation = () => {
    const implementationInterval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + 1;
        
        // Add random events 
        if (newProgress === 15) {
          addBonusEvent("Community members volunteered to help with construction!");
          setBonusPoints(prev => prev + 5);
        }
        
        if (newProgress === 35) {
          setVillageCoins(prev => prev + 50);
          addBonusEvent("Found additional resources during excavation (+50 coins)");
        }
        
        if (newProgress === 65) {
          addBonusEvent("Local school joined to test the new facilities");
        }
        
        if (newProgress === 85) {
          setVillageCoins(prev => prev + 100);
          addBonusEvent("Project completed under budget! (+100 coins)");
          setBonusPoints(prev => prev + 10);
        }
        
        // Add village tips
        if (newProgress === 25) {
          addVillageTip("Try balancing sustainability with development speed for better results!");
        }
        
        if (newProgress === 50) {
          addVillageTip("Involving local community increases long-term success rates!");
        }
        
        if (newProgress === 75) {
          addVillageTip("Technology investments have higher upfront costs but better long-term benefits!");
        }
        
        // Add village buildings
        if (newProgress === 45) {
          addVillageBuildingToQueue("Brick Factory", 120, 10, "production", 5);
        }
        
        if (newProgress === 60) {
          addVillageBuildingToQueue("Water Pump", 80, 8, "resources", 10);
        }
        
        // Implementation complete
        if (newProgress >= 100) {
          clearInterval(implementationInterval);
          setGameStage('results');
          setAnimateScore(true);
        }
        
        return Math.min(newProgress, 100);
      });
      
      // Process building queue
      setVillageBuildingQueue(prev => {
        return prev.map(building => {
          if (building.timeRemaining > 0) {
            return {
              ...building,
              timeRemaining: building.timeRemaining - 1
            };
          }
          return building;
        }).filter(building => building.timeRemaining > 0);
      });
      
    }, 300);
    
    return () => clearInterval(implementationInterval);
  };
  
  // Start mini game when selected
  const handleStartMiniGame = () => {
    setGameStage('minigame');
    // Choose a random challenge from the sector
    const sectorChallenges = getSectorChallenges();
    if (sectorChallenges.length > 0) {
      const randomChallenge = sectorChallenges[Math.floor(Math.random() * sectorChallenges.length)];
      setCurrentChallenge(randomChallenge);
    }
  };
  
  // Implement plan
  const handleStartImplementation = () => {
    setGameStage('implement');
    startImplementation();
  };
  
  // Add building to queue
  const addVillageBuildingToQueue = (name: string, cost: number, buildTime: number, benefitType: string, benefitValue: number) => {
    setVillageBuildingQueue(prev => [
      ...prev,
      {
        name,
        cost,
        timeRemaining: buildTime,
        buildTime,
        benefitType,
        benefitValue
      }
    ]);
  };
  
  // Add bonus event
  const addBonusEvent = (event: string) => {
    setBonusEvents(prev => [...prev, event]);
  };
  
  // Add village tip
  const addVillageTip = (tip: string) => {
    setVillageTips(prev => [...prev, tip]);
  };
  
  interface ResourceRequirements {
    wood: number;
    stone: number;
  }
  
  interface BuildingType {
    id: string;
    name: string;
    description: string;
    cost: number;
    buildTime: number;
    benefitType: string;
    benefitValue: number;
    requiresResources: ResourceRequirements;
  }
  
  // Available buildings for sector
  const availableBuildings: BuildingType[] = [
    {
      id: 'training_center',
      name: 'Training Center',
      description: 'Educates villagers in new techniques',
      cost: 200,
      buildTime: 15,
      benefitType: 'education',
      benefitValue: 10,
      requiresResources: { wood: 20, stone: 10 }
    },
    {
      id: 'storage_facility',
      name: 'Storage Facility',
      description: 'Increases maximum resource storage',
      cost: 150,
      buildTime: 10,
      benefitType: 'storage',
      benefitValue: 100,
      requiresResources: { wood: 30, stone: 15 }
    },
    {
      id: 'market',
      name: 'Village Market',
      description: 'Increases coin production',
      cost: 250,
      buildTime: 20,
      benefitType: 'economy',
      benefitValue: 15,
      requiresResources: { wood: 25, stone: 20 }
    },
    {
      id: 'well',
      name: 'Community Well',
      description: 'Provides water resources',
      cost: 120,
      buildTime: 8,
      benefitType: 'water',
      benefitValue: 20,
      requiresResources: { wood: 10, stone: 30 }
    }
  ];
  
  // Purchase a building
  const purchaseBuilding = (buildingId: string) => {
    const building = availableBuildings.find(b => b.id === buildingId);
    if (building && villageCoins >= building.cost) {
      // Check if we have enough resources
      if (villageResources.wood >= building.requiresResources.wood && 
          villageResources.stone >= building.requiresResources.stone) {
        // Spend coins and resources
        setVillageCoins(prev => prev - building.cost);
        setVillageResources(prev => ({
          ...prev,
          wood: prev.wood - building.requiresResources.wood,
          stone: prev.stone - building.requiresResources.stone
        }));
        
        // Add to building queue
        addVillageBuildingToQueue(
          building.name, 
          building.cost,
          building.buildTime,
          building.benefitType,
          building.benefitValue
        );
        
        setUnlockedBuildings(prev => [...prev, building.id]);
      }
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setGameStage('planning');
    setBudgetAllocation(50);
    setSustainabilityFocus(50);
    setLaborAllocation(50);
    setTechAllocation(50);
    setProgress(0);
    setVillageCoins(1000);
    setVillageResources({
      wood: 100,
      stone: 50,
      crops: 20,
      water: 100,
      energy: 10
    });
    setVillageBuildingQueue([]);
    setBonusPoints(0);
    setBonusEvents([]);
    setVillageTips([]);
    setAnimateScore(false);
    setScore({
      developmentScore: 0,
      budgetEfficiency: 0,
      environmentalImpact: 'Neutral'
    });
    setChallengeResults([]);
  };
  
  // Handle save score to leaderboard
  const handleSaveScore = () => {
    // Here we would connect to the API to save the score
    // For now, we'll just close the dialog
    onClose();
  };
  
  // Challenges for each sector type
  const getSectorChallenges = (): ChallengeType[] => {
    // Base challenges every sector might face
    const baseChallenges: ChallengeType[] = [
      {
        id: 1,
        title: "Unexpected Weather",
        description: "Monsoon rains have come early. How do you adapt your project timeline?",
        options: [
          {
            id: 1,
            text: "Pause work and wait for better weather",
            impact: { development: -10, budget: -5, environment: 0 }
          },
          {
            id: 2,
            text: "Continue work but implement flood protection measures",
            impact: { development: 0, budget: -10, environment: 5 }
          },
          {
            id: 3,
            text: "Accelerate timeline by adding more workers",
            impact: { development: 10, budget: -15, environment: -5 }
          }
        ]
      },
      {
        id: 2,
        title: "Community Feedback",
        description: "Villagers have suggestions for the project. How do you respond?",
        options: [
          {
            id: 1,
            text: "Implement their ideas, even if it delays the project",
            impact: { development: 15, budget: -10, environment: 5 }
          },
          {
            id: 2,
            text: "Consider their input but stick mostly to the original plan",
            impact: { development: 5, budget: 0, environment: 0 }
          },
          {
            id: 3,
            text: "Thank them but continue with the expert-designed plan",
            impact: { development: -5, budget: 5, environment: 0 }
          }
        ]
      }
    ];
    
    // Sector-specific challenges
    let sectorChallenges: ChallengeType[] = [];
    
    switch(sector.name) {
      case "Agriculture":
        sectorChallenges = [
          {
            id: 101,
            title: "Crop Selection",
            description: "Which approach will you take for crop cultivation?",
            options: [
              {
                id: 1,
                text: "Traditional crops using organic methods",
                impact: { development: 5, budget: 0, environment: 15 }
              },
              {
                id: 2,
                text: "High-yield hybrid varieties with modern techniques",
                impact: { development: 15, budget: -10, environment: -5 }
              },
              {
                id: 3,
                text: "Mixed approach with crop rotation",
                impact: { development: 10, budget: -5, environment: 10 }
              }
            ]
          }
        ];
        break;
        
      case "Health":
        sectorChallenges = [
          {
            id: 201,
            title: "Medical Facility Type",
            description: "What type of healthcare facility will you establish?",
            options: [
              {
                id: 1,
                text: "Modern clinic with latest equipment",
                impact: { development: 20, budget: -25, environment: -5 }
              },
              {
                id: 2,
                text: "Basic health center with essential services",
                impact: { development: 15, budget: -10, environment: 0 }
              },
              {
                id: 3,
                text: "Mobile health units to reach remote areas",
                impact: { development: 10, budget: -15, environment: 5 }
              }
            ]
          }
        ];
        break;
        
      default:
        sectorChallenges = [
          {
            id: 301,
            title: "Project Approach",
            description: "How will you implement this development project?",
            options: [
              {
                id: 1,
                text: "Rapid implementation with maximum resources",
                impact: { development: 20, budget: -20, environment: -10 }
              },
              {
                id: 2,
                text: "Balanced approach with community involvement",
                impact: { development: 15, budget: -10, environment: 5 }
              },
              {
                id: 3,
                text: "Slow, sustainable implementation",
                impact: { development: 10, budget: -5, environment: 15 }
              }
            ]
          }
        ];
    }
    
    return [...baseChallenges, ...sectorChallenges];
  };

  const handleGameComplete = (score: number) => {
    setCurrentScore(score);
    setGameCompleted(true);
    setScore(prev => ({
      ...prev,
      developmentScore: prev.developmentScore + Math.floor(score / 5),
      budgetEfficiency: prev.budgetEfficiency + (score > 70 ? 10 : 5),
      environmentalImpact: score > 80 ? 'Excellent' : score > 60 ? 'Good' : 'Neutral'
    }));
    setTimeout(() => {
      setGameType(null);
      setGameCompleted(false);
    }, 5000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle 
            style={{ color: sector.color }}
            className="text-xl flex items-center gap-2"
          >
            {sector.name === "Agriculture" && <span>🌾</span>}
            {sector.name === "Health" && <span>🏥</span>}
            {sector.name === "Rural Roads" && <span>🛣️</span>}
            {sector.name === "Water Supply" && <span>💧</span>}
            {sector.name === "Education" && <span>🏫</span>}
            {sector.name === "Sanitation" && <span>♻️</span>}
            {sector.name} Development Game
          </DialogTitle>
          <DialogDescription>
            {gameStage === 'planning' ? 
              'Plan and develop your village sector with fun interactive challenges!' :
              gameStage === 'allocate' ? 
              'Allocate your resources wisely to develop this sector.' :
              gameStage === 'minigame' ? 
              'Make strategic decisions to overcome challenges!' :
              gameStage === 'implement' ? 
              'Implementing your development plan...' :
              'Here are your development results!'
            }
          </DialogDescription>
        </DialogHeader>
        
        {gameType ? (
          <div className="p-4">
            {gameType === 'resourceAllocation' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setGameType(null)}
                    className="flex items-center gap-1"
                  >
                    <span>←</span> Back to Games
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">Resource Allocation</span>
                </div>
                
                <ResourceAllocationGame 
                  onComplete={handleGameComplete}
                  sectorType={sector.name}
                />
              </div>
            )}
            
            {gameType === 'challenge' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setGameType(null)}
                    className="flex items-center gap-1"
                  >
                    <span>←</span> Back to Games
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">Sector Challenge</span>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-md border border-primary/20 animate-fadeIn">
                  <h2 className="text-xl font-bold text-center text-primary mb-4">Development Challenge</h2>
                  <p className="text-center text-gray-500 mb-6">This game is coming soon!</p>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => setGameType(null)}
                      variant="secondary"
                    >
                      Return to Game Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {gameType === 'quiz' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setGameType(null)}
                    className="flex items-center gap-1"
                  >
                    <span>←</span> Back to Games
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">Knowledge Quiz</span>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-md border border-primary/20 animate-fadeIn">
                  <h2 className="text-xl font-bold text-center text-primary mb-4">Knowledge Quiz</h2>
                  <p className="text-center text-gray-500 mb-6">This game is coming soon!</p>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => setGameType(null)}
                      variant="secondary"
                    >
                      Return to Game Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {gameCompleted && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
                <div className="bg-white rounded-lg p-8 max-w-md animate-bounce">
                  <h2 className="text-2xl font-bold text-center text-primary mb-2">Game Completed!</h2>
                  <p className="text-center mb-4">You scored {currentScore} points</p>
                  <div className="flex justify-center">
                    <div className="relative w-24 h-24 mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-3xl">🎉</div>
                      </div>
                      <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#047857" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (currentScore / 100) * 283}/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Your village is improving! Returning to game selection...
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Current Budget: <span className="text-green-600">${sector.budget}</span></h3>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Game Instructions</h4>
                <p className="text-sm text-muted-foreground">
                  Complete the mini-games to develop your {sector.name.toLowerCase()} sector. Your choices will affect the development score, budget efficiency, and environmental impact.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setGameType('resourceAllocation')}
                  className="bg-white hover:bg-gray-50 border-2 border-gray-200 p-4 h-auto flex flex-col items-center justify-center group"
                >
                  <div className="mb-2 text-2xl group-hover:animate-bounce">🎮</div>
                  <div className="font-medium">Resource Allocation Game</div>
                  <div className="text-xs text-muted-foreground">Prioritize resources for maximum efficiency</div>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setGameType('challenge')}
                  className="bg-white hover:bg-gray-50 border-2 border-gray-200 p-4 h-auto flex flex-col items-center justify-center group"
                >
                  <div className="mb-2 text-2xl group-hover:animate-pulse">🧩</div>
                  <div className="font-medium">Sector Challenge</div>
                  <div className="text-xs text-muted-foreground">Make decisions to improve your village</div>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setGameType('quiz')}
                  className="bg-white hover:bg-gray-50 border-2 border-gray-200 p-4 h-auto flex flex-col items-center justify-center group"
                >
                  <div className="mb-2 text-2xl group-hover:animate-wiggle">❓</div>
                  <div className="font-medium">Knowledge Quiz</div>
                  <div className="text-xs text-muted-foreground">Test your knowledge of sustainable development</div>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* You can add more game stages here */}
      </DialogContent>
    </Dialog>
  );
}