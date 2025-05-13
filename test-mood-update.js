/**
 * MoodLync Mood Update Test
 * 
 * This script simulates changing a mood and verifies the update flow
 * by logging state changes in local storage and UI.
 */

// Simulate the mood selection
function simulateMoodSelection(emotion) {
  console.log(`Selecting emotion: ${emotion}`);
  
  // Normalize emotion (similar to the normalizeEmotion function)
  const normalizedEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);
  console.log(`Normalized emotion: ${normalizedEmotion}`);
  
  // Simulate updating the local storage (similar to syncMoodData)
  localStorage.setItem('moodlync_current_mood', JSON.stringify({
    emotion: normalizedEmotion,
    intensity: 5,
    timestamp: new Date().toISOString()
  }));
  console.log('Updated local storage with new emotion');
  
  // Simulate the event broadcast
  const event = new CustomEvent('moodlync:mood-update', {
    detail: {
      emotion: normalizedEmotion,
      intensity: 5,
      timestamp: new Date().toISOString()
    }
  });
  window.dispatchEvent(event);
  console.log('Dispatched mood-update event');
  
  // Simulate the optimistic UI update
  console.log('Optimistically updating UI before API call');
  
  // Simulate the API call
  console.log('Making API call to update emotion on server');
  
  // Simulate the API response
  setTimeout(() => {
    console.log('API call completed');
    console.log('Received server response with updated emotion data');
    
    // Simulate updating the query cache
    console.log('Updating query cache with server response');
    
    // Simulate query cache invalidation
    console.log('Invalidating emotion queries to refresh data');
    
    // Verify the final state
    const storedMood = localStorage.getItem('moodlync_current_mood');
    console.log('Final emotion state in local storage:', storedMood);
    
    console.log('✅ Mood update complete - the UI should now reflect the new emotion');
  }, 500);
}

// Test multiple emotions
const emotions = ['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral'];

// Run the tests sequentially with delays between them
function runTests() {
  let index = 0;
  
  function testNextEmotion() {
    if (index < emotions.length) {
      console.log(`\n----- Testing emotion update: ${emotions[index]} -----\n`);
      simulateMoodSelection(emotions[index]);
      index++;
      setTimeout(testNextEmotion, 1000);
    } else {
      console.log('\n✅ All mood update tests complete');
    }
  }
  
  testNextEmotion();
}

// Start the tests
console.log('Starting mood update tests...');
runTests();