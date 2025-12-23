'use client';

import { Slider, Typography } from 'antd';
import { INPUT_RANGES } from '@/lib/constants';
import InfoTooltip from '../InfoTooltip';

const { Text } = Typography;

interface VolumeInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function VolumeInput({ value, onChange }: VolumeInputProps) {
  const { min, max, step } = INPUT_RANGES.volume;

  return (
    <div className="form-section">
      <div className="form-label">
        <span>Volume</span>
        <InfoTooltip
          title="Surface Area to Volume Ratio"
          content="Smaller containers cool faster due to a higher surface area to volume ratio. The cooling rate scales with V^(-1/3), where V is volume. This is why a 200ml can cools significantly faster than a 750ml bottle."
          links={[
            {
              text: 'Role of volume-specific surface area in heat transfer',
              url: 'https://www.sciencedirect.com/science/article/pii/S0017931024003661'
            }
          ]}
        />
      </div>
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
