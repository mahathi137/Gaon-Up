import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";

interface LeaderboardTableProps {
  scores: {
    id: number;
    userId: number;
    username: string;
    villageId: number;
    villageName: string;
    developmentScore: number;
    budgetEfficiency: number;
    environmentalImpact: string;
  }[];
  isLoading: boolean;
}

export default function LeaderboardTable({ scores, isLoading }: LeaderboardTableProps) {
  const { user } = useAuth();
  
  // Sort scores in descending order by developmentScore
  const sortedScores = [...(scores || [])].sort((a, b) => b.developmentScore - a.developmentScore);

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary bg-opacity-10 text-foreground">
              <TableHead className="py-3 px-4 text-left font-medium">Rank</TableHead>
              <TableHead className="py-3 px-4 text-left font-medium">Player</TableHead>
              <TableHead className="py-3 px-4 text-left font-medium">Village</TableHead>
              <TableHead className="py-3 px-4 text-left font-medium">Development Score</TableHead>
              <TableHead className="py-3 px-4 text-left font-medium">Budget Efficiency</TableHead>
              <TableHead className="py-3 px-4 text-left font-medium">Environmental Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index} className="border-b border-gray-200">
                <TableCell className="py-3 px-4 font-medium">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary bg-opacity-10 text-foreground">
            <TableHead className="py-3 px-4 text-left font-medium">Rank</TableHead>
            <TableHead className="py-3 px-4 text-left font-medium">Player</TableHead>
            <TableHead className="py-3 px-4 text-left font-medium">Village</TableHead>
            <TableHead className="py-3 px-4 text-left font-medium">Development Score</TableHead>
            <TableHead className="py-3 px-4 text-left font-medium">Budget Efficiency</TableHead>
            <TableHead className="py-3 px-4 text-left font-medium">Environmental Impact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedScores.map((score, index) => (
            <TableRow 
              key={score.id} 
              className={`border-b border-gray-200 ${
                score.userId === user?.id ? 'bg-accent bg-opacity-10' : ''
              }`}
            >
              <TableCell className="py-3 px-4 font-medium">{index + 1}</TableCell>
              <TableCell className={`py-3 px-4 ${score.userId === user?.id ? 'font-medium text-accent' : ''}`}>
                {score.username}
              </TableCell>
              <TableCell className="py-3 px-4">{score.villageName}</TableCell>
              <TableCell className="py-3 px-4">{score.developmentScore}/100</TableCell>
              <TableCell className="py-3 px-4">{score.budgetEfficiency}%</TableCell>
              <TableCell className={`py-3 px-4 ${
                score.environmentalImpact === 'Positive' 
                  ? 'text-green-600' 
                  : score.environmentalImpact === 'Negative'
                  ? 'text-red-600' 
                  : 'text-yellow-600'
              }`}>
                {score.environmentalImpact}
              </TableCell>
            </TableRow>
          ))}
          
          {sortedScores.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                No scores available yet. Start developing villages to appear on the leaderboard!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
