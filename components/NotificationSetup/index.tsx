'use client';

import { useState } from 'react';
import { Card, Button, Typography, Space, Alert } from 'antd';
import { BellOutlined, AppleOutlined, MobileOutlined } from '@ant-design/icons';
import { subscribeToPushNotifications } from '@/lib/web-push-client';

const { Title, Text, Paragraph } = Typography;

interface NotificationSetupProps {
  userId: string;
  onNotificationsEnabled: (subscription: PushSubscription) => void;
}

export default function NotificationSetup({
  userId,
  onNotificationsEnabled,
}: NotificationSetupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect iOS
  const isIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Check if app is installed (standalone mode)
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true);

  const handleEnableNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const subscription = await subscribeToPushNotifications(userId);

      if (!subscription) {
        throw new Error('Failed to subscribe to notifications');
      }

      onNotificationsEnabled(subscription);
    } catch (err) {
      console.error('Error enabling notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{ maxWidth: 600, width: '100%' }}
      styles={{ body: { padding: 32 } }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }} align="center">
        <div style={{ textAlign: 'center' }}>
          <BellOutlined style={{ fontSize: 64, color: '#4A9EFF', marginBottom: 16 }} />
          <Title level={2} style={{ margin: 0 }}>
            Enable Notifications
          </Title>
          <Text type="secondary">
            Get notified when your beer is perfectly chilled
          </Text>
        </div>

        {isIOS && !isStandalone && (
          <Alert
            message="iOS Installation Required"
            description={
              <Space direction="vertical" size="small">
                <Paragraph style={{ margin: 0 }}>
                  To receive notifications on iOS, you need to add this app to your home screen:
                </Paragraph>
                <ol style={{ paddingLeft: 20, margin: 0 }}>
                  <li>Tap the <strong>Share</strong> button in Safari</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                  <li>Tap <strong>Add</strong></li>
                  <li>Open the app from your home screen</li>
                </ol>
              </Space>
            }
            type="info"
            icon={<AppleOutlined />}
            showIcon
          />
        )}

        {!isIOS && (
          <Alert
            message="Push Notifications"
            description="We'll send you a notification when your beer reaches the perfect temperature, even if the app is closed."
            type="info"
            icon={<MobileOutlined />}
            showIcon
          />
        )}

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            onClose={() => setError(null)}
          />
        )}

        <Button
          type="primary"
          size="large"
          icon={<BellOutlined />}
          loading={loading}
          onClick={handleEnableNotifications}
          block
          disabled={isIOS && !isStandalone}
        >
          {isIOS && !isStandalone
            ? 'Add to Home Screen First'
            : 'Enable Notifications'}
        </Button>

        <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
          You can disable notifications later in your device settings
        </Text>
      </Space>
    </Card>
  );
}
