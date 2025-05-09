/**
 * Emotional Intelligence Quiz Data
 * 
 * This file contains the questions, answers, and scoring logic for the
 * Emotional Intelligence Quiz feature.
 */

// Define the types for our quiz
export interface QuizQuestion {
  id: string;
  question: string;
  description?: string;
  options: QuizOption[];
  category: 'self-awareness' | 'self-regulation' | 'motivation' | 'empathy' | 'social-skills';
}

export interface QuizOption {
  id: string;
  text: string;
  score: number;
}

export interface QuizResult {
  range: [number, number]; // Min and max score range
  title: string;
  description: string;
  improvementTips: string[];
}

// Define the emotional intelligence quiz questions
export const emotionalIntelligenceQuestions: QuizQuestion[] = [
  // Self-Awareness Questions
  {
    id: "q1",
    question: "How often do you recognize your emotions as you experience them?",
    category: "self-awareness",
    options: [
      { id: "q1-a", text: "Almost never - I'm often confused about what I feel", score: 1 },
      { id: "q1-b", text: "Sometimes - I can identify basic emotions", score: 2 },
      { id: "q1-c", text: "Usually - I'm generally aware of my emotional state", score: 3 },
      { id: "q1-d", text: "Almost always - I can identify subtle emotional states", score: 4 }
    ]
  },
  {
    id: "q2",
    question: "How well do you understand the connection between your feelings and your actions?",
    category: "self-awareness",
    options: [
      { id: "q2-a", text: "I rarely see the connection", score: 1 },
      { id: "q2-b", text: "I sometimes notice patterns after the fact", score: 2 },
      { id: "q2-c", text: "I usually understand how my feelings affect my behavior", score: 3 },
      { id: "q2-d", text: "I have a clear understanding of how my emotions drive my behavior", score: 4 }
    ]
  },
  {
    id: "q3",
    question: "When you're feeling down, how easily can you identify the specific cause?",
    category: "self-awareness",
    options: [
      { id: "q3-a", text: "I usually can't pinpoint why I feel bad", score: 1 },
      { id: "q3-b", text: "I can sometimes identify obvious causes", score: 2 },
      { id: "q3-c", text: "I can usually figure out why I'm feeling down", score: 3 },
      { id: "q3-d", text: "I can almost always identify the specific trigger for my feelings", score: 4 }
    ]
  },

  // Self-Regulation Questions
  {
    id: "q4",
    question: "When you're angry or upset, how well can you still make rational decisions?",
    category: "self-regulation",
    options: [
      { id: "q4-a", text: "My emotions completely take over", score: 1 },
      { id: "q4-b", text: "I struggle but can sometimes control my reactions", score: 2 },
      { id: "q4-c", text: "I can usually pause and think before acting", score: 3 },
      { id: "q4-d", text: "I consistently make rational decisions despite strong emotions", score: 4 }
    ]
  },
  {
    id: "q5",
    question: "How well do you handle unexpected challenges or setbacks?",
    category: "self-regulation",
    options: [
      { id: "q5-a", text: "I often become overwhelmed and reactive", score: 1 },
      { id: "q5-b", text: "I get frustrated but can eventually adapt", score: 2 },
      { id: "q5-c", text: "I usually stay calm and look for solutions", score: 3 },
      { id: "q5-d", text: "I remain composed and see challenges as opportunities", score: 4 }
    ]
  },
  {
    id: "q6",
    question: "How quickly do you recover from disappointments or failures?",
    category: "self-regulation",
    options: [
      { id: "q6-a", text: "It takes me a long time to bounce back", score: 1 },
      { id: "q6-b", text: "I eventually recover but it's difficult", score: 2 },
      { id: "q6-c", text: "I usually recover relatively quickly", score: 3 },
      { id: "q6-d", text: "I can quickly reframe setbacks and move forward", score: 4 }
    ]
  },

  // Motivation Questions
  {
    id: "q7",
    question: "How often do you set personal goals and work consistently toward them?",
    category: "motivation",
    options: [
      { id: "q7-a", text: "Rarely - I struggle to set or stick to goals", score: 1 },
      { id: "q7-b", text: "Sometimes - but I often lose momentum", score: 2 },
      { id: "q7-c", text: "Usually - I can maintain focus on important goals", score: 3 },
      { id: "q7-d", text: "Consistently - I'm highly disciplined about my goals", score: 4 }
    ]
  },
  {
    id: "q8",
    question: "When faced with an unpleasant but necessary task, how do you approach it?",
    category: "motivation",
    options: [
      { id: "q8-a", text: "I tend to avoid it until absolutely necessary", score: 1 },
      { id: "q8-b", text: "I procrastinate but eventually get it done", score: 2 },
      { id: "q8-c", text: "I usually tackle it even when I don't feel like it", score: 3 },
      { id: "q8-d", text: "I do it promptly, focusing on the purpose rather than the discomfort", score: 4 }
    ]
  },
  {
    id: "q9",
    question: "How do you handle situations where you don't receive external recognition?",
    category: "motivation",
    options: [
      { id: "q9-a", text: "I lose interest if my efforts aren't acknowledged", score: 1 },
      { id: "q9-b", text: "I prefer recognition but can work without it sometimes", score: 2 },
      { id: "q9-c", text: "I'm largely self-motivated but appreciate recognition", score: 3 },
      { id: "q9-d", text: "I'm driven primarily by internal standards, not external validation", score: 4 }
    ]
  },

  // Empathy Questions
  {
    id: "q10",
    question: "How accurately can you identify emotions in others based on their expressions or behavior?",
    category: "empathy",
    options: [
      { id: "q10-a", text: "I often misread people's emotions", score: 1 },
      { id: "q10-b", text: "I can recognize obvious emotional states", score: 2 },
      { id: "q10-c", text: "I'm usually good at reading how others feel", score: 3 },
      { id: "q10-d", text: "I can detect subtle emotional cues that others might miss", score: 4 }
    ]
  },
  {
    id: "q11",
    question: "When someone shares a problem, what's your typical response?",
    category: "empathy",
    options: [
      { id: "q11-a", text: "I immediately offer solutions or change the subject", score: 1 },
      { id: "q11-b", text: "I try to listen but often think about what to say next", score: 2 },
      { id: "q11-c", text: "I listen attentively and try to understand their perspective", score: 3 },
      { id: "q11-d", text: "I fully engage, ask thoughtful questions, and validate their feelings", score: 4 }
    ]
  },
  {
    id: "q12",
    question: "How comfortable are you with people expressing strong emotions around you?",
    category: "empathy",
    options: [
      { id: "q12-a", text: "Very uncomfortable - I don't know how to respond", score: 1 },
      { id: "q12-b", text: "Somewhat uncomfortable but I try to be supportive", score: 2 },
      { id: "q12-c", text: "Generally comfortable and able to be present for them", score: 3 },
      { id: "q12-d", text: "Very comfortable - I can stay present without being overwhelmed", score: 4 }
    ]
  },

  // Social Skills Questions
  {
    id: "q13",
    question: "How effectively do you communicate your feelings in relationships?",
    category: "social-skills",
    options: [
      { id: "q13-a", text: "I either keep feelings to myself or express them poorly", score: 1 },
      { id: "q13-b", text: "I sometimes express my feelings but it's challenging", score: 2 },
      { id: "q13-c", text: "I usually communicate my feelings clearly", score: 3 },
      { id: "q13-d", text: "I express my feelings articulately while respecting others", score: 4 }
    ]
  },
  {
    id: "q14",
    question: "How do you handle conflicts with others?",
    category: "social-skills",
    options: [
      { id: "q14-a", text: "I either withdraw completely or become very defensive", score: 1 },
      { id: "q14-b", text: "I try to resolve issues but often get emotional", score: 2 },
      { id: "q14-c", text: "I usually handle conflicts calmly and seek resolution", score: 3 },
      { id: "q14-d", text: "I approach conflicts as opportunities for deeper understanding", score: 4 }
    ]
  },
  {
    id: "q15",
    question: "How comfortable are you collaborating with different types of people?",
    category: "social-skills",
    options: [
      { id: "q15-a", text: "I prefer working with people similar to me", score: 1 },
      { id: "q15-b", text: "I can work with different people but find it challenging", score: 2 },
      { id: "q15-c", text: "I'm generally adaptable to working with diverse individuals", score: 3 },
      { id: "q15-d", text: "I actively seek diverse perspectives and adapt my approach", score: 4 }
    ]
  }
];

