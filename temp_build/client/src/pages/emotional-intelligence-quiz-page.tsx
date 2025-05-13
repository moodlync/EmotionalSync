import { Helmet } from 'react-helmet-async';
import { EmotionalIntelligenceQuiz } from '@/components/quiz/emotional-intelligence-quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function EmotionalIntelligenceQuizPage() {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="container max-w-7xl py-6 space-y-8">
      <Helmet>
        <title>Emotional Intelligence Quiz | MoodSync</title>
        <meta name="description" content="Discover your emotional intelligence profile and get personalized insights to develop your EQ." />
      </Helmet>
      
      {/* Back button */}
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1" 
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      {/* Page header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Emotional Intelligence Quiz</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Assess your emotional intelligence across five key dimensions and discover personalized strategies to enhance your EQ.
        </p>
      </div>
      
      {/* Quiz component */}
      <EmotionalIntelligenceQuiz />
      
      {/* Additional resources */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">About Emotional Intelligence</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-medium mb-2">What is Emotional Intelligence?</h3>
            <p className="text-muted-foreground">
              Emotional intelligence (EQ) is the ability to understand, use, and manage your emotions in positive ways to relieve stress, 
              communicate effectively, empathize with others, overcome challenges, and defuse conflict. High emotional intelligence 
              helps you build stronger relationships, succeed at work, and achieve your personal and career goals.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Why EQ Matters</h3>
            <p className="text-muted-foreground">
              Research suggests that emotional intelligence is twice as important as IQ in predicting outstanding performance. 
              People with high EQ typically handle pressure well, understand and cooperate with others, are good at resolving 
              conflicts, and make thoughtful decisions that balance rational and emotional considerations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}