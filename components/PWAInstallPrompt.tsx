'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { DownloadOutlined, CloseOutlined, AppleOutlined, AndroidOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed/standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    // Only show if not standalone and not recently dismissed
    if (!standalone && (!dismissed || dismissedTime < oneDayAgo)) {
      // Show prompt after a short delay to not be intrusive
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome: Use the native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // iOS: Show instructions (can't programmatically trigger)
      // Keep the prompt open to show instructions
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or dismissed
  if (!showPrompt || isStandalone) {
    return null;
  }

  // Don't show on desktop (unless there's a deferred prompt)
  if (!isIOS && !isAndroid && !deferredPrompt) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: 16,
      right: 16,
      zIndex: 1000,
      maxWidth: 500,
      margin: '0 auto',
      padding: 8,
      background: '#000000',
      borderRadius: 12,
    }}>
      <Card
        style={{
          background: 'linear-gradient(135deg, #4A9EFF 0%, #3D7FD9 100%)',
          border: 'none',
          boxShadow: '0 8px 24px rgba(74, 158, 255, 0.3)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              color: '#fff',
              opacity: 0.7,
            }}
            size="small"
          />

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isIOS && <AppleOutlined style={{ fontSize: 32, color: '#fff' }} />}
              {isAndroid && <AndroidOutlined style={{ fontSize: 32, color: '#fff' }} />}
              {!isIOS && !isAndroid && <DownloadOutlined style={{ fontSize: 32, color: '#fff' }} />}

              <div>
                <Title level={5} style={{ margin: 0, color: '#fff' }}>
                  Install Beer Timer
                </Title>
                <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Quick access • Offline support • Better experience
                </Text>
              </div>
            </div>

            {isIOS ? (
              <div style={{
                padding: 12,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 6,
              }}>
                <Text style={{ fontSize: 12, color: '#fff', lineHeight: 1.6 }}>
                  To install: Tap the <strong>Share</strong> button{' '}
                  <span style={{ fontSize: 16 }}>⎙</span> in Safari, then select{' '}
                  <strong>"Add to Home Screen"</strong>.
                </Text>
              </div>
            ) : deferredPrompt ? (
              <Button
                type="primary"
                size="large"
                block
                icon={<DownloadOutlined />}
                onClick={handleInstallClick}
                style={{
                  backgroundColor: '#fff',
                  color: '#4A9EFF',
                  borderColor: '#fff',
                  fontWeight: 600,
                  height: 44,
                }}
              >
                Install Now
              </Button>
            ) : isAndroid ? (
              <div style={{
                padding: 12,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 6,
              }}>
                <Text style={{ fontSize: 12, color: '#fff', lineHeight: 1.6 }}>
                  To install: Tap the menu <span style={{ fontSize: 16 }}>⋮</span> in Chrome,
                  then select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </Text>
              </div>
            ) : (
              <Button
                type="primary"
                size="large"
                block
                icon={<DownloadOutlined />}
                onClick={handleInstallClick}
                style={{
                  backgroundColor: '#fff',
                  color: '#4A9EFF',
                  borderColor: '#fff',
                  fontWeight: 600,
                  height: 44,
                }}
              >
                Install App
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
}
