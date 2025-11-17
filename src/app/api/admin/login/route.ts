import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Debug logging
    console.log('[LOGIN] Checking credentials');
    console.log('[LOGIN] Env username:', adminUsername ? '✓ set' : '✗ NOT SET');
    console.log('[LOGIN] Env password:', adminPassword ? '✓ set' : '✗ NOT SET');
    console.log('[LOGIN] Received username:', username);
    console.log('[LOGIN] Username match:', username === adminUsername);

    // Check credentials against environment variables
    if (username === adminUsername && password === adminPassword) {
      console.log('[LOGIN] ✓ Authentication successful');
      
      // Create response with success
      const response = NextResponse.json(
        { success: true, message: 'Login successful' },
        { status: 200 }
      );

      // Set secure cookie (httpOnly, secure in production)
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    console.log('[LOGIN] ✗ Authentication failed - credentials do not match');
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}

export async function POST_logout(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}

