import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ResourceAllocationGame from "./resource-allocation-game";
import SectorChallengeGame from "./sector-challenge-game";
import KnowledgeQuizGame from "./knowledge-quiz-game";

interface SectorMinigameProps {
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
  onGameComplete?: (score: number) => void;
}

type MiniGameType = 'resourceAllocation' | 'challenge' | 'quiz';

// Points tier definitions
const POINT_TIERS = [
  { min: 90, tier: "Outstanding", icon: "🏆", description: "You're a master of sustainable development!" },
  { min: 75, tier: "Excellent", icon: "🌟", description: "Your decisions show remarkable wisdom!" },
  { min: 60, tier: "Great", icon: "👏", description: "You have a solid understanding of village development!" },
  { min: 45, tier: "Good", icon: "👍", description: "You're making positive impacts on your village!" },
  { min: 30, tier: "Average", icon: "🙂", description: "You're on the right track with your development skills." },
  { min: 0, tier: "Beginner", icon: "🌱", description: "There's room to grow your village development skills." }
];

export function SectorMinigame({ isOpen, onClose, sector, villageId, onGameComplete }: SectorMinigameProps) {
  const [gameType, setGameType] = useState<MiniGameType | null>(null);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [gamesPlayed, setGamesPlayed] = useState<MiniGameType[]>([]);
  
  // Get tier based on score
  const getPointsTier = (score: number) => {
    for (const tier of POINT_TIERS) {
      if (score >= tier.min) return tier;
    }
    return POINT_TIERS[POINT_TIERS.length - 1]; // Default to lowest tier
  };
  
  const handleGameComplete = (score: number) => {
    setCurrentScore(score);
    
    // Add to total score
    const newTotalScore = totalScore + score;
    setTotalScore(newTotalScore);
    
    // Add game to played list
    if (gameType && !gamesPlayed.includes(gameType)) {
      setGamesPlayed([...gamesPlayed, gameType]);
    }
    
    // Show completion screen
    setGameCompleted(true);
    
    // Notify parent if callback exists
    if (onGameComplete) {
      onGameComplete(score);
    }
    
    // Return to game selection after delay
    setTimeout(() => {
      setGameType(null);
      setGameCompleted(false);
    }, 5000);
  };
  
  // Background gradient based on sector color
  const getBackgroundGradient = () => {
    const baseColor = sector.color === 'green' ? '#10b981' : 
                      sector.color === 'blue' ? '#3b82f6' : 
                      sector.color === 'purple' ? '#8b5cf6' : 
                      sector.color === 'orange' ? '#f97316' : 
                      sector.color === 'red' ? '#ef4444' : '#8b4513';
                      
    return `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}99 100%)`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle 
            style={{ 
              background: getBackgroundGradient(),
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem' 
            }}
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
            Complete fun mini-games to develop this sector and earn points!
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
                
                <SectorChallengeGame 
                  onComplete={handleGameComplete}
                  sectorType={sector.name}
                />
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
                
                <KnowledgeQuizGame 
                  onComplete={handleGameComplete}
                  sectorType={sector.name}
                />
              </div>
            )}
            
            {gameCompleted && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
                <div className="bg-white rounded-lg p-8 max-w-md">
                  <div className="animate-bounce mb-4">
                    <h2 className="text-2xl font-bold text-center text-primary mb-2">Game Completed!</h2>
                    <p className="text-center text-lg mb-2">
                      <span className="text-3xl">{getPointsTier(currentScore).icon}</span> {getPointsTier(currentScore).tier}
                    </p>
                    <p className="text-center mb-4">You scored <span className="font-bold text-primary">{currentScore}</span> points</p>
                    <p className="text-center text-sm text-muted-foreground mb-3">
                      {getPointsTier(currentScore).description}
                    </p>
                  </div>
                  
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Current Budget: <span className="text-green-600">${sector.budget}</span></h3>
              
              {totalScore > 0 && (
                <div className="text-sm bg-primary/10 px-3 py-1 rounded-full text-primary font-medium">
                  Total Score: {totalScore}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Game Instructions</h4>
                <p className="text-sm text-muted-foreground">
                  Complete all three mini-games to maximize your village development. Each game contributes different skills to your sector improvement.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setGameType('resourceAllocation')}
                  className={`bg-white hover:bg-gray-50 border-2 ${gamesPlayed.includes('resourceAllocation') ? 'border-green-200' : 'border-gray-200'} p-4 h-auto flex flex-col items-center justify-center group`}
                >
                  <div className="mb-2 text-2xl group-hover:animate-bounce">
                    {gamesPlayed.includes('resourceAllocation') ? '✅' : '🎮'}
                  </div>
                  <div className="font-medium">Resource Allocation Game</div>
                  <div className="text-xs text-muted-foreground">Prioritize resources for maximum efficiency</div>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setGameType('challenge')}
                  className={`bg-white hover:bg-gray-50 border-2 ${gamesPlayed.includes('challenge') ? 'border-green-200' : 'border-gray-200'} p-4 h-auto flex flex-col items-center justify-center group`}
                >
                  <div className="mb-2 text-2xl group-hover:animate-pulse">
                    {gamesPlayed.includes('challenge') ? '✅' : '🧩'}
                  </div>
                  <div className="font-medium">Sector Challenge</div>
                  <div className="text-xs text-muted-foreground">Make decisions to improve your village</div>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setGameType('quiz')}
                  className={`bg-white hover:bg-gray-50 border-2 ${gamesPlayed.includes('quiz') ? 'border-green-200' : 'border-gray-200'} p-4 h-auto flex flex-col items-center justify-center group`}
                >
                  <div className="mb-2 text-2xl group-hover:animate-wiggle">
                    {gamesPlayed.includes('quiz') ? '✅' : '❓'}
                  </div>
                  <div className="font-medium">Knowledge Quiz</div>
                  <div className="text-xs text-muted-foreground">Test your knowledge of sustainable development</div>
                </Button>
              </div>
              
              {gamesPlayed.length > 0 && (
                <div className="p-4 bg-green-50 rounded-md border border-green-200 mt-4">
                  <h4 className="font-medium flex items-center gap-2 mb-2 text-green-800">
                    <span className="text-lg">🏆</span> Your Progress
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Games completed:</span>
                      <span className="font-medium">{gamesPlayed.length} / 3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current rank:</span>
                      <span className="font-medium">{getPointsTier(totalScore).tier} {getPointsTier(totalScore).icon}</span>
                    </div>
                    {gamesPlayed.length === 3 && (
                      <div className="text-center mt-2">
                        <p className="text-xs text-green-700 animate-pulse">Congratulations! You've completed all games!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}