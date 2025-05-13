import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { emotions, EmotionType } from '@/lib/emotions';

/**
 * MoodHub - A central hub for accessing all emotion-related features
 */
export default function MoodHub() {
  const { toast } = useToast();
  
  const handleFeatureNotReady = () => {
    toast({
      title: "Feature Coming Soon",
      description: "This feature is still under development and will be available soon!",
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
          Emotion Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your central destination for all emotion-related tools, insights, and connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Emotion Tracking Card */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Emotion Tracking</CardTitle>
            <CardDescription>Record and monitor your emotional journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(emotions).map((emotion) => (
                <span 
                  key={emotion} 
                  className={`text-xs px-2 py-1 rounded-full ${emotions[emotion as EmotionType].backgroundColor}`}
                >
                  {emotions[emotion as EmotionType].name}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Track your emotions over time and gain insights into your emotional patterns and triggers.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/emotion-tracker">
              <Button className="w-full">Track Now</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Mood-Based Chat Card */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Mood-Based Chat</CardTitle>
            <CardDescription>Connect with others feeling similar emotions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Join chat rooms based on your current emotional state and connect with others who understand exactly how you feel.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleFeatureNotReady}>Enter Chat</Button>
          </CardFooter>
        </Card>

        {/* Emotional Journal Card */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Emotional Journal</CardTitle>
            <CardDescription>Document your emotional experiences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Keep a private journal of your emotional experiences, triggers, and reflections to promote greater self-awareness.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/journal">
              <Button className="w-full">Start Writing</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Global Emotion Map Card */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Global Emotion Map</CardTitle>
            <CardDescription>See emotions around the world</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Explore a real-time visualization of emotions being experienced by users across the globe.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleFeatureNotReady}>View Map</Button>
          </CardFooter>
        </Card>

        {/* Token Economy Card */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Token Economy</CardTitle>
            <CardDescription>Earn rewards for emotional growth</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Earn tokens through consistent tracking, journaling, and participation that can be redeemed for premium features.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/token-center">
              <Button className="w-full">Token Center</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Emotional NFTs Card */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Emotional NFTs</CardTitle>
            <CardDescription>Exclusive digital collectibles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Premium members earn unique NFTs that evolve with your emotional journey and reflect your growth.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleFeatureNotReady}>View Collection</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}