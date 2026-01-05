import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({ error: 'Endpoint deprecated. Use /request and /verify flow.' }, { status: 410 });
}
