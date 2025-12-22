'use client';

import { Radio } from 'antd';
import { BoxPlotOutlined, ExperimentOutlined } from '@ant-design/icons';
import { VesselMaterial } from '@/types';

interface VesselSelectorProps {
  value: VesselMaterial;
  onChange: (value: VesselMaterial) => void;
}

export default function VesselSelector({ value, onChange }: VesselSelectorProps) {
  return (
    <div className="form-section">
      <div className="form-label">Vessel Type</div>
      <Radio.Group
        value={value}
        onChange={(e) => onChange(e.target.value)}
        buttonStyle="solid"
        size="middle"
      >
        <Radio.Button value="can">
          <BoxPlotOutlined /> Aluminum Can
        </Radio.Button>
        <Radio.Button value="glass-bottle">
          <ExperimentOutlined /> Glass Bottle
        </Radio.Button>
      </Radio.Group>
    </div>
  );
}
