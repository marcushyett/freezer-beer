import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { StoredTimer } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get timer from Redis
    const timer = await redis.get<StoredTimer>(`timer:${userId}`);

    if (!timer) {
      return NextResponse.json({
        hasTimer: false,
        timer: null,
      });
    }

    const now = Date.now();
    const remainingMs = timer.expiryTime - now;
    const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60000));
    const isExpired = remainingMs <= 0;

    return NextResponse.json({
      hasTimer: true,
      timer: {
        ...timer,
        remainingMs,
        remainingMinutes,
        isExpired,
      },
    });
  } catch (error) {
    console.error('Error getting timer status:', error);
    return NextResponse.json(
      { error: 'Failed to get timer status' },
      { status: 500 }
    );
  }
}
