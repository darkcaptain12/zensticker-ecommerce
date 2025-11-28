import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { rateLimit } from '@/lib/rate-limit'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIP || request.ip || 'unknown'
  return ip
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limiting for login endpoint
  if (pathname.startsWith('/api/auth/signin') || pathname === '/giris') {
    const ip = getClientIP(request)
    const result = rateLimit(`login:${ip}`, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 login attempts per 15 minutes
    })

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      )
    }
  }

  // Rate limiting for API endpoints (except auth)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const ip = getClientIP(request)
    const result = rateLimit(`api:${ip}:${pathname}`, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60, // 60 requests per minute
    })

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token || (token as any).role !== 'ADMIN') {
      const loginUrl = new URL('/giris', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*',
    '/api/:path*',
    '/giris',
  ],
}

