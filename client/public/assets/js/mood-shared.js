/**
 * MoodLync Shared Mood Functions
 * This file provides common functionality for HTML-based mood selectors
 */

// Basic emotion data structure with consistent naming and colors
const EMOTIONS = {
  Joy: {
    name: "Joy",
    emoji: "😊",
    description: "Feeling happy and content",
    background: "#FFDE7D",
    textColor: "#7A4100",
    gradient: ["#FFC837", "#FF8008"]
  },
  Sadness: {
    name: "Sadness",
    emoji: "😢",
    description: "Feeling down or blue",
    background: "#A0C4FF",
    textColor: "#2A3C5F",
    gradient: ["#9BAFD9", "#6D83B9"] 
  },
  Anger: {
    name: "Anger",
    emoji: "😠",
    description: "Feeling frustrated or mad",
    background: "#FF7D7D",
    textColor: "#6F0000",
    gradient: ["#FF4141", "#D10000"]
  },
  Anxiety: {
    name: "Anxiety",
    emoji: "😰",
    description: "Feeling worried or nervous",
    background: "#FFD39A",
    textColor: "#704200",
    gradient: ["#FFB75E", "#ED8F03"]
  },
  Excitement: {
    name: "Excitement",
    emoji: "🤩",
    description: "Feeling enthusiastic and eager",
    background: "#FFA9F9",
    textColor: "#6A008D",
    gradient: ["#FF67FF", "#C840FF"]
  },
  Neutral: {
    name: "Neutral",
    emoji: "😐",
    description: "Feeling neither positive nor negative",
    background: "#E0E0E0",
    textColor: "#424242",
    gradient: ["#BDBDBD", "#9E9E9E"]
  }
};

// Primary emotions list (consistent with React component)
const PRIMARY_EMOTIONS = ["Joy", "Sadness", "Anger", "Anxiety", "Excitement", "Neutral"];

// Mapping from lowercase to capitalized (for compatibility with different systems)
const LOWERCASE_TO_CAPITALIZED = {
  'happy': 'Joy',
  'sad': 'Sadness',
  'angry': 'Anger',
  'anxious': 'Anxiety',
  'excited': 'Excitement',
  'neutral': 'Neutral'
};

// Mapping from capitalized to lowercase
const CAPITALIZED_TO_LOWERCASE = {
  'Joy': 'happy',
  'Sadness': 'sad',
  'Anger': 'angry',
  'Anxiety': 'anxious',
  'Excitement': 'excited',
  'Neutral': 'neutral'
};

/**
 * Normalize emotion names to capitalize format for consistency
 * @param {string} emotion - Emotion name in any format
 * @returns {string} - Normalized emotion name
 */
function normalizeEmotion(emotion) {
  // If emotion is capitalized form, return it
  if (PRIMARY_EMOTIONS.includes(emotion)) {
    return emotion;
  }
  
  // If emotion is lowercase form, convert it
  if (LOWERCASE_TO_CAPITALIZED[emotion]) {
    return LOWERCASE_TO_CAPITALIZED[emotion];
  }
  
  // Default to Neutral if we can't determine
  return 'Neutral';
}

/**
 * Save current mood to localStorage for cross-page communication
 * @param {string} emotion - The emotion to save
 * @param {number} intensity - The intensity value (1-10)
 */
function saveMoodToLocalStorage(emotion, intensity = 5) {
  const normalizedEmotion = normalizeEmotion(emotion);
  
  try {
    localStorage.setItem('moodlync_current_mood', JSON.stringify({
      emotion: normalizedEmotion,
      intensity: intensity,
      timestamp: new Date().toISOString()
    }));
    
    console.log(`Mood saved to localStorage: ${normalizedEmotion} (${intensity})`);
    
    // Broadcast event for communication with React components
    const moodEvent = new CustomEvent('moodlync:mood-update', {
      detail: {
        emotion: normalizedEmotion,
        intensity: intensity,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(moodEvent);
    
  } catch (error) {
    console.error('Error saving mood to localStorage:', error);
  }
}

/**
 * Load mood from localStorage
 * @returns {Object|null} - The mood data or null if not found
 */
function loadMoodFromLocalStorage() {
  try {
    const savedMood = localStorage.getItem('moodlync_current_mood');
    if (savedMood) {
      return JSON.parse(savedMood);
    }
  } catch (error) {
    console.error('Error loading mood from localStorage:', error);
  }
  
  return null;
}

/**
 * Fetch mood data from the server API
 * @returns {Promise<Object>} - The emotion data from server
 */
async function fetchMoodData() {
  try {
    const response = await fetch('/api/mood-data');
    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || EMOTIONS; // Use default emotions if API doesn't return data
    
  } catch (error) {
    console.error('Error fetching mood data:', error);
    return EMOTIONS; // Return default emotions on error
  }
}

/**
 * Track a mood selection and send to server
 * @param {string} emotion - The selected emotion
 * @param {number} intensity - The intensity value
 */
async function trackMoodSelection(emotion, intensity = 5) {
  const normalizedEmotion = normalizeEmotion(emotion);
  
  try {
    // Save locally first (this works without server)
    saveMoodToLocalStorage(normalizedEmotion, intensity);
    
    // Optionally send to server API (if available)
    // This is commented out because we don't have a server endpoint yet
    /*
    const response = await fetch('/api/track-mood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emotion: normalizedEmotion,
        intensity: intensity,
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Mood tracked successfully:', result);
    */
    
    return true;
  } catch (error) {
    console.error('Error tracking mood:', error);
    return false;
  }
}

/**
 * Get the appropriate CSS gradient for an emotion
 * @param {string} emotion - The emotion name
 * @returns {string} - CSS gradient string
 */
function getEmotionGradient(emotion) {
  const normalizedEmotion = normalizeEmotion(emotion);
  const emotionData = EMOTIONS[normalizedEmotion] || EMOTIONS.Neutral;
  
  return `linear-gradient(135deg, ${emotionData.gradient[0]}, ${emotionData.gradient[1]})`;
}

/**
 * Show a toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {number} duration - Duration in ms
 */
function showToast(title, message, duration = 3000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('mood-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'mood-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    `;
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    background-color: white;
    color: #333;
    padding: 12px 16px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    margin-top: 8px;
    min-width: 250px;
    max-width: 320px;
    animation: slideIn 0.3s, fadeOut 0.3s ${duration/1000 - 0.3}s forwards;
    border-left: 4px solid #4D4DE3;
  `;
  
  // Add title
  const titleEl = document.createElement('div');
  titleEl.textContent = title;
  titleEl.style.cssText = `
    font-weight: 600;
    margin-bottom: 4px;
  `;
  
  // Add message
  const messageEl = document.createElement('div');
  messageEl.textContent = message;
  messageEl.style.cssText = `
    font-size: 14px;
    opacity: 0.8;
  `;
  
  // Add to document
  toast.appendChild(titleEl);
  toast.appendChild(messageEl);
  toastContainer.appendChild(toast);
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Remove after duration
  setTimeout(() => {
    toast.remove();
  }, duration);
}

// Export functions for use in HTML files
window.MoodLyncShared = {
  EMOTIONS,
  PRIMARY_EMOTIONS,
  normalizeEmotion,
  saveMoodToLocalStorage,
  loadMoodFromLocalStorage,
  fetchMoodData,
  trackMoodSelection,
  getEmotionGradient,
  showToast
};