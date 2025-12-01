import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/login
 * Admin login endpoint - authenticate with email/password
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Call Supabase Auth API
    const supabaseResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await supabaseResponse.json();

    if (!supabaseResponse.ok) {
      console.error('Supabase auth error:', data);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      token: data.access_token,
      refreshToken: data.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });

    // Set admin_session cookie that middleware checks for
    response.cookies.set('admin_session', data.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
