import { useSubscription } from '@/hooks/use-subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowRight, Calendar, Clock, CreditCard, Crown, Sparkles, Star } from 'lucide-react';

export default function SubscriptionBanner() {
  const { tier, expiryDate, isActive, isTrial, isLifetime, hasSpecialAccess } = useSubscription();
  const [, navigate] = useLocation();
  
  // Format the expiry date for display
  const formattedExpiryDate = expiryDate ? new Date(expiryDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : null;
  
  // Days remaining until expiry
  const daysRemaining = expiryDate ? Math.max(0, Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  
  // Return different banners based on subscription tier
  if (hasSpecialAccess) {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg p-4 text-white shadow-lg mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-white text-indigo-600 mb-2 font-semibold">Developer Access</Badge>
            <h3 className="text-xl font-bold mb-1">Full Feature Access Enabled</h3>
            <p className="opacity-90 mb-2">You have developer access to all MoodLync features and capabilities.</p>
          </div>
          <div className="hidden md:block">
            <Star className="h-12 w-12 text-white/20" />
          </div>
        </div>
      </div>
    );
  }
  
  if (tier === 'lifetime') {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white shadow-lg mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-white text-purple-600 mb-2 font-semibold">Lifetime Premium</Badge>
            <h3 className="text-xl font-bold mb-1">Unlimited Access Forever</h3>
            <p className="opacity-90 mb-2">Thank you for being a lifetime premium member. You have permanent access to all premium features.</p>
          </div>
          <div className="hidden md:block">
            <Crown className="h-12 w-12 text-white/20" />
          </div>
        </div>
      </div>
    );
  }
  
  if (tier === 'family') {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 text-white shadow-lg mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-white text-blue-600 mb-2 font-semibold">Family Plan</Badge>
            <h3 className="text-xl font-bold mb-1">Premium Family Features</h3>
            <p className="opacity-90 mb-2">Your family plan is active{expiryDate ? ` until ${formattedExpiryDate}` : ''}, unlocking premium features for your family.</p>
            {expiryDate && daysRemaining && daysRemaining < 7 && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => navigate('/premium')}
                >
                  Renew Now
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
          <div className="hidden md:flex flex-col items-end">
            {expiryDate && daysRemaining && (
              <div className="text-sm text-white/90 flex items-center mb-2">
                <Calendar className="mr-1.5 h-4 w-4" />
                <span>{daysRemaining} days remaining</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (tier === 'premium') {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg p-4 text-white shadow-lg mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-white text-amber-600 mb-2 font-semibold">Premium</Badge>
            <h3 className="text-xl font-bold mb-1">Premium Features Unlocked</h3>
            <p className="opacity-90 mb-2">Your premium subscription is active{expiryDate ? ` until ${formattedExpiryDate}` : ''}, enjoy all premium features.</p>
            {expiryDate && daysRemaining && daysRemaining < 7 && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => navigate('/premium')}
                >
                  Renew Now
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
          <div className="hidden md:flex flex-col items-end">
            {expiryDate && daysRemaining && (
              <div className="text-sm text-white/90 flex items-center mb-2">
                <Calendar className="mr-1.5 h-4 w-4" />
                <span>{daysRemaining} days remaining</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (tier === 'trial') {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white shadow-lg mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-white text-green-600 mb-2 font-semibold">Trial</Badge>
            <h3 className="text-xl font-bold mb-1">Premium Trial Active</h3>
            <p className="opacity-90 mb-2">Experience all premium features during your trial period{expiryDate ? ` ending on ${formattedExpiryDate}` : ''}.</p>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => navigate('/premium')}
              >
                Upgrade to Premium
                <Sparkles className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
            {expiryDate && daysRemaining && (
              <div className="text-sm text-white/90 flex items-center mb-2">
                <Clock className="mr-1.5 h-4 w-4" />
                <span>{daysRemaining} days remaining</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Free user banner
  return (
    <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 text-white shadow-lg mb-6">
      <div className="flex items-start justify-between">
        <div>
          <Badge className="bg-white text-gray-700 mb-2 font-semibold">Free Account</Badge>
          <h3 className="text-xl font-bold mb-1">Upgrade to Premium</h3>
          <p className="opacity-90 mb-2">Unlock advanced features, emotional NFTs, and premium benefits.</p>
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => navigate('/premium')}
            >
              See Premium Plans
              <CreditCard className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="hidden md:block">
          <Crown className="h-12 w-12 text-white/20" />
        </div>
      </div>
    </div>
  );
}