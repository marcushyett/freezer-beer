'use client';

import { Slider, Typography, Space } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { INPUT_RANGES } from '@/lib/constants';

const { Text } = Typography;

interface VolumeInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function VolumeInput({ value, onChange }: VolumeInputProps) {
  const { min, max, step } = INPUT_RANGES.volume;

  return (
    <div>
      <Space align="center" style={{ marginBottom: 8 }}>
        <DatabaseOutlined style={{ color: '#4A9EFF' }} />
        <Text strong>Volume</Text>
      </Space>
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
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <Text type="secondary">{value}ml</Text>
      </div>
    </div>
  );
}
