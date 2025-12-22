import { TempPreset, AmbientTemps } from '@/types';

// Default ambient temperatures for different cooling locations
export const AMBIENT_TEMPS: AmbientTemps = {
  freezer: -20, // °C
  fridge: 6,    // °C
};

// Temperature presets for quick selection
export const TEMP_PRESETS: TempPreset[] = [
  {
    label: 'Rock Solid',
    value: 0,
    description: 'Frozen solid (not recommended)',
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
