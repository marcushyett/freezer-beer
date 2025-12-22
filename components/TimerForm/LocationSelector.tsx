'use client';

import { useEffect, useState } from 'react';
import { Radio, Spin, message } from 'antd';
import { CoolingLocation } from '@/types';

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Radio.Group
          value={value}
          onChange={(e) => onChange(e.target.value as CoolingLocation)}
          buttonStyle="solid"
          style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}
        >
          <Radio.Button value="freezer" style={{ height: 'auto', padding: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Freezer</span>
              <span style={{ fontWeight: 600 }}>-20°C</span>
            </div>
          </Radio.Button>
          <Radio.Button value="fridge" style={{ height: 'auto', padding: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Fridge</span>
              <span style={{ fontWeight: 600 }}>6°C</span>
            </div>
          </Radio.Button>
          <Radio.Button value="outside" style={{ height: 'auto', padding: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{loadingWeather ? <Spin size="small" /> : 'Outside'}</span>
              <span style={{ fontWeight: 600 }}>
                {outsideTemp !== null ? `${outsideTemp}°C` : 'Auto'}
              </span>
            </div>
          </Radio.Button>
        </Radio.Group>
      </div>
    </div>
  );
}
