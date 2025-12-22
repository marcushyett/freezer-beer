import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { calculateCoolingTime, validateCoolingParams } from '@/lib/cooling-calculator';
import { StoredTimer, CoolingParams } from '@/types';
import { start } from "workflow/api";
import { beerTimerWorkflow } from "@/workflows/beer-timer";

export async function POST(request: NextRequest) {
  try {
    console.log('[Timer Create] Request received');
    const body = await request.json();
    const { userId, coolingParams } = body as {
      userId: string;
      coolingParams: CoolingParams;
    };

    console.log('[Timer Create] User ID:', userId);
    console.log('[Timer Create] Cooling params:', coolingParams);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate cooling parameters
    const validationError = validateCoolingParams(coolingParams);
    if (validationError) {
      console.log('[Timer Create] Validation error:', validationError);
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Calculate cooling time in minutes
    const coolingMinutes = calculateCoolingTime(coolingParams);
    console.log('[Timer Create] Calculated cooling time:', coolingMinutes, 'minutes');

    if (coolingMinutes === Infinity) {
      return NextResponse.json(
        { error: 'Cannot cool to target temperature in this environment' },
        { status: 400 }
      );
    }

    if (coolingMinutes === 0) {
      return NextResponse.json(
        { error: 'Beer is already at or below target temperature' },
        { status: 400 }
      );
    }

    // Create timer object
    const now = Date.now();
    const delayMs = coolingMinutes * 60 * 1000;
    const expiryTime = now + delayMs;

    console.log('[Timer Create] Delay:', delayMs, 'ms');
    console.log('[Timer Create] Workflow function type:', typeof beerTimerWorkflow);
    console.log('[Timer Create] Workflow function name:', beerTimerWorkflow.name);
    console.log('[Timer Create] Workflow function:', beerTimerWorkflow.toString().substring(0, 200));

    // Start workflow to send notification at expiry time
    console.log('[Timer Create] Starting workflow...');
    const run = await start(beerTimerWorkflow, [userId, delayMs, coolingParams.targetTemp]);
    console.log('[Timer Create] Workflow started successfully, runId:', run.runId);

    const timer: StoredTimer = {
      userId,
      startTime: now,
      expiryTime,
      targetTemp: coolingParams.targetTemp,
      notificationSent: false,
      workflowRunId: run.runId,
    };

    // Store timer in Redis
    await redis.set(`timer:${userId}`, timer);

    console.log(`Timer created for user ${userId}: ${coolingMinutes} minutes (workflow ${run.runId})`);

    return NextResponse.json({
      success: true,
      expiryTime,
      coolingMinutes,
      startTime: now,
    });
  } catch (error) {
    console.error('Error creating timer:', error);
    return NextResponse.json(
      { error: 'Failed to create timer' },
      { status: 500 }
    );
  }
}
