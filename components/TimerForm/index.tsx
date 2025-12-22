'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Space, Typography, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { VesselMaterial, CoolingLocation, AdvancedOptions, CoolingParams } from '@/types';
import { DEFAULT_VALUES, AMBIENT_TEMPS } from '@/lib/constants';
import { calculateCoolingTime, validateCoolingParams, projectTemperatureWithForecast, ForecastPoint, ProjectionPoint } from '@/lib/cooling-calculator';
import TemperatureInput from './TemperatureInput';
import VesselSelector from './VesselSelector';
import VolumeInput from './VolumeInput';
import LocationSelector from './LocationSelector';
import TargetTempPresets from './TargetTempPresets';
import AdvancedOptionsComponent from './AdvancedOptions';
import OutsideCoolingGraph from '../OutsideCoolingGraph';

const { Title, Text } = Typography;

interface TimerFormProps {
  userId: string;
  onTimerCreated: (expiryTime: number, coolingMinutes: number) => void;
}

export default function TimerForm({ userId, onTimerCreated }: TimerFormProps) {
  const [currentTemp, setCurrentTemp] = useState(DEFAULT_VALUES.currentTemp);
  const [vesselMaterial, setVesselMaterial] = useState<VesselMaterial>(
    DEFAULT_VALUES.vesselMaterial
  );
  const [volume, setVolume] = useState(DEFAULT_VALUES.volume);
  const [coolingLocation, setCoolingLocation] = useState<CoolingLocation>(
    DEFAULT_VALUES.coolingLocation
  );
  const [targetTemp, setTargetTemp] = useState(DEFAULT_VALUES.targetTemp);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>(
    DEFAULT_VALUES.advancedOptions
  );
  const [outsideTemp, setOutsideTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculatedTime, setCalculatedTime] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [projectionData, setProjectionData] = useState<ProjectionPoint[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Get ambient temperature based on location
  const getAmbientTemp = (): number => {
    if (coolingLocation === 'freezer') return AMBIENT_TEMPS.freezer;
    if (coolingLocation === 'fridge') return AMBIENT_TEMPS.fridge;
    return outsideTemp ?? 15; // Fallback to 15°C if outside temp not available
  };

  // Auto-calculate on any value change
  useEffect(() => {
    // If custom duration is set, use that immediately
    if (advancedOptions.customDuration && advancedOptions.customDuration > 0) {
      setCalculatedTime(advancedOptions.customDuration);
      setValidationError(null);
      return;
    }

    const coolingParams: CoolingParams = {
      currentTemp,
      ambientTemp: getAmbientTemp(),
      volume,
      vesselMaterial,
      targetTemp,
      advancedOptions,
    };

    const error = validateCoolingParams(coolingParams);
    if (error) {
      setValidationError(error);
      setCalculatedTime(null);
      return;
    }

    const time = calculateCoolingTime(coolingParams);

    if (time === Infinity) {
      setValidationError('Cannot cool to target temperature in this environment');
      setCalculatedTime(null);
      return;
    }

    if (time === 0) {
      setValidationError('Beer is already at target temperature');
      setCalculatedTime(null);
      return;
    }

    setValidationError(null);
    setCalculatedTime(time);
  }, [currentTemp, vesselMaterial, volume, coolingLocation, targetTemp, advancedOptions, outsideTemp]);

  // Fetch weather forecast when outside location is selected
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchForecast = async () => {
      if (coolingLocation !== 'outside') {
        setForecastData([]);
        setProjectionData([]);
        return;
      }

      // Need geolocation first
      if (!navigator.geolocation) {
        return;
      }

      setLoadingForecast(true);

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });

        const { latitude, longitude } = position.coords;

        const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}&forecast=true`);

        if (!response.ok) {
          throw new Error('Failed to fetch forecast');
        }

        const data = await response.json();
        setForecastData(data.forecast || []);
      } catch (error) {
        console.error('Error fetching forecast:', error);
        message.error('Could not load weather forecast');
      } finally {
        setLoadingForecast(false);
      }
    };

    // Fetch immediately
    fetchForecast();

    // Refresh every hour
    if (coolingLocation === 'outside') {
      intervalId = setInterval(fetchForecast, 60 * 60 * 1000); // 1 hour
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [coolingLocation]);

  // Calculate temperature projection when forecast data changes
  useEffect(() => {
    if (coolingLocation !== 'outside' || forecastData.length === 0) {
      setProjectionData([]);
      return;
    }

    const projection = projectTemperatureWithForecast(
      {
        currentTemp,
        volume,
        vesselMaterial,
        advancedOptions,
      },
      forecastData,
      targetTemp
    );

    setProjectionData(projection);
  }, [forecastData, currentTemp, volume, vesselMaterial, advancedOptions, targetTemp, coolingLocation]);

  const handleStartTimer = async () => {
    if (calculatedTime === null) {
      message.error('Please calculate cooling time first');
      return;
    }

    setLoading(true);
    message.loading('Starting timer...', 0); // Show loading message

    try {
      const coolingParams: CoolingParams = {
        currentTemp,
        ambientTemp: getAmbientTemp(),
        volume,
        vesselMaterial,
        targetTemp,
        advancedOptions,
      };

      const response = await fetch('/api/timer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coolingParams }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create timer');
      }

      message.destroy(); // Clear loading message
      message.success(`Timer started! ${data.coolingMinutes} minutes`, 3);
      onTimerCreated(data.expiryTime, data.coolingMinutes);
    } catch (error) {
      message.destroy(); // Clear loading message
      console.error('Error creating timer:', error);
      message.error(error instanceof Error ? error.message : 'Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>BEER COOLING TIMER</Title>

        <TemperatureInput
          value={currentTemp}
          onChange={setCurrentTemp}
          label="Current Temperature"
        />

        <VesselSelector value={vesselMaterial} onChange={setVesselMaterial} />

        <VolumeInput value={volume} onChange={setVolume} />

        <LocationSelector
          value={coolingLocation}
          onChange={setCoolingLocation}
          onOutsideTempChange={setOutsideTemp}
        />

        <TargetTempPresets value={targetTemp} onChange={setTargetTemp} />

        <AdvancedOptionsComponent
          value={advancedOptions}
          onChange={setAdvancedOptions}
        />

        {/* Show temperature projection graph for outside cooling */}
        {coolingLocation === 'outside' && projectionData.length > 0 && (
          <OutsideCoolingGraph
            projectionData={projectionData}
            initialTemp={currentTemp}
            targetTemp={targetTemp}
          />
        )}

        {validationError && (
          <div className="validation-error">
            <Text type="secondary">{validationError}</Text>
          </div>
        )}

        {calculatedTime !== null && (
          <div className="result-display">
            <div className="result-time">{calculatedTime}min</div>
            <Text type="secondary">Est. Cooling Time</Text>
          </div>
        )}

        {calculatedTime !== null && !validationError && (
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleStartTimer}
          >
            START TIMER
          </Button>
        )}
      </Space>
    </Card>
  );
}
