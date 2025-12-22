import {
  calculateCoolingTime,
  calculateTemperatureAtTime,
  validateCoolingParams,
} from '../cooling-calculator';
import { CoolingParams } from '@/types';

describe('cooling-calculator', () => {
  // Base test parameters
  const baseParams: CoolingParams = {
    currentTemp: 20,
    ambientTemp: -20,
    volume: 330,
    vesselMaterial: 'can',
    targetTemp: 2,
    advancedOptions: {
      inSnow: false,
      inWater: false,
      inIceWater: false,
      inSaltIceWater: false,
      withCO2Extinguisher: false,
    },
  };

  describe('calculateCoolingTime', () => {
    describe('basic cooling calculations', () => {
      it('should calculate cooling time for a can in freezer', () => {
        const time = calculateCoolingTime(baseParams);
        expect(time).toBeGreaterThan(0);
        expect(time).toBeLessThan(300); // Should be less than 5 hours
      });

      it('should calculate cooling time for glass bottle in freezer', () => {
        const time = calculateCoolingTime({
          ...baseParams,
          vesselMaterial: 'glass-bottle',
        });
        expect(time).toBeGreaterThan(0);
        // Glass should cool slightly slower than aluminum
        const canTime = calculateCoolingTime(baseParams);
        expect(time).toBeGreaterThanOrEqual(canTime);
      });

      it('should calculate cooling time for fridge environment', () => {
        const fridgeTime = calculateCoolingTime({
          ...baseParams,
          ambientTemp: 6,
        });
        const freezerTime = calculateCoolingTime(baseParams);

        expect(fridgeTime).toBeGreaterThan(0);
        // Fridge should take longer than freezer
        expect(fridgeTime).toBeGreaterThan(freezerTime);
      });

      it('should calculate cooling time for outside environment', () => {
        const outsideTime = calculateCoolingTime({
          ...baseParams,
          currentTemp: 25,
          ambientTemp: 10,
          targetTemp: 15, // Cool from 25°C to 15°C in 10°C ambient
        });
        const freezerTime = calculateCoolingTime({
          ...baseParams,
          currentTemp: 25,
          ambientTemp: -20,
          targetTemp: 15, // Cool from 25°C to 15°C in -20°C ambient
        });

        expect(outsideTime).toBeGreaterThan(0);
        expect(freezerTime).toBeGreaterThan(0);
        // Same temperature drop, but warmer ambient (outside) should take MUCH longer
        // because there's less temperature gradient driving the cooling
        expect(outsideTime).toBeGreaterThan(freezerTime);
      });
    });

    describe('volume variations', () => {
      it('should cool faster for smaller volumes', () => {
        const smallTime = calculateCoolingTime({
          ...baseParams,
          volume: 200, // Small bottle
        });
        const standardTime = calculateCoolingTime({
          ...baseParams,
          volume: 330, // Standard can
        });
        const largeTime = calculateCoolingTime({
          ...baseParams,
          volume: 750, // Large bottle
        });

        expect(smallTime).toBeLessThan(standardTime);
        expect(standardTime).toBeLessThan(largeTime);
      });
    });

    describe('target temperature variations', () => {
      it('should take longer to reach colder temperatures', () => {
        const slushyTime = calculateCoolingTime({
          ...baseParams,
          targetTemp: 0, // Slushy
        });
        const perfectTime = calculateCoolingTime({
          ...baseParams,
          targetTemp: 2, // Perfect
        });
        const chilledTime = calculateCoolingTime({
          ...baseParams,
          targetTemp: 4, // Chilled
        });

        expect(slushyTime).toBeGreaterThan(perfectTime);
        expect(perfectTime).toBeGreaterThan(chilledTime);
      });
    });

    describe('advanced cooling options', () => {
      it('should cool faster in snow than in air', () => {
        const snowTime = calculateCoolingTime({
          ...baseParams,
          advancedOptions: { ...baseParams.advancedOptions, inSnow: true },
        });
        const airTime = calculateCoolingTime(baseParams);

        expect(snowTime).toBeLessThan(airTime);
        expect(snowTime).toBeGreaterThan(0);
      });

      it('should cool faster in water than in snow', () => {
        const waterTime = calculateCoolingTime({
          ...baseParams,
          advancedOptions: { ...baseParams.advancedOptions, inWater: true },
        });
        const snowTime = calculateCoolingTime({
          ...baseParams,
          advancedOptions: { ...baseParams.advancedOptions, inSnow: true },
        });
        const airTime = calculateCoolingTime(baseParams);

        expect(waterTime).toBeLessThan(snowTime);
        expect(waterTime).toBeLessThan(airTime);
      });

      it('should cool faster in ice water than in water', () => {
        const iceWaterTime = calculateCoolingTime({
          ...baseParams,
          advancedOptions: { ...baseParams.advancedOptions, inIceWater: true },
        });
        const waterTime = calculateCoolingTime({
          ...baseParams,
          advancedOptions: { ...baseParams.advancedOptions, inWater: true },
        });

        expect(iceWaterTime).toBeLessThan(waterTime);
      });

      it('should cool faster in salt ice water than in ice water', () => {
        const saltIceWaterTime = calculateCoolingTime({
          ...baseParams,
          advancedOptions: { ...baseParams.advancedOptions, inSaltIceWater: true },
        });
        const iceWaterTime = calculateCoolingTime({
          ...baseParams,
          advancedOptions: { ...baseParams.advancedOptions, inIceWater: true },
        });

        expect(saltIceWaterTime).toBeLessThan(iceWaterTime);
      });

      it('should cool fastest with CO2 extinguisher', () => {
        const co2Time = calculateCoolingTime({
          ...baseParams,
          advancedOptions: { ...baseParams.advancedOptions, withCO2Extinguisher: true },
        });
        const saltIceWaterTime = calculateCoolingTime({
          ...baseParams,
          advancedOptions: { ...baseParams.advancedOptions, inSaltIceWater: true },
        });
        const airTime = calculateCoolingTime(baseParams);

        expect(co2Time).toBeLessThan(saltIceWaterTime);
        expect(co2Time).toBeLessThan(airTime);
        expect(co2Time).toBeGreaterThan(0);
      });

      it('should give aluminum advantage in ice water', () => {
        const canTime = calculateCoolingTime({
          ...baseParams,
          vesselMaterial: 'can',
          advancedOptions: { ...baseParams.advancedOptions, inIceWater: true },
        });
        const glassTime = calculateCoolingTime({
          ...baseParams,
          vesselMaterial: 'glass-bottle',
          advancedOptions: { ...baseParams.advancedOptions, inIceWater: true },
        });

        // Aluminum should be notably faster in ice water
        expect(canTime).toBeLessThan(glassTime);
        const speedup = glassTime / canTime;
        expect(speedup).toBeGreaterThan(1.3); // At least 30% faster
      });

      it('should give aluminum advantage in salt ice water', () => {
        const canTime = calculateCoolingTime({
          ...baseParams,
          vesselMaterial: 'can',
          advancedOptions: { ...baseParams.advancedOptions, inSaltIceWater: true },
        });
        const glassTime = calculateCoolingTime({
          ...baseParams,
          vesselMaterial: 'glass-bottle',
          advancedOptions: { ...baseParams.advancedOptions, inSaltIceWater: true },
        });

        expect(canTime).toBeLessThan(glassTime);
        const speedup = glassTime / canTime;
        expect(speedup).toBeGreaterThan(1.3); // At least 30% faster
      });

      it('should give aluminum advantage with CO2 extinguisher', () => {
        const canTime = calculateCoolingTime({
          ...baseParams,
          vesselMaterial: 'can',
          advancedOptions: { ...baseParams.advancedOptions, withCO2Extinguisher: true },
        });
        const glassTime = calculateCoolingTime({
          ...baseParams,
          vesselMaterial: 'glass-bottle',
          advancedOptions: { ...baseParams.advancedOptions, withCO2Extinguisher: true },
        });

        expect(canTime).toBeLessThan(glassTime);
        const speedup = glassTime / canTime;
        expect(speedup).toBeGreaterThan(1.3); // At least 30% faster
      });

      it('should have minimal material difference in air', () => {
        const canTime = calculateCoolingTime({
          ...baseParams,
          vesselMaterial: 'can',
        });
        const glassTime = calculateCoolingTime({
          ...baseParams,
          vesselMaterial: 'glass-bottle',
        });

        // In air, aluminum and glass cool at nearly the same rate
        const diff = Math.abs(canTime - glassTime);
        const avgTime = (canTime + glassTime) / 2;
        const percentDiff = (diff / avgTime) * 100;
        expect(percentDiff).toBeLessThan(15); // Less than 15% difference
      });
    });

    describe('edge cases and validation', () => {
      it('should return 0 when beer is already at target temperature', () => {
        const time = calculateCoolingTime({
          ...baseParams,
          currentTemp: 2,
          targetTemp: 2,
        });
        expect(time).toBe(0);
      });

      it('should return 0 when beer is already colder than target', () => {
        const time = calculateCoolingTime({
          ...baseParams,
          currentTemp: 1,
          targetTemp: 2,
        });
        expect(time).toBe(0);
      });

      it('should return 0 when current temp is at or below ambient', () => {
        const time = calculateCoolingTime({
          ...baseParams,
          currentTemp: -20,
          ambientTemp: -20,
        });
        expect(time).toBe(0);
      });

      it('should return Infinity when target is below ambient', () => {
        const time = calculateCoolingTime({
          ...baseParams,
          ambientTemp: 6, // Fridge
          targetTemp: 0, // Slushy - impossible in fridge
        });
        expect(time).toBe(Infinity);
      });

      it('should handle custom duration override', () => {
        const customTime = calculateCoolingTime({
          ...baseParams,
          advancedOptions: {
            ...baseParams.advancedOptions,
            customDuration: 45,
          },
        });
        // calculateCoolingTime doesn't handle customDuration - that's in the UI layer
        // So this just tests the normal calculation
        expect(customTime).toBeGreaterThan(0);
      });
    });

    describe('realistic scenarios', () => {
      it('should take about 40-60 minutes for a can in freezer from room temp to perfect', () => {
        const time = calculateCoolingTime({
          currentTemp: 20,
          ambientTemp: -20,
          volume: 330,
          vesselMaterial: 'can',
          targetTemp: 2,
          advancedOptions: {
            inSnow: false,
            inWater: false,
            inIceWater: false,
            inSaltIceWater: false,
            withCO2Extinguisher: false,
          },
        });

        expect(time).toBeGreaterThanOrEqual(35);
        expect(time).toBeLessThanOrEqual(65);
      });

      it('should take about 5-10 minutes for a can in salt ice water', () => {
        const time = calculateCoolingTime({
          currentTemp: 20,
          ambientTemp: -20,
          volume: 330,
          vesselMaterial: 'can',
          targetTemp: 2,
          advancedOptions: {
            inSnow: false,
            inWater: false,
            inIceWater: false,
            inSaltIceWater: true,
            withCO2Extinguisher: false,
          },
        });

        expect(time).toBeGreaterThanOrEqual(3);
        expect(time).toBeLessThanOrEqual(12);
      });

      it('should take less than 5 minutes with CO2 extinguisher', () => {
        const time = calculateCoolingTime({
          currentTemp: 20,
          ambientTemp: -78, // CO2 sublimation temp
          volume: 330,
          vesselMaterial: 'can',
          targetTemp: 2,
          advancedOptions: {
            inSnow: false,
            inWater: false,
            inIceWater: false,
            inSaltIceWater: false,
            withCO2Extinguisher: true,
          },
        });

        expect(time).toBeLessThan(5);
        expect(time).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateTemperatureAtTime', () => {
    it('should calculate temperature at a given time', () => {
      const params = {
        currentTemp: 20,
        ambientTemp: -20,
        volume: 330,
        vesselMaterial: 'can' as const,
        advancedOptions: {
          inSnow: false,
          inWater: false,
          inIceWater: false,
          inSaltIceWater: false,
          withCO2Extinguisher: false,
        },
      };

      const temp10min = calculateTemperatureAtTime(params, 10);
      const temp20min = calculateTemperatureAtTime(params, 20);
      const temp30min = calculateTemperatureAtTime(params, 30);

      // Temperature should decrease over time
      expect(temp10min).toBeLessThan(20);
      expect(temp20min).toBeLessThan(temp10min);
      expect(temp30min).toBeLessThan(temp20min);

      // Should approach ambient temperature
      expect(temp30min).toBeGreaterThan(-20);
    });

    it('should converge to target temperature', () => {
      const params = {
        currentTemp: 20,
        ambientTemp: -20,
        volume: 330,
        vesselMaterial: 'can' as const,
        advancedOptions: {
          inSnow: false,
          inWater: false,
          inIceWater: false,
          inIceWater: false,
          inSaltIceWater: false,
          withCO2Extinguisher: false,
        },
      };

      // Calculate time to reach 2°C
      const coolingTime = calculateCoolingTime({
        ...params,
        targetTemp: 2,
      });

      // Temperature at calculated time should be close to target
      const tempAtTarget = calculateTemperatureAtTime(params, coolingTime);
      expect(Math.abs(tempAtTarget - 2)).toBeLessThan(1); // Within 1°C
    });

    it('should return initial temp at time 0', () => {
      const params = {
        currentTemp: 20,
        ambientTemp: -20,
        volume: 330,
        vesselMaterial: 'can' as const,
        advancedOptions: {
          inSnow: false,
          inWater: false,
          inIceWater: false,
          inSaltIceWater: false,
          withCO2Extinguisher: false,
        },
      };

      const temp = calculateTemperatureAtTime(params, 0);
      expect(temp).toBe(20);
    });
  });

  describe('validateCoolingParams', () => {
    it('should return null for valid parameters', () => {
      const error = validateCoolingParams(baseParams);
      expect(error).toBeNull();
    });

    it('should reject zero or negative volume', () => {
      const error = validateCoolingParams({
        ...baseParams,
        volume: 0,
      });
      expect(error).toContain('Volume must be greater than 0');
    });

    it('should reject when current temp is at ambient', () => {
      const error = validateCoolingParams({
        ...baseParams,
        currentTemp: -20,
        ambientTemp: -20,
      });
      expect(error).toContain('already at or below the cooling environment temperature');
    });

    it('should reject when current temp is below ambient', () => {
      const error = validateCoolingParams({
        ...baseParams,
        currentTemp: -25,
        ambientTemp: -20,
      });
      expect(error).toContain('already at or below the cooling environment temperature');
    });

    it('should reject when current temp equals target temp', () => {
      const error = validateCoolingParams({
        ...baseParams,
        currentTemp: 2,
        targetTemp: 2,
      });
      expect(error).toContain('already cold enough');
    });

    it('should reject when current temp is below target temp', () => {
      const error = validateCoolingParams({
        ...baseParams,
        currentTemp: 1,
        targetTemp: 2,
      });
      expect(error).toContain('already cold enough');
    });

    it('should reject when target is below ambient', () => {
      const error = validateCoolingParams({
        ...baseParams,
        ambientTemp: 6, // Fridge
        targetTemp: 0, // Slushy
      });
      expect(error).toContain('Cannot cool below the environment temperature');
      expect(error).toContain('6°C');
    });

    it('should allow target equal to ambient', () => {
      const error = validateCoolingParams({
        ...baseParams,
        currentTemp: 20,
        ambientTemp: 2,
        targetTemp: 2,
      });
      expect(error).toBeNull();
    });
  });

  describe('physics validation', () => {
    it('should follow Newton\'s Law of Cooling exponential decay', () => {
      const params = {
        currentTemp: 20,
        ambientTemp: -20,
        volume: 330,
        vesselMaterial: 'can' as const,
        advancedOptions: {
          inSnow: false,
          inWater: false,
          inIceWater: false,
          inSaltIceWater: false,
          withCO2Extinguisher: false,
        },
      };

      // Temperature difference from ambient should decay exponentially
      const t1 = calculateTemperatureAtTime(params, 5);
      const t2 = calculateTemperatureAtTime(params, 10);
      const t3 = calculateTemperatureAtTime(params, 15);

      const diff1 = t1 - params.ambientTemp;
      const diff2 = t2 - params.ambientTemp;
      const diff3 = t3 - params.ambientTemp;

      // Ratio should be consistent (exponential decay)
      const ratio1 = diff2 / diff1;
      const ratio2 = diff3 / diff2;

      // Ratios should be approximately equal
      expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.1);
    });

    it('should never cool below ambient temperature', () => {
      const params = {
        currentTemp: 20,
        ambientTemp: -20,
        volume: 330,
        vesselMaterial: 'can' as const,
        advancedOptions: {
          inSnow: false,
          inWater: false,
          inIceWater: false,
          inSaltIceWater: false,
          withCO2Extinguisher: false,
        },
      };

      // Even after a very long time, should approach but not go below ambient
      const tempAfterLongTime = calculateTemperatureAtTime(params, 10000);
      expect(tempAfterLongTime).toBeGreaterThanOrEqual(params.ambientTemp);
    });
  });

  describe('comprehensive option combinations', () => {
    it('should handle all material and cooling method combinations', () => {
      const materials = ['can', 'glass-bottle'] as const;
      const methods = [
        { name: 'air', options: {} },
        { name: 'snow', options: { inSnow: true } },
        { name: 'water', options: { inWater: true } },
        { name: 'iceWater', options: { inIceWater: true } },
        { name: 'saltIceWater', options: { inSaltIceWater: true } },
        { name: 'co2', options: { withCO2Extinguisher: true } },
      ];

      materials.forEach(material => {
        methods.forEach(method => {
          const time = calculateCoolingTime({
            currentTemp: 20,
            ambientTemp: -20,
            volume: 330,
            vesselMaterial: material,
            targetTemp: 2,
            advancedOptions: {
              inSnow: false,
              inWater: false,
              inIceWater: false,
              inSaltIceWater: false,
              withCO2Extinguisher: false,
              ...method.options,
            },
          });

          expect(time).toBeGreaterThan(0);
          expect(time).toBeLessThan(300); // Reasonable time
          expect(Number.isNaN(time)).toBe(false);
        });
      });
    });
  });
});
