// Simple script to test admin login functionality

const username = 'admin';
const password = 'Queanbeyan@9';

// Function to test admin login
async function testAdminLogin() {
  try {
    console.log(`Attempting to log in with username: ${username}`);
    
    // Login attempt
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed with status: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful!');
    console.log('Token:', loginData.token);
    console.log('User:', loginData.user);
    
    // Test dashboard access with token
    const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!dashboardResponse.ok) {
      throw new Error(`Dashboard access failed with status: ${dashboardResponse.status}`);
    }
    
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard access successful!');
    console.log('Dashboard data:', JSON.stringify(dashboardData, null, 2));
    
    return 'Admin login functionality is working correctly!';
  } catch (error) {
    console.error('Test failed:', error.message);
    return `Admin login test failed: ${error.message}`;
  }
}

// Run the test
testAdminLogin().then(result => {
  console.log('\nTest Result:', result);
});