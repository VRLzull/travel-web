/**
 * Simple Node.js script untuk testing API
 * Jalankan: node test-script.js
 * 
 * Pastikan backend server sudah running di port 4000
 */

const http = require('http');

const BASE_URL = 'http://localhost:4000/api';
let adminToken = '';

// Helper function untuk membuat HTTP request
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const result = await makeRequest('GET', '/health');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

async function testLogin() {
  console.log('\n🔐 Testing Admin Login...');
  const result = await makeRequest('POST', '/auth/login', {
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true
  });
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  
  if (result.data.success && result.data.data.token) {
    adminToken = result.data.data.token;
    console.log('✅ Token received:', adminToken.substring(0, 20) + '...');
    return true;
  }
  return false;
}

async function testGetPackages() {
  console.log('\n📦 Testing Get All Packages...');
  const result = await makeRequest('GET', '/packages');
  console.log('Status:', result.status);
  console.log('Packages count:', Array.isArray(result.data) ? result.data.length : 'N/A');
  return result.status === 200;
}

async function testCreatePackage() {
  console.log('\n➕ Testing Create Package...');
  const result = await makeRequest('POST', '/packages', {
    title: 'Paket Test Bali',
    location: 'Bali, Indonesia',
    category: 'Domestic',
    duration_days: 3,
    price_per_person: 2500000,
    short_description: 'Paket test',
    description: 'Ini adalah paket test untuk testing API'
  }, adminToken);
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 201;
}

async function testGetBookings() {
  console.log('\n📋 Testing Get All Bookings...');
  const result = await makeRequest('GET', '/bookings');
  console.log('Status:', result.status);
  console.log('Bookings count:', result.data.count || 'N/A');
  return result.status === 200;
}

async function testCreateBooking() {
  console.log('\n📝 Testing Create Booking...');
  const result = await makeRequest('POST', '/bookings', {
    package_id: 1,
    trip_date: '2024-12-25',
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '081234567890',
    total_participants: 2
  });
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 201;
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('='.repeat(50));

  try {
    const tests = [
      { name: 'Health Check', fn: testHealthCheck },
      { name: 'Admin Login', fn: testLogin },
      { name: 'Get Packages', fn: testGetPackages },
      { name: 'Create Package', fn: testCreatePackage },
      { name: 'Get Bookings', fn: testGetBookings },
      { name: 'Create Booking', fn: testCreateBooking },
    ];

    const results = [];
    for (const test of tests) {
      try {
        const passed = await test.fn();
        results.push({ name: test.name, passed });
        if (!passed) {
          console.log(`❌ ${test.name} FAILED`);
        } else {
          console.log(`✅ ${test.name} PASSED`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} ERROR:`, error.message);
        results.push({ name: test.name, passed: false });
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Test Summary:');
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed');
    }

  } catch (error) {
    console.error('❌ Test suite error:', error);
  }
}

// Run tests
runTests();

