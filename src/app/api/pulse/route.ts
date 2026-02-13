import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    // This reads the location from your redis-yellow-zebra database
    const data = await kv.get('lifeline-state');
    return NextResponse.json(data || { error: 'No data found' });
  } catch (error) {
    console.error("Database Read Error:", error);
    return NextResponse.json({ error: 'Database Read Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // This saves the phone's signal into redis-yellow-zebra
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
