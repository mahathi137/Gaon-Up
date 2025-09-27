import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";

interface ResourceItem {
  id: string;
  name: string;
  icon: string;
  value: number;
  color: string;
}

interface ResourceAllocationGameProps {
  onComplete: (score: number) => void;
  sectorType: string;
}

// Sortable resource item component
function SortableResourceItem({ item }: { item: ResourceItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`flex items-center bg-white p-3 mb-2 rounded-lg shadow-md border-l-4 ${item.color} hover:shadow-lg transition-all animate-fadeIn group`}
    >
      <div className="mr-3 text-2xl">{item.icon}</div>
      <div className="flex-1">
        <div className="font-medium group-hover:translate-x-1 transition-transform">{item.name}</div>
        <div className="text-xs text-gray-500">Drag to prioritize</div>
      </div>
      <div className="bg-secondary/10 text-secondary font-bold rounded-full h-8 w-8 flex items-center justify-center">
        {item.value}
      </div>
    </div>
  );
}

// Droppable target area for resources
function DroppableArea({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 min-h-[200px] bg-gray-50">
      <h3 className="text-center text-gray-500 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function ResourceAllocationGame({ onComplete, sectorType }: ResourceAllocationGameProps) {
  // Generate resources based on sector type
  const generateResources = (): ResourceItem[] => {
    const baseResources: ResourceItem[] = [
      { id: 'budget', name: 'Budget Allocation', icon: '💰', value: 25, color: 'border-yellow-500' },
      { id: 'workforce', name: 'Skilled Workforce', icon: '👷‍♂️', value: 20, color: 'border-blue-500' },
      { id: 'tech', name: 'Technology', icon: '💻', value: 15, color: 'border-purple-500' },
      { id: 'materials', name: 'Raw Materials', icon: '🧱', value: 15, color: 'border-orange-500' },
      { id: 'time', name: 'Time Investment', icon: '⏱️', value: 10, color: 'border-red-500' },
      { id: 'community', name: 'Community Support', icon: '🤝', value: 15, color: 'border-green-500' },
    ];
    
    // Add sector-specific resources
    if (sectorType === 'Agriculture') {
      baseResources.push(
        { id: 'seeds', name: 'Quality Seeds', icon: '🌱', value: 20, color: 'border-green-600' },
        { id: 'water', name: 'Water Resources', icon: '💧', value: 25, color: 'border-blue-600' }
      );
    } else if (sectorType === 'Education') {
      baseResources.push(
        { id: 'teachers', name: 'Qualified Teachers', icon: '👩‍🏫', value: 25, color: 'border-indigo-600' },
        { id: 'books', name: 'Learning Materials', icon: '📚', value: 15, color: 'border-amber-600' }
      );
    } else if (sectorType === 'Healthcare') {
      baseResources.push(
        { id: 'doctors', name: 'Medical Staff', icon: '👨‍⚕️', value: 25, color: 'border-pink-600' },
        { id: 'medicines', name: 'Medical Supplies', icon: '💊', value: 20, color: 'border-teal-600' }
      );
    } else if (sectorType === 'Infrastructure') {
      baseResources.push(
        { id: 'machinery', name: 'Construction Equipment', icon: '🚜', value: 20, color: 'border-yellow-600' },
        { id: 'cement', name: 'Building Materials', icon: '🏗️', value: 25, color: 'border-gray-600' }
      );
    } else if (sectorType === 'Energy') {
      baseResources.push(
        { id: 'solar', name: 'Solar Panels', icon: '☀️', value: 25, color: 'border-yellow-600' },
        { id: 'wind', name: 'Wind Turbines', icon: '🌬️', value: 20, color: 'border-cyan-600' }
      );
    } else {
      // Default additional resources
      baseResources.push(
        { id: 'innovation', name: 'Innovation Ideas', icon: '💡', value: 20, color: 'border-purple-600' },
        { id: 'policy', name: 'Policy Support', icon: '📜', value: 15, color: 'border-blue-gray-600' }
      );
    }
    
    // Return a subset of resources for the game (limited to 6 total)
    return baseResources.sort(() => 0.5 - Math.random()).slice(0, 6);
  };

  const [resources, setResources] = useState<ResourceItem[]>(generateResources());
  const [selectedResources, setSelectedResources] = useState<ResourceItem[]>([]);
  const [gamePhase, setGamePhase] = useState<'instruction' | 'sorting' | 'result'>('instruction');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60); // 60 second timer
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timer > 0 && gamePhase === 'sorting') {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && gamePhase === 'sorting') {
      calculateScore();
      setGamePhase('result');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer, gamePhase]);
  
  // Handle drag end event
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      // User is sorting within the priority list
      if (selectedResources.find(r => r.id === active.id) && selectedResources.find(r => r.id === over.id)) {
        setSelectedResources(items => {
          const oldIndex = items.findIndex(i => i.id === active.id);
          const newIndex = items.findIndex(i => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } 
      // User is moving from unselected to selected
      else if (resources.find(r => r.id === active.id) && !selectedResources.includes(active.id)) {
        const item = resources.find(r => r.id === active.id)!;
        setResources(resources.filter(r => r.id !== active.id));
        setSelectedResources([...selectedResources, item]);
      }
    }
  };
  
  // Start the game
  const startGame = () => {
    setGamePhase('sorting');
    setIsTimerActive(true);
  };
  
  // Calculate final score based on resource priorities
  const calculateScore = () => {
    // Base score from number of prioritized resources
    let calculatedScore = Math.min(selectedResources.length * 10, 50);
    
    // Bonus points for sector-specific optimal ordering
    if (sectorType === 'Agriculture') {
      // For agriculture, water should be high priority
      const waterIndex = selectedResources.findIndex(r => r.id === 'water');
      if (waterIndex === 0) calculatedScore += 20;
      else if (waterIndex === 1) calculatedScore += 15;
      else if (waterIndex === 2) calculatedScore += 10;
      
      // Seeds should also be prioritized
      const seedsIndex = selectedResources.findIndex(r => r.id === 'seeds');
      if (seedsIndex === 0 || seedsIndex === 1) calculatedScore += 15;
    } else if (sectorType === 'Education') {
      // For education, teachers should be high priority
      const teachersIndex = selectedResources.findIndex(r => r.id === 'teachers');
      if (teachersIndex === 0) calculatedScore += 20;
      else if (teachersIndex === 1) calculatedScore += 15;
    } else if (sectorType === 'Healthcare') {
      // For healthcare, medical staff should be high priority
      const doctorsIndex = selectedResources.findIndex(r => r.id === 'doctors');
      if (doctorsIndex === 0) calculatedScore += 20;
      else if (doctorsIndex === 1) calculatedScore += 15;
    }
    
    // Community involvement bonus
    const communityIndex = selectedResources.findIndex(r => r.id === 'community');
    if (communityIndex !== -1 && communityIndex < 3) calculatedScore += 10;
    
    // Budget not as top priority bonus (realistic constraints)
    const budgetIndex = selectedResources.findIndex(r => r.id === 'budget');
    if (budgetIndex !== 0 && budgetIndex !== -1) calculatedScore += 5;
    
    setScore(calculatedScore);
    setTimeout(() => {
      onComplete(calculatedScore);
    }, 3000);
  };
  
  // Finish game early
  const finishEarly = () => {
    calculateScore();
    setGamePhase('result');
    setIsTimerActive(false);
  };
  
  // Render different game phases
  if (gamePhase === 'instruction') {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md border border-primary/20 animate-fadeIn">
        <h2 className="text-xl font-bold text-center text-primary mb-4">Resource Allocation Game</h2>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm">
            <span className="font-bold">Goal:</span> Prioritize resources by dragging them in order of importance for your {sectorType} development plan.
          </p>
          <p className="text-sm mt-2">
            <span className="font-bold">Instructions:</span> Drag resources from the available pool to the priority area. Then arrange them in order of importance (most important at the top). You have 60 seconds to complete this task!
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-2xl animate-pulse">
              60
            </div>
            <p className="text-sm text-gray-600">seconds</p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Button 
            onClick={startGame}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-8 py-2 rounded-lg text-lg shadow-lg"
          >
            Start Game
          </Button>
          <p className="text-sm text-gray-500 mt-2">Choose wisely! Your village's development depends on it.</p>
        </div>
      </div>
    );
  }
  
  if (gamePhase === 'sorting') {
    return (
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white rounded-lg p-6 shadow-md border border-primary/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Prioritize Resources</h2>
            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              <span className="mr-2">⏱️</span>
              <span className={`font-bold ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>{timer}s</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <DroppableArea title="Priority Area (Most Important at Top)">
                <SortableContext items={selectedResources.map(item => item.id)}>
                  <div>
                    {selectedResources.map((item) => (
                      <SortableResourceItem key={item.id} item={item} />
                    ))}
                    {selectedResources.length === 0 && (
                      <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        Drag resources here to prioritize them
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableArea>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Available Resources</h3>
              <SortableContext items={resources.map(item => item.id)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {resources.map((item) => (
                    <SortableResourceItem key={item.id} item={item} />
                  ))}
                  {resources.length === 0 && (
                    <div className="text-center text-gray-400 py-4 col-span-2">
                      All resources have been allocated!
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={finishEarly} 
              variant="secondary"
            >
              I'm Done
            </Button>
          </div>
        </div>
      </DndContext>
    );
  }
  
  if (gamePhase === 'result') {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md border border-primary/20 animate-fadeIn">
        <h2 className="text-xl font-bold text-center text-primary mb-6">Resource Allocation Results</h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-medium">Your Score</h3>
            <span className="text-2xl font-bold text-primary">{score}/100</span>
          </div>
          <div className="bg-gray-200 h-3 w-full rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Your Priority Order:</h3>
          <ol className="list-decimal pl-5">
            {selectedResources.map((resource, index) => (
              <li key={resource.id} className="mb-1">
                <span className="mr-2">{resource.icon}</span>
                <span className="font-medium">{resource.name}</span>
                {index === 0 && <span className="ml-2 text-xs text-green-600 font-medium">(Top Priority)</span>}
              </li>
            ))}
          </ol>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm font-medium text-blue-800">
            Resource prioritization impacts village development efficiency. Your choices will influence project success rates and sustainability.
          </p>
        </div>
        
        <div className="text-center">
          <Button 
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
            onClick={() => onComplete(score)}
          >
            Continue Development
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
}