import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Save state to KV with a 1-week expiration (just in case)
        // We use a fixed key 'lifeline-state' for simplicity in this single-user demo
        await kv.set('lifeline-state', body, { ex: 604800 });

        return NextResponse.json({ success: true, timestamp: Date.now() });
    } catch (error) {
        console.error('KV Write Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to sync to cloud' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const state = await kv.get('lifeline-state');
        return NextResponse.json(state || {});
    } catch (error) {
        console.error('KV Read Error:', error);
        return NextResponse.json({ error: 'Failed to fetch from cloud' }, { status: 500 });
    }
}
