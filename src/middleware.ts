import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Check if accessing admin routes
    if (path.startsWith('/admin')) {
        const sessionCookie = request.cookies.get('admin_session')

        // If no session, redirect to login
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // If accessing login while already having a session, redirect to admin
    if (path === '/login') {
        const sessionCookie = request.cookies.get('admin_session')
        if (sessionCookie) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next|uploads|favicon.ico).*)',
        '/admin/:path*',
        '/login'
    ],
}
