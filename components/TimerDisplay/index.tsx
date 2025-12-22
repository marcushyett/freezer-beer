'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Button, Space, Progress, message } from 'antd';
import { ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface TimerDisplayProps {
  expiryTime: number;
  targetTemp: number;
  userId: string;
  onTimerCancelled: () => void;
}

export default function TimerDisplay({
  expiryTime,
  targetTemp,
  userId,
  onTimerCancelled,
}: TimerDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialRemaining = Math.max(0, expiryTime - Date.now());
    setTotalTime(initialRemaining);
    setTimeRemaining(initialRemaining);

    const interval = setInterval(() => {
      const remaining = Math.max(0, expiryTime - Date.now());
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  const handleCancel = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/timer/cancel', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel timer');
      }

      message.success('Timer cancelled');
      onTimerCancelled();
    } catch (error) {
      console.error('Error cancelling timer:', error);
      message.error('Failed to cancel timer');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const progressPercent = totalTime > 0
    ? ((totalTime - timeRemaining) / totalTime) * 100
    : 0;

  const isExpired = timeRemaining === 0;

  return (
    <Card
      style={{ maxWidth: 600, width: '100%' }}
      styles={{ body: { padding: 32 } }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }} align="center">
        <div style={{ textAlign: 'center' }}>
          <ClockCircleOutlined
            style={{
              fontSize: 64,
              color: isExpired ? '#52c41a' : '#4A9EFF',
              marginBottom: 16,
            }}
          />
          <Title level={2} style={{ margin: 0 }}>
            {isExpired ? 'Beer is Ready!' : 'Cooling...'}
          </Title>
          <Text type="secondary">
            Target: {targetTemp}°C
          </Text>
        </div>

        <div style={{ width: '100%' }}>
          <Progress
            type="circle"
            percent={Math.round(progressPercent)}
            size={200}
            format={() => (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>
                  {formatTime(timeRemaining)}
                </div>
                <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                  {isExpired ? 'Complete!' : 'remaining'}
                </div>
              </div>
            )}
            strokeColor={{
              '0%': '#4A9EFF',
              '100%': '#52c41a',
            }}
          />
        </div>

        {!isExpired && (
          <Text type="secondary" style={{ textAlign: 'center' }}>
            You'll receive a notification when your beer is ready
            <br />
            (Keep this device connected to the internet)
          </Text>
        )}

        {isExpired && (
          <Text type="success" style={{ textAlign: 'center', fontSize: 16 }}>
            Your beer has reached the perfect temperature!
            <br />
            Enjoy responsibly!
          </Text>
        )}

        <Button
          type="default"
          size="large"
          block
          icon={<CloseCircleOutlined />}
          onClick={handleCancel}
          loading={loading}
        >
          Cancel Timer
        </Button>
      </Space>
    </Card>
  );
}
