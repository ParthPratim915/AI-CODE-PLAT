/**
 * Next.js middleware for route protection
 * 
 * This middleware protects routes based on user authentication and roles.
 * 
 * SECURITY NOTE:
 * Middleware runs on Edge Runtime and cannot directly access Firestore.
 * For production, implement Firebase Admin SDK with session cookies:
 * 1. Create session cookie on login (server-side API route)
 * 2. Verify session cookie in middleware using Admin SDK
 * 3. Extract user ID and role from verified token
 * 
 * Current implementation provides structure with TODO comments.
 * Client-side guards in dashboard pages provide additional protection.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection configuration
 */
const PROTECTED_ROUTES = {
  admin: ['/dashboard/admin'],
  candidate: ['/dashboard/candidate'],
  authenticated: ['/dashboard', '/test'],
};

/**
 * Check if a path matches any of the protected route patterns
 */
function isProtectedRoute(pathname: string, routeType: 'admin' | 'candidate' | 'authenticated'): boolean {
  return PROTECTED_ROUTES[routeType].some(route => pathname.startsWith(route));
}

/**
 * Middleware function to protect routes
 * 
 * TODO: Implement Firebase Admin SDK session cookie verification
 * 
 * Production implementation steps:
 * 1. Create API route: /api/auth/session (creates session cookie on login)
 * 2. Use Firebase Admin SDK to verify session cookie in middleware
 * 3. Extract user ID from verified token
 * 4. Fetch user role from Firestore using Admin SDK
 * 5. Redirect based on role:
 *    - /dashboard/admin → only role === 'admin'
 *    - /dashboard/candidate → role === 'candidate' OR 'admin'
 *    - Unauthenticated → redirect to /login
 * 
 * Current placeholder allows requests through - client-side guards provide protection
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires admin access
  if (isProtectedRoute(pathname, 'admin')) {
    // TODO: Verify Firebase session cookie and check role === 'admin'
    // const sessionCookie = request.cookies.get('session');
    // if (!sessionCookie) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
    // const decodedToken = await admin.auth().verifySessionCookie(sessionCookie.value);
    // const userRole = await getUserRoleFromFirestore(decodedToken.uid);
    // if (userRole !== 'admin') {
    //   return NextResponse.redirect(new URL('/dashboard/candidate', request.url));
    // }
  }

  // Check if route requires candidate access (or admin)
  if (isProtectedRoute(pathname, 'candidate')) {
    // TODO: Verify Firebase session cookie and check role === 'candidate' OR 'admin'
    // const sessionCookie = request.cookies.get('session');
    // if (!sessionCookie) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
    // const decodedToken = await admin.auth().verifySessionCookie(sessionCookie.value);
    // const userRole = await getUserRoleFromFirestore(decodedToken.uid);
    // if (userRole !== 'candidate' && userRole !== 'admin') {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  // Check if route requires any authentication
  if (isProtectedRoute(pathname, 'authenticated')) {
    // TODO: Verify Firebase session cookie exists
    // const sessionCookie = request.cookies.get('session');
    // if (!sessionCookie) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  // Allow request to proceed
  // Client-side guards in dashboard pages provide additional protection
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/test/:path*',
  ],
};
