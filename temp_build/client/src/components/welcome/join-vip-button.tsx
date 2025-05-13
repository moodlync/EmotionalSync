import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

type JoinVipButtonProps = {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export function JoinVipButton({ 
  size = 'default', 
  variant = 'default', 
  className = '' 
}: JoinVipButtonProps) {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  const handleJoinClick = useCallback(() => {
    // Save the intended destination in sessionStorage
    sessionStorage.setItem('redirectAfterAuth', '/welcome#vip-membership');
    
    // Redirect to auth page if not logged in
    if (!user) {
      navigate('/auth');
    } else {
      // If already logged in, redirect directly to premium features
      navigate('/premium/features');
    }
  }, [user, navigate]);

  return (
    <Button 
      onClick={handleJoinClick}
      size={size}
      variant={variant}
      className={`group relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-300/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
      <div className="relative z-10 flex items-center justify-center">
        <Crown className="mr-2 h-4 w-4 text-amber-200 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        <span>Join VIP Membership</span>
        <span className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">✨</span>
      </div>
    </Button>
  );
}

export default JoinVipButton;