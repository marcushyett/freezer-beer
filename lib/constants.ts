import { TempPreset, AmbientTemps } from '@/types';

// Default ambient temperatures for different cooling locations
// References:
// - Standard freezer temperature: -18°C to -20°C (food safety standards)
// - Standard refrigerator temperature: 3°C to 5°C (optimal for food preservation)
export const AMBIENT_TEMPS: AmbientTemps = {
  freezer: -20, // °C
  fridge: 5,    // °C
};

// Advanced cooling method configurations
// Each advanced method defines its own ambient temperature and heat transfer characteristics
// When selected, these override the basic location settings (freezer/fridge/outside)
//
// Scientific References:
// - Sturm et al. (2002): "Thermal conductivity and heat transfer through snow"
//   https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2000JC000409
// - Kulacki & Emara (1977): "Heat transfer in glass, aluminum, and plastic beverage bottles"
//   https://www.tandfonline.com/doi/abs/10.1080/01457630801922535
// - Purandare et al. (2023): "Dry ice sublimation temperature investigation"
//   https://www.sciencedirect.com/science/article/pii/S0735193323004311
// - Johnson (2015): "Fastest way to cool a drink" (Physics EEI)
//   https://pennyroyalresearch.wordpress.com/wp-content/uploads/2016/12/fastest-way-to-cool-a-drink.pdf
export const ADVANCED_COOLING_METHODS = {
  inSnow: {
    name: 'In Snow',
    ambientTemp: 0,  // °C - Snow at 0°C (freezing point)
    multiplier: 1.3, // Thermal conductivity: ~0.39 W/(m·K), better than air (0.026 W/(m·K))
    description: 'Snow provides better contact than air but less than water',
    warning: null,
  },
  inWater: {
    name: 'In Cold Water',
    ambientTemp: 10, // °C - Typical cold tap water temperature
    multiplier: 2.5, // Water thermal conductivity: 0.609 W/(m·K) - 23x better than air
    description: 'Cold water has much higher thermal conductivity than air',
    warning: null,
  },
  inIceWater: {
    name: 'In Ice Water',
    ambientTemp: 0,  // °C - Ice-water equilibrium at 0°C
    multiplier: 4.0, // Enhanced by convection currents and latent heat of fusion
    description: 'Ice-water bath is highly effective due to latent heat absorption',
    warning: null,
  },
  inSaltIceWater: {
    name: 'In Salt Ice Water',
    ambientTemp: -21, // °C - NaCl-water eutectic point (~23% salt by weight)
    multiplier: 6.0,  // Salt prevents freezing, maintains better contact, 4x faster melting
    description: 'Salt lowers freezing point and enhances heat transfer via buoyancy currents',
    warning: null,
  },
  withCO2Extinguisher: {
    name: 'CO₂ Fire Extinguisher',
    ambientTemp: -78.5, // °C - Dry ice sublimation temperature at 1 atm
    multiplier: 12.0,   // Extremely rapid cooling from direct contact with sublimating CO₂
    description: 'Dry ice sublimation provides extreme cooling via Joule-Thomson effect',
    warning: '⚠️ Can cause thermal shock! Risk of explosion with sealed containers.',
  },
} as const;

export type AdvancedCoolingMethod = keyof typeof ADVANCED_COOLING_METHODS;

// Temperature presets for quick selection
export const TEMP_PRESETS: TempPreset[] = [
  {
    label: 'Slushy',
    value: 0,
    description: 'Icy slushy consistency',
  },
  {
    label: 'Super Cold',
    value: 1,
    description: 'Almost freezing, very cold',
  },
  {
    label: 'Perfect',
    value: 2,
    description: 'Ideal drinking temperature',
  },
  {
    label: 'Cold',
    value: 3,
    description: 'Nice and cold',
  },
  {
    label: 'Chilled',
    value: 4,
    description: 'Lightly chilled',
  },
  {
    label: 'Cool',
    value: 5,
    description: 'Just cool enough',
  },
  {
    label: 'Cool-ish',
    value: 6,
    description: 'Barely chilled',
  },
];

// Default form values
export const DEFAULT_VALUES = {
  currentTemp: 20,         // Room temperature
  vesselMaterial: 'can' as const,
  volume: 330,             // Standard can size (ml)
  coolingLocation: 'freezer' as const,
  targetTemp: 2,           // "Perfect" preset
  advancedOptions: {
    inSnow: false,
    inWater: false,
    inIceWater: false,
    inSaltIceWater: false,
    withCO2Extinguisher: false,
  },
};

// Form input ranges
export const INPUT_RANGES = {
  temperature: {
    min: -10,
    max: 40,
    step: 1,
  },
  volume: {
    min: 200,
    max: 750,
    step: 10,
  },
};
