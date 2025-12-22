'use client';

import { Slider } from 'antd';
import { INPUT_RANGES } from '@/lib/constants';

interface VolumeInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function VolumeInput({ value, onChange }: VolumeInputProps) {
  const { min, max, step } = INPUT_RANGES.volume;

  return (
    <div className="form-section">
      <div className="form-label">Volume</div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        marks={{
          [min]: `${min}ml`,
          330: '330ml',
          500: '500ml',
          [max]: `${max}ml`,
        }}
        tooltip={{
          formatter: (val) => `${val}ml`,
        }}
      />
    </div>
  );
}
