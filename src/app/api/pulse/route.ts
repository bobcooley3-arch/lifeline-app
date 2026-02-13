import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// This uses the exact name 'REDIS_URL' found in your settings
const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
})

export async function GET() {
  try {
    const data = await redis.get('lifeline-state');
    return NextResponse.json(data || { error: 'No data found' });
  } catch (error) {
    console.error("Read Error:", error);
    return NextResponse.json({ error: 'Database Read Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await redis.set('lifeline-state', {
      ...body,
      lastCheckIn: Date.now()
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Write Error:", error);
    return NextResponse.json({ error: 'Database Write Error' }, { status: 500 });
  }
}
