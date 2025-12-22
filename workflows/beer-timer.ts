import { sleep, fetch } from "workflow";

export async function beerTimerWorkflow(
  userId: string,
  delayMs: number,
  targetTemp: number
) {
  "use workflow";

  console.log('[Workflow] Starting beer timer workflow for user:', userId);
  console.log('[Workflow] Delay:', delayMs, 'ms (', delayMs / 60000, 'minutes)');
  console.log('[Workflow] Target temp:', targetTemp, '°C');

  // Sleep until timer expires (no resources consumed)
  console.log('[Workflow] Sleeping...');
  await sleep(`${delayMs}ms`);
  console.log('[Workflow] Woke up, sending notification...');

  // Call API route to send push notification (Node.js modules not allowed in workflows)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/push/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, targetTemp }),
  });

  if (!response.ok) {
    console.error('[Workflow] Failed to send notification:', response.status, response.statusText);
    throw new Error(`Failed to send notification: ${response.status}`);
  }

  const result = await response.json();
  console.log('[Workflow] Notification result:', result);
  console.log('[Workflow] Workflow completed for user:', userId);
}
