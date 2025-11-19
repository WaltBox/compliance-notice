import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // If on beaglenotice.com domain - only allow public routes
  if (host.includes('beaglenotice.com')) {
    // Redirect root to beagleforpms.com
    if (pathname === '/') {
      return NextResponse.redirect('https://www.beagleforpms.com', { status: 301 });
    }

    // Block admin routes
    if (pathname.startsWith('/admin')) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Allow /programs/*, /api/beagle-programs, and /api/opt-out-responses routes
    // (everything else also returns 404)
    if (!pathname.startsWith('/programs') && !pathname.startsWith('/api/beagle-programs') && !pathname.startsWith('/api/opt-out-responses')) {
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  // Check authentication for admin routes (on any domain except beaglenotice.com)
  if (!host.includes('beaglenotice.com') && pathname.startsWith('/admin')) {
    // Allow login page without auth
    if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
      return NextResponse.next();
    }

    // Check for admin session cookie
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

