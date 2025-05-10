/**
 * MoodLync Registration Flow Test Script
 * 
 * This script tests the complete registration flow with step-by-step validation
 * to help identify and fix any issues in the process.
 */

// Store cookies between requests
let cookies = '';

// Helper function to make API requests with proper logging
async function makeRequest(url, method, data) {
  try {
    // Add base URL for Node.js environment
    const baseUrl = 'http://localhost:5000';
    const fullUrl = new URL(url, baseUrl).toString();
    
    console.log(`\n🔷 Making ${method} request to ${fullUrl}`);
    if (data) {
      console.log('Request data:', JSON.stringify(data, null, 2));
    }
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    // Add cookies to maintain session state
    if (cookies) {
      options.headers['Cookie'] = cookies;
    }
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(fullUrl, options);
    
    // Save cookies for future requests
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // Extract the session cookie
      const sessionCookie = setCookieHeader.split(';')[0];
      cookies = sessionCookie;
      console.log('Session cookie received:', cookies);
    }
    console.log(`Response status: ${response.status}`);
    
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData, null, 2));
    } else {
      const text = await response.text();
      console.log('Response text:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      responseData = { text: text };
    }
    
    return { 
      status: response.status, 
      data: responseData,
      success: response.status >= 200 && response.status < 300
    };
  } catch (error) {
    console.error('❌ Error making request:', error);
    return { error: error.message };
  }
}

// Generate unique test user data
function generateTestUser() {
  const randomNum = Math.floor(Math.random() * 100000);
  return {
    username: `testuser${randomNum}`,
    password: "Password123!",
    email: `testuser${randomNum}@example.com`,
    firstName: "Test",
    lastName: "User",
    middleName: "",
    gender: "prefer_not_to_say",
    state: "Victoria",
    country: "Australia"
  };
}

// Test the validation endpoint
async function testValidation(userData) {
  console.log('\n📋 STEP 1: Testing validation endpoint');
  const result = await makeRequest('/api/test-register', 'POST', userData);
  
  if (!result.success) {
    console.error('❌ Validation test failed');
    return false;
  }
  
  console.log('✅ Validation test passed');
  return true;
}

// Test the health check endpoint
async function testHealthCheck() {
  console.log('\n🩺 STEP 2: Testing API health check');
  const result = await makeRequest('/api/healthcheck', 'GET');
  
  if (!result.success) {
    console.error('❌ Health check failed');
    return false;
  }
  
  console.log('✅ Health check passed');
  return true;
}

// Test the actual registration endpoint
async function testRegistration(userData) {
  console.log('\n📝 STEP 3: Testing actual registration');
  const result = await makeRequest('/api/register', 'POST', userData);
  
  if (!result.success) {
    console.error('❌ Registration failed');
    return false;
  }
  
  console.log('✅ Registration successful');
  return true;
}

// Test login after registration
async function testLogin(username, password) {
  console.log('\n🔑 STEP 4: Testing login with registered credentials');
  const result = await makeRequest('/api/login', 'POST', { 
    username, 
    password 
  });
  
  if (!result.success) {
    console.error('❌ Login failed');
    return false;
  }
  
  console.log('✅ Login successful');
  return true;
}

// Test user profile endpoint
async function testUserProfile() {
  console.log('\n👤 STEP 5: Testing user profile endpoint');
  const result = await makeRequest('/api/user', 'GET');
  
  if (!result.success) {
    console.error('❌ User profile fetch failed');
    return false;
  }
  
  console.log('✅ User profile fetch successful');
  return true;
}

// Test logout
async function testLogout() {
  console.log('\n🚪 STEP 6: Testing logout');
  const result = await makeRequest('/api/logout', 'POST');
  
  if (!result.success) {
    console.error('❌ Logout failed');
    return false;
  }
  
  console.log('✅ Logout successful');
  return true;
}

// Run the full registration flow test
async function runFullRegistrationTest() {
  console.log('🚀 Starting full registration flow test');
  console.log('======================================');
  
  // Generate test user data
  const testUser = generateTestUser();
  console.log('Test user data:', testUser);
  
  // Run all tests in sequence
  const validationPassed = await testValidation(testUser);
  if (!validationPassed) return;
  
  const healthCheckPassed = await testHealthCheck();
  if (!healthCheckPassed) return;
  
  const registrationPassed = await testRegistration(testUser);
  if (!registrationPassed) return;
  
  const loginPassed = await testLogin(testUser.username, testUser.password);
  if (!loginPassed) return;
  
  const profilePassed = await testUserProfile();
  if (!profilePassed) return;
  
  const logoutPassed = await testLogout();
  if (!logoutPassed) return;
  
  console.log('\n✨ SUCCESS: Full registration flow test completed successfully!');
  console.log('User registered, logged in, profile retrieved, and logged out.');
  
  return {
    success: true,
    userData: testUser
  };
}

// Run the tests
runFullRegistrationTest().then(result => {
  if (result && result.success) {
    console.log('\n👍 TEST SUMMARY: All tests completed successfully');
  } else {
    console.log('\n👎 TEST SUMMARY: Some tests failed, see logs above for details');
  }
}).catch(err => {
  console.error('Error running tests:', err);
});