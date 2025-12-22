'use client';

import { Space, Button } from 'antd';
import { TEMP_PRESETS } from '@/lib/constants';

interface TargetTempPresetsProps {
  value: number;
  onChange: (value: number) => void;
}

export default function TargetTempPresets({
  value,
  onChange,
}: TargetTempPresetsProps) {
  return (
    <div className="form-section">
      <div className="form-label">Target Temperature</div>
      <Space wrap>
        {TEMP_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type={value === preset.value ? 'primary' : 'default'}
            onClick={() => onChange(preset.value)}
            size="middle"
          >
            {preset.label} ({preset.value}°C)
          </Button>
        ))}
      </Space>
    </div>
  );
}
