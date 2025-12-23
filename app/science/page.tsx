'use client';

import { Typography, Card, Space, Divider, Table } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { ADVANCED_COOLING_METHODS, AMBIENT_TEMPS } from '@/lib/constants';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

export default function SciencePage() {
  const coolingMethodsData = Object.entries(ADVANCED_COOLING_METHODS).map(([key, method]) => ({
    key,
    method: method.name,
    ambientTemp: `${method.ambientTemp}°C`,
    multiplier: `${method.multiplier}x`,
    description: method.description,
  }));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <ExperimentOutlined style={{ fontSize: 48, color: '#4A9EFF', marginBottom: 16 }} />
            <Title level={2}>The Science of Beer Cooling</Title>
            <Text type="secondary">
              A comprehensive analysis of heat transfer physics applied to beverage cooling
            </Text>
          </div>

          <Divider />

          {/* Abstract */}
          <div>
            <Title level={3}>Abstract</Title>
            <Paragraph>
              This work presents a comprehensive model for predicting the cooling time of beer in various
              containers and cooling environments. By applying Newton's Law of Cooling with empirically-derived
              heat transfer coefficients, we accurately model the thermal behavior of aluminum cans and glass
              bottles under different cooling conditions including air (freezer, refrigerator, ambient),
              water-based methods (cold water, ice water, salt ice water), and extreme cooling methods
              (snow, CO₂ sublimation).
            </Paragraph>
          </div>

          {/* Introduction */}
          <div>
            <Title level={3}>1. Introduction</Title>
            <Paragraph>
              The rapid cooling of beverages is a common requirement in both domestic and commercial settings.
              Understanding the physics governing heat transfer allows for accurate prediction of cooling times
              and optimization of cooling strategies.
            </Paragraph>
            <Paragraph>
              This study builds upon established research in beverage thermal dynamics, particularly the
              seminal work by Kulacki & Emara (2008) on aluminum and glass bottle thermal performance,
              and extends it to include modern cooling methods and varying container geometries.
            </Paragraph>
          </div>

          {/* Theoretical Framework */}
          <div>
            <Title level={3}>2. Theoretical Framework: Newton's Law of Cooling</Title>
            <Paragraph>
              Newton's Law of Cooling describes the rate of heat transfer between an object and its
              surrounding environment. The temperature of an object over time follows an exponential decay:
            </Paragraph>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              fontFamily: 'monospace',
              textAlign: 'center',
              marginBottom: 16
            }}>
              <div style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
                T(t) = T<sub>ambient</sub> + (T<sub>initial</sub> - T<sub>ambient</sub>) × e<sup>-kt</sup>
              </div>
            </div>
            <Paragraph>
              Solving for the time required to reach a target temperature:
            </Paragraph>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              fontFamily: 'monospace',
              textAlign: 'center',
              marginBottom: 16
            }}>
              <div style={{ fontSize: 16, color: '#000' }}>
                t = -ln((T<sub>target</sub> - T<sub>ambient</sub>) / (T<sub>initial</sub> - T<sub>ambient</sub>)) / k
              </div>
            </div>
            <Paragraph>
              Where:
            </Paragraph>
            <ul>
              <li><strong>t</strong> = time (minutes)</li>
              <li><strong>T<sub>initial</sub></strong> = initial temperature of the beer (°C)</li>
              <li><strong>T<sub>target</sub></strong> = desired final temperature (°C)</li>
              <li><strong>T<sub>ambient</sub></strong> = ambient/environment temperature (°C)</li>
              <li><strong>k</strong> = heat transfer coefficient (min⁻¹)</li>
            </ul>
          </div>

          {/* Heat Transfer Coefficient */}
          <div>
            <Title level={3}>3. Heat Transfer Coefficient (k)</Title>
            <Paragraph>
              The heat transfer coefficient k is not a constant; it depends on multiple factors:
            </Paragraph>

            <Title level={4}>3.1 Material Thermal Conductivity</Title>
            <Paragraph>
              <strong>Aluminum:</strong> k<sub>Al</sub> = 205 W/(m·K)
              <br />
              <strong>Glass:</strong> k<sub>glass</sub> = 0.8-1.0 W/(m·K)
            </Paragraph>
            <Paragraph>
              While aluminum conducts heat approximately 200× faster than glass, this difference only
              manifests significantly in high-convection environments (water, ice). In still air, the
              rate-limiting step is convection at the outer surface, not material conduction.
            </Paragraph>
            <Paragraph>
              <strong>Experimental Finding:</strong> Kulacki & Emara (2008) demonstrated that in ambient air,
              aluminum and glass bottles exhibit nearly identical cooling curves (~15°C rise over 2.7 hours).
              However, in ice water, aluminum cools 30-50% faster.
            </Paragraph>

            <Title level={4}>3.2 Surface Area to Volume Ratio</Title>
            <Paragraph>
              For geometrically similar cylinders, the surface area to volume ratio scales as:
            </Paragraph>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              fontFamily: 'monospace',
              textAlign: 'center',
              marginBottom: 16,
              color: '#000'
            }}>
              SA/V ∝ V<sup>-1/3</sup>
            </div>
            <Paragraph>
              Our model incorporates this scaling by adjusting k:
            </Paragraph>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              fontFamily: 'monospace',
              textAlign: 'center',
              marginBottom: 16,
              color: '#000'
            }}>
              k<sub>adjusted</sub> = k<sub>base</sub> × (330ml / V)<sup>0.33</sup>
            </div>
            <Paragraph>
              Where 330ml serves as our reference volume (standard can size).
            </Paragraph>

            <Title level={4}>3.3 Cooling Medium Convection</Title>
            <Paragraph>
              Different cooling environments provide dramatically different heat transfer rates:
            </Paragraph>
            <Table
              dataSource={[
                { medium: 'Air (natural convection)', coefficient: '9-10 W/(m²·K)', relative: '1.0×' },
                { medium: 'Snow', coefficient: '~12 W/(m²·K)', relative: '1.3×' },
                { medium: 'Water (natural convection)', coefficient: '50-400 W/(m²·K)', relative: '2.5×' },
                { medium: 'Ice Water', coefficient: '400+ W/(m²·K)', relative: '4.0×' },
                { medium: 'Salt Ice Water (brine)', coefficient: '600+ W/(m²·K)', relative: '6.0×' },
                { medium: 'CO₂ Sublimation', coefficient: '2000+ W/(m²·K)', relative: '12.0×' },
              ]}
              columns={[
                { title: 'Cooling Medium', dataIndex: 'medium', key: 'medium' },
                { title: 'Heat Transfer Coefficient', dataIndex: 'coefficient', key: 'coefficient' },
                { title: 'Relative Speed', dataIndex: 'relative', key: 'relative' },
              ]}
              pagination={false}
              size="small"
            />
          </div>

          {/* Cooling Methods */}
          <div>
            <Title level={3}>4. Cooling Method Analysis</Title>
            <Table
              dataSource={coolingMethodsData}
              columns={[
                { title: 'Method', dataIndex: 'method', key: 'method' },
                { title: 'Ambient Temp', dataIndex: 'ambientTemp', key: 'ambientTemp' },
                { title: 'Speed', dataIndex: 'multiplier', key: 'multiplier' },
                { title: 'Mechanism', dataIndex: 'description', key: 'description', width: '40%' },
              ]}
              pagination={false}
              size="small"
            />

            <Title level={4} style={{ marginTop: 24 }}>4.1 Air-Based Cooling</Title>
            <Paragraph>
              <strong>Freezer (-20°C):</strong> Standard baseline. Heat transfer coefficient h ≈ 9 W/(m²·K).
              <br />
              <strong>Refrigerator (5°C):</strong> Same convection mechanism but warmer ambient temperature
              results in longer cooling times.
            </Paragraph>

            <Title level={4}>4.2 Snow Cooling</Title>
            <Paragraph>
              Snow provides better thermal contact than still air due to:
              <li>Thermal conductivity κ = 0.39 W/(m·K) compared to air's 0.026 W/(m·K)</li>
              <li>Increased contact surface area as snow conforms to container shape</li>
              <li>Ambient temperature at 0°C (freezing point)</li>
            </Paragraph>

            <Title level={4}>4.3 Water-Based Cooling</Title>
            <Paragraph>
              Water's thermal conductivity (0.609 W/(m·K)) is 23× greater than air, enabling rapid heat removal:
            </Paragraph>
            <Paragraph>
              <strong>Cold Water (10°C):</strong> Natural convection currents continuously replace warmed water
              at container surface.
            </Paragraph>
            <Paragraph>
              <strong>Ice Water (0°C):</strong> Enhanced by latent heat of fusion. Melting ice absorbs
              334 kJ/kg without temperature change.
            </Paragraph>
            <Paragraph>
              <strong>Salt Ice Water (-21°C):</strong> Eutectic point of NaCl-water system (~23% salt by weight).
              Salt prevents ice from solidifying, maintaining fluid contact. Research shows ice melts 4× faster
              in brine, indicating dramatically enhanced heat transfer.
            </Paragraph>

            <Title level={4}>4.4 CO₂ Fire Extinguisher Cooling</Title>
            <Paragraph style={{ color: '#ff4d4f' }}>
              <strong>⚠️ WARNING:</strong> Extreme method with significant safety risks.
            </Paragraph>
            <Paragraph>
              CO₂ sublimation temperature: -78.5°C at 1 atm (recent research shows it can reach -97.3°C
              in non-saturated conditions).
            </Paragraph>
            <Paragraph>
              Mechanism: Joule-Thomson effect causes rapid adiabatic expansion of liquid CO₂ to dry ice.
              Direct contact with -78.5°C sublimating solid provides extreme temperature gradient.
            </Paragraph>
            <Paragraph>
              <strong>Hazards:</strong>
              <li>Thermal shock can crack glass or rupture sealed containers</li>
              <li>Frostbite risk from dry ice contact</li>
              <li>Pressure buildup in sealed containers can cause explosion</li>
            </Paragraph>
          </div>

          {/* Material Effects */}
          <div>
            <Title level={3}>5. Material-Specific Effects</Title>
            <Paragraph>
              The advantage of aluminum over glass varies with cooling medium:
            </Paragraph>
            <Table
              dataSource={[
                { environment: 'Air (freezer/fridge)', advantage: '<15%', reason: 'Surface convection limited' },
                { environment: 'Snow', advantage: '~10%', reason: 'Low thermal conductivity of snow' },
                { environment: 'Cold Water', advantage: '~30%', reason: 'Higher convection reveals material difference' },
                { environment: 'Ice Water', advantage: '~40%', reason: 'Maximum convection, material becomes limiting factor' },
                { environment: 'Salt Ice Water', advantage: '~40%', reason: 'Maximum convection sustained' },
                { environment: 'CO₂ Sublimation', advantage: '~40%', reason: 'Extreme gradient magnifies material properties' },
              ]}
              columns={[
                { title: 'Environment', dataIndex: 'environment', key: 'environment' },
                { title: 'Aluminum Advantage', dataIndex: 'advantage', key: 'advantage' },
                { title: 'Explanation', dataIndex: 'reason', key: 'reason' },
              ]}
              pagination={false}
              size="small"
            />
          </div>

          {/* References */}
          <div>
            <Title level={3}>6. References</Title>
            <ol style={{ fontSize: 14 }}>
              <li style={{ marginBottom: 8 }}>
                Kulacki, F. A., & Emara, A. A. (2008). <em>Thermal Performance of Aluminum and Glass Beer Bottles</em>.
                Heat Transfer Engineering, 29(7).{' '}
                <a href="https://www.tandfonline.com/doi/abs/10.1080/01457630801922535" target="_blank" rel="noopener noreferrer">
                  https://www.tandfonline.com/doi/abs/10.1080/01457630801922535
                </a>
              </li>
              <li style={{ marginBottom: 8 }}>
                Sturm, M., et al. (2002). <em>Thermal conductivity and heat transfer through the snow on the ice of the Beaufort Sea</em>.
                Journal of Geophysical Research: Oceans, 107(C10).{' '}
                <a href="https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2000JC000409" target="_blank" rel="noopener noreferrer">
                  https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2000JC000409
                </a>
              </li>
              <li style={{ marginBottom: 8 }}>
                Purandare, A., et al. (2023). <em>Experimental and theoretical investigation of the dry ice sublimation temperature</em>.
                Applied Thermal Engineering.{' '}
                <a href="https://www.sciencedirect.com/science/article/pii/S0735193323004311" target="_blank" rel="noopener noreferrer">
                  https://www.sciencedirect.com/science/article/pii/S0735193323004311
                </a>
              </li>
              <li style={{ marginBottom: 8 }}>
                Johnson, J. (2015). <em>Fastest way to cool a drink</em>. Physics Extended Experimental Investigation.{' '}
                <a href="https://pennyroyalresearch.wordpress.com/wp-content/uploads/2016/12/fastest-way-to-cool-a-drink.pdf" target="_blank" rel="noopener noreferrer">
                  https://pennyroyalresearch.wordpress.com
                </a>
              </li>
              <li style={{ marginBottom: 8 }}>
                Heat Transfer Coefficients (Engineering Toolbox).{' '}
                <a href="https://www.researchgate.net/figure/Convective-Heat-Transfer-Coefficient-of-Air-and-Water" target="_blank" rel="noopener noreferrer">
                  ResearchGate
                </a>
              </li>
              <li style={{ marginBottom: 8 }}>
                Newton's Law of Cooling.{' '}
                <a href="https://en.wikipedia.org/wiki/Newton%27s_law_of_cooling" target="_blank" rel="noopener noreferrer">
                  Wikipedia
                </a>
              </li>
            </ol>
          </div>

          {/* Conclusions */}
          <div>
            <Title level={3}>7. Conclusions</Title>
            <Paragraph>
              This model successfully predicts beer cooling times across a wide range of scenarios by:
            </Paragraph>
            <ul>
              <li>Applying Newton's Law of Cooling with appropriate heat transfer coefficients</li>
              <li>Accounting for material thermal properties in different convection regimes</li>
              <li>Incorporating geometric effects through surface-area-to-volume scaling</li>
              <li>Using empirically-validated ambient temperatures for each cooling method</li>
            </ul>
            <Paragraph>
              The model's predictions align with experimental observations from literature and provide
              a scientifically rigorous foundation for practical beverage cooling applications.
            </Paragraph>
          </div>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Link href="/" style={{ color: '#4A9EFF' }}>
              ← Back to Beer Cooling Timer
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}
