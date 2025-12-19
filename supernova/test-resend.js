// Quick test script to verify Resend works
require('dotenv').config({ path: '.env.local' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

console.log('=== RESEND TEST ===');
console.log('API Key exists:', !!RESEND_API_KEY);
console.log('API Key prefix:', RESEND_API_KEY?.substring(0, 10));

async function testResend() {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'debs@daitaniverse.space',
        to: 'debs@daitani.co.uk',
        subject: 'Direct API Test from Node',
        html: '<p>Testing Resend API directly from Node.js</p>'
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS - Email sent!');
      console.log('Check your inbox and Resend dashboard');
    } else {
      console.log('\n❌ FAILED - Check the error above');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testResend();
