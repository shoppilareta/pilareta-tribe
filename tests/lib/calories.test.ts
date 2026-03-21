import { describe, it, expect } from 'vitest';
import {
  estimateCalories,
  getRpeLabel,
  getRpeDescription,
  getRpeColor,
  isValidRpe,
  isValidDuration,
  isValidWorkoutType,
} from '@/lib/track/calories';

describe('estimateCalories', () => {
  it('returns 0 calories for 0 minutes', () => {
    expect(estimateCalories(0, 'reformer', 5)).toBe(0);
  });

  it('returns different values for different workout types at same duration and RPE', () => {
    const reformer = estimateCalories(60, 'reformer', 5);
    const running = estimateCalories(60, 'running', 5);
    const stretching = estimateCalories(60, 'stretching', 5);

    // Running should burn more than reformer, reformer more than stretching
    expect(running).toBeGreaterThan(reformer);
    expect(reformer).toBeGreaterThan(stretching);
  });

  it('scales proportionally with duration', () => {
    const thirtyMin = estimateCalories(30, 'mat', 5);
    const sixtyMin = estimateCalories(60, 'mat', 5);

    // 60 minutes should be exactly double 30 minutes (before rounding)
    // With rounding, allow +-1 difference
    expect(Math.abs(sixtyMin - thirtyMin * 2)).toBeLessThanOrEqual(1);
  });

  it('higher RPE increases calorie estimate', () => {
    const lowRpe = estimateCalories(60, 'reformer', 1);
    const midRpe = estimateCalories(60, 'reformer', 5);
    const highRpe = estimateCalories(60, 'reformer', 10);

    expect(highRpe).toBeGreaterThan(midRpe);
    expect(midRpe).toBeGreaterThan(lowRpe);
  });

  it('heavier body weight increases calorie estimate', () => {
    const light = estimateCalories(60, 'reformer', 5, 50);
    const heavy = estimateCalories(60, 'reformer', 5, 90);

    expect(heavy).toBeGreaterThan(light);
  });

  it('uses default weight of 65kg when not specified', () => {
    const withDefault = estimateCalories(60, 'reformer', 5);
    const withExplicit = estimateCalories(60, 'reformer', 5, 65);

    expect(withDefault).toBe(withExplicit);
  });

  it('returns the "other" MET for unknown workout types', () => {
    const unknown = estimateCalories(60, 'underwater_basket_weaving', 5);
    const other = estimateCalories(60, 'other', 5);

    expect(unknown).toBe(other);
  });

  it('handles very long durations (3 hours)', () => {
    const result = estimateCalories(180, 'running', 10);
    // 3 hours of max-effort running should be a large number
    expect(result).toBeGreaterThan(500);
  });

  it('returns a rounded integer', () => {
    const result = estimateCalories(45, 'reformer', 7);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('handles case-insensitive workout types', () => {
    const lower = estimateCalories(60, 'reformer', 5);
    const upper = estimateCalories(60, 'Reformer', 5);
    const mixed = estimateCalories(60, 'REFORMER', 5);

    expect(lower).toBe(upper);
    expect(upper).toBe(mixed);
  });
});

describe('getRpeLabel', () => {
  it('returns "Very light" for RPE 1-2', () => {
    expect(getRpeLabel(1)).toBe('Very light');
    expect(getRpeLabel(2)).toBe('Very light');
  });

  it('returns "Light" for RPE 3-4', () => {
    expect(getRpeLabel(3)).toBe('Light');
    expect(getRpeLabel(4)).toBe('Light');
  });

  it('returns "Moderate" for RPE 5-6', () => {
    expect(getRpeLabel(5)).toBe('Moderate');
    expect(getRpeLabel(6)).toBe('Moderate');
  });

  it('returns "Hard" for RPE 7-8', () => {
    expect(getRpeLabel(7)).toBe('Hard');
    expect(getRpeLabel(8)).toBe('Hard');
  });

  it('returns "All-out" for RPE 9-10', () => {
    expect(getRpeLabel(9)).toBe('All-out');
    expect(getRpeLabel(10)).toBe('All-out');
  });
});

describe('getRpeDescription', () => {
  it('returns conversation-easy description for low RPE', () => {
    expect(getRpeDescription(1)).toContain('conversation');
  });

  it('returns max effort description for high RPE', () => {
    expect(getRpeDescription(10)).toContain('Maximum');
  });
});

describe('getRpeColor', () => {
  it('returns green for low RPE', () => {
    const color = getRpeColor(1);
    expect(color).toContain('34, 197, 94'); // green channel values
  });

  it('returns red for high RPE', () => {
    const color = getRpeColor(9);
    expect(color).toContain('239, 68, 68'); // red channel values
  });

  it('transitions through yellow and orange for mid ranges', () => {
    const yellow = getRpeColor(4);
    const orange = getRpeColor(6);
    expect(yellow).toContain('234, 179, 8');
    expect(orange).toContain('249, 115, 22');
  });
});

describe('isValidRpe', () => {
  it('accepts integers 1 through 10', () => {
    for (let i = 1; i <= 10; i++) {
      expect(isValidRpe(i)).toBe(true);
    }
  });

  it('rejects 0 and 11', () => {
    expect(isValidRpe(0)).toBe(false);
    expect(isValidRpe(11)).toBe(false);
  });

  it('rejects non-integers', () => {
    expect(isValidRpe(5.5)).toBe(false);
    expect(isValidRpe(3.14)).toBe(false);
  });

  it('rejects negative numbers', () => {
    expect(isValidRpe(-1)).toBe(false);
  });
});

describe('isValidDuration', () => {
  it('accepts integers 1 through 180', () => {
    expect(isValidDuration(1)).toBe(true);
    expect(isValidDuration(60)).toBe(true);
    expect(isValidDuration(180)).toBe(true);
  });

  it('rejects 0 and over 180', () => {
    expect(isValidDuration(0)).toBe(false);
    expect(isValidDuration(181)).toBe(false);
  });

  it('rejects non-integers', () => {
    expect(isValidDuration(30.5)).toBe(false);
  });
});

describe('isValidWorkoutType', () => {
  it('accepts all known workout types', () => {
    const types = ['reformer', 'mat', 'tower', 'yoga', 'running', 'stretching', 'strength_training', 'other'];
    for (const t of types) {
      expect(isValidWorkoutType(t)).toBe(true);
    }
  });

  it('rejects unknown types', () => {
    expect(isValidWorkoutType('swimming')).toBe(false);
    expect(isValidWorkoutType('')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isValidWorkoutType('Reformer')).toBe(true);
    expect(isValidWorkoutType('MAT')).toBe(true);
  });
});
