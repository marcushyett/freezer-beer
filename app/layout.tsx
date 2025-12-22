import type { Metadata } from 'next';
import { ConfigProvider, theme } from 'antd';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beer Cooling Timer',
  description: 'Calculate the perfect cooling time for your beer',
  manifest: '/manifest.json',
  themeColor: '#4A9EFF',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Beer Timer',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorPrimary: '#4A9EFF',
              colorBgBase: '#141414',
              colorBgContainer: '#1f1f1f',
              colorBgElevated: '#2a2a2a',
              colorBorder: '#3a3a3a',
              borderRadius: 8,
              fontSize: 16,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
