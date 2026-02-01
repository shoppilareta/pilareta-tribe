const COLOR_MAP: Record<string, string> = {
  'black': '#1a1a1a',
  'white': '#f5f5f5',
  'red': '#dc2626',
  'blue': '#2563eb',
  'navy': '#1e3a5f',
  'green': '#16a34a',
  'olive': '#6b7f3a',
  'grey': '#6b7280',
  'gray': '#6b7280',
  'pink': '#ec4899',
  'purple': '#9333ea',
  'brown': '#78350f',
  'beige': '#d4c4a8',
  'cream': '#f6eddd',
  'tan': '#d2b48c',
  'maroon': '#7f1d1d',
  'orange': '#ea580c',
  'yellow': '#eab308',
  'coral': '#f87171',
  'teal': '#0d9488',
  'turquoise': '#06b6d4',
  'lavender': '#a78bfa',
  'mint': '#6ee7b7',
  'nude': '#e8c4a0',
  'burgundy': '#722f37',
  'charcoal': '#374151',
  'ivory': '#fffff0',
  'khaki': '#c3b091',
  'mauve': '#e0b0ff',
  'peach': '#ffcba4',
  'plum': '#8e4585',
  'rose': '#ff007f',
  'rust': '#b7410e',
  'sage': '#9caf88',
  'salmon': '#fa8072',
  'sand': '#c2b280',
  'silver': '#c0c0c0',
  'slate': '#708090',
  'wine': '#722f37',
  'dark green': '#1a472a',
  'light blue': '#87ceeb',
  'heather': '#9ca3af',
  'indigo': '#4f46e5',
  'gold': '#d4a017',
  'aqua': '#00d4aa',
  'magenta': '#d946ef',
  'lilac': '#c8a2c8',
  'stone': '#a8a29e',
  'taupe': '#8b7e74',
  'denim': '#1560bd',
  'fuchsia': '#c026d3',
  'copper': '#b87333',
  'cobalt': '#0047ab',
  'sky': '#38bdf8',
  'moss': '#4a5e3a',
  'clay': '#b66a50',
  'espresso': '#3c1414',
  'lemon': '#fde047',
  'mocha': '#967969',
};

// Sort keys longest-first so "dark green" matches before "green"
const SORTED_KEYS = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);

const FALLBACK = '#6b7280';

export function getColorCode(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();

  // Exact match (fast path)
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];

  // Fuzzy: check if the color name contains a known keyword
  for (const key of SORTED_KEYS) {
    if (normalized.includes(key)) return COLOR_MAP[key];
  }

  return FALLBACK;
}
