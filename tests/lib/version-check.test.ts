import { describe, it, expect } from 'vitest';
import { compareVersions } from '@/lib/version-check';

describe('compareVersions', () => {
  it('returns 0 for equal versions', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('2.3.4', '2.3.4')).toBe(0);
  });

  it('returns -1 when a < b', () => {
    expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
    expect(compareVersions('1.0.0', '1.1.0')).toBe(-1);
    expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
    expect(compareVersions('1.9.9', '2.0.0')).toBe(-1);
  });

  it('returns 1 when a > b', () => {
    expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
    expect(compareVersions('1.1.0', '1.0.0')).toBe(1);
    expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
    expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
  });

  it('handles different-length versions', () => {
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.0', '1.0')).toBe(0);
    expect(compareVersions('1.0', '1.0.1')).toBe(-1);
    expect(compareVersions('1.0.1', '1.0')).toBe(1);
  });

  it('handles major version jumps', () => {
    expect(compareVersions('1.0.0', '10.0.0')).toBe(-1);
    expect(compareVersions('10.0.0', '1.0.0')).toBe(1);
  });
});
