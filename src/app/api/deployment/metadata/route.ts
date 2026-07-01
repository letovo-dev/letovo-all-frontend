import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    sha: process.env.LETOVO_BUILD_SHA || 'unknown',
  });
}
