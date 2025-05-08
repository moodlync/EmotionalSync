import { Router } from 'express';
import { storage } from '../storage';
import { EmotionType } from '@shared/schema';
import { z } from 'zod';

// Middleware functions
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

async function requirePremium(req: any, res: any, next: any) {
  // Skip check if there's no user (should be caught by requireAuth middleware)
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You need to be logged in to access this feature.' 
    });
  }
  
  // If the user is premium, allow access immediately
  if (req.user.isPremium) {
    return next();
  }
  
  // If not premium, check if the user is in an active trial period
  try {
    const isInActiveTrial = await storage.isUserInActiveTrial(req.user.id);
    
    if (isInActiveTrial) {
      // User is in trial period, allow access
      return next();
    }
    
    // User is neither premium nor in trial, deny access
    return res.status(403).json({ 
      error: 'Premium required',
      message: 'This feature is only available to premium members. Upgrade to premium or start a free trial to access this feature.' 
    });
  } catch (error) {
    console.error('Error checking trial status:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while checking your premium status.' 
    });
  }
}

// Define our wellness tip schema
const WellnessTipSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  source: z.string(),
  emotionTypes: z.array(z.string()),
  isPremium: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Array of wellness tips for mental health improvement
const generalWellnessTips = [
  {
    id: 1,
    title: "Practice Mindful Breathing",
    description: "Take 5 minutes to focus on your breath. Inhale for 4 counts, hold for 2, and exhale for 6. This simple technique activates your parasympathetic nervous system, reducing anxiety immediately.",
    category: "Meditation",
    source: "Journal of Behavioral Medicine",
    emotionTypes: ['anxious', 'stressed', 'overwhelmed', 'angry'],
    isPremium: false
  },
  {
    id: 2,
    title: "Gratitude Journaling",
    description: "Write down three specific things you're grateful for today. Studies show this simple practice increases dopamine and reduces cortisol, improving mood for up to 24 hours.",
    category: "Journaling",
    source: "Positive Psychology Research",
    emotionTypes: ['sad', 'neutral', 'content', 'hopeful'],
    isPremium: false
  },
  {
    id: 3,
    title: "The 3-3-3 Grounding Technique",
    description: "When anxiety strikes, name 3 things you see, 3 sounds you hear, and move 3 parts of your body. This interrupts the fight-or-flight response and returns you to the present moment.",
    category: "Anxiety Management",
    source: "Clinical Psychology Review",
    emotionTypes: ['anxious', 'overwhelmed', 'stressed'],
    isPremium: false
  },
  {
    id: 4,
    title: "Joy Spotting Practice",
    description: "Set an alarm for 3 random times today. When it goes off, find something beautiful or joyful in your immediate environment. This trains your brain to notice positivity naturally over time.",
    category: "Positive Psychology",
    source: "Happiness Studies Journal",
    emotionTypes: ['sad', 'bored', 'neutral', 'nostalgic'],
    isPremium: false
  },
  {
    id: 5,
    title: "Digital Sunset Protocol",
    description: "Turn off screens 60 minutes before bed. Blue light suppresses melatonin by up to 50%. Better sleep quality is directly linked to reduced depression symptoms the following day.",
    category: "Sleep Hygiene",
    source: "Sleep Medicine Reviews",
    emotionTypes: ['stressed', 'anxious', 'overwhelmed', 'tired'],
    isPremium: false
  },
  {
    id: 6,
    title: "2-Minute Movement Breaks",
    description: "Set a timer to move for just 2 minutes every hour. Even brief movement releases BDNF (brain-derived neurotrophic factor), a protein that improves mood and cognitive function.",
    category: "Physical Activity",
    source: "Neuropsychology Journal",
    emotionTypes: ['sad', 'bored', 'stressed', 'overwhelmed'],
    isPremium: false
  },
  {
    id: 7,
    title: "Loving-Kindness Meditation",
    description: "Spend 5 minutes sending well-wishes to yourself, a loved one, and someone difficult in your life. This practice reduces implicit bias and increases feelings of social connection.",
    category: "Meditation",
    source: "Mindfulness Research",
    emotionTypes: ['angry', 'sad', 'anxious', 'neutral'],
    isPremium: false
  },
  {
    id: 8,
    title: "5-4-3-2-1 Sensory Grounding",
    description: "Notice 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This powerful technique stops anxiety by engaging all your senses.",
    category: "Anxiety Management",
    source: "Cognitive Behavioral Therapy",
    emotionTypes: ['anxious', 'overwhelmed', 'stressed'],
    isPremium: false
  },
  {
    id: 9,
    title: "Emotional Vocabulary Expansion",
    description: "Challenge yourself to name your emotions with more specificity than just 'good' or 'bad'. Research shows that emotional granularity (using precise emotion words) actually helps regulate feelings more effectively.",
    category: "Emotional Intelligence",
    source: "Journal of Personality",
    emotionTypes: ['neutral', 'confused', 'mixed'],
    isPremium: false
  },
  {
    id: 10,
    title: "Opposite Action Technique",
    description: "When experiencing an unhelpful emotion, try doing the opposite of what that emotion urges you to do. If anxiety makes you want to avoid, gently approach; if anger makes you want to attack, practice gentleness.",
    category: "Emotional Regulation",
    source: "Dialectical Behavior Therapy",
    emotionTypes: ['angry', 'anxious', 'sad', 'stressed'],
    isPremium: false
  },
  {
    id: 11,
    title: "Self-Compassion Break",
    description: "When you notice self-criticism, place your hand on your heart and say: 'This is a moment of suffering. Suffering is part of life. May I be kind to myself in this moment, and give myself the compassion I need.'",
    category: "Self-Compassion",
    source: "Mindful Self-Compassion Research",
    emotionTypes: ['sad', 'overwhelmed', 'stressed', 'anxious'],
    isPremium: false
  },
  {
    id: 12,
    title: "Achievement Journaling",
    description: "At the end of each day, write down three things you accomplished, no matter how small. This builds confidence and helps counter depressive thoughts that you 'never get anything done.'",
    category: "Positive Psychology",
    source: "Journal of Happiness Studies",
    emotionTypes: ['sad', 'overwhelmed', 'stressed', 'hopeful'],
    isPremium: false
  },
  {
    id: 13,
    title: "Emotion Acceptance Mantra",
    description: "When difficult emotions arise, say to yourself: 'I can feel [emotion] and still take effective action.' Accepting emotions rather than fighting them reduces their intensity and duration.",
    category: "Emotional Acceptance",
    source: "Acceptance and Commitment Therapy",
    emotionTypes: ['sad', 'angry', 'anxious', 'overwhelmed'],
    isPremium: false
  },
  {
    id: 14,
    title: "Joy Multiplier Practice",
    description: "When you experience a positive moment today, take 20 seconds to fully absorb it. This practice - called 'positive savoring' - strengthens neural pathways for happiness and well-being.",
    category: "Positive Psychology",
    source: "Applied Positive Psychology",
    emotionTypes: ['happy', 'content', 'excited', 'hopeful'],
    isPremium: true
  },
  {
    id: 15,
    title: "Values Alignment Check",
    description: "Take 2 minutes to ask: 'How can I bring one core value into my next activity today?' This micro-practice increases daily meaning and purpose, which research links to greater emotional well-being.",
    category: "Meaning & Purpose",
    source: "Journal of Positive Psychology",
    emotionTypes: ['neutral', 'bored', 'content', 'hopeful'],
    isPremium: true
  },
  {
    id: 16,
    title: "Progressive Muscle Relaxation",
    description: "Tense each muscle group for 5 seconds, then release for 10 seconds, working from your toes to your head. This physiological intervention resets your nervous system and reduces cortisol levels.",
    category: "Stress Management",
    source: "Journal of Applied Psychophysiology and Biofeedback",
    emotionTypes: ['stressed', 'anxious', 'angry', 'overwhelmed'],
    isPremium: true
  },
  {
    id: 17,
    title: "Mental Subtraction Exercise",
    description: "Imagine one positive aspect of your life never happened. Research shows this 'what if' reflection increases appreciation for what you have and boosts happiness more effectively than gratitude journaling.",
    category: "Positive Psychology",
    source: "Journal of Personality and Social Psychology",
    emotionTypes: ['sad', 'nostalgic', 'bored', 'neutral'],
    isPremium: true
  },
  {
    id: 18,
    title: "Emotional Needs Inventory",
    description: "Ask yourself: 'Which of my core emotional needs (safety, autonomy, connection, competence) feels most depleted right now?' Then take one small action to meet that specific need.",
    category: "Emotional Intelligence",
    source: "Self-Determination Theory Research",
    emotionTypes: ['sad', 'anxious', 'overwhelmed', 'stressed'],
    isPremium: true
  }
];

