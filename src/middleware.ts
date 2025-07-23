import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If token exists, verify it
  if (token) {
    const payload = await verifyToken(token)
    
    // If token is invalid and trying to access protected route
    if (!payload && !isPublicRoute) {
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('token')
      return response
    }

    // If valid token and trying to access public route, redirect to dashboard
    if (payload && isPublicRoute) {
      const dashboardUrl = payload.role === 'HR_ADMIN' ? '/dashboard/hr' : '/dashboard/employee'
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }

    // Role-based access control
    if (payload) {
      const isHRRoute = request.nextUrl.pathname.startsWith('/dashboard/hr') || 
                       request.nextUrl.pathname.startsWith('/trainings') || 
                       request.nextUrl.pathname.startsWith('/attendance')
      
      const isEmployeeRoute = request.nextUrl.pathname.startsWith('/dashboard/employee') || 
                             request.nextUrl.pathname.startsWith('/enrollment') || 
                             request.nextUrl.pathname.startsWith('/certificates') ||
                             request.nextUrl.pathname.startsWith('/feedback')

      if (isHRRoute && payload.role !== 'HR_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/employee', request.url))
      }

      if (isEmployeeRoute && payload.role !== 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/dashboard/hr', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}