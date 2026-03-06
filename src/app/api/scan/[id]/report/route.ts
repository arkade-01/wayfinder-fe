import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3002';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const res = await fetch(`${API_URL}/scan/${id}/report`);
    
    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }
    
    const pdf = await res.arrayBuffer();
    
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': res.headers.get('Content-Disposition') || `attachment; filename="report-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to connect to API' }, { status: 500 });
  }
}
