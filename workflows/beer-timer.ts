"use workflow";

import { sleep } from "workflow";
import { redis } from "@/lib/redis";
import { webpush } from "@/lib/web-push-server";
import { StoredTimer, StoredSubscription } from "@/types";

export async function beerTimerWorkflow(
  userId: string,
  delayMs: number,
  targetTemp: number
) {
  // Sleep until timer expires (no resources consumed)
  await sleep(`${delayMs}ms`);

  // Send notification when workflow resumes
  await sendBeerReadyNotification(userId, targetTemp);
}

async function sendBeerReadyNotification(userId: string, targetTemp: number) {
  "use step"; // Enables automatic retries

  const now = Date.now();

  // Check if timer still exists (handles cancellation)
  const timer = await redis.get<StoredTimer>(`timer:${userId}`);
  if (!timer) {
    console.log(`Timer ${userId} cancelled before notification`);
    return;
  }

  // Check if already sent (idempotency)
  if (timer.notificationSent) {
    console.log(`Notification already sent for ${userId}`);
    return;
  }

  // Get push subscription
  const storedSub = await redis.get<StoredSubscription>(`subscription:${userId}`);

  if (!storedSub?.subscription) {
    console.log(`No push subscription for ${userId}`);
    timer.notificationSent = true;
    await redis.set(`timer:${userId}`, timer);
    return;
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

    console.log(`Notification sent to ${userId}`);

    // Mark as sent
    timer.notificationSent = true;
    await redis.set(`timer:${userId}`, timer);

  } catch (error) {
    console.error(`Failed to send notification to ${userId}:`, error);

    // Handle 410 Gone (invalid subscription)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      if (statusCode === 410) {
        await redis.del(`subscription:${userId}`);
        console.log(`Removed invalid subscription for ${userId}`);
        timer.notificationSent = true;
        await redis.set(`timer:${userId}`, timer);
        return;
      }
    }

    // Re-throw for automatic retry (other errors)
    throw error;
  }
}
