import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3002';

function getClientIp(request: NextRequest): string {
  // Vercel provides real client IP in x-real-ip or first entry of x-forwarded-for
  return request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const exits = searchParams.get('exits');
    const clientIp = getClientIp(request);
    
    const url = exits !== null 
      ? `${API_URL}/bridge/${address}?exits=${exits}`
      : `${API_URL}/bridge/${address}`;
    
    const res = await fetch(url, {
      headers: { 'x-forwarded-for': clientIp },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to connect to API' }, { status: 500 });
  }
}
