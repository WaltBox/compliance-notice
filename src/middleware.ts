import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // If on beaglenotice.com (without www), redirect to www version
  if (host === 'beaglenotice.com') {
    return NextResponse.redirect(`https://www.beaglenotice.com${pathname}`, { status: 301 });
  }

  // If on www.beaglenotice.com domain - only allow public routes
  if (host.includes('www.beaglenotice.com')) {
    // Redirect root and /lander to joinbeagle.com (GoDaddy forwards non-www domains to /lander)
    if (pathname === '/' || pathname === '/lander') {
      return NextResponse.redirect('https://joinbeagle.com', { status: 301 });
    }

    // Block admin routes
    if (pathname.startsWith('/admin')) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Allow /programs/*, /api/beagle-programs, /api/opt-out-responses, /api/opt-in-responses, and /api/upgrade-selections routes
    // (everything else also returns 404)
    if (!pathname.startsWith('/programs') && !pathname.startsWith('/api/beagle-programs') && !pathname.startsWith('/api/opt-out-responses') && !pathname.startsWith('/api/opt-in-responses') && !pathname.startsWith('/api/upgrade-selections')) {
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

