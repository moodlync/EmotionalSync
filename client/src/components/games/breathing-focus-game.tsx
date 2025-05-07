import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { HeartPulse, Play, Pause, SkipForward } from 'lucide-react';

// Levels of breathing exercise
const BREATHING_EXERCISES = [
  {
    id: 'beginner',
    title: 'Calm Focus',
    description: 'A gentle introduction to mindful breathing',
    instruction: '4-7-8 Technique',
    inhaleDuration: 4000,
    holdDuration: 7000,
    exhaleDuration: 8000,
    cycles: 3,
    tokenReward: 8
  },
  {
    id: 'intermediate',
    title: 'Deep Renewal',
    description: 'Deeper breaths for energy restoration',
    instruction: 'Box Breathing',
    inhaleDuration: 4000,
    holdDuration: 4000,
    exhaleDuration: 4000,
    holdAfterExhaleDuration: 4000,
    cycles: 4,
    tokenReward: 12
  },
  {
    id: 'advanced',
    title: 'Stress Release',
    description: 'Advanced technique for tension relief',
    instruction: 'Progressive Release',
    inhaleDuration: 5000,
    holdDuration: 2000,
    exhaleDuration: 8000,
    cycles: 5,
    tokenReward: 15
  }
];

// Simple stub implementation
export default function BreathingFocusGame({ 
  onComplete,
  sessionDuration = 180
}: { 
  onComplete: (score: number) => void;
  sessionDuration?: number;
}) {
  const [selectedExercise, setSelectedExercise] = useState(BREATHING_EXERCISES[0]);
  const [stage, setStage] = useState<'selection' | 'preparation' | 'exercise' | 'completion'>('selection');
  const [breathingState, setBreathingState] = useState<'inhale' | 'hold' | 'exhale' | 'hold-after-exhale'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [countdownCounter, setCountdownCounter] = useState(3);
  
  const timerRef = useRef<number | null>(null);
  const breathingTimerRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Handle exercise selection
  const handleSelectExercise = (exercise: any) => {
    setSelectedExercise(exercise);
    setStage('preparation');
    setCountdownCounter(3);
  };
  
  // Handle preparation countdown
  useEffect(() => {
    if (stage === 'preparation' && countdownCounter > 0) {
      const timer = setTimeout(() => {
        setCountdownCounter(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (stage === 'preparation' && countdownCounter === 0) {
      // Start exercise
      setStage('exercise');
      setTimeRemaining(sessionDuration);
      setBreathingState('inhale');
      setCycleCount(0);
    }
  }, [stage, countdownCounter, sessionDuration]);
  
  // Handle main exercise timer
  useEffect(() => {
    if (stage === 'exercise' && !isPaused && timeRemaining > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
        setProgress((1 - (timeRemaining - 1) / sessionDuration) * 100);
      }, 1000);
      
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (timeRemaining === 0 && stage === 'exercise') {
      // Exercise complete
      setStage('completion');
      
      // Calculate score
      const baseScore = selectedExercise.tokenReward * 10;
      const completionBonus = cycleCount * 50;
      const finalScore = baseScore + completionBonus;
      setTotalScore(finalScore);
      
      // Show completion toast
      toast({
        title: "Breathing Exercise Complete!",
        description: `Great job! You've completed ${cycleCount} breathing cycles.`,
      });
      
      // Call the completion callback
      setTimeout(() => {
        onComplete(finalScore);
      }, 1500);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stage, isPaused, timeRemaining, sessionDuration, cycleCount, selectedExercise, toast, onComplete]);
  
  // Handle breathing cycle
  useEffect(() => {
    if (stage === 'exercise' && !isPaused) {
      let duration = 0;
      
      switch (breathingState) {
        case 'inhale':
          duration = selectedExercise.inhaleDuration;
          break;
        case 'hold':
          duration = selectedExercise.holdDuration;
          break;
        case 'exhale':
          duration = selectedExercise.exhaleDuration;
          break;
        case 'hold-after-exhale':
          duration = selectedExercise.holdAfterExhaleDuration || 0;
          break;
      }
      
      breathingTimerRef.current = window.setTimeout(() => {
        // Determine next state
        let nextState: 'inhale' | 'hold' | 'exhale' | 'hold-after-exhale';
        let cycleIncrement = 0;
        
        switch (breathingState) {
          case 'inhale':
            nextState = 'hold';
            break;
          case 'hold':
            nextState = 'exhale';
            break;
          case 'exhale':
            if (selectedExercise.holdAfterExhaleDuration) {
              nextState = 'hold-after-exhale';
            } else {
              nextState = 'inhale';
              cycleIncrement = 1;
            }
            break;
          case 'hold-after-exhale':
            nextState = 'inhale';
            cycleIncrement = 1;
            break;
          default:
            nextState = 'inhale';
        }
        
        setBreathingState(nextState);
        if (cycleIncrement) {
          setCycleCount(prev => prev + 1);
        }
      }, duration);
      
      return () => {
        if (breathingTimerRef.current) clearTimeout(breathingTimerRef.current);
      };
    }
  }, [breathingState, stage, isPaused, selectedExercise]);
  
  // Render instructions based on current breathing state
  const renderBreathingInstructions = () => {
    switch (breathingState) {
      case 'inhale':
        return (
          <div className="text-center">
            <div className="text-3xl font-semibold text-blue-500 dark:text-blue-400 mb-4">Inhale</div>
            <div 
              className="w-32 h-32 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center animate-pulse"
              style={{ animationDuration: `${selectedExercise.inhaleDuration}ms` }}
            >
              <div className="w-24 h-24 rounded-full bg-blue-500/20 dark:bg-blue-500/40"></div>
            </div>
            <div className="mt-4 text-muted-foreground">
              Breathe in slowly through your nose
            </div>
          </div>
        );
      case 'hold':
        return (
          <div className="text-center">
            <div className="text-3xl font-semibold text-amber-500 dark:text-amber-400 mb-4">Hold</div>
            <div className="w-32 h-32 mx-auto rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-amber-500/20 dark:bg-amber-500/40"></div>
            </div>
            <div className="mt-4 text-muted-foreground">
              Hold your breath comfortably
            </div>
          </div>
        );
      case 'exhale':
        return (
          <div className="text-center">
            <div className="text-3xl font-semibold text-emerald-500 dark:text-emerald-400 mb-4">Exhale</div>
            <div 
              className="w-32 h-32 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center"
              style={{ animation: `shrink ${selectedExercise.exhaleDuration}ms ease-in-out` }}
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 dark:bg-emerald-500/40"></div>
            </div>
            <div className="mt-4 text-muted-foreground">
              Breathe out slowly through your mouth
            </div>
          </div>
        );
      case 'hold-after-exhale':
        return (
          <div className="text-center">
            <div className="text-3xl font-semibold text-purple-500 dark:text-purple-400 mb-4">Rest</div>
            <div className="w-32 h-32 mx-auto rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-500/40"></div>
            </div>
            <div className="mt-4 text-muted-foreground">
              Pause briefly before inhaling again
            </div>
          </div>
        );
    }
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render different stages
  const renderContent = () => {
    switch (stage) {
      case 'selection':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HeartPulse className="mr-2 h-5 w-5" />
                Breathing Focus Exercise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Select a breathing exercise that matches your current needs.
                Each exercise provides different benefits for your mental well-being.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BREATHING_EXERCISES.map(exercise => (
                  <Card 
                    key={exercise.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectExercise(exercise)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                      <div className="text-xs">
                        <div className="flex justify-between">
                          <span>Technique:</span>
                          <span>{exercise.instruction}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{exercise.cycles} cycles</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reward:</span>
                          <span>{exercise.tokenReward} tokens</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
        
      case 'preparation':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">{selectedExercise.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="text-4xl font-bold mb-4">{countdownCounter}</div>
              <p className="text-muted-foreground">
                Find a comfortable position and get ready to begin...
              </p>
            </CardContent>
          </Card>
        );
        
      case 'exercise':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{selectedExercise.title}</CardTitle>
                <div className="text-sm font-mono">{formatTime(timeRemaining)}</div>
              </div>
              <div className="w-full bg-secondary h-1 mt-2">
                <div 
                  className="bg-primary h-1 transition-all" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </CardHeader>
            <CardContent className="py-8">
              {renderBreathingInstructions()}
              
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span>Cycle:</span>
                  <span className="font-medium">{cycleCount + 1}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-4">
              <Button
                variant="outline" 
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setStage('completion')}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 'completion':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Exercise Complete!</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  <HeartPulse className="h-12 w-12" />
                </div>
              </div>
              
              <h3 className="text-xl font-medium mb-4">Great job!</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Total Time:</span>
                  <span>{formatTime(sessionDuration - timeRemaining)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Breathing Cycles:</span>
                  <span>{cycleCount}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Tokens Earned:</span>
                  <span>{selectedExercise.tokenReward}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm">
                How do you feel now? Take a moment to notice the difference in your mind and body.
              </p>
            </CardContent>
            <CardFooter className="flex space-x-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setStage('selection')}
              >
                Try Another Exercise
              </Button>
              <Button 
                className="w-full"
                onClick={() => onComplete(totalScore)}
              >
                Finish
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };
  
  return (
    <div className="py-6">
      {renderContent()}
      
      <style jsx global>{`
        @keyframes shrink {
          from { transform: scale(1); }
          to { transform: scale(0.65); }
        }
      `}</style>
    </div>
  );
}