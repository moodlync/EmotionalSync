import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Medal, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Contributor {
  id: number;
  userId: number;
  username: string;
  profilePicture?: string | null;
  tokensBurned: number;
  rank: number;
}

export default function TopContributorsLeaderboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [limit] = useState(50);
  
  const { data: contributors, isLoading, error } = useQuery<Contributor[]>({
    queryKey: ['/api/token-pool/top-contributors', limit],
    queryFn: async () => {
      const res = await fetch(`/api/token-pool/top-contributors?limit=${limit}`);
      if (!res.ok) {
        throw new Error('Failed to fetch contributors');
      }
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load contributor data',
      variant: 'destructive',
    });
  }
  
  return (
    <div>
      {isLoading ? (
        <LeaderboardLoadingSkeleton />
      ) : contributors && contributors.length > 0 ? (
        <LeaderboardTable contributors={contributors} />
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No contributors yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Be the first to contribute to the token pool by burning your minted NFTs!
          </p>
        </div>
      )}
    </div>
  );
}

function LeaderboardTable({ contributors }: { contributors: Contributor[] }) {
  const { user } = useAuth();
  
  // Find current user in the leaderboard
  const currentUserRank = user ? contributors.find(c => c.userId === user.id)?.rank : undefined;
  
  return (
    <Table>
      <TableCaption>Top {contributors.length} contributors in the current distribution round</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-right">Tokens Contributed</TableHead>
          <TableHead className="w-16 text-center">Trend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contributors.map((contributor) => {
          const isCurrentUser = user && contributor.userId === user.id;
          
          // Determine rank icon
          let RankIcon = null;
          if (contributor.rank === 1) {
            RankIcon = <Medal className="h-4 w-4 text-yellow-500" />;
          } else if (contributor.rank === 2) {
            RankIcon = <Medal className="h-4 w-4 text-gray-400" />;
          } else if (contributor.rank === 3) {
            RankIcon = <Medal className="h-4 w-4 text-amber-700" />;
          }
          
          // Randomly determine trend for this example
          // In a real implementation, this would be based on actual rank changes
          const trends = [<TrendingUp className="h-4 w-4 text-green-500" />, <TrendingDown className="h-4 w-4 text-red-500" />, <Minus className="h-4 w-4 text-gray-400" />];
          const TrendIcon = trends[Math.floor(Math.random() * trends.length)];
          
          return (
            <TableRow key={contributor.id} className={isCurrentUser ? "bg-primary/5" : ""}>
              <TableCell className="font-medium flex items-center">
                {RankIcon ? (
                  <span className="mr-1">{RankIcon}</span>
                ) : null}
                {contributor.rank}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {contributor.profilePicture ? (
                    <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                      <img 
                        src={contributor.profilePicture} 
                        alt={`${contributor.username}'s profile picture`}
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-2 text-xs">
                      {contributor.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={isCurrentUser ? "font-semibold" : ""}>
                    {contributor.username}
                    {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                {contributor.tokensBurned.toLocaleString()}
              </TableCell>
              <TableCell className="text-center">
                {TrendIcon}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function LeaderboardLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-full" />
      </div>
      
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}