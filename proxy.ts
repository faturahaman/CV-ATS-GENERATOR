/**
 * Next.js Proxy (formerly Middleware) — Rate Limiting for AI API Routes
 *
 * Applies a simple sliding-window rate limit to all /api/ai/* routes.
 * Uses an in-memory Map keyed by client IP.
 *
 * Limits: 20 requests per 60-second window per IP.
 *
 * Note: In-memory state is per-process and resets on cold starts.
 * For production multi-instance deployments, replace with a Redis-backed
 * solution (e.g. Upstash Rate Limit).
 */

import { NextRequest, NextResponse } from 'next/server'

const WINDOW_MS = 60_000   // 60 seconds
const MAX_REQUESTS = 20    // requests per window per IP

interface WindowEntry {
  count: number
  windowStart: number
}

// In-memory store — lives for the lifetime of the server process
const ipWindows = new Map<string, WindowEntry>()

// Periodically clean up stale entries to prevent unbounded memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of ipWindows.entries()) {
      if (now - entry.windowStart > WINDOW_MS * 2) {
        ipWindows.delete(ip)
      }
    }
  }, 5 * 60_000)
}

export function proxy(request: NextRequest) {
  // Only rate-limit AI API routes
  if (!request.nextUrl.pathname.startsWith('/api/ai/')) {
    return NextResponse.next()
  }

  // Resolve client IP — Next.js sets x-forwarded-for in production
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'

  const now = Date.now()
  const entry = ipWindows.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipWindows.set(ip, { count: 1, windowStart: now })
    return NextResponse.next()
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((entry.windowStart + WINDOW_MS) / 1000)),
        },
      }
    )
  }

  entry.count += 1
  ipWindows.set(ip, entry)

  return NextResponse.next()
}

export const config = {
  matcher: '/api/ai/:path*',
}
