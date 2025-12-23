'use client';

import { Collapse, Switch, Space, Typography, InputNumber } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { AdvancedOptions } from '@/types';
import { ADVANCED_COOLING_METHODS } from '@/lib/constants';

const { Text } = Typography;

interface AdvancedOptionsProps {
  value: AdvancedOptions;
  onChange: (value: AdvancedOptions) => void;
}

export default function AdvancedOptionsComponent({
  value,
  onChange,
}: AdvancedOptionsProps) {
  const handleChange = (key: keyof AdvancedOptions, checked: boolean) => {
    // Only one cooling method can be active at a time
    if (checked && key !== 'customDuration') {
      onChange({
        inSnow: key === 'inSnow',
        inWater: key === 'inWater',
        inIceWater: key === 'inIceWater',
        inSaltIceWater: key === 'inSaltIceWater',
        withCO2Extinguisher: key === 'withCO2Extinguisher',
        customDuration: value.customDuration,
      });
    } else {
      onChange({
        ...value,
        [key]: false,
      });
    }
  };

  const hasActiveOption = value.inSnow || value.inWater || value.inIceWater ||
                          value.inSaltIceWater || value.withCO2Extinguisher;

  return (
    <Collapse
      ghost
      items={[
        {
          key: '1',
          label: (
            <Space>
              <SettingOutlined style={{ color: '#4A9EFF' }} />
              <Text strong>Advanced Options</Text>
              {hasActiveOption && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  (Active)
                </Text>
              )}
            </Space>
          ),
          children: (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text>{ADVANCED_COOLING_METHODS.inSnow.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {ADVANCED_COOLING_METHODS.inSnow.multiplier}x faster • {ADVANCED_COOLING_METHODS.inSnow.ambientTemp}°C
                  </Text>
                </div>
                <Switch
                  checked={value.inSnow}
                  onChange={(checked) => handleChange('inSnow', checked)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text>{ADVANCED_COOLING_METHODS.inWater.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {ADVANCED_COOLING_METHODS.inWater.multiplier}x faster • {ADVANCED_COOLING_METHODS.inWater.ambientTemp}°C
                  </Text>
                </div>
                <Switch
                  checked={value.inWater}
                  onChange={(checked) => handleChange('inWater', checked)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text>{ADVANCED_COOLING_METHODS.inIceWater.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {ADVANCED_COOLING_METHODS.inIceWater.multiplier}x faster • {ADVANCED_COOLING_METHODS.inIceWater.ambientTemp}°C
                  </Text>
                </div>
                <Switch
                  checked={value.inIceWater}
                  onChange={(checked) => handleChange('inIceWater', checked)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text>{ADVANCED_COOLING_METHODS.inSaltIceWater.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {ADVANCED_COOLING_METHODS.inSaltIceWater.multiplier}x faster • {ADVANCED_COOLING_METHODS.inSaltIceWater.ambientTemp}°C
                  </Text>
                </div>
                <Switch
                  checked={value.inSaltIceWater}
                  onChange={(checked) => handleChange('inSaltIceWater', checked)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text>{ADVANCED_COOLING_METHODS.withCO2Extinguisher.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {ADVANCED_COOLING_METHODS.withCO2Extinguisher.multiplier}x faster • {ADVANCED_COOLING_METHODS.withCO2Extinguisher.ambientTemp}°C
                  </Text>
                  {ADVANCED_COOLING_METHODS.withCO2Extinguisher.warning && (
                    <>
                      <br />
                      <Text type="warning" style={{ fontSize: 11 }}>
                        {ADVANCED_COOLING_METHODS.withCO2Extinguisher.warning}
                      </Text>
                    </>
                  )}
                </div>
                <Switch
                  checked={value.withCO2Extinguisher}
                  onChange={(checked) => handleChange('withCO2Extinguisher', checked)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid #1a1a1a',
                }}
              >
                <div>
                  <Text>Custom Duration (Testing)</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Override calculated time
                  </Text>
                </div>
                <InputNumber
                  value={value.customDuration || 1}
                  onChange={(val) => onChange({ ...value, customDuration: val || undefined })}
                  min={0.1}
                  max={120}
                  step={0.5}
                  placeholder="1"
                  size="small"
                  style={{ width: 80 }}
                  suffix="min"
                />
              </div>

              <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                Cooling multipliers only apply when custom duration is not set
              </Text>
            </Space>
          ),
        },
      ]}
    />
  );
}