const router = Router();

// Get all wellness tips (with optional emotion filter)
router.get('/wellness-tips', requireAuth, async (req, res) => {
  try {
    const { emotion } = req.query;
    const userId = req.user!.id;
    
    // Get user subscription status
    const isPremium = req.user!.isPremium || await storage.isUserInActiveTrial(userId);
    
    // Filter tips by emotion if provided
    let tips = generalWellnessTips;
    
    if (emotion) {
      tips = tips.filter(tip => 
        tip.emotionTypes.includes(emotion as string) && 
        (!tip.isPremium || isPremium)
      );
    } else {
      // If no emotion filter, just filter by premium status
      tips = tips.filter(tip => !tip.isPremium || isPremium);
    }
    
    res.json(tips);
  } catch (error) {
    console.error('Error fetching wellness tips:', error);
    res.status(500).json({ message: 'Error fetching wellness tips', error });
  }
});

// Get personalized wellness tips based on user's current emotion
router.get('/wellness-tips/personalized', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userEmotion = req.query.emotion as EmotionType | undefined;
    
    // Get user subscription status
    const isPremium = req.user!.isPremium || await storage.isUserInActiveTrial(userId);
    
    // If no emotion provided, try to get the user's most recent emotion
    let currentEmotion = userEmotion;
    if (!currentEmotion) {
      try {
        // Get the user's current emotion from their profile
        // Note: In a real implementation, we would retrieve this from a user_profiles table
        // For now, just default to 'neutral' if no emotion is provided
        currentEmotion = 'neutral';
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // If we can't get the current emotion, default to neutral
        currentEmotion = 'neutral';
      }
    }
    
    // Filter tips by current emotion or return general tips if no match
    let emotionSpecificTips = generalWellnessTips.filter(tip => 
      tip.emotionTypes.includes(currentEmotion as string) && 
      (!tip.isPremium || isPremium)
    );
    
    // If no matching tips, return general tips
    if (emotionSpecificTips.length === 0) {
      emotionSpecificTips = generalWellnessTips.filter(tip => !tip.isPremium || isPremium);
    }
    
    res.json({
      tips: emotionSpecificTips,
      currentEmotion,
      isPremium
    });
  } catch (error) {
    console.error('Error fetching personalized wellness tips:', error);
    res.status(500).json({ message: 'Error fetching personalized wellness tips', error });
  }
});

