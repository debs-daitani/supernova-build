import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== RESEND API TEST START ===');
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('RESEND_API_KEY first 10 chars:', process.env.RESEND_API_KEY?.substring(0, 10));
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

  try {
    const payload = {
      from: 'debs@daitaniverse.space',
      to: 'debs@daitani.co.uk',
      subject: 'Test from dAItaniverse',
      html: '<p>If you see this, Resend works!</p>'
    };

    console.log('Sending to Resend API with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Resend response status:', response.status);
    console.log('Resend response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    const responseData = await response.json();
    console.log('Resend response body:', JSON.stringify(responseData, null, 2));

    console.log('=== RESEND API TEST END ===');

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: responseData,
      env: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
        emailFrom: process.env.EMAIL_FROM
      }
    });
  } catch (error: any) {
    console.error('=== RESEND API TEST ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
