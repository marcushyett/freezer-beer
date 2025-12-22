'use client';

import { Collapse, Switch, Space, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { AdvancedOptions } from '@/types';

const { Text } = Typography;
const { Panel } = Collapse;

interface AdvancedOptionsProps {
  value: AdvancedOptions;
  onChange: (value: AdvancedOptions) => void;
}

export default function AdvancedOptionsComponent({
  value,
  onChange,
}: AdvancedOptionsProps) {
  const handleChange = (key: keyof AdvancedOptions, checked: boolean) => {
    // Only one can be active at a time
    if (checked) {
      onChange({
        inSnow: key === 'inSnow',
        inWater: key === 'inWater',
        inIceWater: key === 'inIceWater',
      });
    } else {
      onChange({
        ...value,
        [key]: false,
      });
    }
  };

  const hasActiveOption = value.inSnow || value.inWater || value.inIceWater;

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
                  <Text>In Snow</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    1.3x faster cooling
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
                  <Text>In Cold Water</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    2.5x faster cooling
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
                  <Text>In Ice Water</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    4x faster cooling
                  </Text>
                </div>
                <Switch
                  checked={value.inIceWater}
                  onChange={(checked) => handleChange('inIceWater', checked)}
                />
              </div>

              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                Note: Only one advanced option can be active at a time
              </Text>
            </Space>
          ),
        },
      ]}
    />
  );
}
