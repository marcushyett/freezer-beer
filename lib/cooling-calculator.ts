import { CoolingParams } from '@/types';

/**
 * Calculate beer cooling time using Newton's Law of Cooling
 *
 * Newton's Law: T(t) = T_ambient + (T_initial - T_ambient) * e^(-kt)
 * Solving for time when T(t) = T_target:
 * t = -ln((T_target - T_ambient) / (T_initial - T_ambient)) / k
 *
 * Where k is the heat transfer coefficient that depends on:
 * - Vessel material (aluminum vs glass)
 * - Volume (surface area to volume ratio)
 * - Cooling medium (air, water, ice water, snow)
 */

// Base heat transfer coefficients for different materials
// These are empirically derived constants
const K_BASE = {
  'can': 0.015,          // Aluminum - better thermal conductivity
  'glass-bottle': 0.008, // Glass - slower cooling
} as const;

/**
 * Calculate the cooling time in minutes for a beer to reach target temperature
 */
export function calculateCoolingTime(params: CoolingParams): number {
  const {
    currentTemp,
    ambientTemp,
    volume,
    vesselMaterial,
    targetTemp,
    advancedOptions,
  } = params;

  // Validation: ensure physical constraints
  if (currentTemp <= ambientTemp) {
    // Beer is already at or below ambient temperature
    return 0;
  }

  if (targetTemp >= currentTemp) {
    // Target is at or above current temperature (can't cool to higher temp)
    return 0;
  }

  if (targetTemp < ambientTemp) {
    // Target is below ambient (impossible to cool below ambient in that environment)
    // Return a very large number to indicate impossibility
    return Infinity;
  }

  // Get base heat transfer coefficient for the vessel material
  let k = K_BASE[vesselMaterial];

  // Adjust k based on volume (smaller containers cool faster)
  // Surface area to volume ratio: larger ratio = faster cooling
  // For a cylinder: SA/V ∝ 1/r where r = radius
  // volume ∝ r²h, so for standard proportions: V^(1/3) ∝ r
  // Therefore: SA/V ∝ V^(-1/3)
  // Standard can is 330ml, so we scale relative to that
  const volumeScalingFactor = Math.pow(330 / volume, 0.33);
  k *= volumeScalingFactor;

  // Apply advanced cooling option multipliers
  if (advancedOptions.inIceWater) {
    // Ice water bath is extremely effective due to:
    // 1. High thermal conductivity of water vs air (25x)
    // 2. Latent heat of fusion from melting ice
    // 3. Convection currents in water
    k *= 4.0;
  } else if (advancedOptions.inWater) {
    // Cold water bath (without ice) is still very effective
    // Water's thermal conductivity is much higher than air
    k *= 2.5;
  } else if (advancedOptions.inSnow) {
    // Snow provides better surface contact than still air
    // But not as effective as liquid water
    k *= 1.3;
  }

  // Newton's Law rearranged to solve for time:
  // t = -ln((T_target - T_ambient) / (T_initial - T_ambient)) / k
  const numerator = targetTemp - ambientTemp;
  const denominator = currentTemp - ambientTemp;

  // Additional safety check (should be caught by earlier validations)
  if (denominator <= 0 || numerator <= 0) {
    return 0;
  }

  // Calculate time in minutes
  const timeMinutes = -Math.log(numerator / denominator) / k;

  // Round to nearest minute and ensure non-negative
  return Math.max(0, Math.round(timeMinutes));
}

/**
 * Calculate the temperature of the beer at a given time
 * (Inverse function - useful for validation and testing)
 */
export function calculateTemperatureAtTime(
  params: Omit<CoolingParams, 'targetTemp'>,
  timeMinutes: number
): number {
  const {
    currentTemp,
    ambientTemp,
    volume,
    vesselMaterial,
    advancedOptions,
  } = params;

  // Get k with same logic as calculateCoolingTime
  let k = K_BASE[vesselMaterial];
  k *= Math.pow(330 / volume, 0.33);

  if (advancedOptions.inIceWater) {
    k *= 4.0;
  } else if (advancedOptions.inWater) {
    k *= 2.5;
  } else if (advancedOptions.inSnow) {
    k *= 1.3;
  }

  // Newton's Law: T(t) = T_ambient + (T_initial - T_ambient) * e^(-kt)
  const temperature = ambientTemp + (currentTemp - ambientTemp) * Math.exp(-k * timeMinutes);

  return Math.round(temperature * 10) / 10; // Round to 1 decimal place
}

/**
 * Validate cooling parameters and return error message if invalid
 */
export function validateCoolingParams(params: CoolingParams): string | null {
  const { currentTemp, ambientTemp, targetTemp, volume } = params;

  if (volume <= 0) {
    return 'Volume must be greater than 0';
  }

  if (currentTemp <= ambientTemp) {
    return 'Beer is already at or below the cooling environment temperature';
  }

  if (targetTemp >= currentTemp) {
    return 'Target temperature must be below current temperature';
  }

  if (targetTemp < ambientTemp) {
    return `Cannot cool below the environment temperature (${ambientTemp}°C)`;
  }

  return null; // No errors
}
