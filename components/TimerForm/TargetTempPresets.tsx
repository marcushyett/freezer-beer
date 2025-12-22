'use client';

import { Space, Typography, Button } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { TEMP_PRESETS } from '@/lib/constants';

const { Text } = Typography;

interface TargetTempPresetsProps {
  value: number;
  onChange: (value: number) => void;
}

export default function TargetTempPresets({
  value,
  onChange,
}: TargetTempPresetsProps) {
  return (
    <div>
      <Space align="center" style={{ marginBottom: 12 }}>
        <FireOutlined style={{ color: '#4A9EFF' }} />
        <Text strong>Target Temperature</Text>
      </Space>
      <Space wrap style={{ width: '100%' }}>
        {TEMP_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type={value === preset.value ? 'primary' : 'default'}
            onClick={() => onChange(preset.value)}
            size="large"
          >
            {preset.label}
            <br />
            <Text
              type="secondary"
              style={{ fontSize: 12 }}
            >
              {preset.value}°C
            </Text>
          </Button>
        ))}
      </Space>
    </div>
  );
}
