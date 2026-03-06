import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3002';

export async function GET(request: NextRequest) {
  try {
    // Forward the client IP
    const forwarded = request.headers.get('x-forwarded-for') || '';
    
    const res = await fetch(`${API_URL}/limits`, {
      headers: {
        'x-forwarded-for': forwarded,
      },
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to connect to API' }, { status: 500 });
  }
}
