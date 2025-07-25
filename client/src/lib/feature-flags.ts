/**
 * Feature Flags Configuration
 * 
 * Use this file to control new features without modifying core logic.
 * Set flags to false to disable features and return to stable state.
 */

export const FEATURE_FLAGS = {
  // Auto Loop functionality - DISABLED due to crash
  AUTO_LOOP: false,
  
  // Future features can be added here
  ADVANCED_CHORD_INVERSIONS: false,
  CHORD_PROGRESSION_ANALYSIS: false,
  PRACTICE_SESSION_TRACKING: false,
  CUSTOM_CHORD_LIBRARY: false,
} as const;

// Type for feature flag keys
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return FEATURE_FLAGS[flag];
};

// Helper function to get all enabled features
export const getEnabledFeatures = (): FeatureFlag[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([flag, _]) => flag as FeatureFlag);
};