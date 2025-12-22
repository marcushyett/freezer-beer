import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { webpush } from '@/lib/web-push-server';
import { StoredTimer, StoredSubscription } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check for internal workflow auth
    const authHeader = request.headers.get('x-workflow-auth');
    const expectedAuth = process.env.WORKFLOW_INTERNAL_KEY || 'workflow-internal';

    if (authHeader !== expectedAuth) {
      console.error('[Push Send] Unauthorized request - missing or invalid auth header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, targetTemp } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log(`[Push Send] Sending notification for user ${userId}`);

    const now = Date.now();

    // Check if timer still exists (handles cancellation)
    const timer = await redis.get<StoredTimer>(`timer:${userId}`);
    if (!timer) {
      console.log(`[Push Send] Timer ${userId} cancelled before notification`);
      return NextResponse.json({ message: 'Timer cancelled' }, { status: 200 });
    }

    // Check if already sent (idempotency)
    if (timer.notificationSent) {
      console.log(`[Push Send] Notification already sent for ${userId}`);
      return NextResponse.json({ message: 'Already sent' }, { status: 200 });
    }

    // Get push subscription
    const storedSub = await redis.get<StoredSubscription>(`subscription:${userId}`);

    if (!storedSub?.subscription) {
      console.log(`[Push Send] No push subscription for ${userId}`);
      timer.notificationSent = true;
      await redis.set(`timer:${userId}`, timer);
      return NextResponse.json({ message: 'No subscription' }, { status: 200 });
    }

    try {
      // Send push notification
      await webpush.sendNotification(
        storedSub.subscription as any,
        JSON.stringify({
          title: 'Beer is Ready!',
          message: `Your beer has reached ${targetTemp}°C - perfect drinking temperature!`,
          timestamp: now,
        })
      );

      console.log(`[Push Send] Notification sent to ${userId}`);

      // Mark as sent
      timer.notificationSent = true;
      await redis.set(`timer:${userId}`, timer);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error(`[Push Send] Failed to send notification to ${userId}:`, error);

      // Handle 410 Gone (invalid subscription)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        if (statusCode === 410) {
          await redis.del(`subscription:${userId}`);
          console.log(`[Push Send] Removed invalid subscription for ${userId}`);
          timer.notificationSent = true;
          await redis.set(`timer:${userId}`, timer);
          return NextResponse.json({ message: 'Invalid subscription removed' }, { status: 200 });
        }
      }

      // Return error for other failures
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Push Send] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
