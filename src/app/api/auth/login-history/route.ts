import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';

// In a production app, you would store login sessions in a database
// For now, we'll return mock data based on the current session
export async function GET(request: NextRequest) {
    try {
        // Get session from cookie
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('auth_session');

        if (!sessionCookie) {
            return NextResponse.json(
                { success: false, error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Verify session
        const session = await verifySession(sessionCookie.value);
        if (!session || !session.email) {
            return NextResponse.json(
                { success: false, error: 'Sessão inválida' },
                { status: 401 }
            );
        }

        // Get user agent for current session info
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'Unknown';

        // Parse user agent for device/browser info
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
        const device = isMobile ? 'Mobile' : 'Desktop';

        let browser = 'Unknown';
        if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        // Return current session as the only "active" session
        // In production, you'd query a sessions table in your database
        const sessions = [
            {
                id: 'current',
                device,
                browser,
                ip: ip.substring(0, 20), // Truncate for privacy
                location: 'Portugal', // Would use IP geolocation in production
                lastActive: new Date().toISOString(),
                isCurrent: true,
            },
        ];

        return NextResponse.json({
            success: true,
            data: sessions,
        });
    } catch (error) {
        console.error('❌ [Login History] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao carregar histórico' },
            { status: 500 }
        );
    }
}
