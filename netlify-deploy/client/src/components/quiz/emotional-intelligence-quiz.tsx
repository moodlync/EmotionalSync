import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { 
  emotionalIntelligenceQuestions, 
  calculateCategoryScores,
  getQuizResult,
  getCategoryLabel,
  getCategoryDescription,
  type QuizQuestion
} from '@/data/emotional-intelligence-quiz';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2,
  BookOpen,
  BrainCircuit,
  Lightbulb,
  Heart,
  Users,
  ChevronLeft, 
  ChevronRight,
  Trophy,
  Sparkles
} from 'lucide-react';

// Predefined colors for the different categories
const categoryColors: Record<string, string> = {
  'self-awareness': 'bg-blue-500',
  'self-regulation': 'bg-purple-500',
  'motivation': 'bg-amber-500',
  'empathy': 'bg-pink-500',
  'social-skills': 'bg-green-500'
};

// Category icons
const categoryIcons: Record<string, JSX.Element> = {
  'self-awareness': <BrainCircuit className="h-5 w-5" />,
  'self-regulation': <BookOpen className="h-5 w-5" />,
  'motivation': <Lightbulb className="h-5 w-5" />,
  'empathy': <Heart className="h-5 w-5" />,
  'social-skills': <Users className="h-5 w-5" />
};

export function EmotionalIntelligenceQuiz() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for quiz progress and answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Results state
  const [results, setResults] = useState<{
    totalScore: number;
    categoryScores: Record<string, number>;
    categoryPercentages: Record<string, number>;
  } | null>(null);
  
  // Quiz metadata
  const totalQuestions = emotionalIntelligenceQuestions.length;
  const currentQuestion = emotionalIntelligenceQuestions[currentQuestionIndex];
  const progress = Math.round((Object.keys(answers).length / totalQuestions) * 100);
  
  // Effect to calculate results when all questions are answered
  useEffect(() => {
    if (Object.keys(answers).length === totalQuestions && quizStarted) {
      setResults(calculateCategoryScores(answers));
    }
  }, [answers, quizStarted]);
  
  // Handle selecting an answer
  const handleSelectAnswer = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (Object.keys(answers).length === totalQuestions) {
      setShowResults(true);
    }
  };
  
  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Save quiz results to user profile
  const handleSaveResults = async () => {
    if (!user || !results) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare data to send to server
      const resultData = {
        totalScore: results.totalScore,
        categoryScores: results.categoryPercentages,
        completedAt: new Date().toISOString(),
      };
      
      // Send to API
      const response = await apiRequest('POST', '/api/emotional-intelligence/results', resultData);
      
      if (response.ok) {
        toast({
          title: "Results saved!",
          description: "Your emotional intelligence assessment has been saved to your profile.",
          variant: "default"
        });
        
        // Give tokens for completing quiz
        const tokenResponse = await apiRequest('POST', '/api/rewards/add', {
          amount: 25,
          reason: 'Completed Emotional Intelligence Quiz'
        });
        
        if (tokenResponse.ok) {
          toast({
            title: "Tokens earned!",
            description: "You've earned 25 tokens for completing the quiz.",
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Failed to save results",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error saving results",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Restart the quiz
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
    setQuizStarted(true);
  };
  
  // Render the introduction screen
  if (!quizStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl md:text-3xl font-bold">Emotional Intelligence Assessment</CardTitle>
          <CardDescription className="text-base md:text-lg">
            Discover your emotional strengths and opportunities for growth
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-semibold">Why take this assessment?</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Identify your emotional strengths and weaknesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Get personalized tips to improve your emotional intelligence</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Track your growth over time with periodic reassessments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Earn tokens and special badges for completing the assessment</span>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-semibold">What you'll discover</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(categoryColors).map(category => (
                  <div key={category} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${categoryColors[category].replace('bg-', 'bg-opacity-20 text-')}`}>
                      {categoryIcons[category]}
                    </div>
                    <span className="font-medium">{getCategoryLabel(category)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">This quiz takes about 5-7 minutes to complete and consists of 15 questions across 5 key dimensions of emotional intelligence.</p>
            <p className="text-sm text-muted-foreground">Your responses are kept private and will only be used to provide you with personalized feedback.</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6">
          <Button 
            size="lg" 
            onClick={() => setQuizStarted(true)}
            className="px-8 py-6 text-lg rounded-full"
          >
            Start Assessment <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Render results
  if (showResults && results) {
    const quizResult = getQuizResult(results.totalScore);
    
    return (
      <Card className="w-full max-w-5xl mx-auto shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">Your Emotional Intelligence Profile</CardTitle>
          <CardDescription className="text-base md:text-lg">
            {quizResult.title} • Score: {results.totalScore} out of 60
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Summary of results */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-base md:text-lg">{quizResult.description}</p>
          </div>
          
          {/* Category results visualization */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Your EQ Dimensions</h3>
            {Object.keys(results.categoryPercentages).map(category => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${categoryColors[category].replace('bg-', 'bg-opacity-20 text-')}`}>
                      {categoryIcons[category]}
                    </div>
                    <span className="font-medium">{getCategoryLabel(category)}</span>
                  </div>
                  <span className="text-sm font-medium">{results.categoryPercentages[category]}%</span>
                </div>
                <div className="relative">
                  <Progress value={results.categoryPercentages[category]} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">{getCategoryDescription(category)}</p>
              </div>
            ))}
          </div>
          
          {/* Improvement tips */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Practices to Strengthen Your EQ</h3>
            <div className="space-y-2">
              {quizResult.improvementTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center p-6">
          <Button
            variant="outline"
            onClick={handleRestartQuiz}
            className="sm:mr-2"
          >
            Retake Quiz
          </Button>
          
          <Button
            onClick={handleSaveResults}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Results & Earn Tokens'}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Render quiz questions
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl md:text-2xl font-bold">Emotional Intelligence Quiz</CardTitle>
          <span className="text-sm font-medium px-3 py-1 bg-primary/10 rounded-full">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-semibold">{currentQuestion.question}</h3>
            {currentQuestion.description && (
              <p className="text-muted-foreground">{currentQuestion.description}</p>
            )}
          </div>
          
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleSelectAnswer}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-2 rounded-lg border p-3 transition-colors ${
                  answers[currentQuestion.id] === option.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={option.id}
                  className="flex-grow cursor-pointer text-base peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t p-4">
        <Button 
          variant="ghost"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNextQuestion}
          disabled={!answers[currentQuestion.id]}
        >
          {currentQuestionIndex === totalQuestions - 1 && Object.keys(answers).length === totalQuestions
            ? 'View Results'
            : 'Next'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}