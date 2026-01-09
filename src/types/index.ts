// Auth Types
export interface SendOtpRequest {
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  otpCode: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  credential: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  broinsBalance: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  isActiveToday: boolean;
}

export interface LevelResponse {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalExperienceForNextLevel: number;
  progressPercent: number;
}

export interface DailyBonusResponse {
  claimed: boolean;
  broinsAwarded: number;
  newBalance: number;
  message: string;
}

export interface XpGainResponse {
  xpGained: number;
  totalExperience: number;
  level: number;
  leveledUp: boolean;
  newLevel?: number;
  broinsAwarded?: number;
}

export interface UpdateUserRequest {
  avatarUrl?: string;
}

// Wallet Types
export interface BalanceResponse {
  balance: number;
}

export interface PurchaseRequest {
  amount: number;
}

export interface PurchaseResponse {
  newBalance: number;
  transactionId: string;
}

export interface CheckoutRequest {
  amountUsd: number;
  broins: number;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface Transaction {
  id: string;
  type: 'Purchase' | 'Spend';
  amountUSD?: number;
  amountBroins: number;
  relatedUploadId?: string;
  createdAt: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Upload Types
export interface CreateUploadRequest {
  content: string;
  title?: string;
}

export interface CreatePdfUploadRequest {
  file: File;
  title?: string;
}

export interface UploadChunk {
  id: string;
  chunkIndex: number;
  title?: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  summary?: string;
  keyPoints?: string[];
  flashcardCount: number;
  errorMessage?: string;
}

export interface Upload {
  id: string;
  title: string;
  content?: string;
  contentPreview?: string;
  summaryPreview?: string;
  keyPointsCount?: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  characterCount?: number;
  broinsCost: number;
  flashcardCount: number;
  summary?: string;
  keyPoints?: string[];
  errorMessage?: string;
  createdAt: string;
  // Chunking support
  isChunked?: boolean;
  totalChunks?: number;
  completedChunks?: number;
  chunks?: UploadChunk[];
  // PDF support
  sourceType?: 'Text' | 'Pdf';
  originalFileName?: string;
  pageCount?: number;
}

// Lightweight upload summary (doesn't include all chunks/flashcards)
export interface UploadSummary {
  id: string;
  title: string;
  contentPreview: string;
  summary?: string;
  keyPoints?: string[];  // Only for non-chunked
  characterCount: number;
  broinsCost: number;
  status: string;
  errorMessage?: string;
  flashcardCount: number;
  isChunked: boolean;
  totalChunks: number;
  completedChunks: number;
  createdAt: string;
  // PDF support
  sourceType?: 'Text' | 'Pdf';
  originalFileName?: string;
  pageCount?: number;
}

export interface UploadsResponse {
  uploads: Upload[];
  totalCount: number;
  page: number;
  limit: number;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  uploadChunkId?: string;
  chunkIndex?: number;
  chunkTitle?: string;
}

// Key Flashcards Response
export interface KeyFlashcardsResponse {
  flashcards: Flashcard[];
  total: number;
}

// Paginated Flashcards Response (for lazy loading)
export interface PaginatedFlashcardsResponse {
  flashcards: Flashcard[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Top Key Points Response (Grouped by chunk, paginated)
export interface TopKeyPointsResponse {
  groups: KeyPointGroupItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KeyPointGroupItem {
  chunkIndex: number;
  chunkTitle: string;
  points: string[];
}

// Paginated Chunks Response
export interface PaginatedChunksResponse {
  chunks: ChunkSummaryItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChunkSummaryItem {
  id: string;
  chunkIndex: number;
  title: string;
  flashcardCount: number;
  status: string;
}

// Chunk Detail Response (lightweight - single chunk)
export interface ChunkDetail {
  // Upload info
  uploadId: string;
  uploadTitle: string;
  totalChunks: number;
  // Chunk details
  id: string;
  chunkIndex: number;
  title?: string;
  status: string;
  summary?: string;
  keyPoints?: string[];
  flashcardCount: number;
  errorMessage?: string;
}

// Practice Types
export interface SubmitDifficultyRequest {
  flashcardId: string;
  difficulty: 1 | 2 | 3; // 1=Difficult, 2=Good, 3=Easy
}

export interface SubmitDifficultyResponse {
  success: boolean;
  totalReviewed: number;
  remainingCards: number;
  // XP Gain Info
  xpGained: number;
  totalExperience: number;
  level: number;
  leveledUp: boolean;
  newLevel?: number;
  broinsAwarded?: number;
}

export interface PracticeStats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  flashcardsAttempted: number;
  totalFlashcards: number;
}

// API Response Types
export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
