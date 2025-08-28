import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('token')
  
  // Check if the request is for the daily-view route
  if (request.nextUrl.pathname.startsWith('/daily-view')) {
    // If no token is present, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/daily-view/:path*',
  ],
}
