// Simple registration test script

// Helper function to make API requests
async function makeRequest(url, method, data) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error('Error making request:', error);
    return { error: error.message };
  }
}

// Test registration data
const testUser = {
  username: "testuser" + Math.floor(Math.random() * 10000),
  password: "Password123!",
  email: `testuser${Math.floor(Math.random() * 10000)}@example.com`,
  firstName: "Test",
  lastName: "User",
  dateOfBirth: "1990-01-01"
};

console.log('Test user data:', testUser);

// Test the two endpoints
async function runTests() {
  console.log('1. Testing /api/test-register endpoint...');
  await makeRequest('/api/test-register', 'POST', testUser);
  
  console.log('\n2. Testing actual /api/register endpoint...');
  await makeRequest('/api/register', 'POST', testUser);
}

// Run the tests
runTests();