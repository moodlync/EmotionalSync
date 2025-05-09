// Define emotion options (expanded range of human emotions)
export const emotionOptions = [
  // Positive emotions
  'Joy',
  'Love',
  'Hope',
  'Gratitude',
  'Serenity',
  'Interest',
  'Amusement',
  'Pride',
  'Contentment',
  'Excitement',
  'Relief',
  
  // Negative emotions
  'Anger',
  'Fear',
  'Sadness',
  'Disgust',
  'Shame',
  'Guilt',
  'Envy',
  'Jealousy',
  'Anxiety',
  'Grief',
  'Disappointment',
  
  // Neutral or mixed emotions
  'Surprise',
  'Confusion',
  'Nostalgia',
  'Anticipation',
  'Boredom',
  'Awe',
  'Curiosity',
  'Empathy',
  'Satisfaction',
  'Neutral',
];

// Group emotions by category
export const emotionCategories = {
  positive: [
    'Joy', 'Love', 'Hope', 'Gratitude', 'Serenity', 
    'Interest', 'Amusement', 'Pride', 'Contentment', 
    'Excitement', 'Relief'
  ],
  negative: [
    'Anger', 'Fear', 'Sadness', 'Disgust', 'Shame', 
    'Guilt', 'Envy', 'Jealousy', 'Anxiety', 
    'Grief', 'Disappointment'
  ],
  neutral: [
    'Surprise', 'Confusion', 'Nostalgia', 'Anticipation', 
    'Boredom', 'Awe', 'Curiosity', 'Empathy', 
    'Satisfaction', 'Neutral'
  ]
};

// Color options mapped to emotions and their HEX codes
export const colorOptions: { [key: string]: string } = {
  // Warm colors for positive emotions
  joy: '#FFD700', // Gold
  love: '#FF69B4', // Hot pink
  hope: '#ADD8E6', // Light blue
  gratitude: '#9ACD32', // Yellow-green
  serenity: '#E6E6FA', // Lavender
  
  // Cool/dark colors for negative emotions
  anger: '#FF0000', // Red
  fear: '#800080', // Purple
  sadness: '#6495ED', // Cornflower blue
  disgust: '#008000', // Green
  shame: '#8B4513', // Saddle brown
  
  // Neutral/mixed colors for other emotions
  surprise: '#FF7F50', // Coral
  confusion: '#D8BFD8', // Thistle
  nostalgia: '#DEB887', // Burlywood
  anticipation: '#FFA500', // Orange
  neutral: '#A9A9A9', // Dark gray
  
  // Additional colors
  excitement: '#FF1493', // Deep pink
  anxiety: '#4B0082', // Indigo
  curiosity: '#40E0D0', // Turquoise
  grief: '#483D8B', // Dark slate blue
  awe: '#9932CC', // Dark orchid
  pride: '#FFD700', // Gold
  guilt: '#8B0000', // Dark red
  boredom: '#F5F5DC', // Beige
  relief: '#98FB98', // Pale green
  contentment: '#87CEEB', // Sky blue
};

// Sound options for different emotions
export const soundOptions = [
  { id: 'gentle_waves', name: 'Gentle Waves', emotion: 'serenity' },
  { id: 'soft_rain', name: 'Soft Rain', emotion: 'sadness' },
  { id: 'birds_chirping', name: 'Birds Chirping', emotion: 'joy' },
  { id: 'crackling_fire', name: 'Crackling Fire', emotion: 'contentment' },
  { id: 'heartbeat', name: 'Heartbeat', emotion: 'anxiety' },
  { id: 'wind_chimes', name: 'Wind Chimes', emotion: 'hope' },
  { id: 'thunderstorm', name: 'Thunderstorm', emotion: 'fear' },
  { id: 'piano_melody', name: 'Piano Melody', emotion: 'nostalgia' },
  { id: 'drum_beat', name: 'Drum Beat', emotion: 'excitement' },
  { id: 'church_bells', name: 'Church Bells', emotion: 'awe' },
  { id: 'laughter', name: 'Laughter', emotion: 'amusement' },
  { id: 'ticking_clock', name: 'Ticking Clock', emotion: 'anticipation' },
  { id: 'deep_breath', name: 'Deep Breath', emotion: 'relief' },
  { id: 'crowd_celebration', name: 'Crowd Celebration', emotion: 'pride' },
  { id: 'glass_breaking', name: 'Glass Breaking', emotion: 'anger' }
];

// Vibration pattern options
export const vibrationOptions = [
  { id: 'short', name: 'Short Pulse', description: 'A quick, single vibration' },
  { id: 'long', name: 'Long Pulse', description: 'A sustained vibration' },
  { id: 'double', name: 'Double Pulse', description: 'Two quick vibrations' },
  { id: 'triple', name: 'Triple Pulse', description: 'Three quick vibrations' },
  { id: 'escalating', name: 'Escalating', description: 'Vibrations that increase in duration' },
  { id: 'heartbeat', name: 'Heartbeat', description: 'Mimics a heartbeat pattern' }
];

// Default sensory mappings for emotions (used when user doesn't specify)
export const defaultEmotionSensoryMappings: { 
  [key: string]: { 
    color: string, 
    sound?: string, 
    vibration?: string 
  } 
} = {
  Joy: { color: 'joy', sound: 'birds_chirping', vibration: 'double' },
  Love: { color: 'love', sound: 'heartbeat', vibration: 'heartbeat' },
  Hope: { color: 'hope', sound: 'wind_chimes' },
  Gratitude: { color: 'gratitude', sound: 'piano_melody' },
  Serenity: { color: 'serenity', sound: 'gentle_waves', vibration: 'long' },
  Anger: { color: 'anger', sound: 'glass_breaking', vibration: 'escalating' },
  Fear: { color: 'fear', sound: 'thunderstorm', vibration: 'heartbeat' },
  Sadness: { color: 'sadness', sound: 'soft_rain' },
  Disgust: { color: 'disgust' },
  Shame: { color: 'shame' },
  Surprise: { color: 'surprise', vibration: 'short' },
  Confusion: { color: 'confusion', vibration: 'triple' },
  Nostalgia: { color: 'nostalgia', sound: 'piano_melody' },
  Anticipation: { color: 'anticipation', sound: 'ticking_clock', vibration: 'double' },
  Neutral: { color: 'neutral' },
  
  // Additional mappings for expanded emotions
  Excitement: { color: 'excitement', sound: 'drum_beat', vibration: 'escalating' },
  Anxiety: { color: 'anxiety', sound: 'heartbeat', vibration: 'escalating' },
  Curiosity: { color: 'curiosity', vibration: 'double' },
  Grief: { color: 'grief', sound: 'soft_rain' },
  Awe: { color: 'awe', sound: 'church_bells' },
  Pride: { color: 'pride', sound: 'crowd_celebration' },
  Guilt: { color: 'guilt' },
  Relief: { color: 'relief', sound: 'deep_breath', vibration: 'long' },
  Contentment: { color: 'contentment', sound: 'crackling_fire' },
  Amusement: { color: 'joy', sound: 'laughter', vibration: 'double' },
};

// Emotional intensity gradients
export const intensityGradients = {
  low: { opacity: 0.3, saturation: 0.5 },
  medium: { opacity: 0.6, saturation: 0.75 },
  high: { opacity: 0.9, saturation: 1 },
};