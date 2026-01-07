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

export interface Transaction {
  id: string;
  type: 'Purchase' | 'Usage' | 'SignupBonus' | 'Refund';
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