// Scoring scale and interpretation
export const quizResults: QuizResult[] = [
  {
    range: [15, 30],
    title: "Developing Emotional Intelligence",
    description: "You're in the early stages of developing your emotional intelligence. You sometimes struggle to identify your own emotions and those of others, which can lead to challenges in personal and professional relationships. The good news is that emotional intelligence can be developed with practice and awareness.",
    improvementTips: [
      "Start a daily emotional awareness journal to identify your feelings",
      "Practice pausing before reacting when emotions are strong",
      "Ask trusted friends for feedback on how you come across",
      "Read books on emotional intelligence fundamentals",
      "Practice active listening without immediately offering solutions"
    ]
  },
  {
    range: [31, 45],
    title: "Growing Emotional Intelligence",
    description: "You have a moderate level of emotional intelligence. You recognize many of your emotions and can sometimes understand others' perspectives. You have some good emotional management strategies but may struggle in particularly challenging situations. With continued practice, you can further strengthen these skills.",
    improvementTips: [
      "Deepen your emotional vocabulary to identify more specific feelings",
      "Practice empathetic listening with different types of people",
      "Develop strategies for handling specific emotional triggers",
      "Try meditation or mindfulness to increase emotional awareness",
      "Look for patterns in situations that challenge your emotional regulation"
    ]
  },
  {
    range: [46, 60],
    title: "Strong Emotional Intelligence",
    description: "You demonstrate strong emotional intelligence. You have good self-awareness, manage your emotions effectively, and understand others well. You likely form meaningful connections and navigate social situations successfully. Your emotional intelligence is an asset in both personal and professional contexts.",
    improvementTips: [
      "Mentor others in developing their emotional intelligence",
      "Seek opportunities to work with diverse groups and perspectives",
      "Refine your skills in particularly challenging emotional situations",
      "Consider how you can use your emotional intelligence for leadership",
      "Continue developing emotional agility for life's complex challenges"
    ]
  }
];

