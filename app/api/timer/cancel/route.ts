import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { StoredTimer } from '@/types';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get timer to retrieve workflow run ID
    const timer = await redis.get<StoredTimer>(`timer:${userId}`);

    if (timer?.workflowRunId) {
      // TODO: Cancel the running workflow once workflow/api exports cancel function
      // For now, the workflow will complete but notification won't be sent
      // since the timer will be deleted from Redis
      console.log(`Timer ${timer.workflowRunId} will complete but notification won't be sent (timer deleted)`);
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
