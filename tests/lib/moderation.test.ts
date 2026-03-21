import { describe, it, expect } from 'vitest';
import { moderateContent } from '@/lib/moderation';

describe('moderateContent', () => {
  describe('clean text', () => {
    it('passes normal conversational text', () => {
      const result = moderateContent('Great workout today! Feeling strong.');
      expect(result.clean).toBe(true);
      expect(result.flaggedWords).toHaveLength(0);
    });

    it('passes empty string', () => {
      const result = moderateContent('');
      expect(result.clean).toBe(true);
    });

    it('passes whitespace-only string', () => {
      const result = moderateContent('   ');
      expect(result.clean).toBe(true);
    });

    it('passes pilates-specific terminology', () => {
      const result = moderateContent('The Hundred is a classic mat exercise for core activation.');
      expect(result.clean).toBe(true);
    });
  });

  describe('word boundary matching', () => {
    it('does NOT flag "class" (which contains "ass")', () => {
      const result = moderateContent('I loved the reformer class today!');
      expect(result.clean).toBe(true);
    });

    it('does NOT flag "assessment" (contains "ass")', () => {
      const result = moderateContent('The fitness assessment was thorough.');
      expect(result.clean).toBe(true);
    });

    it('does NOT flag "classic" (contains "ass")', () => {
      const result = moderateContent('This is a classic Pilates move.');
      expect(result.clean).toBe(true);
    });

    it('does NOT flag "hello" (contains "hell")', () => {
      const result = moderateContent('Hello everyone, welcome to the studio.');
      expect(result.clean).toBe(true);
    });

    it('does NOT flag "shell" (contains "hell")', () => {
      const result = moderateContent('Come out of your shell and try reformer.');
      expect(result.clean).toBe(true);
    });

    it('flags standalone profane words', () => {
      const result = moderateContent('This is shit');
      expect(result.clean).toBe(false);
      expect(result.flaggedWords).toContain('shit');
    });

    it('flags profane words surrounded by punctuation', () => {
      const result = moderateContent('What the fuck!');
      expect(result.clean).toBe(false);
      expect(result.flaggedWords).toContain('fuck');
    });
  });

  describe('l33t speak detection', () => {
    it('catches @ substitution for "a"', () => {
      // "b@stard" → "bastard" after leet normalisation
      const result = moderateContent('You b@stard');
      expect(result.clean).toBe(false);
    });

    it('catches 1 substitution for "i"', () => {
      const result = moderateContent('sh1t');
      expect(result.clean).toBe(false);
    });

    it('catches 0 substitution for "o"', () => {
      const result = moderateContent('c0ck');
      expect(result.clean).toBe(false);
    });

    it('catches 3 substitution for "e"', () => {
      const result = moderateContent('r3tard');
      expect(result.clean).toBe(false);
    });

    it('catches $ substitution for "s"', () => {
      const result = moderateContent('a$$hole');
      expect(result.clean).toBe(false);
    });
  });

  describe('case insensitivity', () => {
    it('catches uppercase profanity', () => {
      const result = moderateContent('SHIT');
      expect(result.clean).toBe(false);
    });

    it('catches mixed case profanity', () => {
      const result = moderateContent('FuCk');
      expect(result.clean).toBe(false);
    });
  });

  describe('multiple profane words', () => {
    it('returns all flagged words', () => {
      const result = moderateContent('shit fuck damn');
      expect(result.clean).toBe(false);
      expect(result.flaggedWords).toContain('shit');
      expect(result.flaggedWords).toContain('fuck');
      expect(result.flaggedWords).toContain('damn');
    });
  });
});
