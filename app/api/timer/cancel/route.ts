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

    // Delete timer from Redis
    await redis.del(`timer:${userId}`);

    console.log(`Timer cancelled for user ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling timer:', error);
    return NextResponse.json(
      { error: 'Failed to cancel timer' },
      { status: 500 }
    );
  }
}
