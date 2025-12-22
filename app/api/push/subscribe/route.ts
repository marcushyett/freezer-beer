import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { StoredSubscription } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subscription } = body as {
      userId: string;
      subscription: PushSubscription;
    };

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: 'User ID and subscription are required' },
        { status: 400 }
      );
    }

    // Store subscription in Redis
    const storedSubscription: StoredSubscription = {
      userId,
      subscription,
      createdAt: Date.now(),
    };

    await redis.set(`subscription:${userId}`, storedSubscription);

    console.log(`Push subscription saved for user ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}
