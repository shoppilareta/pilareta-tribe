import type {
  WorkoutLog,
  WorkoutStats,
  UgcPost,
  UgcComment,
  UgcTag,
  User,
  Studio,
  Exercise,
  Program,
  PilatesSession,
  ShopifyProduct,
} from './models';

// --- Auth ---

export interface MobileLoginResponse {
  authUrl: string;
  state: string;
  codeVerifier: string;
}

export interface MobileCallbackRequest {
  code: string;
  state: string;
  codeVerifier: string;
}

export interface MobileCallbackResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export interface MobileRefreshRequest {
  refreshToken: string;
}

export interface MobileRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// --- Track ---

export interface TrackStatsResponse {
  stats: WorkoutStats;
  weeklyProgress: boolean[];
}

export interface TrackLogsResponse {
  logs: WorkoutLog[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateWorkoutLogRequest {
  workoutDate?: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  notes?: string;
  focusAreas?: string[];
  sessionId?: string;
  studioId?: string;
  customStudioName?: string;
  calorieEstimate?: number;
}

export interface UpdateWorkoutLogRequest {
  workoutDate?: string;
  durationMinutes?: number;
  workoutType?: string;
  rpe?: number;
  notes?: string | null;
  focusAreas?: string[];
  studioId?: string | null;
  customStudioName?: string | null;
  calorieEstimate?: number | null;
}

// --- UGC ---

export interface UgcFeedResponse {
  posts: UgcPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface UgcCommentsResponse {
  comments: UgcComment[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface UgcTagsResponse {
  tags: UgcTag[];
}

// --- Studios ---

export interface StudiosResponse {
  studios: Studio[];
  total: number;
}

export interface NearbyStudiosResponse {
  studios: Studio[];
  source: string;
  total: number;
}

export interface GeocodeResponse {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

// --- Learn ---

export interface ExercisesResponse {
  exercises: Exercise[];
}

export interface ProgramsResponse {
  programs: Program[];
}

export interface BuildSessionRequest {
  goal: string;
  duration: number;
  level: string;
  constraints: string[];
}

export interface BuildSessionResponse {
  sessionId: string;
  session: PilatesSession;
}

// --- Shop ---

export interface ShopProductsResponse {
  products: ShopifyProduct[];
}

export interface ShopCartResponse {
  cart: {
    id: string;
    checkoutUrl: string;
    lines: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        product: { title: string; images: { url: string }[] };
        price: { amount: string; currencyCode: string };
      };
    }[];
    cost: {
      totalAmount: { amount: string; currencyCode: string };
      subtotalAmount: { amount: string; currencyCode: string };
    };
  };
}

// --- Pagination ---

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}
