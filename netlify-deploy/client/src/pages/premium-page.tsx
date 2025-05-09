import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import PremiumSubscriptionTab from '@/components/premium/premium-subscription-tab';
import AdvertisementSection from '@/components/premium/advertisement-section';
import ChallengeCreator from '@/components/challenges/challenge-creator';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Star, Crown, Award, Users, Swords, Palette, Bell, Pin, Shield, Megaphone, Coins } from 'lucide-react';

export default function PremiumPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('subscription');

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Premium Features</h1>
        <p className="text-muted-foreground mt-2">
          Unlock enhanced emotional wellness tools and exclusive features
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[40rem] grid-cols-5">
          <TabsTrigger value="subscription">
            <Crown className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="features">
            <Star className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Award className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="family">
            <Users className="h-4 w-4 mr-2 text-pink-400" />
            Family Plan
          </TabsTrigger>
          <TabsTrigger value="advertisements">
            <Megaphone className="h-4 w-4 mr-2" />
            Advertise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="pt-6">
          <div className="grid grid-cols-1 gap-6">
            <PremiumSubscriptionTab />
          </div>
        </TabsContent>
        
        <TabsContent value="features" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              title="Private Chat Rooms" 
              description="Create private, invitation-only chat rooms for your closest friends and family"
              icon={<Users className="h-6 w-6" />}
              isPremium={true}
            />
            <FeatureCard 
              title="User Blocking" 
              description="Block any users that are bothering you and customize your experience"
              icon={<Shield className="h-6 w-6" />}
              isPremium={true}
            />
            <FeatureCard 
              title="Custom Theme Colors" 
              description="Personalize the app with your favorite colors and visual preferences"
              icon={<Palette className="h-6 w-6" />}
              isPremium={true}
            />
            <FeatureCard 
              title="Create Challenges" 
              description="Design custom wellness challenges for the community and earn tokens"
              icon={<Award className="h-6 w-6" />}
              isPremium={true}
              linkTo="/user-challenges"
            />
            <FeatureCard 
              title="Advanced Notifications" 
              description="Customize which notifications you receive and how they're delivered"
              icon={<Bell className="h-6 w-6" />}
              isPremium={true}
            />
            <FeatureCard 
              title="Pin Important Content" 
              description="Save and organize valuable resources, posts, and conversations"
              icon={<Pin className="h-6 w-6" />}
              isPremium={true}
            />
            <FeatureCard 
              title="Family Plan" 
              description="Connect with family members, monitor their wellness (with consent), and share tokens"
              icon={<Users className="h-6 w-6" />}
              isPremium={true}
              linkTo="/family"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="challenges" className="pt-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                Premium Challenge Creation
              </h2>
              <p className="text-muted-foreground mb-6">
                As a premium member, you can create custom challenges for the community. 
                When users complete your challenges, you'll earn 3 tokens for each completion!
              </p>
              
              <div className="flex space-x-4">
                <Button asChild>
                  <Link to="/user-challenges">
                    <Swords className="h-4 w-4 mr-2" />
                    Browse Community Challenges
                  </Link>
                </Button>
              </div>
            </div>
            
            <ChallengeCreator />
          </div>
        </TabsContent>
        
        <TabsContent value="family" className="pt-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Users className="h-5 w-5 mr-2 text-pink-500" />
                Family Wellness Connection
              </h2>
              <p className="text-muted-foreground mb-4">
                Our Family Plan allows you to connect with up to 5 family members to track and support their emotional well-being with their explicit consent.
                Share tokens, monitor moods, and stay connected in a meaningful way.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-pink-600">Annual Family Plan</h3>
                  <p className="text-2xl font-bold mb-1">$149.99<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                  <p className="text-sm text-muted-foreground mb-4">For families looking for ongoing support</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-0.5 mr-2 mt-0.5">
                        <svg className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-sm">Up to 5 family members</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-0.5 mr-2 mt-0.5">
                        <svg className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-sm">Consent-based mood tracking</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-0.5 mr-2 mt-0.5">
                        <svg className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-sm">Token transfer between members</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                    <Link to="/family">
                      Start Family Plan
                    </Link>
                  </Button>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-purple-600">Lifetime Family Plan</h3>
                  <p className="text-2xl font-bold mb-1">$349.99</p>
                  <p className="text-sm text-muted-foreground mb-4">One-time payment, lifetime access</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-0.5 mr-2 mt-0.5">
                        <svg className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-sm">All Family Plan features</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-0.5 mr-2 mt-0.5">
                        <svg className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-sm">Never pay again</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-0.5 mr-2 mt-0.5">
                        <svg className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-sm">All future updates included</span>
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                    <Link to="/family">
                      Get Lifetime Access
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-5">
                <Shield className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-medium mb-2">Enhanced Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  All mood tracking is consent-based. Family members must explicitly approve what data you can see.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-5">
                <Bell className="h-8 w-8 text-amber-500 mb-3" />
                <h3 className="font-medium mb-2">Crisis Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Receive notifications if family members experience significant emotional changes (if they allow it).
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-5">
                <Coins className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-medium mb-2">Token Sharing</h3>
                <p className="text-sm text-muted-foreground">
                  Share tokens between family members and manage redemption from a single account.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <Link to="/family">
                  Explore Family Plan
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advertisements" className="pt-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Megaphone className="h-5 w-5 mr-2 text-primary" />
                Premium Advertisement Management
              </h2>
              <p className="text-muted-foreground mb-6">
                As a premium user, you can create and manage advertisements for health-related services or programs. 
                Connect with the community and promote your wellness offerings!
              </p>
            </div>
            
            <AdvertisementSection />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isPremium: boolean;
  linkTo?: string;
}

function FeatureCard({ title, description, icon, isPremium, linkTo }: FeatureCardProps) {
  const card = (
    <div className={`bg-card border rounded-lg p-6 h-full flex flex-col ${isPremium ? 'bg-primary/5 border-primary/20' : ''}`}>
      <div className={`p-2 rounded-full w-fit mb-4 ${isPremium ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2 flex items-center">
        {title}
        {isPremium && <Crown className="h-4 w-4 ml-2 text-amber-500" />}
      </h3>
      <p className="text-muted-foreground text-sm flex-1">{description}</p>
      
      {linkTo && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={linkTo}>
              <span>Access Feature</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
  
  return linkTo ? card : card;
}