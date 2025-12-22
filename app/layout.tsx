import type { Metadata } from 'next';
import { ConfigProvider, theme } from 'antd';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beer Cooling Timer',
  description: 'Calculate the perfect cooling time for your beer',
  manifest: '/manifest.json',
  themeColor: '#000000',
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
              colorPrimary: '#ffffff',
              colorBgBase: '#000000',
              colorBgContainer: '#0a0a0a',
              colorBgElevated: '#141414',
              colorBorder: '#1a1a1a',
              colorText: '#ffffff',
              colorTextSecondary: '#888888',
              colorTextTertiary: '#666666',
              borderRadius: 2,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              lineHeight: 1.3,
            },
            components: {
              Button: {
                defaultBorderColor: '#333333',
                defaultColor: '#ffffff',
                primaryColor: '#000000',
                controlHeight: 36,
                fontSize: 11,
              },
              Segmented: {
                itemSelectedBg: '#ffffff',
                itemSelectedColor: '#000000',
                controlHeight: 36,
              },
              Radio: {
                buttonSolidCheckedBg: '#ffffff',
                buttonSolidCheckedColor: '#000000',
              },
              Progress: {
                defaultColor: '#ffffff',
              },
              Slider: {
                trackBg: '#1a1a1a',
                trackHoverBg: '#222222',
                handleColor: '#ffffff',
                handleActiveColor: '#ffffff',
                dotBorderColor: '#333333',
                railBg: '#1a1a1a',
                railHoverBg: '#1a1a1a',
              },
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
