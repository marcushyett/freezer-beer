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
    <div style={{ marginBottom: 16 }}>
      <Text strong style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: 8 }}>
        Vessel Type
      </Text>
      <Radio.Group
        value={value}
        onChange={(e) => onChange(e.target.value)}
        buttonStyle="solid"
        size="small"
        style={{ width: '100%', display: 'flex' }}
      >
        <Radio.Button value="can" style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
          <Space direction="vertical" size={2}>
            <BoxPlotOutlined style={{ fontSize: '14px' }} />
            <span style={{ fontSize: '11px' }}>Aluminum Can</span>
          </Space>
        </Radio.Button>
        <Radio.Button value="glass-bottle" style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
          <Space direction="vertical" size={2}>
            <ExperimentOutlined style={{ fontSize: '14px' }} />
            <span style={{ fontSize: '11px' }}>Glass Bottle</span>
          </Space>
        </Radio.Button>
      </Radio.Group>
    </div>
  );
}
