'use client';

import { Radio, Typography, Space } from 'antd';
import { BoxPlotOutlined, ExperimentOutlined } from '@ant-design/icons';
import { VesselMaterial } from '@/types';

const { Text } = Typography;

interface VesselSelectorProps {
  value: VesselMaterial;
  onChange: (value: VesselMaterial) => void;
}

export default function VesselSelector({ value, onChange }: VesselSelectorProps) {
  return (
    <div>
      <Space align="center" style={{ marginBottom: 12 }}>
        <BoxPlotOutlined style={{ color: '#4A9EFF' }} />
        <Text strong>Vessel Type</Text>
      </Space>
      <Radio.Group
        value={value}
        onChange={(e) => onChange(e.target.value)}
        buttonStyle="solid"
        size="large"
        style={{ width: '100%', display: 'flex' }}
      >
        <Radio.Button value="can" style={{ flex: 1, textAlign: 'center' }}>
          <Space direction="vertical" size={4}>
            <BoxPlotOutlined />
            <span>Aluminum Can</span>
          </Space>
        </Radio.Button>
        <Radio.Button value="glass-bottle" style={{ flex: 1, textAlign: 'center' }}>
          <Space direction="vertical" size={4}>
            <ExperimentOutlined />
            <span>Glass Bottle</span>
          </Space>
        </Radio.Button>
      </Radio.Group>
    </div>
  );
}
