'use client';

import { useEffect, useState } from 'react';
import { Segmented, Typography, Space, Spin, message } from 'antd';
import {
  ThunderboltOutlined,
  InboxOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import { CoolingLocation } from '@/types';

const { Text } = Typography;

interface LocationSelectorProps {
  value: CoolingLocation;
  onChange: (value: CoolingLocation) => void;
  onOutsideTempChange: (temp: number | null) => void;
}

export default function LocationSelector({
  value,
  onChange,
  onOutsideTempChange,
}: LocationSelectorProps) {
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [outsideTemp, setOutsideTemp] = useState<number | null>(null);

  useEffect(() => {
    if (value === 'outside' && outsideTemp === null) {
      fetchOutsideTemperature();
    }
  }, [value]);

  const fetchOutsideTemperature = async () => {
    setLoadingWeather(true);

    try {
      // Get user's geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Fetch weather from our API
      const response = await fetch(
        `/api/weather?lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather');
      }

      const data = await response.json();
      setOutsideTemp(data.temperature);
      onOutsideTempChange(data.temperature);
    } catch (error) {
      console.error('Error fetching weather:', error);
      message.error('Could not get outside temperature. Using default.');
      setOutsideTemp(15); // Fallback
      onOutsideTempChange(15);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleChange = (newValue: string | number) => {
    onChange(newValue as CoolingLocation);
  };

  return (
    <div className="form-section">
      <div className="form-label">Cooling Location</div>
      <Segmented
        value={value}
        onChange={handleChange}
        size="middle"
        block
        options={[
          {
            label: 'Freezer -20°C',
            value: 'freezer',
          },
          {
            label: 'Fridge 6°C',
            value: 'fridge',
          },
          {
            label: loadingWeather
              ? 'Outside...'
              : outsideTemp !== null
                ? `Outside ${outsideTemp}°C`
                : 'Outside',
            value: 'outside',
          },
        ]}
      />
    </div>
  );
}
