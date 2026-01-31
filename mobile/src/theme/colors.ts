export const colors = {
  // Core palette
  bg: {
    primary: '#202219',
    secondary: '#1a1a1a',
    tertiary: '#1a1c16',
    card: 'rgba(70, 74, 60, 0.2)',
    input: 'rgba(70, 74, 60, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.75)',
  },

  fg: {
    primary: '#f6eddd',
    secondary: 'rgba(246, 237, 221, 0.7)',
    tertiary: 'rgba(246, 237, 221, 0.5)',
    muted: 'rgba(246, 237, 221, 0.4)',
    disabled: 'rgba(246, 237, 221, 0.3)',
  },

  border: {
    subtle: '#464a3c',
    default: 'rgba(246, 237, 221, 0.1)',
    hover: 'rgba(246, 237, 221, 0.2)',
    focus: 'rgba(246, 237, 221, 0.5)',
  },

  accent: {
    amber: '#f59e0b',
    gold: '#fbbf24',
    darkAmber: '#d97706',
    gray: '#e3e3e3',
  },

  // Semantic colors
  success: 'rgba(34, 197, 94, 0.8)',
  warning: 'rgba(234, 179, 8, 0.8)',
  error: 'rgba(239, 68, 68, 0.8)',

  // RPE intensity scale
  rpe: {
    low: 'rgba(34, 197, 94, 0.8)',
    medium: 'rgba(234, 179, 8, 0.8)',
    high: 'rgba(249, 115, 22, 0.8)',
    max: 'rgba(239, 68, 68, 0.8)',
  },

  // Button states
  button: {
    primaryBg: '#f6eddd',
    primaryText: '#202219',
    primaryHover: '#e3dccb',
    outlineBg: 'transparent',
    outlineHover: 'rgba(246, 237, 221, 0.1)',
  },

  // Tab bar
  tabBar: {
    bg: '#202219',
    active: '#f6eddd',
    inactive: 'rgba(246, 237, 221, 0.4)',
    border: 'rgba(246, 237, 221, 0.1)',
  },

  // Transparent helpers
  cream10: 'rgba(246, 237, 221, 0.1)',
  cream05: 'rgba(246, 237, 221, 0.05)',
  cream20: 'rgba(246, 237, 221, 0.2)',
} as const;
