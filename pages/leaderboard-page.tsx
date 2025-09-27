import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import LeaderboardTable from "@/components/leaderboard-table";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function LeaderboardPage() {
  const { user } = useAuth();
  
  // Fetch all scores for leaderboard
  const { data: scores, isLoading } = useQuery({
    queryKey: ["/api/scores"],
  });
  
  // Fetch user's scores
  const { data: userScores, isLoading: isLoadingUserScores } = useQuery({
    queryKey: ["/api/scores/me"],
  });

  // Find user's highest score
  const userHighestScore = userScores && userScores.length > 0 
    ? userScores.reduce((max: any, score: any) => 
        max.developmentScore > score.developmentScore ? max : score, userScores[0])
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <section className="py-16 bg-neutral flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-10 text-center animated-element">Village Development Leaderboard</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 animated-element">
            <LeaderboardTable scores={scores || []} isLoading={isLoading} />
            
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <h4 className="font-medium mb-1">Your Current Score</h4>
                {isLoadingUserScores ? (
                  <Skeleton className="h-8 w-64" />
                ) : userHighestScore ? (
                  <div className="flex items-center">
                    <div className="w-64 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-accent h-2.5 rounded-full" 
                        style={{ width: `${userHighestScore.developmentScore}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 text-lg font-medium">{userHighestScore.developmentScore}/100</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground">You haven't completed any villages yet.</p>
                )}
              </div>
              
              <Button className="bg-primary hover:bg-primary/90">
                View Full Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
