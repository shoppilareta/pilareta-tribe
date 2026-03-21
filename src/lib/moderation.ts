/**
 * Basic profanity/content filter for UGC text.
 *
 * Uses word-boundary regex matching so partial matches inside
 * innocent words (e.g. "class" won't match "ass") are avoided.
 * Also normalises common l33t-speak substitutions before checking.
 */

const PROFANE_WORDS: string[] = [
  // Common English profanity (40+ entries)
  'ass',
  'asshole',
  'bastard',
  'bitch',
  'bollocks',
  'bullshit',
  'cock',
  'crap',
  'cunt',
  'damn',
  'dick',
  'dickhead',
  'douchebag',
  'fag',
  'faggot',
  'fuck',
  'fucker',
  'fucking',
  'goddamn',
  'hell',
  'jackass',
  'jerk',
  'motherfucker',
  'nigga',
  'nigger',
  'piss',
  'prick',
  'pussy',
  'retard',
  'shit',
  'shitty',
  'slut',
  'twat',
  'wanker',
  'whore',
  'arsehole',
  'bellend',
  'bloody',
  'bugger',
  'chutiya',
  'madarchod',
  'behenchod',
  'gaand',
];

/**
 * Apply common l33t-speak substitutions so "f@ck" or "sh1t" are caught.
 */
function normaliseLeetSpeak(text: string): string {
  return text
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/\$/g, 's');
}

/**
 * Build a word-boundary regex for a given word (case-insensitive).
 */
function wordRegex(word: string): RegExp {
  return new RegExp(`\\b${word}\\b`, 'i');
}

export interface ModerationResult {
  /** true when no profanity was detected */
  clean: boolean;
  /** list of profane words that were found (empty when clean) */
  flaggedWords: string[];
}

/**
 * Check a piece of user-generated text for profanity.
 *
 * @param text - The raw user text to check
 * @returns An object indicating whether the text is clean and any flagged words
 */
export function moderateContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { clean: true, flaggedWords: [] };
  }

  const normalised = normaliseLeetSpeak(text);
  const flaggedWords: string[] = [];

  for (const word of PROFANE_WORDS) {
    const regex = wordRegex(word);
    // Check both the original text and the l33t-speak-normalised version
    if (regex.test(text) || regex.test(normalised)) {
      flaggedWords.push(word);
    }
  }

  return {
    clean: flaggedWords.length === 0,
    flaggedWords,
  };
}
