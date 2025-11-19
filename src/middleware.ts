import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/supernova', '/marketplace', '/community', '/library', '/admin']

// Routes that require specific roles
const roleProtectedRoutes: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/supernova': ['UPGRADE', 'MEMBER', 'ADMIN'],
  '/library': ['UPGRADE', 'MEMBER', 'ADMIN'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get auth token from cookie
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Verify token
  const payload = verifyToken(token)

  if (!payload) {
    // Invalid token, redirect to login
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleProtectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(payload.role)) {
        // Insufficient permissions
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|auth).*)',
  ],
}
