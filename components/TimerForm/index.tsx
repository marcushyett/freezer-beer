'use client';

import { useState } from 'react';
import { Button, Card, Space, Typography, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { VesselMaterial, CoolingLocation, AdvancedOptions, CoolingParams } from '@/types';
import { DEFAULT_VALUES, AMBIENT_TEMPS } from '@/lib/constants';
import { calculateCoolingTime, validateCoolingParams } from '@/lib/cooling-calculator';
import TemperatureInput from './TemperatureInput';
import VesselSelector from './VesselSelector';
import VolumeInput from './VolumeInput';
import LocationSelector from './LocationSelector';
import TargetTempPresets from './TargetTempPresets';
import AdvancedOptionsComponent from './AdvancedOptions';

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

  // Get ambient temperature based on location
  const getAmbientTemp = (): number => {
    if (coolingLocation === 'freezer') return AMBIENT_TEMPS.freezer;
    if (coolingLocation === 'fridge') return AMBIENT_TEMPS.fridge;
    return outsideTemp ?? 15; // Fallback to 15°C if outside temp not available
  };

  const handleCalculate = () => {
    // If custom duration is set, use that immediately
    if (advancedOptions.customDuration && advancedOptions.customDuration > 0) {
      setCalculatedTime(advancedOptions.customDuration);
      message.success(`Using custom duration: ${advancedOptions.customDuration} min`);
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
      message.error(error);
      return;
    }

    const time = calculateCoolingTime(coolingParams);

    if (time === Infinity) {
      message.error('Cannot cool to target temperature in this environment');
      return;
    }

    if (time === 0) {
      message.info('Beer is already at target temperature');
      return;
    }

    setCalculatedTime(time);
  };

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

        <Button
          type="primary"
          size="large"
          block
          onClick={handleCalculate}
        >
          CALCULATE
        </Button>

        {calculatedTime !== null && (
          <div className="result-display">
            <div className="result-time">{calculatedTime}min</div>
            <Text type="secondary">Est. Cooling Time</Text>
          </div>
        )}

        {calculatedTime !== null && (
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
