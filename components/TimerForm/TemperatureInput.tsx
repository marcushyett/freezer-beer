'use client';

import { Slider } from 'antd';
import { INPUT_RANGES } from '@/lib/constants';

interface TemperatureInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export default function TemperatureInput({
  value,
  onChange,
  label,
}: TemperatureInputProps) {
  const { min, max, step } = INPUT_RANGES.temperature;

  return (
    <div className="form-section">
      <div className="form-label">{label}</div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        marks={{
          [min]: `${min}°C`,
          0: '0°C',
          20: '20°C',
          [max]: `${max}°C`,
        }}
        tooltip={{
          formatter: (val) => `${val}°C`,
        }}
      />
    </div>
  );
}
