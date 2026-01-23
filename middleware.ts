import {type NextRequest, NextResponse} from 'next/server'

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/']
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname === route)

  // Check for Lucia session cookie
  const sessionCookie = request.cookies.get('auth_session')

  // If no session cookie and trying to access protected route, redirect to login
  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If session cookie exists and trying to access login/signup, redirect to collections
  if (
    sessionCookie &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')
  ) {
    return NextResponse.redirect(new URL('/collections', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
