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
  // Use VERCEL_URL which is available in Vercel deployments
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://freezer-beer.vercel.app';

  const url = `${baseUrl}/api/push/send`;
  console.log('[Workflow] Calling notification API:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-workflow-auth': process.env.WORKFLOW_INTERNAL_KEY || 'workflow-internal',
    },
    body: JSON.stringify({ userId, targetTemp }),
  });

  console.log('[Workflow] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Workflow] Failed to send notification:', response.status, response.statusText);
    console.error('[Workflow] Error response:', errorText);
    throw new Error(`Failed to send notification: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('[Workflow] Notification result:', result);
  console.log('[Workflow] Workflow completed for user:', userId);
}
