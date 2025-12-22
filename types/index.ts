// Type definitions for the Beer Cooling Timer app

export type VesselMaterial = 'can' | 'glass-bottle';
export type CoolingLocation = 'freezer' | 'fridge' | 'outside';

export interface AdvancedOptions {
  inSnow: boolean;
  inWater: boolean;
  inIceWater: boolean;
  customDuration?: number; // Custom timer duration in minutes (for testing)
}

export interface CoolingParams {
  currentTemp: number;        // °C
  ambientTemp: number;        // °C (freezer/fridge/outside)
  volume: number;             // ml
  vesselMaterial: VesselMaterial;
  targetTemp: number;         // °C
  advancedOptions: AdvancedOptions;
}

export interface StoredTimer {
  userId: string;
  startTime: number;           // Unix timestamp
  expiryTime: number;          // Unix timestamp
  targetTemp: number;          // Target temperature in Celsius
  beerName?: string;           // Optional: what beer they're cooling
  notificationSent: boolean;   // Prevent duplicate notifications
  workflowRunId: string;       // Workflow run ID for tracking/debugging
}

export interface StoredSubscription {
  userId: string;
  subscription: PushSubscription;
  createdAt: number;
}

export interface TimerState {
  expiryTime: number;
  targetTemp: number;
  beerName?: string;
}

export interface AppState {
  // Form inputs
  currentTemp: number;
  vesselMaterial: VesselMaterial;
  volume: number;
  coolingLocation: CoolingLocation;
  targetTemp: number;
  advancedOptions: AdvancedOptions;

  // Timer state
  activeTimer: TimerState | null;

  // Notification state
  pushSubscription: PushSubscription | null;
  notificationsEnabled: boolean;

  // User ID
  userId: string | null;
}

// Temperature presets for quick selection
export interface TempPreset {
  label: string;
  value: number;  // °C
  description?: string;
}

// Default ambient temperatures
export interface AmbientTemps {
  freezer: number;
  fridge: number;
}
