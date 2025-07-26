const axios = require('axios');

const BASE_URL = "http://10.94.219.125:8080/api";

async function testTokenValidation() {
  try {
    console.log('Testing backend connection...');
    
    // Test basic connection
    const testResponse = await axios.get(`${BASE_URL}/auth/test`);
    console.log('Backend test response:', testResponse.data);
    
    // Test token validation with a dummy token
    console.log('\nTesting token validation...');
    const tokenResponse = await axios.get(`${BASE_URL}/auth/validate-token`, {
      headers: { 
        'Authorization': 'Bearer dummy-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Token validation response:', tokenResponse.data);
    
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testTokenValidation(); 