import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { PremiumUpgradeButton } from '@/components/ui/premium-upgrade-button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Fingerprint, ArrowRight, Check } from 'lucide-react';

export default function EmotionalImprintsFeature() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500" />
          <CardHeader>
            <CardTitle className="flex items-center">
              <Fingerprint className="h-5 w-5 mr-2 text-pink-500" />
              Emotional Imprints
            </CardTitle>
            <CardDescription>
              Create multi-sensory snapshots of emotional states and share them with others.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Emotional Imprints combine colors, sounds, and haptic feedback to create 
                a rich, immersive way to capture and share your emotional experiences.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 relative top-0.5">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Create personal imprints</span> that combine color, sound, and vibration 
                      to represent emotions in a unique multi-sensory way
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 relative top-0.5">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Share your emotional states</span> with friends and loved ones
                      in a more profound way than simple text or emojis
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 relative top-0.5">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Create template imprints</span> to quickly capture 
                      recurring emotional states without repeating setup
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 relative top-0.5">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Build your emotional vocabulary</span> beyond the 
                      limitations of words with this innovative new medium
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/emotional-imprints">
              <Button className="w-full">
                Explore Emotional Imprints
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-3">
                <li className="text-sm">
                  <span className="font-medium">Create an imprint</span> by selecting an emotion, color, 
                  optional sound, and vibration pattern
                </li>
                <li className="text-sm">
                  <span className="font-medium">Experience your imprint</span> through a multi-sensory preview
                  combining visual, auditory, and haptic feedback
                </li>
                <li className="text-sm">
                  <span className="font-medium">Save and share</span> your emotional imprints with others in 
                  your network or keep them private for self-reflection
                </li>
                <li className="text-sm">
                  <span className="font-medium">Mark favorites as templates</span> to quickly create similar
                  imprints in the future
                </li>
                <li className="text-sm">
                  <span className="font-medium">Build an emotional vocabulary</span> that captures the nuances 
                  of your experiences beyond words alone
                </li>
              </ol>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Premium Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Emotional Imprints is an exclusive premium feature, 
                designed to enhance your emotional experience and interpersonal connections.
              </p>
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-md p-4 text-sm text-rose-800">
                <p className="font-medium">Unlock with Premium subscription</p>
                <p className="text-xs mt-1 opacity-80 mb-3">Included in all premium tiers</p>
                <PremiumUpgradeButton size="sm" fullWidth>
                  Unlock Emotional Imprints
                </PremiumUpgradeButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}