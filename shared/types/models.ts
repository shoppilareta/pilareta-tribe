export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutDate: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  notes: string | null;
  calorieEstimate: number | null;
  focusAreas: string[];
  imageUrl: string | null;
  sessionId: string | null;
  studioId: string | null;
  customStudioName: string | null;
  isShared: boolean;
  sharedPostId: string | null;
  createdAt: string;
  updatedAt: string;
  session?: { id: string; name: string } | null;
  studio?: { id: string; name: string; city: string } | null;
  sharedPost?: { id: string; status: string } | null;
}

export interface WorkoutStats {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakStartDate: string | null;
  totalWorkouts: number;
  totalMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  focusAreaCounts: Record<string, number> | null;
  totalCalories: number;
  averageRpe: number;
  workoutTypeBreakdown: Record<string, number>;
}

export interface WeeklyProgress {
  weeklyProgress: boolean[];
}

export interface Studio {
  id: string;
  name: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string | null;
  phoneNumber: string | null;
  website: string | null;
  rating: number | null;
  ratingCount: number | null;
  openingHours: unknown;
  photos: unknown;
  amenities: string[];
  verified: boolean;
}

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  description: string;
  equipment: string;
  difficulty: string;
  focusAreas: string[];
  setupSteps: string[];
  executionSteps: string[];
  cues: string[];
  commonMistakes: string[];
  modifications: { easier: string[]; harder: string[] } | null;
  contraindications: string[];
  safetyNotes: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  defaultReps: number | null;
  defaultDuration: number | null;
  defaultSets: number;
  defaultTempo: string | null;
  rpeTarget: number;
  springSuggestion: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  equipment: string;
  level: string;
  focusAreas: string[];
  benefits: string[];
  prerequisites: string | null;
  imageUrl: string | null;
  isPublished: boolean;
}

export interface PilatesSession {
  id: string;
  name: string;
  description: string | null;
  goal: string;
  equipment: string;
  level: string;
  durationMinutes: number;
  focusAreas: string[];
  totalSets: number;
  totalReps: number | null;
  totalDuration: number;
  rpeTarget: number;
  rationale: string[];
  items?: PilatesSessionItem[];
}

export interface PilatesSessionItem {
  id: string;
  orderIndex: number;
  section: string;
  sets: number;
  reps: number | null;
  duration: number | null;
  tempo: string | null;
  restSeconds: number;
  springSetting: string | null;
  rpeTarget: number;
  showCues: string[];
  showMistakes: string[];
  exercise: Exercise;
}

export interface UgcPost {
  id: string;
  userId: string;
  caption: string | null;
  mediaUrl: string | null;
  mediaType: string;
  thumbnailUrl: string | null;
  aspectRatio: number | null;
  instagramUrl: string | null;
  status: string;
  isFeatured: boolean;
  postType: string;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  createdAt: string;
  user?: {
    firstName: string | null;
    lastName: string | null;
    displayName?: string;
  };
  studio?: { id: string; name: string; city: string } | null;
  tags?: { tag: { id: string; name: string; slug: string } }[];
  isLiked?: boolean;
  isSaved?: boolean;
  isOwner?: boolean;
  workoutRecap?: WorkoutLog | null;
}

export interface UgcComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
}

export interface UgcTag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType?: string;
  tags?: string[];
  availableForSale?: boolean;
  featuredImage?: { url: string; altText: string | null } | null;
  images: { url: string; altText: string | null }[];
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  variants: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    availableForSale: boolean;
    image?: { url: string; altText: string | null };
    selectedOptions?: { name: string; value: string }[];
  }[];
}
