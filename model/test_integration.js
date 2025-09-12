/**
 * Test script for AgriClip model integration
 * This script tests the connection between Express backend and FastAPI model service
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Configuration
const EXPRESS_API_URL = 'http://localhost:3000/api';
const FASTAPI_URL = 'http://localhost:8000';
const TEST_IMAGE_PATH = path.join(__dirname, 'test_image.jpg');

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
  username: 'testuser'
};

let authToken = null;
let uploadId = null;

// Helper function to log test results
function logTest(name, success, message) {
  console.log(`\n${success ? '✅' : '❌'} ${name}`);
  console.log(`  ${message}`);
}

// Helper function to handle errors
function handleError(testName, error) {
  if (error.response) {
    logTest(testName, false, `Error ${error.response.status}: ${error.response.statusText}`);
    console.error('Response data:', error.response.data);
  } else if (error.request) {
    logTest(testName, false, 'No response received');
  } else {
    logTest(testName, false, `Error: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log('🔍 Starting AgriClip Integration Tests');
  console.log('=====================================');
  
  try {
    // Test 1: Check FastAPI health
    try {
      const response = await axios.get(`${FASTAPI_URL}/health`);
      logTest('FastAPI Health Check', true, `Status: ${JSON.stringify(response.data)}`);
    } catch (error) {
      handleError('FastAPI Health Check', error);
      console.log('\n❌ FastAPI service is not running. Please start it first.');
      return;
    }
    
    // Test 2: Check Express API health
    try {
      const response = await axios.get(`${EXPRESS_API_URL}/health`);
      logTest('Express API Health Check', true, `Status: ${JSON.stringify(response.data)}`);
    } catch (error) {
      handleError('Express API Health Check', error);
      console.log('\n❌ Express API is not running. Please start it first.');
      return;
    }
    
    // Test 3: Check model status through Express API
    try {
      const response = await axios.get(`${EXPRESS_API_URL}/model/status`);
      logTest('Model Status Check', true, `Status: ${response.data.message}`);
    } catch (error) {
      handleError('Model Status Check', error);
    }
    
    // Test 4: Get disease list through Express API
    try {
      const response = await axios.get(`${EXPRESS_API_URL}/model/diseases`);
      logTest('Disease List Check', true, `Retrieved ${response.data.data.diseases.length} diseases`);
    } catch (error) {
      handleError('Disease List Check', error);
    }
    
    console.log('\n✅ All integration tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }
}

// Run the tests
runTests();