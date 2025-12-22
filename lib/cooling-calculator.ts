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
// Based on research: in ambient air, glass and aluminum cool at nearly identical rates
// The difference only becomes significant in high heat-transfer environments (water/ice)
const K_BASE = {
  'can': 0.012,          // Aluminum can
  'glass-bottle': 0.011, // Glass bottle - only slightly slower in air
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
  let materialBonus = 1.0; // Extra speed for aluminum in water/ice

  if (advancedOptions.withCO2Extinguisher) {
    // CO2 fire extinguisher: extremely rapid cooling via sublimation
    // CO2 sublimates at -78.5°C, instant surface contact
    // WARNING: Can cause thermal shock and explode cans if not careful!
    k *= 12.0;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0; // 40% faster for aluminum
  } else if (advancedOptions.inSaltIceWater) {
    // Salt ice water: salt lowers freezing point to ~-21°C
    // Prevents ice from freezing solid, maintains better contact
    // More effective than plain ice water
    k *= 6.0;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0; // 40% faster for aluminum
  } else if (advancedOptions.inIceWater) {
    // Ice water bath is extremely effective due to:
    // 1. High thermal conductivity of water vs air (25x)
    // 2. Latent heat of fusion from melting ice
    // 3. Convection currents in water
    // Research: aluminum cools 30-50% faster than glass in ice bath
    k *= 4.0;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0; // 40% faster for aluminum
  } else if (advancedOptions.inWater) {
    // Cold water bath (without ice) is still very effective
    // Water's thermal conductivity is much higher than air
    k *= 2.5;
    materialBonus = vesselMaterial === 'can' ? 1.3 : 1.0; // 30% faster for aluminum
  } else if (advancedOptions.inSnow) {
    // Snow provides better surface contact than still air
    // But not as effective as liquid water
    k *= 1.3;
    materialBonus = vesselMaterial === 'can' ? 1.1 : 1.0; // 10% faster for aluminum
  }

  k *= materialBonus;

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

  let materialBonus = 1.0;

  if (advancedOptions.withCO2Extinguisher) {
    k *= 12.0;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0;
  } else if (advancedOptions.inSaltIceWater) {
    k *= 6.0;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0;
  } else if (advancedOptions.inIceWater) {
    k *= 4.0;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0;
  } else if (advancedOptions.inWater) {
    k *= 2.5;
    materialBonus = vesselMaterial === 'can' ? 1.3 : 1.0;
  } else if (advancedOptions.inSnow) {
    k *= 1.3;
    materialBonus = vesselMaterial === 'can' ? 1.1 : 1.0;
  }

  k *= materialBonus;

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
