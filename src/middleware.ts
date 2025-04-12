import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    const openRoutes = [
        '/shared/[id]',
        '/api/tasks/get-tasks-mentor/[id]',
    ];


    const isLogin = pathname === '/login';
    const isPublicFile = pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/api/auth');

    const isOpenRoute = openRoutes.some(route => {
        const pattern = '^' + route.replace(/\[(.*?)\]/g, '[^/]+') + '$';
        return new RegExp(pattern).test(pathname);
    });

    if (!token && !isOpenRoute && !isLogin && !isPublicFile) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isLogin) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|favicon.ico|api/auth|shared).*)',
    ],
};

