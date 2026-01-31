import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that are accessible even if not logged in
    const isPublicPath = pathname === '/login' || pathname === '/';

    if (token) {
        // If logged in and trying to access login or landing page, redirect to dashboard
        if (isPublicPath && pathname !== '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } else {
        // If NOT logged in and trying to access protected dashboard
        if (pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

// Config to specify which routes this middleware should run on
export const config = {
    matcher: [
        '/',
        '/login',
        '/dashboard/:path*',
    ],
};
