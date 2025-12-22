# Beer Cooling Timer

A Progressive Web App (PWA) that calculates the perfect cooling time for your beer using Newton's Law of Cooling and sends push notifications when it's ready to drink.

## Features

- **Physics-Based Calculations**: Uses Newton's Law of Cooling for accurate time estimates
- **Push Notifications**: Get notified on iOS and Android when your beer is ready (even with the app closed)
- **Simple UX**: Sliders, buttons, and switches - minimal text input
- **Dark Mode**: Sleek monochrome design with muted blue (#4A9EFF) accent
- **Advanced Options**: Support for cooling in snow, water, or ice water
- **Location-Aware**: Auto-detects outside temperature using OpenMeteo API
- **PWA**: Installable on iOS (16.4+) and Android devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Ant Design 5 with dark theme
- **Backend**: Vercel Serverless Functions + Cron Jobs
- **Database**: Upstash Redis (free tier)
- **Notifications**: Web Push API
- **Weather**: OpenMeteo API

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Vercel account (free hobby plan works)
- Upstash Redis database (free tier available)

### 2. Clone and Install

```bash
cd freezer-beer
npm install
```

### 3. Set Up Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database (select free tier)
3. Copy the REST API credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 4. Configure Environment Variables

The `.env.local` file has been created with VAPID keys already generated. You need to:

1. Add your Upstash Redis credentials:
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

2. Update the VAPID_SUBJECT with your email:
   ```bash
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

### 5. Generate PWA Icons

Create or download icons and place them in `public/icons/`:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `icon-96.png` (96x96px, optional badge)

See `public/icons/README.md` for detailed instructions.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use the Vercel dashboard:
1. Import your GitHub repository
2. Add environment variables in project settings
3. Enable Cron Jobs in project settings
4. Deploy

### 8. Test on iOS

1. Deploy to Vercel (push notifications don't work on localhost for iOS)
2. Open the deployed URL in Safari on iOS 16.4+
3. Tap Share → Add to Home Screen
4. Open from home screen
5. Grant notification permission
6. Test the timer!

## How It Works

### Cooling Calculation

Uses Newton's Law of Cooling:
```
T(t) = T_ambient + (T_initial - T_ambient) * e^(-kt)
```

Where:
- `k` = heat transfer coefficient (varies by vessel material and volume)
- Material coefficients: Aluminum can (0.015), Glass bottle (0.008)
- Advanced options multiply `k`: Ice water (4x), Water (2.5x), Snow (1.3x)

### Notification System

1. User calculates cooling time
2. Timer data stored in Upstash Redis with expiry timestamp
3. User subscribes to push notifications (Web Push API)
4. Vercel Cron Job runs every minute
5. Cron checks Redis for expired timers
6. Sends push notification via Web Push API
7. Service worker displays notification on device (even if app is closed)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push VAPID public key | Yes |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key | Yes |
| `VAPID_SUBJECT` | Contact email for push notifications | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST API URL | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST API token | Yes |
| `CRON_SECRET` | Secret for authenticating cron job | Yes |

## Architecture

### Frontend (`/app`, `/components`)
- **page.tsx**: Main app orchestrator
- **TimerForm**: Input form with sliders and buttons
- **TimerDisplay**: Countdown timer with progress ring
- **NotificationSetup**: Permission request UI

### Backend (`/app/api`)
- **timer/create**: Create and store timer
- **timer/cancel**: Cancel active timer
- **timer/status**: Check timer status
- **push/subscribe**: Store push subscription
- **push/unsubscribe**: Remove subscription
- **cron/check-timers**: Check for expired timers and send notifications
- **weather**: Fetch outside temperature

### Libraries (`/lib`)
- **cooling-calculator.ts**: Newton's Law implementation
- **redis.ts**: Upstash Redis client
- **web-push-server.ts**: Server-side push notification sender
- **web-push-client.ts**: Client-side push subscription manager
- **constants.ts**: Default values and presets

## iOS PWA Support

**Requirements:**
- iOS 16.4 or later
- App must be added to home screen (not just Safari)
- Notifications permission must be granted

**Limitations:**
- No Apple Watch sync
- Notifications only work when installed via "Add to Home Screen"
- Background refresh depends on iOS power settings

## Troubleshooting

### Notifications Not Working on iOS

1. Ensure iOS version is 16.4+
2. Check that app is opened from home screen (not Safari)
3. Verify notification permission is granted
4. Check Service Worker is registered (DevTools → Application)

### Cron Job Not Running

1. Verify vercel.json is in project root
2. Check cron jobs are enabled in Vercel dashboard
3. View logs in Vercel dashboard → Functions tab
4. Ensure CRON_SECRET matches between .env.local and request

### Redis Connection Error

1. Verify Upstash credentials in .env.local
2. Check Upstash database is active
3. Ensure free tier limits aren't exceeded (10K requests/day)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

MIT

## Credits

- Physics calculations based on Newton's Law of Cooling
- Weather data from [OpenMeteo](https://open-meteo.com/)
- Icons should credit their source
- Built with Next.js, Ant Design, and Upstash Redis
