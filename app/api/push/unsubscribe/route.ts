import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete subscription from Redis
    await redis.del(`subscription:${userId}`);

    console.log(`Push subscription deleted for user ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete push subscription' },
      { status: 500 }
    );
  }
}