// Get a single wellness tip by ID
router.get('/wellness-tips/:id', requireAuth, async (req, res) => {
  try {
    const tipId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    if (isNaN(tipId)) {
      return res.status(400).json({ message: 'Invalid tip ID' });
    }
    
    // Get user subscription status
    const isPremium = req.user!.isPremium || await storage.isUserInActiveTrial(userId);
    
    const tip = generalWellnessTips.find(tip => tip.id === tipId);
    
    if (!tip) {
      return res.status(404).json({ message: 'Wellness tip not found' });
    }
    
    // Check if user can access premium tips
    if (tip.isPremium && !isPremium) {
      return res.status(403).json({ 
        message: 'This wellness tip is only available to premium members',
        requiresPremium: true
      });
    }
    
    res.json(tip);
  } catch (error) {
    console.error('Error fetching wellness tip:', error);
    res.status(500).json({ message: 'Error fetching wellness tip', error });
  }
});

// Bookmark a wellness tip
router.post('/wellness-tips/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const tipId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    if (isNaN(tipId)) {
      return res.status(400).json({ message: 'Invalid tip ID' });
    }
    
    // Check if the tip exists
    const tip = generalWellnessTips.find(tip => tip.id === tipId);
    
    if (!tip) {
      return res.status(404).json({ message: 'Wellness tip not found' });
    }
    
    // In a real implementation, this would save to the database
    // For now, just return success
    
    res.json({ 
      success: true,
      message: 'Wellness tip bookmarked successfully'
    });
  } catch (error) {
    console.error('Error bookmarking wellness tip:', error);
    res.status(500).json({ message: 'Error bookmarking wellness tip', error });
  }
});

// Like a wellness tip
router.post('/wellness-tips/:id/like', requireAuth, async (req, res) => {
  try {
    const tipId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    if (isNaN(tipId)) {
      return res.status(400).json({ message: 'Invalid tip ID' });
    }
    
    // Check if the tip exists
    const tip = generalWellnessTips.find(tip => tip.id === tipId);
    
    if (!tip) {
      return res.status(404).json({ message: 'Wellness tip not found' });
    }
    
    // In a real implementation, this would save to the database
    // For now, just return success
    
    res.json({ 
      success: true,
      message: 'Wellness tip liked successfully'
    });
  } catch (error) {
    console.error('Error liking wellness tip:', error);
    res.status(500).json({ message: 'Error liking wellness tip', error });
  }
});

export default router;