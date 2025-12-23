import { CoolingParams } from '@/types';
import { ADVANCED_COOLING_METHODS } from './constants';

/**
 * Calculate beer cooling time using Newton's Law of Cooling
 *
 * Newton's Law of Cooling describes how an object's temperature changes over time
 * when exposed to an environment of different temperature:
 *
 * T(t) = T_ambient + (T_initial - T_ambient) * e^(-kt)
 *
 * Where:
 * - T(t) is the temperature at time t
 * - T_ambient is the ambient/environment temperature
 * - T_initial is the initial temperature
 * - k is the heat transfer coefficient
 * - t is time
 *
 * Solving for time when T(t) = T_target:
 * t = -ln((T_target - T_ambient) / (T_initial - T_ambient)) / k
 *
 * The heat transfer coefficient k depends on:
 * - Vessel material (aluminum vs glass) - thermal conductivity
 * - Volume (surface area to volume ratio) - geometry
 * - Cooling medium (air, water, ice water, snow) - convection and conduction
 *
 * Scientific References:
 * - Kulacki & Emara (2008): "Thermal Performance of Aluminum and Glass Beer Bottles"
 *   Heat Transfer Engineering, Vol 29, No 7
 *   https://www.tandfonline.com/doi/abs/10.1080/01457630801922535
 *   Finding: In air, aluminum and glass cool nearly identically (~15°C rise in 2.7 hours)
 *            In ice water, aluminum cools 30-50% faster due to higher thermal conductivity
 *
 * - Bergman et al.: "Heat Transfer Coefficients for Natural and Forced Convection"
 *   Air (natural convection): h = 9-10 W/(m²·K)
 *   Water (natural convection): h = 50-400 W/(m²·K)
 *   https://www.researchgate.net/figure/Convective-Heat-Transfer-Coefficient-of-Air-and-Water
 */

// Base heat transfer coefficients for different materials in AIR (natural convection)
// These coefficients are calibrated for a 330ml container at room temperature
// cooling in still air with h ≈ 9 W/(m²·K)
//
// References:
// - Aluminum thermal conductivity: 205 W/(m·K)
// - Glass thermal conductivity: 0.8-1.0 W/(m·K)
// - In AIR: minimal difference (<15%) because heat transfer is limited by air convection, not material
// - In WATER/ICE: significant difference (30-50%) because water convection is fast enough
//   that material thermal conductivity becomes the limiting factor
const K_BASE = {
  'can': 0.012,          // Aluminum can - excellent thermal conductor
  'glass-bottle': 0.011, // Glass bottle - poorer thermal conductor, but negligible in air
} as const;

/**
 * Calculate the cooling time in minutes for a beer to reach target temperature
 */
