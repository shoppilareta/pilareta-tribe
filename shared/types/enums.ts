export const WorkoutType = {
  REFORMER: 'reformer',
  MAT: 'mat',
  TOWER: 'tower',
  OTHER: 'other',
} as const;
export type WorkoutType = (typeof WorkoutType)[keyof typeof WorkoutType];

export const FocusArea = {
  CORE: 'core',
  GLUTES: 'glutes',
  LEGS: 'legs',
  ARMS: 'arms',
  BACK: 'back',
  POSTURE: 'posture',
  MOBILITY: 'mobility',
} as const;
export type FocusArea = (typeof FocusArea)[keyof typeof FocusArea];

export const PostStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];

export const PostType = {
  GENERAL: 'general',
  WORKOUT_RECAP: 'workout_recap',
} as const;
export type PostType = (typeof PostType)[keyof typeof PostType];

export const MediaType = {
  IMAGE: 'image',
  VIDEO: 'video',
  INSTAGRAM: 'instagram',
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const Difficulty = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const Equipment = {
  REFORMER: 'reformer',
  MAT: 'mat',
  BOTH: 'both',
} as const;
export type Equipment = (typeof Equipment)[keyof typeof Equipment];

export const SessionSection = {
  WARMUP: 'warmup',
  ACTIVATION: 'activation',
  MAIN: 'main',
  COOLDOWN: 'cooldown',
} as const;
export type SessionSection = (typeof SessionSection)[keyof typeof SessionSection];

export const Platform = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
} as const;
export type Platform = (typeof Platform)[keyof typeof Platform];
