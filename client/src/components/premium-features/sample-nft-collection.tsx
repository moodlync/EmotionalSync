import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Award, Star, Crown, Trophy } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

// Import emotion-based NFT images from assets
import emotionalNFT1 from "@assets/individual Emotional NFt 1.jpg";
import badMoodNFT from "@assets/individual bad mood Emotional NFt 2.jpg";
import angerNFT from "@assets/individual for Anger Emotional NFt.jpg";
import surpriseNFT from "@assets/individual for Surprise Emotional NFt.jpg";
import emotionalDigitalCollectibles from "@assets/Create a very unique image for Emotional NFTs_Exclusive Digital Collectibles_Premium members earn unique NFTs that evolve with your emotional journey.jpg";

interface SampleNFT {
  id: number;
  name: string;
  description: string;
  imageUrl: string; 
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  benefit: string;
  emotionType?: string;
}

const sampleNFTs: SampleNFT[] = [
  {
    id: 1,
    name: "Joy Essence",
    description: "Awarded for maintaining a 7-day streak of joy entries in your emotional journal. This NFT radiates positive energy.",
    imageUrl: emotionalNFT1,
    rarity: 'uncommon',
    benefit: "+8% token earnings for activities done in joyful state",
    emotionType: "Joy"
  },
  {
    id: 2,
    name: "Reflection Tree",
    description: "Evolved from Consistency Seed after 30 days of journaling. This NFT reflects your growing emotional awareness.",
    imageUrl: emotionalDigitalCollectibles,
    rarity: 'rare',
    benefit: "+10% token earnings for 2 weeks",
    emotionType: "Varied"
  },
  {
    id: 3,
    name: "Anger Management",
    description: "Earned by successfully managing and reducing anger patterns over time. Represents emotional growth and control.",
    imageUrl: angerNFT,
    rarity: 'epic',
    benefit: "Access to special anger management resources",
    emotionType: "Anger"
  },
  {
    id: 4,
    name: "Surprise Discovery",
    description: "Awarded when you discover unexpected emotional patterns through consistent journaling and self-reflection.",
    imageUrl: surpriseNFT,
    rarity: 'uncommon',
    benefit: "+5% discovery bonus for finding new emotional insights",
    emotionType: "Surprise"
  },
  {
    id: 5,
    name: "Serenity Pool",
    description: "Awarded for consistent meditation practice and reduced stress levels. Creates a digital peace sanctuary.",
    imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3499?q=80&w=2940&auto=format&fit=crop",
    rarity: 'rare',
    benefit: "Access to exclusive guided meditation content",
    emotionType: "Calm"
  },
  {
    id: 6,
    name: "Empathy Nexus",
    description: "Earned by helping others through community support and positive interactions. Strengthens social connections.",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2940&auto=format&fit=crop",
    rarity: 'epic',
    benefit: "Priority matching with users sharing similar emotional journeys",
    emotionType: "Empathy"
  },
  {
    id: 7,
    name: "Melancholy Mastery",
    description: "Created after overcoming periods of sadness through healthy coping mechanisms. A visual reminder of your resilience.",
    imageUrl: badMoodNFT,
    rarity: 'legendary',
    benefit: "Permanent +5% boost to all emotional growth rewards",
    emotionType: "Sadness"
  },
  {
    id: 8,
    name: "Emotional Balance",
    description: "The highest evolution of emotional NFTs, representing mastery of emotional regulation across all feeling states.",
    imageUrl: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?q=80&w=2940&auto=format&fit=crop",
    rarity: 'legendary',
    benefit: "Voting rights on platform features and 15% token earnings boost",
    emotionType: "Balance"
  },
  {
    id: 9,
    name: "Gratitude Prism",
    description: "Manifests from consistent gratitude journaling, capturing the spectrum of positive experiences in your life.",
    imageUrl: "https://images.unsplash.com/photo-1474623809196-26c1d33457cc?q=80&w=2940&auto=format&fit=crop",
    rarity: 'uncommon',
    benefit: "Weekly token bonuses based on continued gratitude practices",
    emotionType: "Gratitude"
  },
  {
    id: 10,
    name: "Resilience Blossom",
    description: "Awarded for 30 anxiety-free days or significant improvement in mood patterns. Grants special perks for mental wellness.",
    imageUrl: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?q=80&w=2940&auto=format&fit=crop",
    rarity: 'epic',
    benefit: "Free therapy session discount",
    emotionType: "Resilience"
  },
  {
    id: 11,
    name: "Excitement Peak",
    description: "Celebrates periods of healthy excitement and anticipation. This NFT captures the exhilarating feeling of positive anticipation.",
    imageUrl: "https://images.unsplash.com/photo-1570051008600-b34baa49e751?q=80&w=2940&auto=format&fit=crop",
    rarity: 'rare',
    benefit: "+10% boost to rewards during excited emotional states",
    emotionType: "Excitement"
  },
  {
    id: 12,
    name: "Calm Waters",
    description: "Earned through consistent practice of mindfulness and maintaining emotional equilibrium during challenging situations.",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2940&auto=format&fit=crop",
    rarity: 'uncommon',
    benefit: "Enhanced mood stabilization features",
    emotionType: "Calm"
  }
];

