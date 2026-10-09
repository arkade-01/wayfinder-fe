import { NextRequest, NextResponse } from 'next/server';

// Proxies /api/solana/* → ${API_URL}/solana/* (OG search, wallet scans, edges).
const API_URL = process.env.API_URL || 'http://localhost:3002';
const ALLOWED = [/^og\/search$/, /^wallets\/[1-9A-HJ-NP-Za-km-z]{32,44}\/(scan|edges)$/, /^wallets\/scans\/[0-9a-fA-F]{24}$/];

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

async function proxy(request: NextRequest, params: Promise<{ path: string[] }>, method: 'GET' | 'POST') {
  const { path } = await params;
  const joined = path.join('/');
  if (!ALLOWED.some((re) => re.test(joined))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const { search } = new URL(request.url);
    const res = await fetch(`${API_URL}/solana/${joined}${search}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': getClientIp(request) },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to connect to API' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params, 'POST');
}
