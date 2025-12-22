'use client';

import { Slider, Typography, Space } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { INPUT_RANGES } from '@/lib/constants';

const { Text } = Typography;

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
    <div>
      <Space align="center" style={{ marginBottom: 8 }}>
        <FireOutlined style={{ color: '#4A9EFF' }} />
        <Text strong>{label}</Text>
      </Space>
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
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <Text type="secondary">{value}°C</Text>
      </div>
    </div>
  );
}
