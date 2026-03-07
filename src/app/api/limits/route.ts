import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3002';

function getClientIp(request: NextRequest): string {
  // Vercel/Next.js provides real client IP in these headers
  return request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    
    const res = await fetch(`${API_URL}/limits`, {
      headers: {
        'x-forwarded-for': clientIp,
      },
      cache: 'no-store',
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to connect to API' }, { status: 500 });
  }
}
