import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import confetti from 'canvas-confetti';
import { Heart, Sparkles, ArrowRight, Repeat, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Define the affirmation themes and their associated statements
const AFFIRMATION_THEMES = {
  "Self-Love": [
    "I am worthy of love and respect exactly as I am.",
    "I accept myself completely, with both my strengths and weaknesses.",
    "I treat myself with kindness and compassion.",
    "I honor my needs and take care of myself.",
    "I am enough just as I am, right now."
  ],
  "Confidence": [
    "I believe in myself and my abilities.",
    "I am capable of achieving my goals.",
    "I trust my decisions and inner wisdom.",
    "I speak with confidence and clarity.",
    "I embrace challenges as opportunities to grow."
  ],
  "Growth": [
    "I am constantly growing and evolving.",
    "I learn from my mistakes and become stronger.",
    "I welcome change as a positive force in my life.",
    "Every day I'm becoming a better version of myself.",
    "I am open to new possibilities and experiences."
  ],
  "Gratitude": [
    "I am grateful for all the good in my life.",
    "I appreciate the simple joys and blessings each day.",
    "My heart is filled with thankfulness.",
    "I notice and celebrate the abundance around me.",
    "I express gratitude even during challenging times."
  ],
  "Calm": [
    "I breathe in peace and breathe out tension.",
    "My mind is calm and my body is relaxed.",
    "I release worry and embrace tranquility.",
    "I am centered and grounded in this moment.",
    "Peace flows through me with each breath."
  ]
};

// Define the game's stages
type GameStage = 'intro' | 'theme-selection' | 'affirmation' | 'reflection' | 'complete';

export default function PositiveAffirmationGame({ 
  onComplete,
  tokenReward = 5
}: { 
  onComplete: (score: number) => void;
  tokenReward?: number;
}) {
  const [stage, setStage] = useState<GameStage>('intro');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [repeatedCount, setRepeatedCount] = useState(0);
  const [affirmationsCompleted, setAffirmationsCompleted] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [showCompletionEffect, setShowCompletionEffect] = useState(false);
  const { toast } = useToast();
  
  // Calculate the progress percentage
  useEffect(() => {
    if (stage === 'intro') {
      setProgress(0);
    } else if (stage === 'theme-selection') {
      setProgress(20);
    } else if (stage === 'affirmation') {
      // Calculate based on affirmations completed
      const total = selectedTheme ? AFFIRMATION_THEMES[selectedTheme].length : 5;
      const percentage = Math.min(80, 20 + (affirmationsCompleted.length / total) * 60);
      setProgress(percentage);
    } else if (stage === 'reflection') {
      setProgress(90);
    } else if (stage === 'complete') {
      setProgress(100);
    }
  }, [stage, affirmationsCompleted.length, selectedTheme]);
  
  const handleSelectTheme = (theme: string) => {
    setSelectedTheme(theme);
    setStage('affirmation');
    setCurrentAffirmationIndex(0);
    setAffirmationsCompleted([]);
  };
  
  const handleRepeatAffirmation = () => {
    setRepeatedCount(repeatedCount + 1);
    
    // Trigger confetti on third repeat
    if (repeatedCount === 2) {
      // Trigger confetti from the button
      const buttonElement = document.getElementById('repeat-button');
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: x / window.innerWidth, y: y / window.innerHeight },
          colors: ['#FFD700', '#FFC0CB', '#87CEFA'],
        });
      }
      
      // Add current affirmation to completed list
      if (selectedTheme) {
        const currentAffirmation = AFFIRMATION_THEMES[selectedTheme][currentAffirmationIndex];
        setAffirmationsCompleted(prev => [...prev, currentAffirmation]);
        
        // Check if all affirmations are completed
        if (affirmationsCompleted.length + 1 >= AFFIRMATION_THEMES[selectedTheme].length) {
          setStage('reflection');
        } else {
          // Move to next affirmation
          setCurrentAffirmationIndex((currentAffirmationIndex + 1) % AFFIRMATION_THEMES[selectedTheme].length);
        }
      }
      
      setRepeatedCount(0);
    }
  };
  
  const handleComplete = () => {
    setStage('complete');
    setShowCompletionEffect(true);
    
    // Trigger confetti celebration
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FFC0CB', '#87CEFA', '#98FB98', '#FFA07A'],
      startVelocity: 30,
      gravity: 0.5,
      shapes: ['circle', 'square'],
    });
    
    // Call the onComplete callback with score
    const score = Math.floor(80 + Math.random() * 20); // Score between 80-100
    setTimeout(() => {
      onComplete(score);
    }, 1500);
    
    toast({
      title: "Great job!",
      description: `You've earned ${tokenReward} tokens for completing your affirmations.`,
    });
  };
  
  // Render the game content based on the current stage
  const renderContent = () => {
    switch (stage) {
      case 'intro':
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Positive Affirmations</CardTitle>
              <CardDescription>
                Strengthen your mindset with powerful affirmations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Positive affirmations are powerful statements that can help reshape your thoughts 
                and mindset. In this exercise, you'll select a theme that resonates with you and 
                practice affirmations to build mental resilience.
              </p>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span>Improves emotional well-being</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>Reduces negative thought patterns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Builds lasting mental resilience</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setStage('theme-selection')} className="w-full">
                Start Exercise
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );
        
      case 'theme-selection':
        return (
          <>
            <CardHeader>
              <CardTitle>Choose Your Theme</CardTitle>
              <CardDescription>
                Select the theme that resonates with what you need today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(AFFIRMATION_THEMES).map(theme => (
                  <Button
                    key={theme}
                    variant="outline"
                    className="h-auto py-4 justify-start text-left flex-col items-start"
                    onClick={() => handleSelectTheme(theme)}
                  >
                    <span className="font-semibold text-lg">{theme}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {theme === "Self-Love" && "Embrace and accept yourself"}
                      {theme === "Confidence" && "Build belief in your abilities"}
                      {theme === "Growth" && "Embrace change and development"}
                      {theme === "Gratitude" && "Appreciate life's gifts"}
                      {theme === "Calm" && "Find peace amid chaos"}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStage('intro')}>
                Go Back
              </Button>
            </CardFooter>
          </>
        );
        
      case 'affirmation':
        if (!selectedTheme) return null;
        
        const currentAffirmation = AFFIRMATION_THEMES[selectedTheme][currentAffirmationIndex];
        const affirmationNumber = currentAffirmationIndex + 1;
        const totalAffirmations = AFFIRMATION_THEMES[selectedTheme].length;
        
        return (
          <>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedTheme}</CardTitle>
                  <CardDescription>
                    Affirmation {affirmationNumber} of {totalAffirmations}
                  </CardDescription>
                </div>
                <div className="text-xs text-muted-foreground">
                  Repeat 3× to continue
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-8">
              <div className="bg-gradient-to-r from-violet-100 to-pink-100 dark:from-violet-950 dark:to-pink-950 p-6 rounded-lg w-full">
                <p className="text-xl font-medium leading-relaxed">
                  "{currentAffirmation}"
                </p>
              </div>
              
              <div className="flex space-x-3 items-center">
                {[0, 1, 2].map(index => (
                  <div 
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < repeatedCount ? 'bg-primary' : 'bg-secondary'
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                id="repeat-button"
                onClick={handleRepeatAffirmation}
                size="lg"
                className="rounded-full px-8"
              >
                <Repeat className="mr-2 h-4 w-4" />
                Say it out loud
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStage('theme-selection')}>
                Change Theme
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (affirmationsCompleted.length > 0 || repeatedCount >= 2) {
                    setStage('reflection');
                  } else {
                    toast({
                      title: "Keep going!",
                      description: "Try to complete at least one affirmation first.",
                      variant: "default"
                    });
                  }
                }}
              >
                Skip to Reflection
              </Button>
            </CardFooter>
          </>
        );
        
      case 'reflection':
        return (
          <>
            <CardHeader>
              <CardTitle>Reflect on Your Experience</CardTitle>
              <CardDescription>
                Take a moment to notice how you feel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                You've completed {affirmationsCompleted.length} affirmations in the "{selectedTheme}" theme.
                How do you feel now compared to when you started?
              </p>
              
              <div className="space-y-4">
                <h4 className="font-medium">Affirmations you practiced:</h4>
                <ul className="space-y-2">
                  {affirmationsCompleted.map((affirmation, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>"{affirmation}"</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm italic">
                  Remember: Affirmations work best when practiced regularly. Try incorporating 
                  these statements into your daily routine for best results.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleComplete} className="w-full">
                Complete Exercise
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );
        
      case 'complete':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Exercise Complete!
              </CardTitle>
              <CardDescription>
                Great job strengthening your mindset
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-20 ${showCompletionEffect ? 'animate-ping' : ''}`}></div>
                <div className="absolute inset-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-20"></div>
                <Sparkles className="h-16 w-16 text-purple-500" />
              </div>
              
              <div>
                <p className="text-xl font-medium mb-2">You've earned {tokenReward} tokens!</p>
                <p className="text-muted-foreground">
                  Continue practicing affirmations daily for best results.
                  Remember, consistency is key to building mental resilience.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => setStage('theme-selection')}>
                Try Another Theme
              </Button>
            </CardFooter>
          </>
        );
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <Progress value={progress} className="h-2" />
      </div>
      <Card className="border-2">
        {renderContent()}
      </Card>
    </div>
  );
}