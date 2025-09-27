import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

interface KnowledgeQuizGameProps {
  onComplete: (score: number) => void;
  sectorType: string;
}

// Question type definition
type Question = {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
};

export default function KnowledgeQuizGame({ onComplete, sectorType }: KnowledgeQuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  
  // Get questions based on sector type
  const getSectorQuestions = (): Question[] => {
    // General sustainability questions
    const generalQuestions: Question[] = [
      {
        id: 1,
        text: "Which of the following is NOT one of the three pillars of sustainability?",
        options: [
          { id: "a", text: "Environmental protection", isCorrect: false },
          { id: "b", text: "Economic development", isCorrect: false },
          { id: "c", text: "Social equity", isCorrect: false },
          { id: "d", text: "Technological advancement", isCorrect: true }
        ],
        explanation: "The three pillars of sustainability are environmental protection, economic development, and social equity. While technology plays a role in sustainability, it is not one of the core pillars."
      },
      {
        id: 2,
        text: "What does the term 'sustainable development' mean?",
        options: [
          { id: "a", text: "Development that meets the needs of the present without compromising future generations", isCorrect: true },
          { id: "b", text: "Development focused exclusively on environmental protection", isCorrect: false },
          { id: "c", text: "Development that maximizes economic growth regardless of other factors", isCorrect: false },
          { id: "d", text: "Development that occurs only in rural areas", isCorrect: false }
        ],
        explanation: "Sustainable development is development that meets the needs of the present without compromising the ability of future generations to meet their own needs, as defined by the Brundtland Commission."
      }
    ];
    
    // Sector-specific questions
    let sectorQuestions: Question[] = [];
    
    switch(sectorType) {
      case "Agriculture":
        sectorQuestions = [
          {
            id: 101,
            text: "Which agricultural practice helps conserve soil moisture and reduce erosion?",
            options: [
              { id: "a", text: "Deep plowing", isCorrect: false },
              { id: "b", text: "Monocropping", isCorrect: false },
              { id: "c", text: "Mulching", isCorrect: true },
              { id: "d", text: "Excessive irrigation", isCorrect: false }
            ],
            explanation: "Mulching involves covering the soil surface with organic materials, which helps retain moisture, suppress weeds, and reduce soil erosion."
          },
          {
            id: 102,
            text: "What is the primary benefit of crop rotation in sustainable agriculture?",
            options: [
              { id: "a", text: "It reduces the need for labor", isCorrect: false },
              { id: "b", text: "It improves soil health and reduces pest problems", isCorrect: true },
              { id: "c", text: "It increases the need for chemical fertilizers", isCorrect: false },
              { id: "d", text: "It allows for year-round harvesting", isCorrect: false }
            ],
            explanation: "Crop rotation involves growing different types of crops in the same area in sequential seasons, which helps maintain soil health, reduce pest and disease problems, and improve nutrient cycling."
          }
        ];
        break;
        
      case "Health":
        sectorQuestions = [
          {
            id: 201,
            text: "Which of the following is a preventive healthcare strategy?",
            options: [
              { id: "a", text: "Treating illnesses with antibiotics", isCorrect: false },
              { id: "b", text: "Building hospitals for emergency care", isCorrect: false },
              { id: "c", text: "Immunization programs", isCorrect: true },
              { id: "d", text: "Specialized surgical procedures", isCorrect: false }
            ],
            explanation: "Immunization programs are a preventive healthcare strategy that aims to protect individuals from diseases before they occur, reducing the overall disease burden in communities."
          },
          {
            id: 202,
            text: "What is the concept of 'One Health' focused on?",
            options: [
              { id: "a", text: "Treating only the most critical patients", isCorrect: false },
              { id: "b", text: "The interconnection between people, animals, plants, and environment", isCorrect: true },
              { id: "c", text: "Providing healthcare only to certain populations", isCorrect: false },
              { id: "d", text: "Focusing on a single aspect of healthcare delivery", isCorrect: false }
            ],
            explanation: "One Health is an approach that recognizes that the health of people is closely connected to the health of animals, plants, and our shared environment."
          }
        ];
        break;
        
      case "Education":
        sectorQuestions = [
          {
            id: 301,
            text: "Which approach to education emphasizes learning through direct experience?",
            options: [
              { id: "a", text: "Lecture-based learning", isCorrect: false },
              { id: "b", text: "Rote memorization", isCorrect: false },
              { id: "c", text: "Experiential learning", isCorrect: true },
              { id: "d", text: "Standardized testing", isCorrect: false }
            ],
            explanation: "Experiential learning emphasizes learning through direct experience and reflection on that experience, rather than through traditional lecture formats or memorization."
          },
          {
            id: 302,
            text: "What is a key benefit of inclusive education?",
            options: [
              { id: "a", text: "It reduces education costs", isCorrect: false },
              { id: "b", text: "It creates equal opportunities for all students regardless of abilities", isCorrect: true },
              { id: "c", text: "It simplifies the curriculum", isCorrect: false },
              { id: "d", text: "It eliminates the need for specialized teachers", isCorrect: false }
            ],
            explanation: "Inclusive education aims to ensure equal access and opportunities for all students regardless of their diverse abilities, backgrounds, or other characteristics."
          }
        ];
        break;
        
      case "Water Supply":
        sectorQuestions = [
          {
            id: 401,
            text: "Which water conservation technique involves collecting rainfall from rooftops?",
            options: [
              { id: "a", text: "Drip irrigation", isCorrect: false },
              { id: "b", text: "Rainwater harvesting", isCorrect: true },
              { id: "c", text: "Wastewater treatment", isCorrect: false },
              { id: "d", text: "Desalination", isCorrect: false }
            ],
            explanation: "Rainwater harvesting is the collection and storage of rainwater for reuse on-site, rather than allowing it to run off. It is commonly collected from rooftops and stored in tanks."
          },
          {
            id: 402,
            text: "What is the primary purpose of a water treatment plant?",
            options: [
              { id: "a", text: "Generate hydroelectric power", isCorrect: false },
              { id: "b", text: "Create artificial rain", isCorrect: false },
              { id: "c", text: "Remove contaminants from water to make it safe for consumption", isCorrect: true },
              { id: "d", text: "Extract minerals from water for commercial use", isCorrect: false }
            ],
            explanation: "Water treatment plants remove contaminants and undesirable components from water to make it safe for human consumption or return to the environment."
          }
        ];
        break;
        
      case "Rural Roads":
        sectorQuestions = [
          {
            id: 501,
            text: "What is a key benefit of all-weather rural roads?",
            options: [
              { id: "a", text: "They require less maintenance than urban roads", isCorrect: false },
              { id: "b", text: "They provide year-round access to markets and services", isCorrect: true },
              { id: "c", text: "They eliminate the need for public transportation", isCorrect: false },
              { id: "d", text: "They automatically reduce traffic congestion", isCorrect: false }
            ],
            explanation: "All-weather rural roads are designed to remain accessible throughout the year regardless of weather conditions, ensuring continuous access to markets, healthcare facilities, schools, and other essential services."
          },
          {
            id: 502,
            text: "Which road construction material is generally considered most environmentally sustainable?",
            options: [
              { id: "a", text: "Traditional asphalt", isCorrect: false },
              { id: "b", text: "Standard concrete", isCorrect: false },
              { id: "c", text: "Pervious concrete", isCorrect: true },
              { id: "d", text: "Steel reinforcement", isCorrect: false }
            ],
            explanation: "Pervious concrete allows water to pass through it, reducing runoff and allowing groundwater recharge, which is more environmentally sustainable than impervious surfaces like traditional asphalt or concrete."
          }
        ];
        break;
        
      default:
        sectorQuestions = [
          {
            id: 601,
            text: "What is a key principle of participatory development?",
            options: [
              { id: "a", text: "Excluding local communities from decision-making", isCorrect: false },
              { id: "b", text: "Involving local stakeholders in planning and implementation", isCorrect: true },
              { id: "c", text: "Prioritizing rapid development over local concerns", isCorrect: false },
              { id: "d", text: "Implementing standardized solutions across all communities", isCorrect: false }
            ],
            explanation: "Participatory development involves including local stakeholders in planning, implementation, and evaluation of development projects, ensuring their needs, knowledge, and preferences are considered."
          },
          {
            id: 602,
            text: "What is the purpose of an Environmental Impact Assessment (EIA)?",
            options: [
              { id: "a", text: "To evaluate the potential environmental effects of a proposed project", isCorrect: true },
              { id: "b", text: "To maximize economic returns from development projects", isCorrect: false },
              { id: "c", text: "To bypass environmental regulations", isCorrect: false },
              { id: "d", text: "To speed up project approval processes", isCorrect: false }
            ],
            explanation: "An Environmental Impact Assessment is a process of evaluating the likely environmental impacts of a proposed project or development, considering both beneficial and adverse impacts."
          }
        ];
    }
    
    return [...generalQuestions, ...sectorQuestions];
  };
  
  // Get a random subset of questions
  const getRandomQuestions = (allQuestions: Question[], count: number): Question[] => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };
  
  const allQuestions = getSectorQuestions();
  const questions = getRandomQuestions(allQuestions, 5); // Get 5 random questions
  const currentQuestion = questions[currentQuestionIndex];
  
  // Timer effect
  useEffect(() => {
    if (gameEnded || showAnswer) return;
    
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
  }, [currentQuestionIndex, showAnswer, gameEnded]);
  
  // Handle time up - show answer and move to next question
  const handleTimeUp = () => {
    // If no answer selected, choose a random one
    if (!selectedAnswers[currentQuestionIndex]) {
      const randomOption = currentQuestion.options[Math.floor(Math.random() * currentQuestion.options.length)].id;
      handleAnswerSelect(randomOption);
    }
  };
  
  // Handle answer selection
  const handleAnswerSelect = (optionId: string) => {
    // Skip if already answered
    if (selectedAnswers[currentQuestionIndex]) return;
    
    // Update selected answers
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = optionId;
    setSelectedAnswers(newSelectedAnswers);
    
    // Check if correct and update score
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    if (selectedOption?.isCorrect) {
      // Base score plus time bonus
      const timeBonus = Math.max(0, timeLeft / 20 * 10);
      const questionScore = 10 + Math.round(timeBonus);
      setScore(prev => prev + questionScore);
    }
    
    // Show answer explanation
    setShowAnswer(true);
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowAnswer(false);
        setTimeLeft(20); // Reset timer for next question
      } else {
        setGameEnded(true);
        // Final score includes base score plus completion bonus
        const finalScore = score + 15; // Bonus for completing all questions
        onComplete(finalScore);
      }
    }, 3000);
  };
  
  // Get background color for option based on selection status
  const getOptionBackground = (optionId: string, isCorrect: boolean) => {
    const selectedAnswer = selectedAnswers[currentQuestionIndex];
    
    if (!showAnswer) {
      return selectedAnswer === optionId 
        ? "bg-primary/10 border-primary" 
        : "bg-white hover:bg-gray-50";
    }
    
    if (isCorrect) {
      return "bg-green-50 border-green-500 text-green-700";
    }
    
    if (selectedAnswer === optionId && !isCorrect) {
      return "bg-red-50 border-red-500 text-red-700";
    }
    
    return "bg-white opacity-50"; // Other options become faded
  };
  
  return (
    <div className="space-y-6 pb-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />
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
              stroke="#3b82f6" 
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - timeLeft / 20)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>
      </div>
    
      {/* Current question */}
      <Card className="border-primary/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-primary/10 p-4">
            <h3 className="text-xl font-bold mb-1">Question {currentQuestionIndex + 1}</h3>
            <p className="text-gray-700">{currentQuestion.text}</p>
          </div>
          
          <div className="p-4 space-y-3">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className={`w-full justify-start text-left h-auto p-4 transition duration-200 
                  ${getOptionBackground(option.id, option.isCorrect)} 
                  ${showAnswer || selectedAnswers[currentQuestionIndex] ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={showAnswer || selectedAnswers[currentQuestionIndex] !== undefined}
              >
                <div className="flex items-center gap-2">
                  {showAnswer && option.isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {showAnswer && selectedAnswers[currentQuestionIndex] === option.id && !option.isCorrect && 
                    <XCircle className="h-5 w-5 text-red-500" />}
                  <span className="font-medium">{option.id.toUpperCase()}. {option.text}</span>
                </div>
              </Button>
            ))}
          </div>
          
          {/* Explanation */}
          {showAnswer && (
            <div className="p-4 bg-muted animate-fadeIn border-t">
              <h4 className="font-semibold mb-1">Explanation:</h4>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Instructions */}
      <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
        <p>Select the correct answer to earn points. Answer quickly for bonus points!</p>
      </div>
    </div>
  );
}