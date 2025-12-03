import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')
  const isPublicAPI = req.nextUrl.pathname.startsWith('/api/public')

  // Allow public API routes
  if (isPublicAPI) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from login page
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Require auth for all dashboard routes
  if (!isAuthPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role-based access control
  const userRole = req.auth?.user?.role
  const path = req.nextUrl.pathname

  // Admin-only routes
  if (path.startsWith('/settings') || path.startsWith('/staff')) {
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Trainer restrictions
  if (userRole === 'TRAINER') {
    const restrictedPaths = ['/billing', '/reports', '/leads']
    if (restrictedPaths.some(p => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)']
}
