import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfTokenSync } from '@/lib/csrf/csrf';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * CSRF token endpoint - generates and sets CSRF token cookie
 * This replaces the middleware CSRF logic for better compatibility with Next.js 16
 */
export async function GET(request: NextRequest) {
    const existingToken = request.cookies.get(CSRF_COOKIE_NAME);
    
    if (existingToken) {
        return NextResponse.json({ 
            token: existingToken.value,
            message: 'Token already exists'
        });
    }

    const csrfToken = generateCsrfTokenSync();
    const response = NextResponse.json({ 
        token: csrfToken,
        message: 'Token generated'
    });

    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
        httpOnly: false, // Must be readable by JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: CSRF_COOKIE_MAX_AGE,
        path: '/',
    });

    return response;
}

