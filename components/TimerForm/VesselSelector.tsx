'use client';

import { Radio } from 'antd';
import { BoxPlotOutlined, ExperimentOutlined } from '@ant-design/icons';
import { VesselMaterial } from '@/types';
import InfoTooltip from '../InfoTooltip';

interface VesselSelectorProps {
  value: VesselMaterial;
  onChange: (value: VesselMaterial) => void;
}

export default function VesselSelector({ value, onChange }: VesselSelectorProps) {
  return (
    <div className="form-section">
      <div className="form-label">
        <span>Vessel Type</span>
        <InfoTooltip
          title="Material Thermal Conductivity"
          content="Aluminum (205 W/m·K) vs Glass (0.8-1.0 W/m·K). In AIR: <15% difference. In WATER/ICE: aluminum cools 30-50% faster because water's high heat transfer makes material conductivity the limiting factor."
          links={[
            {
              text: 'Kulacki & Emara (2008): Thermal Performance Study',
              url: 'https://www.tandfonline.com/doi/abs/10.1080/01457630801922535'
            }
          ]}
        />
      </div>
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
