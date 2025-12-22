import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST() {
  try {
    // Get all timer keys
    const keys = await redis.keys('timer:*');

    if (keys.length === 0) {
      return NextResponse.json({ message: 'No timers to clean up' });
    }

    // Delete all timers
    for (const key of keys) {
      await redis.del(key);
    }

    console.log(`[Cleanup] Deleted ${keys.length} old timers`);

    return NextResponse.json({
      success: true,
      deleted: keys.length,
      message: `Cleaned up ${keys.length} old timers`
    });
  } catch (error) {
    console.error('[Cleanup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup timers' },
      { status: 500 }
    );
  }
}
