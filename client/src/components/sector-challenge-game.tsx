import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SectorChallengeGameProps {
  onComplete: (score: number) => void;
  sectorType: string;
}

// Challenge type definition
type Challenge = {
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
};

export default function SectorChallengeGame({ onComplete, sectorType }: SectorChallengeGameProps) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameEnded, setGameEnded] = useState(false);
  
  // Get challenges based on sector type
  const getSectorChallenges = (): Challenge[] => {
    // Base challenges every sector might face
    const baseChallenges: Challenge[] = [
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
    let sectorChallenges: Challenge[] = [];
    
    switch(sectorType) {
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
        
      case "Education":
        sectorChallenges = [
          {
            id: 301,
            title: "School Infrastructure",
            description: "How will you improve educational facilities?",
            options: [
              {
                id: 1,
                text: "Build a new school with modern amenities",
                impact: { development: 20, budget: -25, environment: -5 }
              },
              {
                id: 2,
                text: "Renovate existing buildings and add digital resources",
                impact: { development: 15, budget: -15, environment: 5 }
              },
              {
                id: 3,
                text: "Create community learning centers",
                impact: { development: 10, budget: -10, environment: 10 }
              }
            ]
          }
        ];
        break;
        
      case "Water Supply":
        sectorChallenges = [
          {
            id: 401,
            title: "Water Source",
            description: "What primary water source will you develop?",
            options: [
              {
                id: 1,
                text: "Dig deep borewells with electric pumps",
                impact: { development: 15, budget: -15, environment: -10 }
              },
              {
                id: 2,
                text: "Construct rainwater harvesting systems",
                impact: { development: 10, budget: -10, environment: 20 }
              },
              {
                id: 3,
                text: "Build a water treatment plant for the nearby river",
                impact: { development: 20, budget: -25, environment: 5 }
              }
            ]
          }
        ];
        break;
        
      case "Rural Roads":
        sectorChallenges = [
          {
            id: 501,
            title: "Road Material",
            description: "What type of road surface will you use?",
            options: [
              {
                id: 1,
                text: "Concrete roads for durability",
                impact: { development: 20, budget: -25, environment: -10 }
              },
              {
                id: 2,
                text: "Asphalt with recycled materials",
                impact: { development: 15, budget: -15, environment: 0 }
              },
              {
                id: 3,
                text: "Compacted gravel with local materials",
                impact: { development: 10, budget: -10, environment: 10 }
              }
            ]
          }
        ];
        break;
        
      default:
        sectorChallenges = [
          {
            id: 601,
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
  
  const challenges = getSectorChallenges();
  const currentChallenge = challenges[currentChallengeIndex];
  
  // Timer effect
  useEffect(() => {
    if (gameEnded) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentChallengeIndex, gameEnded]);
  
  // Handle time up - move to next challenge or end game
  const handleTimeUp = () => {
    // If the user hasn't selected an option, choose a random one
    if (!selectedOptions[currentChallengeIndex]) {
      const randomOption = Math.floor(Math.random() * currentChallenge.options.length) + 1;
      handleOptionSelect(randomOption);
    }
  };
  
  // Handle option selection
  const handleOptionSelect = (optionId: number) => {
    // Skip if already selected for this challenge
    if (selectedOptions[currentChallengeIndex]) return;
    
    // Update selected options
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentChallengeIndex] = optionId;
    setSelectedOptions(newSelectedOptions);
    
    // Calculate impact on score
    const selectedOption = currentChallenge.options.find(opt => opt.id === optionId);
    if (selectedOption) {
      const optionScore = 
        (selectedOption.impact.development + 
        selectedOption.impact.budget + 
        selectedOption.impact.environment) / 3;
      
      // Higher scores for better balanced impacts
      const balanceBonus = 
        Math.abs(selectedOption.impact.development) > 0 && 
        Math.abs(selectedOption.impact.budget) > 0 && 
        Math.abs(selectedOption.impact.environment) > 0 ? 5 : 0;
      
      const timeBonus = Math.max(0, timeLeft / 30 * 10); // Up to 10 points for quick decisions
      
      const challengeScore = Math.max(0, Math.round(optionScore + balanceBonus + timeBonus));
      setScore(prev => prev + challengeScore);
    }
    
    // Move to next challenge or end game
    setTimeout(() => {
      if (currentChallengeIndex < challenges.length - 1) {
        setCurrentChallengeIndex(prev => prev + 1);
        setTimeLeft(30); // Reset timer for next challenge
      } else {
        setGameEnded(true);
        // Final score includes base score plus bonus for completing all challenges
        const finalScore = score + 20; // Bonus for completing all challenges
        onComplete(finalScore);
      }
    }, 1500);
  };
  
  // Get background color for option based on selection status
  const getOptionBackground = (optionId: number) => {
    const selectedOption = selectedOptions[currentChallengeIndex];
    
    if (!selectedOption) return "bg-white hover:bg-gray-50";
    
    if (selectedOption === optionId) {
      // This option was selected by user
      return "bg-green-50 border-green-500";
    }
    
    return "bg-white opacity-50"; // Other options become faded
  };
  
  return (
    <div className="space-y-6 pb-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Challenge {currentChallengeIndex + 1} of {challenges.length}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={(currentChallengeIndex / challenges.length) * 100} className="h-2" />
      </div>
      
      {/* Timer */}
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center relative">
          <span className="font-bold text-lg">{timeLeft}</span>
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="32" 
              cy="32" 
              r="28" 
              fill="none" 
              stroke="#f3f4f6" 
              strokeWidth="4"
            />
            <circle 
              cx="32" 
              cy="32" 
              r="28" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - timeLeft / 30)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>
      </div>
    
      {/* Current challenge */}
      <Card className="border-primary/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-primary/10 p-4">
            <h3 className="text-xl font-bold mb-1">{currentChallenge.title}</h3>
            <p className="text-gray-600">{currentChallenge.description}</p>
          </div>
          
          <div className="p-4 space-y-3">
            {currentChallenge.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className={`w-full justify-start text-left h-auto p-4 transition duration-200 
                  ${getOptionBackground(option.id)} ${selectedOptions[currentChallengeIndex] ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={() => handleOptionSelect(option.id)}
                disabled={selectedOptions[currentChallengeIndex] !== undefined}
              >
                <div>
                  <p className="font-medium">{option.text}</p>
                  {selectedOptions[currentChallengeIndex] === option.id && (
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs animate-fadeIn">
                      <div className={`p-1 rounded ${option.impact.development > 0 ? 'bg-green-100 text-green-800' : option.impact.development < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        Development: {option.impact.development > 0 ? '+' : ''}{option.impact.development}
                      </div>
                      <div className={`p-1 rounded ${option.impact.budget > 0 ? 'bg-green-100 text-green-800' : option.impact.budget < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        Budget: {option.impact.budget > 0 ? '+' : ''}{option.impact.budget}
                      </div>
                      <div className={`p-1 rounded ${option.impact.environment > 0 ? 'bg-green-100 text-green-800' : option.impact.environment < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        Environment: {option.impact.environment > 0 ? '+' : ''}{option.impact.environment}
                      </div>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Instructions */}
      <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
        <p>Choose the option that balances development, budget, and environmental impacts for the best score.</p>
      </div>
    </div>
  );
}