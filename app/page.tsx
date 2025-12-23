'use client';

import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import TimerForm from '@/components/TimerForm';
import TimerDisplay from '@/components/TimerDisplay';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<{
    expiryTime: number;
    targetTemp: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Get or create user ID
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);

    // Check for active timer
    try {
      const response = await fetch(`/api/timer/status?userId=${storedUserId}`);
      const data = await response.json();

      if (data.hasTimer && !data.timer.isExpired) {
        setActiveTimer({
          expiryTime: data.timer.expiryTime,
          targetTemp: data.timer.targetTemp,
        });
      }
    } catch (error) {
      console.error('Error checking timer status:', error);
    }

    setLoading(false);
  };

  const handleTimerCreated = (expiryTime: number, coolingMinutes: number) => {
    setActiveTimer({
      expiryTime,
      targetTemp: 2, // We'll get this from the form in a more complete implementation
    });
  };

  const handleTimerCancelled = () => {
    setActiveTimer(null);
  };

  if (loading || !userId) {
    return (
      <div className="app-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <main className="app-container">
      {activeTimer ? (
        <TimerDisplay
          expiryTime={activeTimer.expiryTime}
          targetTemp={activeTimer.targetTemp}
          userId={userId}
          onTimerCancelled={handleTimerCancelled}
        />
      ) : (
        <TimerForm userId={userId} onTimerCreated={handleTimerCreated} />
      )}

      {/* PWA Install Prompt - subtle nudge, doesn't block usage */}
      <PWAInstallPrompt />
    </main>
  );
}
