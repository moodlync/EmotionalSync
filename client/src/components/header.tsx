import { Coins, History, User as UserIcon, CreditCard, Crown, HelpCircle, Share2, Award, Video, Users, Wrench, Heart, Moon, Sun, Sparkles, Search, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import HeaderLogoWithText from "@/components/logo/header-logo-with-text";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppTestPanel from "@/components/test-utils/app-test-panel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RewardActivity {
  id: number;
  userId: number;
  activityType: 'journal_entry' | 'chat_participation' | 'emotion_update' | 'daily_login' | 'help_others';
  tokensEarned: number;
  description: string;
  createdAt: string;
}

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [rewardHistoryOpen, setRewardHistoryOpen] = useState(false);
  const [logoHeartbeat, setLogoHeartbeat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Heartbeat effect and logo rotation disabled as requested

  // Fetch token balance
  const { data: tokenData, isLoading: isLoadingTokens } = useQuery({
    queryKey: ['/api/tokens'],
    queryFn: async () => {
      const res = await fetch('/api/tokens');
      if (!res.ok) throw new Error('Failed to fetch token balance');
      return res.json();
    },
    enabled: !!user // Only fetch if user is logged in
  });

  // Fetch reward history
  const { data: rewardActivities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['/api/rewards/history'],
    queryFn: async () => {
      const res = await fetch('/api/rewards/history');
      if (!res.ok) throw new Error('Failed to fetch reward history');
      return res.json() as Promise<RewardActivity[]>;
    },
    enabled: rewardHistoryOpen // Only fetch when dialog is open
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getActivityTypeLabel = (type: RewardActivity['activityType']) => {
    switch (type) {
      case 'journal_entry': return 'Journal Entry';
      case 'chat_participation': return 'Chat Participation';
      case 'emotion_update': return 'Emotion Update';
      case 'daily_login': return 'Daily Login';
      case 'help_others': return 'Helping Others';
      default: return type;
    }
  };

  return (
    <header className="bg-white dark:bg-black text-black dark:text-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="flex items-center cursor-pointer">
          <div className="hover:scale-105 transition-transform duration-300 ease-in-out">
            <HeaderLogoWithText 
              logoSize={100} 
              textSize="lg" 
              enableHeartbeat={logoHeartbeat}
              hideText={true}
              isWelcomeScreen={true} /* Changed from rounded to welcome page style */
            />
          </div>
        </Link>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Token Display - Only for logged in users */}
          {user && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/tokens" className="block">
                    <Button 
                      variant="ghost" 
                      className="h-10 rounded-full bg-gray-100 dark:bg-white/20 hover:bg-gray-200 dark:hover:bg-white/30 transition-colors flex items-center gap-1.5"
                    >
                      <Coins className="h-4 w-4 text-yellow-500 dark:text-yellow-300" />
                      <span className="font-medium sm:inline hidden">
                        {isLoadingTokens ? '...' : tokenData?.tokens || 0}
                      </span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your token balance - Click to redeem</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Desktop Search Component - Only visible on desktop */}
          {user && (
            <div className="hidden md:flex items-center relative">
              <div className={`flex items-center ${isSearchOpen ? 'w-64' : 'w-10'} transition-all duration-300 bg-gray-100 dark:bg-white rounded-full overflow-hidden`}>
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex items-center justify-center h-10 w-10 text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-800"
                >
                  <Search className="h-4 w-4" />
                </button>
                
                {isSearchOpen && (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search MoodLync..."
                    className="flex-1 h-10 px-2 bg-transparent border-none focus:outline-none text-sm dark:text-gray-800"
                  />
                )}
              </div>
            </div>
          )}
          
          {/* Mobile Search Component - Only visible on mobile */}
          {user && (
            <div className="flex md:hidden items-center relative">
              <div className={`flex items-center ${isSearchOpen ? 'w-32' : 'w-8'} transition-all duration-300 bg-gray-100 dark:bg-white rounded-full overflow-hidden`}>
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex items-center justify-center h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-800"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
                
                {isSearchOpen && (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 h-8 px-2 bg-transparent border-none focus:outline-none text-xs dark:text-gray-800"
                  />
                )}
              </div>
            </div>
          )}

          {/* Notification Bell - Always visible */}
          {user && (
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <NotificationBell />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          {/* Theme Toggle Button - Hidden on mobile, moved to account dropdown */}
          <div className="hidden md:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <ThemeToggle />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Theme</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full bg-gradient-to-r from-primary/90 to-secondary/90 dark:from-primary/80 dark:to-secondary/80 p-0.5 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-all duration-300 group">
                  <div className="absolute inset-0 bg-white dark:bg-black rounded-full scale-[0.96] group-hover:scale-[0.92] transition-transform"></div>
                  <span className="relative flex items-center justify-center w-10 h-10">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 opacity-50 group-hover:opacity-100 transition-opacity"></span>
                    <Avatar className="h-7 w-7 ring-2 ring-white dark:ring-black">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-medium text-sm">
                        {user?.username?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-black"></span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">My Account</span>
                  {user?.isPremium && (
                    <Badge variant="outline" className="h-5 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-[10px] font-bold">
                      PREMIUM
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/profile" className="w-full flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/profile#badges" className="w-full flex items-center">
                    <Award className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">My Badges</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/tokens" className="w-full flex items-center">
                    <Coins className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Token Redemption</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/milestones" className="w-full flex items-center">
                    <Award className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Token Milestones</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/nft-collection" className="w-full flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
                    <span className="truncate">NFT Collection</span>
                    {user?.isPremium && <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">Premium</Badge>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/community" className="w-full flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">Community Feed</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/premium" className="w-full flex items-center">
                    <Crown className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Premium Features</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/family" className="w-full flex items-center">
                    <Users className="h-4 w-4 mr-2 text-pink-400 flex-shrink-0" />
                    <span className="truncate">Family Plan</span>
                    {user?.isPremium && <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">Premium</Badge>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/referrals" className="w-full flex items-center">
                    <Share2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Invite Friends</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/videos" className="w-full flex items-center">
                    <Video className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Premium Videos</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/friends" className="w-full flex items-center">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Friend Book</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/emotional-imprints" className="w-full flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-pink-400 flex-shrink-0" />
                    <span className="truncate">Emotional Imprints</span>
                    {user?.isPremium && <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">Premium</Badge>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/community" className="w-full flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    <span className="truncate">Community Feed</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/contact" className="w-full flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Contact Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <div className="w-full">
                    <AppTestPanel />
                  </div>
                </DropdownMenuItem>
                {/* Mobile-only Theme Toggle in Dropdown */}
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem className="md:hidden flex items-center justify-between" asChild>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span>Theme</span>
                    </div>
                    <ThemeToggle />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>

      {/* Reward History Dialog */}
      <Dialog open={rewardHistoryOpen} onOpenChange={setRewardHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tokens & Rewards History</DialogTitle>
            <DialogDescription>
              Your current balance: <span className="font-bold text-primary">{isLoadingTokens ? '...' : tokenData?.tokens || 0} tokens</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoadingActivities ? (
              <div className="py-4 text-center">Loading your reward history...</div>
            ) : rewardActivities && rewardActivities.length > 0 ? (
              <div className="space-y-2">
                {rewardActivities.map(activity => (
                  <div key={activity.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-medium">{getActivityTypeLabel(activity.activityType)}</span>
                        <span className="text-sm text-muted-foreground">{activity.description}</span>
                        <span className="text-xs text-muted-foreground mt-1">{activity.createdAt}</span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        +{activity.tokensEarned} tokens
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                You haven't earned any rewards yet. Start by updating your emotion or creating a journal entry!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
