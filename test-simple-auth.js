/**
 * This script tests the simplified authentication server for MoodLync
 * It sends registration, login, profile, and logout requests
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const USERNAME = 'tester_' + Math.floor(Math.random() * 1000);
const PASSWORD = 'Password123';
const EMAIL = `${USERNAME}@example.com`;

// Store cookies between requests
let cookies = '';

// Helper function for making API requests
async function apiRequest(endpoint, method, data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  // Add cookies for session management
  if (cookies) {
    options.headers.Cookie = cookies;
  }
  
  // Add request body for POST requests
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    console.log(`Making ${method} request to ${url}`, data ? 'with data' : '');
    
    const response = await fetch(url, options);
    
    // Extract and save cookies from response
    const responseCookies = response.headers.get('set-cookie');
    if (responseCookies) {
      cookies = responseCookies;
    }
    
    // Parse response
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = { status: response.status, statusText: response.statusText };
    }
    
    return {
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error(`Error in ${method} request to ${url}:`, error.message);
    return {
      status: 0,
      error: error.message
    };
  }
}

// Test user registration
async function testRegistration() {
  console.log('\n----- TESTING USER REGISTRATION -----');
  
  const userData = {
    username: USERNAME,
    password: PASSWORD,
    email: EMAIL,
    firstName: 'Test',
    lastName: 'User'
  };
  
  const response = await apiRequest('/api/register', 'POST', userData);
  
  if (response.status === 201) {
    console.log('✅ REGISTRATION SUCCESSFUL:', {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email
    });
    return true;
  } else {
    console.log('❌ REGISTRATION FAILED:', response);
    return false;
  }
}

// Test user login
async function testLogin() {
  console.log('\n----- TESTING USER LOGIN -----');
  
  const loginData = {
    username: USERNAME,
    password: PASSWORD
  };
  
  const response = await apiRequest('/api/login', 'POST', loginData);
  
  if (response.status === 200) {
    console.log('✅ LOGIN SUCCESSFUL:', {
      id: response.data.id,
      username: response.data.username
    });
    return true;
  } else {
    console.log('❌ LOGIN FAILED:', response);
    return false;
  }
}

// Test getting user profile
async function testGetProfile() {
  console.log('\n----- TESTING GET USER PROFILE -----');
  
  const response = await apiRequest('/api/user', 'GET');
  
  if (response.status === 200) {
    console.log('✅ PROFILE RETRIEVED SUCCESSFULLY:', {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email
    });
    return true;
  } else {
    console.log('❌ PROFILE RETRIEVAL FAILED:', response);
    return false;
  }
}

// Test user logout
async function testLogout() {
  console.log('\n----- TESTING USER LOGOUT -----');
  
  const response = await apiRequest('/api/logout', 'POST');
  
  if (response.status === 200) {
    console.log('✅ LOGOUT SUCCESSFUL');
    return true;
  } else {
    console.log('❌ LOGOUT FAILED:', response);
    return false;
  }
}

// Test accessing protected route after logout
async function testProtectedRouteAfterLogout() {
  console.log('\n----- TESTING PROTECTED ROUTE AFTER LOGOUT -----');
  
  const response = await apiRequest('/api/user', 'GET');
  
  if (response.status === 401) {
    console.log('✅ PROTECTED ROUTE CORRECTLY RETURNED 401 AFTER LOGOUT');
    return true;
  } else {
    console.log('❌ PROTECTED ROUTE TEST FAILED:', response);
    return false;
  }
}

// Health check test
async function testHealthCheck() {
  console.log('\n----- TESTING HEALTH CHECK ENDPOINT -----');
  
  const response = await apiRequest('/api/healthcheck', 'GET');
  
  if (response.status === 200) {
    console.log('✅ HEALTH CHECK SUCCESSFUL:', response.data);
    return true;
  } else {
    console.log('❌ HEALTH CHECK FAILED:', response);
    return false;
  }
}

// Run all tests in sequence
async function runAllTests() {
  console.log('===========================================');
  console.log('  STARTING SIMPLIFIED AUTH SYSTEM TESTS');
  console.log('===========================================');
  console.log(`API BASE URL: ${API_BASE_URL}`);
  console.log(`Test username: ${USERNAME}`);
  
  // First, check if server is running
  try {
    const healthCheck = await testHealthCheck();
    if (!healthCheck) {
      console.error('❌ Server health check failed. Is the server running?');
      process.exit(1);
    }
    
    // Run the authentication flow tests
    const registrationSuccessful = await testRegistration();
    
    if (!registrationSuccessful) {
      console.log('⚠️ Registration failed, attempting login with existing user credentials');
    }
    
    const loginSuccessful = await testLogin();
    
    if (!loginSuccessful) {
      console.error('❌ Login failed. Cannot continue tests.');
      process.exit(1);
    }
    
    await testGetProfile();
    await testLogout();
    await testProtectedRouteAfterLogout();
    
    console.log('\n===========================================');
    console.log('      ALL TESTS COMPLETED');
    console.log('===========================================');
  } catch (error) {
    console.error('❌ Test execution error:', error);
    process.exit(1);
  }
}

// Execute tests
runAllTests();