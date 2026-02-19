import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// DEV MODE: Set to false to enable full auth + role-based routing
const DEV_MODE = true

const publicRoutes = ['/', '/login', '/register', '/callback', '/terms', '/privacy']
const workerRoutes = ['/worker-dashboard', '/worker-profile', '/worker-calendar', '/worker-bookings', '/worker-messages', '/worker-reviews', '/worker-earnings', '/worker-settings', '/worker-notifications']
const clientRoutes = ['/dashboard', '/search', '/workers', '/bookings', '/messages', '/reviews', '/profile', '/notifications']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request)
  const path = request.nextUrl.pathname

  // DEV MODE: Allow all routes without authentication
  if (DEV_MODE) {
    return supabaseResponse
  }

  // Allow public routes
  if (publicRoutes.some((route) => path === route) || path.startsWith('/api/')) {
    return supabaseResponse
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Get user profile for role-based routing
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // New user without profile - send to registration
    if (!path.startsWith('/register')) {
      return NextResponse.redirect(new URL('/register', request.url))
    }
    return supabaseResponse
  }

  const role = profile.role

  // Prevent workers from accessing client routes and vice versa
  if (role === 'worker' && clientRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/worker-dashboard', request.url))
  }

  if (role === 'client' && workerRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin routes only for admins
  if (adminRoutes.some((route) => path.startsWith(route)) && role !== 'admin') {
    return NextResponse.redirect(
      new URL(role === 'worker' ? '/worker-dashboard' : '/dashboard', request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|locales|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
