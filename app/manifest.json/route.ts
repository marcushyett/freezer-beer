import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'Beer Cooling Timer',
    short_name: 'BeerTimer',
    description: 'Calculate the perfect cooling time for your beer',
    start_url: '/',
    display: 'standalone',
    background_color: '#141414',
    theme_color: '#4A9EFF',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['utilities', 'lifestyle'],
    dir: 'ltr',
    lang: 'en-US',
  };

  return NextResponse.json(manifest);
}
