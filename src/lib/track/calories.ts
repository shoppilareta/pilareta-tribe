/**
 * Calorie estimation for Pilates workouts
 *
 * This is an ESTIMATE based on MET values and should be clearly labeled as such.
 * Actual calorie burn varies significantly based on:
 * - Individual body composition
 * - Actual intensity throughout workout
 * - Fitness level
 * - Environmental factors
 *
 * MET values source: Compendium of Physical Activities
 * - Mat Pilates: ~3.0 METs (general conditioning)
 * - Reformer Pilates: ~3.5-4.0 METs (moderate-vigorous)
 */

// Base MET values by workout type
const BASE_METS: Record<string, number> = {
  mat: 3.0,
  reformer: 3.5,
  tower: 3.8,
  other: 3.2,
};

// Default body weight for estimation (can be personalized later)
const DEFAULT_WEIGHT_KG = 65;

/**
 * Estimate calories burned during a Pilates workout
 *
 * Formula: Calories = MET × Weight(kg) × Duration(hours)
 *
 * @param durationMinutes - Workout duration in minutes
 * @param workoutType - Type of Pilates (mat, reformer, tower, other)
 * @param rpe - Rate of Perceived Exertion (1-10)
 * @param weightKg - Optional body weight in kg (default: 65kg)
 * @returns Estimated calories burned (rounded to nearest whole number)
 */
export function estimateCalories(
  durationMinutes: number,
  workoutType: string,
  rpe: number,
  weightKg: number = DEFAULT_WEIGHT_KG
): number {
  // Get base MET for workout type
  const baseMet = BASE_METS[workoutType.toLowerCase()] || BASE_METS.other;

  // Adjust MET by RPE (intensity multiplier)
  // RPE 1-3: 0.8x (lighter than average)
  // RPE 4-6: 1.0x (average)
  // RPE 7-10: 1.2x (higher intensity)
  const intensityMultiplier = 0.8 + (rpe / 10) * 0.4; // Range: 0.84 to 1.2

  const adjustedMet = baseMet * intensityMultiplier;

  // Calculate calories: MET × weight(kg) × duration(hours)
  const durationHours = durationMinutes / 60;
  const calories = adjustedMet * weightKg * durationHours;

  return Math.round(calories);
}

/**
 * Get a descriptive label for RPE value
 */
export function getRpeLabel(rpe: number): string {
  if (rpe <= 2) return 'Very light';
  if (rpe <= 4) return 'Light';
  if (rpe <= 6) return 'Moderate';
  if (rpe <= 8) return 'Hard';
  return 'All-out';
}

/**
 * Get intensity description for RPE
 */
export function getRpeDescription(rpe: number): string {
  if (rpe <= 2) return 'Easy breathing, could hold a conversation easily';
  if (rpe <= 4) return 'Slightly elevated breathing, comfortable pace';
  if (rpe <= 6) return 'Breathing harder, can speak in short sentences';
  if (rpe <= 8) return 'Heavy breathing, difficult to speak';
  return 'Maximum effort, unable to maintain for long';
}

/**
 * Get color for RPE display
 */
export function getRpeColor(rpe: number): string {
  if (rpe <= 3) return 'rgba(34, 197, 94, 0.8)'; // Green
  if (rpe <= 5) return 'rgba(234, 179, 8, 0.8)'; // Yellow
  if (rpe <= 7) return 'rgba(249, 115, 22, 0.8)'; // Orange
  return 'rgba(239, 68, 68, 0.8)'; // Red
}

/**
 * Validate RPE value
 */
export function isValidRpe(rpe: number): boolean {
  return Number.isInteger(rpe) && rpe >= 1 && rpe <= 10;
}

/**
 * Validate duration
 */
export function isValidDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes > 0 && minutes <= 180;
}

/**
 * Validate workout type
 */
export function isValidWorkoutType(type: string): boolean {
  return ['reformer', 'mat', 'tower', 'other'].includes(type.toLowerCase());
}
