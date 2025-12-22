'use client';

import { Space, Typography, Button } from 'antd';
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
      <Text strong style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: 8 }}>
        Target Temperature
      </Text>
      <Space wrap size="small" style={{ width: '100%' }}>
        {TEMP_PRESETS.map((preset) => {
          const isSelected = value === preset.value;
          return (
            <Button
              key={preset.value}
              type={isSelected ? 'primary' : 'default'}
              onClick={() => onChange(preset.value)}
              size="small"
              style={{
                padding: '4px 12px',
                height: 'auto',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 500 }}>{preset.label}</span>
                <span style={{
                  fontSize: '10px',
                  color: isSelected ? '#000000' : '#666666',
                  opacity: isSelected ? 0.7 : 1
                }}>
                  {preset.value}°C
                </span>
              </div>
            </Button>
          );
        })}
      </Space>
    </div>
  );
}
