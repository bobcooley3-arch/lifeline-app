import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const data = await kv.get('lifeline-state');
    return NextResponse.json(data || { error: 'No data found' });
  } catch (error) {
    return NextResponse.json({ error: 'Database Read Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // This saves the data to your 'redis-yellow-zebra'
    await kv.set('lifeline-state', {
      ...body,
      lastCheckIn: Date.now()
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Write Error:", error);
    return NextResponse.json({ error: 'Database Write Error' }, { status: 500 });
  }
}
