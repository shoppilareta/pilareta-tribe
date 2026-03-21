import { describe, it, expect } from 'vitest';
import { getColorCode } from '@/lib/colorCode';

describe('getColorCode', () => {
  describe('exact matches', () => {
    it('returns correct hex for basic colors', () => {
      expect(getColorCode('black')).toBe('#1a1a1a');
      expect(getColorCode('white')).toBe('#f5f5f5');
      expect(getColorCode('red')).toBe('#dc2626');
      expect(getColorCode('blue')).toBe('#2563eb');
      expect(getColorCode('green')).toBe('#16a34a');
    });

    it('returns correct hex for specific named colors', () => {
      expect(getColorCode('burgundy')).toBe('#722f37');
      expect(getColorCode('sage')).toBe('#9caf88');
      expect(getColorCode('terracotta')).toBe('#e2725b');
      expect(getColorCode('navy')).toBe('#1e3a5f');
      expect(getColorCode('coral')).toBe('#f87171');
    });

    it('handles multi-word color names', () => {
      expect(getColorCode('dark green')).toBe('#1a472a');
      expect(getColorCode('light pink')).toBe('#ffb6c1');
      expect(getColorCode('rose gold')).toBe('#b76e79');
      expect(getColorCode('powder blue')).toBe('#b0e0e6');
    });
  });

  describe('case insensitivity', () => {
    it('matches regardless of case', () => {
      expect(getColorCode('Black')).toBe('#1a1a1a');
      expect(getColorCode('RED')).toBe('#dc2626');
      expect(getColorCode('Navy')).toBe('#1e3a5f');
    });

    it('trims whitespace', () => {
      expect(getColorCode('  blue  ')).toBe('#2563eb');
    });
  });

  describe('fuzzy matching (substring)', () => {
    it('matches when input contains a known color name', () => {
      // "burgundy jacket" contains "burgundy"
      expect(getColorCode('burgundy jacket')).toBe('#722f37');
    });

    it('prefers longer matches over shorter ones', () => {
      // "dark green" should match before "green" because keys are sorted longest-first
      expect(getColorCode('a dark green sweater')).toBe('#1a472a');
    });
  });

  describe('misspelling support', () => {
    it('recognizes common misspellings of burgundy', () => {
      expect(getColorCode('burgendy')).toBe('#722f37');
      expect(getColorCode('bourgundy')).toBe('#722f37');
    });

    it('recognizes mauve variants', () => {
      expect(getColorCode('mouve')).toBe('#c9a0dc');
      expect(getColorCode('mouv')).toBe('#c9a0dc');
    });
  });

  describe('grey/gray equivalence', () => {
    it('accepts both spellings', () => {
      expect(getColorCode('grey')).toBe('#6b7280');
      expect(getColorCode('gray')).toBe('#6b7280');
    });
  });

  describe('fallback', () => {
    it('returns grey fallback for completely unknown input', () => {
      expect(getColorCode('xyzzy')).toBe('#6b7280');
    });

    it('returns fallback for empty-ish strings', () => {
      expect(getColorCode('???')).toBe('#6b7280');
    });
  });
});
