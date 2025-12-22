import { TempPreset, AmbientTemps } from '@/types';

// Default ambient temperatures for different cooling locations
export const AMBIENT_TEMPS: AmbientTemps = {
  freezer: -20, // °C
  fridge: 5,    // °C
};

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
