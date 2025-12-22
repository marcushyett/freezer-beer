'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Button, Space, message } from 'antd';

const { Text } = Typography;

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

    const pad = (n: number) => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const progressPercent = totalTime > 0
    ? ((totalTime - timeRemaining) / totalTime) * 100
    : 0;

  const isExpired = timeRemaining === 0;

  return (
    <Card
      style={{
        maxWidth: 600,
        width: '100%',
        background: 'transparent',
        border: '1px solid #1a1a1a',
      }}
      styles={{ body: { padding: 24 } }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }} align="center">
        {/* Elegant countdown display */}
        <div style={{
          fontSize: '64px',
          fontWeight: '400',
          letterSpacing: '-0.03em',
          lineHeight: '1',
          color: '#ffffff',
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'center',
        }}>
          {isExpired ? 'READY' : formatTime(timeRemaining)}
        </div>

        {/* Subtle progress bar */}
        <div style={{
          width: '100%',
          height: '1px',
          background: '#1a1a1a',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progressPercent}%`,
            background: '#ffffff',
            transition: 'width 1s linear',
          }} />
        </div>

        {/* Metadata */}
        <Space direction="vertical" size={4} align="center" style={{ width: '100%' }}>
          <Text style={{
            fontSize: '10px',
            color: '#666666',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {isExpired ? 'Complete' : 'Remaining'}
          </Text>
          <Text style={{
            fontSize: '11px',
            color: '#888888',
          }}>
            Target {targetTemp}°C
          </Text>
        </Space>

        {!isExpired && (
          <Text style={{
            textAlign: 'center',
            fontSize: '10px',
            color: '#666666',
            lineHeight: '1.4',
          }}>
            Notification on completion
          </Text>
        )}

        {isExpired && (
          <Text style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#ffffff',
            lineHeight: '1.4',
          }}>
            Perfect temperature reached
          </Text>
        )}

        {/* Cancel button */}
        <Button
          onClick={handleCancel}
          loading={loading}
          size="small"
          style={{
            border: '1px solid #333333',
            background: 'transparent',
            color: '#ffffff',
            marginTop: 8,
          }}
        >
          CANCEL
        </Button>
      </Space>
    </Card>
  );
}