// Define category types to ensure type safety
export type EqCategory = 'self-awareness' | 'self-regulation' | 'motivation' | 'empathy' | 'social-skills';

// Calculate scores by category
export const calculateCategoryScores = (answers: Record<string, string>) => {
  const categoryScores: Record<EqCategory, number> = {
    'self-awareness': 0,
    'self-regulation': 0,
    'motivation': 0, 
    'empathy': 0,
    'social-skills': 0
  };
  
  let totalScore = 0;
  
  // Group questions by category
  const questionsByCategory: Record<EqCategory, QuizQuestion[]> = emotionalIntelligenceQuestions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<EqCategory, QuizQuestion[]>);
  
  // Calculate scores for each category
  for (const questionId in answers) {
    const question = emotionalIntelligenceQuestions.find(q => q.id === questionId);
    if (question) {
      const selectedOption = question.options.find(o => o.id === answers[questionId]);
      if (selectedOption) {
        categoryScores[question.category] += selectedOption.score;
        totalScore += selectedOption.score;
      }
    }
  }
  
  // Calculate percentage scores for each category
  const maxCategoryScores: Record<string, number> = {};
  for (const category in questionsByCategory) {
    maxCategoryScores[category] = questionsByCategory[category].length * 4; // 4 is max score per question
  }
  
  const categoryPercentages = {} as Record<string, number>;
  for (const category in categoryScores) {
    if (category in maxCategoryScores) {
      categoryPercentages[category] = Math.round((categoryScores[category] / maxCategoryScores[category]) * 100);
    }
  }
  
  return {
    totalScore,
    categoryScores,
    categoryPercentages
  };
};

// Get result interpretation based on total score
export const getQuizResult = (totalScore: number): QuizResult => {
  return quizResults.find(result => 
    totalScore >= result.range[0] && totalScore <= result.range[1]
  ) || quizResults[0]; // Default to first result if no match found
};

// Get descriptive label for category
export const getCategoryLabel = (category: string): string => {
  switch(category) {
    case 'self-awareness':
      return 'Self-Awareness';
    case 'self-regulation':
      return 'Self-Regulation';
    case 'motivation':
      return 'Motivation';
    case 'empathy':
      return 'Empathy';
    case 'social-skills':
      return 'Social Skills';
    default:
      return category;
  }
};

// Get description for each category
export const getCategoryDescription = (category: string): string => {
  switch(category) {
    case 'self-awareness':
      return 'The ability to recognize and understand your own emotions and how they affect your thoughts and behavior.';
    case 'self-regulation':
      return 'The ability to control impulsive feelings and behaviors, manage emotions in healthy ways, and adapt to changing circumstances.';
    case 'motivation':
      return 'The drive to improve and achieve, commitment to goals, initiative, and optimism even in the face of setbacks.';
    case 'empathy':
      return 'The ability to understand the emotions, needs, and concerns of other people, pick up on emotional cues, and feel comfortable socially.';
    case 'social-skills':
      return 'The ability to maintain healthy relationships, communicate clearly, inspire and influence others, work well in a team, and manage conflict.';
    default:
      return '';
  }
};