export function calculateCoolingTime(params: CoolingParams): number {
  const {
    currentTemp,
    ambientTemp: baseAmbientTemp,
    volume,
    vesselMaterial,
    targetTemp,
    advancedOptions,
  } = params;

  // Determine the effective ambient temperature
  // Advanced cooling methods override the base ambient temperature
  let effectiveAmbientTemp = baseAmbientTemp;
  let k = K_BASE[vesselMaterial];
  let materialBonus = 1.0; // Extra speed for aluminum in water/ice environments

  // Check which advanced option is selected (only one can be active at a time)
  if (advancedOptions.withCO2Extinguisher) {
    const method = ADVANCED_COOLING_METHODS.withCO2Extinguisher;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0; // 40% faster for aluminum
  } else if (advancedOptions.inSaltIceWater) {
    const method = ADVANCED_COOLING_METHODS.inSaltIceWater;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0; // 40% faster for aluminum
  } else if (advancedOptions.inIceWater) {
    const method = ADVANCED_COOLING_METHODS.inIceWater;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0; // 40% faster for aluminum
  } else if (advancedOptions.inWater) {
    const method = ADVANCED_COOLING_METHODS.inWater;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.3 : 1.0; // 30% faster for aluminum
  } else if (advancedOptions.inSnow) {
    const method = ADVANCED_COOLING_METHODS.inSnow;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.1 : 1.0; // 10% faster for aluminum
  }

  // Validation: ensure physical constraints with effective ambient temp
  if (currentTemp <= effectiveAmbientTemp) {
    // Beer is already at or below ambient temperature
    return 0;
  }

  if (targetTemp >= currentTemp) {
    // Target is at or above current temperature (can't cool to higher temp)
    return 0;
  }

  if (targetTemp <= effectiveAmbientTemp) {
    // Target is at or below ambient (impossible to cool below ambient in that environment)
    // When target equals ambient, it takes infinite time to reach (asymptotic approach)
    // Return a very large number to indicate impossibility
    return Infinity;
  }

  // Adjust k based on volume (smaller containers cool faster)
  // Surface area to volume ratio: larger ratio = faster cooling
  //
  // Physical principle: Heat transfer rate ∝ Surface Area
  //                     Heat capacity ∝ Volume
  //                     Therefore: Cooling rate ∝ SA/V
  //
  // For geometrically similar cylinders:
  // - Surface Area ∝ r² (ignoring top/bottom for simplification)
  // - Volume ∝ r² × h
  // - For constant aspect ratio: h ∝ r
  // - Therefore: SA ∝ r² and V ∝ r³
  // - So: SA/V ∝ r²/r³ = 1/r ∝ V^(-1/3)
  //
  // Standard can is 330ml, so we scale relative to that
  // Using 0.33 exponent (approximately 1/3) for the power law
  const volumeScalingFactor = Math.pow(330 / volume, 0.33);
  k *= volumeScalingFactor;

  // Apply material bonus (aluminum's advantage in high-conductivity environments)
  k *= materialBonus;

  // Newton's Law rearranged to solve for time:
  // t = -ln((T_target - T_ambient) / (T_initial - T_ambient)) / k
  const numerator = targetTemp - effectiveAmbientTemp;
  const denominator = currentTemp - effectiveAmbientTemp;

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
    ambientTemp: baseAmbientTemp,
    volume,
    vesselMaterial,
    advancedOptions,
  } = params;

  // Determine the effective ambient temperature (same logic as calculateCoolingTime)
  let effectiveAmbientTemp = baseAmbientTemp;
  let k = K_BASE[vesselMaterial];
  let materialBonus = 1.0;

  if (advancedOptions.withCO2Extinguisher) {
    const method = ADVANCED_COOLING_METHODS.withCO2Extinguisher;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0;
  } else if (advancedOptions.inSaltIceWater) {
    const method = ADVANCED_COOLING_METHODS.inSaltIceWater;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0;
  } else if (advancedOptions.inIceWater) {
    const method = ADVANCED_COOLING_METHODS.inIceWater;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0;
  } else if (advancedOptions.inWater) {
    const method = ADVANCED_COOLING_METHODS.inWater;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.3 : 1.0;
  } else if (advancedOptions.inSnow) {
    const method = ADVANCED_COOLING_METHODS.inSnow;
    effectiveAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.1 : 1.0;
  }

  k *= Math.pow(330 / volume, 0.33);
  k *= materialBonus;

  // Newton's Law: T(t) = T_ambient + (T_initial - T_ambient) * e^(-kt)
  const temperature = effectiveAmbientTemp + (currentTemp - effectiveAmbientTemp) * Math.exp(-k * timeMinutes);

  return Math.round(temperature * 10) / 10; // Round to 1 decimal place
}

/**
 * Project beer temperature over time with changing ambient temperatures
 * Used for outdoor cooling where temperature varies hour by hour
 */
export interface ForecastPoint {
  time: number; // Unix timestamp in milliseconds
  temperature: number; // Ambient temperature in °C
}

