import { EmotionType } from "@shared/schema";

export type PositivityContentCategory = 'quote' | 'affirmation' | 'tip' | 'exercise';

export interface PositivityContent {
  id: number;
  title: string;
  content: string;
  category: PositivityContentCategory;
  source?: string;
  imageUrl?: string;
  forEmotions: EmotionType[];
}

// Positive quotes collection
export const POSITIVITY_QUOTES: PositivityContent[] = [
  {
    id: 1,
    title: "Finding Strength",
    content: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    category: "quote",
    source: "Nelson Mandela",
    forEmotions: ["sad", "anxious"]
  },
  {
    id: 2,
    title: "Inner Light",
    content: "Happiness is not something ready-made. It comes from your own actions.",
    category: "quote",
    source: "Dalai Lama",
    forEmotions: ["sad", "neutral"]
  },
  {
    id: 3,
    title: "Embrace Change",
    content: "Life is 10% what happens to us and 90% how we react to it.",
    category: "quote",
    source: "Charles R. Swindoll",
    forEmotions: ["anxious", "angry"]
  },
  {
    id: 4,
    title: "True Courage",
    content: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
    category: "quote",
    source: "Mary Anne Radmacher",
    forEmotions: ["sad", "anxious"]
  },
  {
    id: 5,
    title: "Perspective",
    content: "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.",
    category: "quote",
    source: "Oprah Winfrey",
    forEmotions: ["sad", "angry"]
  },
  {
    id: 6,
    title: "Daily Choice",
    content: "Every day may not be good, but there is something good in every day.",
    category: "quote",
    source: "Alice Morse Earle",
    forEmotions: ["sad", "neutral"]
  },
  {
    id: 7,
    title: "Inner Strength",
    content: "You have within you right now, everything you need to deal with whatever the world can throw at you.",
    category: "quote",
    source: "Brian Tracy",
    forEmotions: ["anxious", "sad"]
  },
  {
    id: 8,
    title: "Finding Peace",
    content: "The mind is like water. When it's turbulent, it's difficult to see. When it's calm, everything becomes clear.",
    category: "quote",
    source: "Prasad Mahes",
    forEmotions: ["anxious", "angry"]
  }
];

// Positive affirmations collection
export const POSITIVITY_AFFIRMATIONS: PositivityContent[] = [
  {
    id: 101,
    title: "Personal Worth",
    content: "I am worthy of love, respect, and positive energy. My needs and wants are important.",
    category: "affirmation",
    forEmotions: ["sad", "anxious"]
  },
  {
    id: 102,
    title: "Inner Strength",
    content: "I have survived all of my toughest days so far, and I will survive today too. My strength is greater than any struggle.",
    category: "affirmation",
    forEmotions: ["anxious", "sad"]
  },
  {
    id: 103,
    title: "Emotional Peace",
    content: "I release all anger and resentment. I choose to respond, not react. I am in control of my emotions.",
    category: "affirmation",
    forEmotions: ["angry", "anxious"]
  },
  {
    id: 104,
    title: "Self-Love",
    content: "I love and accept myself exactly as I am right now. Every day I'm growing and evolving into my best self.",
    category: "affirmation",
    forEmotions: ["sad", "neutral"]
  },
  {
    id: 105,
    title: "Present Focus",
    content: "Today, I choose to focus on what I can control. I let go of what I cannot. This moment is my only responsibility.",
    category: "affirmation",
    forEmotions: ["anxious", "angry"]
  },
  {
    id: 106,
    title: "Gratitude",
    content: "I am grateful for all the good in my life. Even in difficult times, I can find moments of joy and learning.",
    category: "affirmation",
    forEmotions: ["sad", "neutral"]
  },
  {
    id: 107,
    title: "Inner Peace",
    content: "I breathe in calmness and exhale tension. My mind is quiet, my body is relaxed, my heart is at peace.",
    category: "affirmation",
    forEmotions: ["anxious", "angry"]
  },
  {
    id: 108,
    title: "Resilience",
    content: "I am resilient in the face of challenges. Each obstacle is an opportunity to grow stronger and wiser.",
    category: "affirmation",
    forEmotions: ["sad", "anxious"]
  }
];

// Practical tips collection
export const POSITIVITY_TIPS: PositivityContent[] = [
  {
    id: 201,
    title: "Five-Minute Reset",
    content: "When feeling overwhelmed, take five minutes to step away from what you're doing. Go outside if possible, take 10 deep breaths, and observe five things you can see, four things you can touch, three things you can hear, two things you can smell, and one thing you can taste.",
    category: "tip",
    forEmotions: ["anxious", "angry"]
  },
  {
    id: 202,
    title: "Morning Mindset",
    content: "Start your day by writing down three things you're grateful for. They can be simple—a comfortable bed, a hot cup of coffee, or a text from a friend. This small practice shifts your mind toward positivity before the day begins.",
    category: "tip",
    forEmotions: ["sad", "neutral"]
  },
  {
    id: 203,
    title: "Emotional Awareness",
    content: "When strong emotions arise, name them specifically. Instead of 'I feel bad,' try identifying 'I feel disappointed' or 'I feel frustrated.' Naming emotions reduces their power and helps you respond thoughtfully.",
    category: "tip",
    forEmotions: ["angry", "anxious"]
  },
  {
    id: 204,
    title: "Digital Sunset",
    content: "Create a 'digital sunset' one hour before bedtime. Put away all screens to reduce blue light exposure and mental stimulation. Replace scrolling with reading, gentle stretching, or journaling for better sleep quality.",
    category: "tip",
    forEmotions: ["anxious", "neutral"]
  },
  {
    id: 205,
    title: "Joy Collecting",
    content: "Keep a 'joy jar' or notebook. Throughout the day, jot down small moments that brought you happiness or peace. Reading these notes when you're feeling low provides perspective and reminds you good things are always present.",
    category: "tip",
    forEmotions: ["sad", "neutral"]
  },
  {
    id: 206,
    title: "Physical Reset",
    content: "When stress builds, take a 'body break.' Stand up, stretch high, shake out your hands, roll your shoulders, and take three deep breaths. This quick reset interrupts stress patterns and grounds you in your body.",
    category: "tip",
    forEmotions: ["anxious", "angry"]
  },
  {
    id: 207,
    title: "Compassionate Self-Talk",
    content: "When you notice negative self-talk, ask: 'Would I speak this way to someone I love?' If not, rephrase your thoughts with the kindness you'd offer a good friend.",
    category: "tip",
    forEmotions: ["sad", "anxious"]
  },
  {
    id: 208,
    title: "Mindful Moments",
    content: "Set three random alarms during your day as 'mindfulness bells.' When they ring, pause whatever you're doing and take three conscious breaths, bringing your full attention to the present moment.",
    category: "tip",
    forEmotions: ["anxious", "neutral"]
  }
];

