export type EmotionType = "happy" | "sad" | "angry" | "anxious" | "excited" | "neutral";

export interface Emotion {
  id: EmotionType;
  name: string;
  description: string;
  backgroundColor: string;
  lightBackgroundColor: string;
  textColor: string;
  message: string;
  icon: string;
  emoji: string;
  color: string; // Hex color for UI components
}

export const emotions: Record<EmotionType, Emotion> = {
  happy: {
    id: "happy",
    name: "Happy",
    description: "Feeling joyful and content",
    backgroundColor: "bg-happy",
    lightBackgroundColor: "bg-happy-light",
    textColor: "text-yellow-800",
    message: "Share your joy with others who are feeling good today!",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    emoji: "😊",
    color: "#FFD700"
  },
  sad: {
    id: "sad",
    name: "Sad",
    description: "Feeling down or blue",
    backgroundColor: "bg-sad",
    lightBackgroundColor: "bg-sad-light",
    textColor: "text-white",
    message: "Connect with others who understand what you're going through.",
    icon: "M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    emoji: "😢",
    color: "#3B82F6"
  },
  angry: {
    id: "angry",
    name: "Angry",
    description: "Feeling frustrated or mad",
    backgroundColor: "bg-angry",
    lightBackgroundColor: "bg-angry-light",
    textColor: "text-white",
    message: "Find others who understand your frustration and can help you process it.",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    emoji: "😠",
    color: "#EF4444"
  },
  anxious: {
    id: "anxious",
    name: "Anxious",
    description: "Feeling worried or nervous",
    backgroundColor: "bg-anxious",
    lightBackgroundColor: "bg-anxious-light",
    textColor: "text-white",
    message: "You're not alone - connect with others experiencing anxiety too.",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    emoji: "😰",
    color: "#A855F7"
  },
  excited: {
    id: "excited",
    name: "Excited",
    description: "Feeling energetic and enthusiastic",
    backgroundColor: "bg-excited",
    lightBackgroundColor: "bg-excited-light",
    textColor: "text-white",
    message: "Share your enthusiasm with others who are feeling the same energy!",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    emoji: "🤩",
    color: "#F97316"
  },
  neutral: {
    id: "neutral",
    name: "Neutral",
    description: "Feeling balanced or indifferent",
    backgroundColor: "bg-neutral",
    lightBackgroundColor: "bg-neutral-light",
    textColor: "text-white",
    message: "Connect with others who are also in a balanced state today.",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    emoji: "😐",
    color: "#6B7280"
  }
};

export const aiResponses: Record<EmotionType, string[]> = {
  happy: [
    "That's wonderful to hear! What's something specific that brightened your day today?",
    "Your happiness is contagious! Have you considered joining our 'Positivity Circle' to amplify that joy with others?",
    "I love seeing you happy! Have you tried our 'Gratitude Journal' feature? It's proven to extend happy feelings by documenting them.",
    "Happiness often comes from meaningful connections. Would you like me to suggest a mood-matched chat room with others feeling joyful?",
    "This happy energy is perfect for creative activities! Have you explored our mood-based music playlists to enhance this feeling?",
    "Did you know happy people earn tokens faster? What goals are you working toward with your token balance?"
  ],
  sad: [
    "I notice you're feeling down today. On a scale of 1-10, how intense is this feeling for you right now?",
    "Sadness often has wisdom to share with us. What do you think this emotion might be trying to tell you?",
    "Our 'Comfort Corner' has people experiencing similar feelings who've found helpful coping strategies. Would connecting there help?",
    "Sometimes sadness is tied to specific thoughts. Would you like to try our guided reflection exercise to explore what's beneath the surface?",
    "Movement can sometimes shift emotional states. Have you tried our 5-minute mood-lifting stretch routine?",
    "Many users find our 'Emotional Weather' tracking helpful for seeing patterns in their sadness. Would you like to start tracking?"
  ],
  angry: [
    "Anger often masks other emotions underneath. Are you able to identify what might be beneath this feeling?",
    "On a scale of 1-10, how intense is your anger right now? I might have some specific techniques based on your answer.",
    "Have you tried the 'Cooling Flames' breathing technique in our Emotional Toolkit? It's specifically designed for anger management.",
    "Many users find physical activity helps process anger constructively. Would you like some quick exercise suggestions?",
    "Our 'Perspective Shift' challenge has helped many users transform anger into motivation. Would you like to try it?",
    "Anger can actually be a powerful creative force when channeled properly. Have you explored our 'Transform Emotions' workshop?"
  ],
  anxious: [
    "Let's try grounding together. Can you name 5 things you can see right now in your environment?",
    "Anxiety often stems from future concerns. Is there a specific worry or event that's triggering these feelings?",
    "Our Premium users have access to the 'Calm Waters' guided meditations specifically designed for anxiety. Would you like to explore upgrading?",
    "The 'Worry Journal' feature helps many users externalize anxious thoughts. Would you like to start one?",
    "Have you connected with our 'Support Circles'? Many users find relief sharing coping strategies with others experiencing similar feelings.",
    "Anxiety can sometimes be reduced through sensory activities. Would you like to try our color-breathing visualization exercise?"
  ],
  excited: [
    "Your energy is fantastic! What specific opportunity or event has you feeling so charged up today?",
    "Excitement is perfect for creative brainstorming! Have you tried channeling this energy into our 'Idea Storm' feature?",
    "Our 'High Vibration' chat room connects users with matching excitement levels. Would you like to amplify your enthusiasm with others?",
    "This excited energy is perfect for tackling challenges! Which token-earning activity would you like to pursue while riding this wave?",
    "Have you tried our 'Emotion Soundtrack' feature? It can suggest music that maintains and enhances your current excited state.",
    "Many users love documenting excited moments in their Emotion Journal. These entries become wonderful mood-boosters when viewed later!"
  ],
  neutral: [
    "Neutral can be a perfect state for mindfulness. Would you like to try our guided 3-minute awareness exercise?",
    "This balanced state is ideal for decision-making. Is there something you've been needing clarity on that we could explore?",
    "Many users find neutral moods perfect for our 'Emotion Exploration' activities. Would you like to try adding some emotional color?",
    "Have you checked our community challenges today? A neutral state can be perfect for trying something new.",
    "Our 'Mood Cultivation' tool helps users intentionally shift toward desired emotional states. Would you like to explore a specific feeling?",
    "Neutral states are excellent for reflection. Have you reviewed your emotional patterns in our Insights dashboard recently?"
  ]
};

export const getRandomAIResponse = (emotion: EmotionType): string => {
  const responses = aiResponses[emotion];
  return responses[Math.floor(Math.random() * responses.length)];
};
