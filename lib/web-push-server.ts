import webpush from 'web-push';

if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined');
}

if (!process.env.VAPID_PRIVATE_KEY) {
  throw new Error('VAPID_PRIVATE_KEY is not defined');
}

if (!process.env.VAPID_SUBJECT) {
  throw new Error('VAPID_SUBJECT is not defined');
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export { webpush };
