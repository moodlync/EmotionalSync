/**
 * Test script for MoodLync simplified authentication system
 * 
 * This script tests:
 * 1. Registration with the simplified auth system
 * 2. Login with the created credentials
 * 3. Retrieving user profile
 * 4. Logging out
 */

import fetch from 'node-fetch';
import fs from 'fs';
import { promisify } from 'util';
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5001';
const COOKIES_FILE = 'cookies.txt';
let cookies = '';

// Test user credentials
const TEST_USER = {
  username: 'testuser_' + Math.floor(Math.random() * 10000),
  password: 'Password123!',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
};

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (cookies) {
    options.headers.Cookie = cookies;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  
  // Save cookies from response
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    cookies = setCookieHeader;
    await writeFile(COOKIES_FILE, cookies);
    console.log('Cookies saved to', COOKIES_FILE);
  }

  return response;
}

async function loadCookies() {
  try {
    cookies = await readFile(COOKIES_FILE, 'utf8');
    console.log('Cookies loaded from', COOKIES_FILE);
    return true;
  } catch (err) {
    console.log('No cookies file found or error reading cookies');
    return false;
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  try {
    const response = await apiRequest('/api/healthcheck');
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Health check response:', data);
    return response.status === 200;
  } catch (err) {
    console.error('Health check failed:', err);
    return false;
  }
}

async function testRegister() {
  console.log('\n=== Testing Registration ===');
  try {
    const response = await apiRequest('/api/register', 'POST', TEST_USER);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    
    if (response.status === 201) {
      console.log('User registered successfully:');
      console.log(`- ID: ${data.id}`);
      console.log(`- Username: ${data.username}`);
      return true;
    } else {
      console.error('Registration failed:', data);
      return false;
    }
  } catch (err) {
    console.error('Registration error:', err);
    return false;
  }
}

async function testLogin() {
  console.log('\n=== Testing Login ===');
  try {
    const response = await apiRequest('/api/login', 'POST', {
      username: TEST_USER.username,
      password: TEST_USER.password
    });
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('Login successful:');
      console.log(`- ID: ${data.id}`);
      console.log(`- Username: ${data.username}`);
      return true;
    } else {
      console.error('Login failed:', data);
      return false;
    }
  } catch (err) {
    console.error('Login error:', err);
    return false;
  }
}

async function testGetUser() {
  console.log('\n=== Testing Get User Profile ===');
  try {
    const response = await apiRequest('/api/user');
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('User profile retrieved:');
      console.log(`- ID: ${data.id}`);
      console.log(`- Username: ${data.username}`);
      console.log(`- Email: ${data.email}`);
      return true;
    } else {
      console.error('Failed to get user profile');
      return false;
    }
  } catch (err) {
    console.error('Get user error:', err);
    return false;
  }
}

async function testLogout() {
  console.log('\n=== Testing Logout ===');
  try {
    const response = await apiRequest('/api/logout', 'POST');
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('Logout successful');
      // Clear cookies
      cookies = '';
      await writeFile(COOKIES_FILE, '');
      return true;
    } else {
      console.error('Logout failed');
      return false;
    }
  } catch (err) {
    console.error('Logout error:', err);
    return false;
  }
}

async function testVerifyLoggedOut() {
  console.log('\n=== Verifying Logged Out State ===');
  try {
    const response = await apiRequest('/api/user');
    console.log(`Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('User is correctly logged out (401 Unauthorized)');
      return true;
    } else {
      console.error('User still appears to be logged in');
      return false;
    }
  } catch (err) {
    console.error('Verify logged out error:', err);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting simplified auth tests');
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Test user: ${TEST_USER.username}`);
  
  // Load cookies if they exist
  await loadCookies();
  
  let allPassed = true;
  
  // Run all tests
  if (!await testHealthCheck()) allPassed = false;
  if (!await testRegister()) allPassed = false;
  if (!await testLogin()) allPassed = false;
  if (!await testGetUser()) allPassed = false;
  if (!await testLogout()) allPassed = false;
  if (!await testVerifyLoggedOut()) allPassed = false;
  
  // Display final results
  console.log('\n=== Test Results ===');
  if (allPassed) {
    console.log('✅ All tests PASSED!');
  } else {
    console.log('❌ Some tests FAILED!');
  }
}

// Add main function to make the script work as ES module
const main = async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  }
};

// Run the main function
main();