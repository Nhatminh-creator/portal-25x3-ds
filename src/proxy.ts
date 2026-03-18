import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ['/diem-danh', '/lich-su']
  
  // Check if the current route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Middleware-level auth check would require session management
    // For now, the ProtectedRoute component handles the client-side protection
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/diem-danh/:path*', '/lich-su/:path*', '/'],
}
