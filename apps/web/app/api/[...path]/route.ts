import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const targetUrl = `${API_BASE.replace(/\/api$/, '')}/api/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  headers.set('Content-Type', req.headers.get('Content-Type') || 'application/json');

  let body: BodyInit | null = null;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store'
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to communicate with backend API', details: String(error) }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