// Practical exercises collection
export const POSITIVITY_EXERCISES: PositivityContent[] = [
  {
    id: 301,
    title: "Breath Counting Meditation",
    content: "Sit comfortably with your back straight. Close your eyes. Breathe naturally and count each exhalation up to 10, then start again from 1. If you lose track, simply start again at 1. Practice for 5-10 minutes daily to reduce anxiety and improve focus.",
    category: "exercise",
    forEmotions: ["anxious", "angry"]
  },
  {
    id: 302,
    title: "Gratitude Letter",
    content: "Write a letter to someone who has positively impacted your life but whom you've never properly thanked. Describe specifically what they did and how it affected you. Whether you send it or not, this exercise increases feelings of connection and gratitude.",
    category: "exercise",
    forEmotions: ["sad", "neutral"]
  },
  {
    id: 303,
    title: "Body Scan Relaxation",
    content: "Lie down comfortably. Starting at your toes, bring attention to each part of your body, noticing sensations without judgment. Consciously release tension as you move upward to your head. Complete the practice in 10-20 minutes for deep relaxation.",
    category: "exercise",
    forEmotions: ["anxious", "angry"]
  },
  {
    id: 304,
    title: "Values Reflection",
    content: "List 5-10 core values that are most important to you (e.g., honesty, creativity, family). For each, write how you're currently honoring this value in your life and one simple way you could align with it more fully tomorrow.",
    category: "exercise",
    forEmotions: ["sad", "neutral"]
  },
  {
    id: 305,
    title: "Worry Time Practice",
    content: "Designate 15 minutes daily as 'worry time.' When worries arise outside this period, note them to address later. During your scheduled worry time, write down all concerns and possible next steps. This contains anxiety and transforms unproductive worry into problem-solving.",
    category: "exercise",
    forEmotions: ["anxious", "neutral"]
  },
  {
    id: 306,
    title: "Anger Release Journal",
    content: "When anger builds, write uncensored thoughts in a private journal for 10 minutes. Be completely honest about your feelings. When finished, take three deep breaths, tear out the page (if you wish), and consciously decide to release those thoughts.",
    category: "exercise",
    forEmotions: ["angry", "anxious"]
  },
  {
    id: 307,
    title: "Joy Spotting Walk",
    content: "Take a 15-minute walk with the sole purpose of noticing pleasing things. Look for beauty, humor, kindness, or anything that sparks positive feelings. Try to find at least 10 joyful things, no matter how small. This trains your brain to notice positivity.",
    category: "exercise",
    forEmotions: ["sad", "neutral"]
  },
  {
    id: 308,
    title: "Self-Compassion Break",
    content: "When struggling, place your hands over your heart. Acknowledge your difficulty: 'This is a moment of suffering.' Recognize you're not alone: 'Suffering is part of life.' Offer yourself kindness: 'May I be kind to myself in this moment.' Hold this space for 1-2 minutes.",
    category: "exercise",
    forEmotions: ["sad", "anxious"]
  }
];

// Combine all content for easy access
export const ALL_POSITIVITY_CONTENT: PositivityContent[] = [
  ...POSITIVITY_QUOTES,
  ...POSITIVITY_AFFIRMATIONS,
  ...POSITIVITY_TIPS,
  ...POSITIVITY_EXERCISES
];

// Get content that matches a specific emotion
export function getContentForEmotion(emotion: EmotionType): PositivityContent[] {
  return ALL_POSITIVITY_CONTENT.filter(item => 
    item.forEmotions.includes(emotion)
  );
}

// Get random content that matches a specific emotion
export function getRandomContentForEmotion(emotion: EmotionType): PositivityContent | null {
  const matchingContent = getContentForEmotion(emotion);
  if (matchingContent.length === 0) return null;
  
  return matchingContent[Math.floor(Math.random() * matchingContent.length)];
}

// Get random content by category
export function getRandomContentByCategory(category: PositivityContentCategory): PositivityContent | null {
  const categoryContent = ALL_POSITIVITY_CONTENT.filter(item => item.category === category);
  if (categoryContent.length === 0) return null;
  
  return categoryContent[Math.floor(Math.random() * categoryContent.length)];
}

// Get content by ID
export function getContentById(id: number): PositivityContent | undefined {
  return ALL_POSITIVITY_CONTENT.find(item => item.id === id);
}