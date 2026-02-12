import {type NextRequest, NextResponse} from 'next/server'

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth_session')

  // If logged in and trying to access login/signup, redirect to collections
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