export default function SampleNftCollection() {
  const [_, navigate] = useLocation();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'uncommon': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rare': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'epic': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'legendary': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Helper function to get emotion-based glow effect
  const getEmotionGlow = (emotionType?: string) => {
    if (!emotionType) return "";
    
    switch (emotionType.toLowerCase()) {
      case "joy":
        return "shadow-[0_0_15px_rgba(251,191,36,0.5)]";
      case "sadness":
        return "shadow-[0_0_15px_rgba(59,130,246,0.5)]";
      case "anger":
        return "shadow-[0_0_15px_rgba(239,68,68,0.5)]";
      case "surprise":
        return "shadow-[0_0_15px_rgba(168,85,247,0.5)]";
      case "varied":
        return "shadow-[0_0_15px_rgba(124,58,237,0.5)]";
      case "empathy":
        return "shadow-[0_0_15px_rgba(236,72,153,0.5)]";
      case "calm":
        return "shadow-[0_0_15px_rgba(20,184,166,0.5)]";
      case "balance":
        return "shadow-[0_0_15px_rgba(79,70,229,0.5)]";
      case "gratitude":
        return "shadow-[0_0_15px_rgba(217,119,6,0.5)]";
      case "resilience":
        return "shadow-[0_0_15px_rgba(5,150,105,0.5)]";
      case "excitement":
        return "shadow-[0_0_15px_rgba(249,115,22,0.5)]";
      default:
        return "shadow-[0_0_15px_rgba(147,51,234,0.3)]";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
          Emotional NFT Collection
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          These exclusive digital collectibles represent emotional milestones and evolve with your journey.
          Sign up as a premium member to start earning these NFTs.
        </p>
        
        <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-8">
          <Badge variant="outline" className="bg-primary/10 text-primary px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Premium Feature
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary px-3 py-1">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Exclusive Benefits
          </Badge>
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1">
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            Emotion-Driven
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1">
            <Trophy className="w-3.5 h-3.5 mr-1.5" />
            Milestone Rewards
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {sampleNFTs.map((nft) => (
          <Card 
            key={nft.id} 
            className={`overflow-hidden h-full flex flex-col bg-card/50 backdrop-blur-sm 
                       border-primary/10 hover:border-primary/20 transition-all duration-300
                       hover:translate-y-[-5px] ${getEmotionGlow(nft.emotionType)}`}
          >
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={nft.imageUrl} 
                alt={nft.name} 
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{nft.name}</CardTitle>
                <Badge className={getRarityColor(nft.rarity)}>
                  {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                </Badge>
              </div>
              {nft.emotionType && (
                <div className="mt-1 mb-1">
                  <Badge variant="outline" className="bg-secondary/5 text-secondary text-xs">
                    {nft.emotionType} Emotion
                  </Badge>
                </div>
              )}
              <CardDescription>{nft.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2 pt-0">
              <div className="bg-primary/5 p-2 rounded-md flex items-center">
                <Star className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium">{nft.benefit}</span>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-2">
              <div className="text-xs text-muted-foreground">
                <span className="block mb-1">This is a preview. Sign up as a premium member to start earning NFTs.</span>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/auth")}>
                  Join MoodSync Premium
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
          <Card className="p-6 max-w-md bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-100 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="rounded-full p-3 bg-blue-100/70 dark:bg-blue-900/30">
                <Sparkles className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">Auto-Generated NFTs</h3>
                <p className="text-sm text-blue-800/80 dark:text-blue-400/80">
                  Premium members receive unique NFTs based on their emotional journey and achievements
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 max-w-md bg-gradient-to-r from-green-50/80 to-teal-50/80 dark:from-green-950/30 dark:to-teal-950/30 border-green-100 dark:border-green-800">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="rounded-full p-3 bg-green-100/70 dark:bg-green-900/30">
                <Award className="h-5 w-5 text-green-700 dark:text-green-400" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-green-900 dark:text-green-300">Real-World Benefits</h3>
                <p className="text-sm text-green-800/80 dark:text-green-400/80">
                  NFTs unlock special platform features and access to exclusive wellness content
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          size="lg"
          onClick={() => navigate("/auth")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Become a Premium Member
        </Button>
      </div>
    </div>
  );
}