export interface ProjectionPoint {
  time: number; // Unix timestamp in milliseconds
  beerTemp: number; // Beer temperature in °C
  ambientTemp: number; // Ambient temperature in °C
  targetReached: boolean; // Whether target temperature was reached
  freezingRisk: boolean; // Whether beer is at risk of freezing (< 1°C)
}

export function projectTemperatureWithForecast(
  params: Omit<CoolingParams, 'ambientTemp' | 'targetTemp'>,
  forecast: ForecastPoint[],
  targetTemp: number
): ProjectionPoint[] {
  const {
    currentTemp,
    volume,
    vesselMaterial,
    advancedOptions,
  } = params;

  if (forecast.length === 0) {
    return [];
  }

  // Get base heat transfer coefficient
  let k = K_BASE[vesselMaterial];
  let materialBonus = 1.0;
  let useAdvancedMethod = false;
  let advancedAmbientTemp = 0;

  // Apply advanced cooling options (though unlikely to be used for outdoor cooling)
  // If an advanced method is selected, it overrides the forecast temperatures
  if (advancedOptions.withCO2Extinguisher) {
    const method = ADVANCED_COOLING_METHODS.withCO2Extinguisher;
    advancedAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0;
    useAdvancedMethod = true;
  } else if (advancedOptions.inSaltIceWater) {
    const method = ADVANCED_COOLING_METHODS.inSaltIceWater;
    advancedAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0;
    useAdvancedMethod = true;
  } else if (advancedOptions.inIceWater) {
    const method = ADVANCED_COOLING_METHODS.inIceWater;
    advancedAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.4 : 1.0;
    useAdvancedMethod = true;
  } else if (advancedOptions.inWater) {
    const method = ADVANCED_COOLING_METHODS.inWater;
    advancedAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.3 : 1.0;
    useAdvancedMethod = true;
  } else if (advancedOptions.inSnow) {
    const method = ADVANCED_COOLING_METHODS.inSnow;
    advancedAmbientTemp = method.ambientTemp;
    k *= method.multiplier;
    materialBonus = vesselMaterial === 'can' ? 1.1 : 1.0;
    useAdvancedMethod = true;
  }

  k *= Math.pow(330 / volume, 0.33);
  k *= materialBonus;

  const result: ProjectionPoint[] = [];
  let beerTemp = currentTemp;
  const startTime = forecast[0].time;

  // Project temperature for each hour in the forecast
  for (let i = 0; i < forecast.length; i++) {
    const forecastPoint = forecast[i];
    // Use advanced method's ambient temp if selected, otherwise use forecast
    const ambientTemp = useAdvancedMethod ? advancedAmbientTemp : forecastPoint.temperature;

    // Calculate time elapsed since start (in minutes)
    const elapsedMinutes = (forecastPoint.time - startTime) / (1000 * 60);

    // If this is not the first point, calculate new beer temp based on previous hour
    if (i > 0) {
      const prevAmbientTemp = useAdvancedMethod ? advancedAmbientTemp : forecast[i - 1].temperature;
      const hourInMinutes = 60;

      // Apply Newton's Law for this hour with the ambient temp from previous hour
      beerTemp = prevAmbientTemp + (beerTemp - prevAmbientTemp) * Math.exp(-k * hourInMinutes);
    }

    const targetReached = beerTemp <= targetTemp;
    const freezingRisk = beerTemp < 1;

    result.push({
      time: forecastPoint.time,
      beerTemp: Math.round(beerTemp * 10) / 10,
      ambientTemp,
      targetReached,
      freezingRisk,
    });

    // If we've reached target and are at risk of freezing, we can stop projecting further
    if (targetReached && freezingRisk && i > 24) {
      // Continue for at least 24 hours to show the trend
      break;
    }
  }

  return result;
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

  if (currentTemp <= targetTemp) {
    return 'Your beer is already cold enough! No cooling needed.';
  }

  if (targetTemp <= ambientTemp) {
    return `Cannot cool to or below the environment temperature (${ambientTemp}°C)`;
  }

  return null; // No errors
}
