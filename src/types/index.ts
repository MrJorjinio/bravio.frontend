// Auth Types
export interface SendOtpRequest {
  email: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  otpCode: string;
  referralCode?: string;
}

export interface LoginRequest {
  credential: string; // Email or Username
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
  username: string;
  broinsBalance: number;
  avatarUrl?: string;
  createdAt: string;
  isAdmin?: boolean;
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  isActiveToday: boolean;
  dailyBonusClaimed: boolean;
  streakBonusAwarded?: boolean;
  streakBonusAmount?: number;
  daysUntilNextBonus?: number;
}

export interface LevelResponse {
  level: number;
  experience: number;
  experienceInCurrentLevel: number;
  experienceRequiredForLevel: number;
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

export interface UpdateProfileRequest {
  username?: string;
}

export interface UpdateProfileResponse {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  usernameChanged: boolean;
  avatarChanged: boolean;
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
  type: 'Purchase' | 'Spend' | 'DailyBonus' | 'LevelUp' | 'StreakBonus' | 'ReferralBonus' | 'ReferredBonus';
  amountUSD?: number;
  amountBroins: number;
  relatedUploadId?: string;
  description?: string;
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

export interface CreateUrlUploadRequest {
  url: string;
  title?: string;
}

export interface CreateVoiceUploadRequest {
  audioFile: File;
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
  // Practice stats (inline from list API to avoid N+1 queries)
  flashcardsAttempted?: number;
  flashcardsCompleted?: number;
  accuracy?: number;
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
  flashcardsTotal: number;
  flashcardsCompleted: number;
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

// Referral Types
export interface ReferralResponse {
  referralCode: string;
  totalReferrals: number;
  totalEarned: number;
}

export interface ReferralApplyRequest {
  referralCode: string;
}

export interface ReferralApplyResponse {
  success: boolean;
  message: string;
  bonusAwarded: number;
  newBalance: number;
}

export interface ReferralValidateResponse {
  isValid: boolean;
}

// Package Types (for purchasing broins)
export interface Package {
  name: string;
  priceUSD: number;
  priceCents: number;
  broins: number;
}

export interface PackagesResponse {
  packages: Package[];
}

export interface PackagePurchaseRequest {
  packageName: string;
  paymentMethodId?: string;
}

export interface PackagePurchaseResponse {
  transactionId: string;
  type: string;
  packageName: string;
  amountUSD: number;
  amountBroins: number;
  newBalance: number;
}

// ============================================
// Tier & Subscription Types
// ============================================

export type UserTier = 'Free' | 'Pro';
export type SubscriptionStatus = 'None' | 'Active' | 'GracePeriod' | 'Cancelled' | 'Expired';

export interface SubscriptionStatusResponse {
  tier: UserTier;
  isPro: boolean;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  willCancelAtPeriodEnd: boolean;
  gracePeriodEnd?: string;
  isInGracePeriod: boolean;
  daysRemainingInPeriod: number;
  monthlyPrice: number;
  proBenefits: string[];
}

export interface SubscriptionCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

// Extended User type with tier info
export interface UserWithTier extends User {
  tier: UserTier;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus;
  monthlyBroinsEarned: number;
  monthlyBroinCap: number;
  documentsProcessedToday: number;
  dailyDocumentLimit: number;
  hasStreakProtection: boolean;
  streakProtectionUsedThisMonth: boolean;
}

// ============================================
// Badge Types
// ============================================

export type BadgeType =
  // Basic Badges
  | 'FirstDocument'
  | 'Streak7Day'
  | 'Streak30Day'
  | 'Documents10'
  | 'Documents50'
  | 'FirstReferral'
  | 'Referrals5'
  | 'Level5'
  | 'Level10'
  // Pro Exclusive
  | 'ProMember'
  | 'Documents100'
  | 'Streak90Day'
  | 'Level20'
  | 'Top10Weekly'
  // Leaderboard Placement Badges
  | 'Top1Daily'
  | 'Top1Weekly'
  | 'Top1AllTime'
  | 'Top3Daily'
  | 'Top3Weekly'
  | 'Top3AllTime';

export interface Badge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  isProExclusive: boolean;
  isEarned: boolean;
  earnedAt?: string;
  currentProgress: number;
  requiredProgress: number;
  progressPercent: number;
}

export interface UserBadgesResponse {
  badges: Badge[];
  totalBadges: number;
  earnedCount: number;
}

export interface AllBadgesResponse {
  badges: Badge[];
  totalCount: number;
  basicCount: number;
  proExclusiveCount: number;
}

export interface BadgeAwardedResponse {
  badgeType: string;
  badgeName: string;
  description: string;
  earnedAt: string;
}

export interface CheckBadgesResponse {
  newBadgesAwarded: number;
  badges: BadgeAwardedResponse[];
}

// ============================================
// Leaderboard Types
// ============================================

export type LeaderboardPeriod = 'daily' | 'weekly' | 'alltime';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  level: number;
  experience: number;
  weeklyXp: number;
  dailyXp: number;
  isPro: boolean;
  isCurrentUser: boolean;
  displayBadgeIcon?: string;
  displayBadgeName?: string;
}

export interface UserRankResponse {
  rank: number;
  totalUsers: number;
  experience: number;
  weeklyXp: number;
  dailyXp: number;
  level: number;
  xpToNextRank: number;
  period: LeaderboardPeriod;
}

export interface LeaderboardResponse {
  period: LeaderboardPeriod;
  periodStart?: string;
  periodEnd?: string;
  topUsers: LeaderboardEntry[];
  currentUser?: UserRankResponse;
}

// ============================================
// Updated Streak Response (with protection)
// ============================================

export interface StreakResponseWithProtection extends StreakResponse {
  hasStreakProtection?: boolean;
  streakProtectionUsed?: boolean;
  streakProtectionMessage?: string;
}

// ============================================
// Tier Limits (for display)
// ============================================

export interface TierLimits {
  // Monthly cap
  monthlyBroinCap: number | null; // null = unlimited

  // Daily document limit
  dailyDocumentLimit: number | null; // null = unlimited

  // PDF limits
  pdfMaxPages: number;

  // Text limits
  textMaxChars: number;

  // File size (in MB)
  maxFileSizeMB: number;

  // History limit
  historyLimit: number | null; // null = unlimited

  // Bonuses
  dailyBonus: number;
  levelUpBonus: number;
  streakBonus: number;
  referralBonus: number;

  // Special features
  hasStreakProtection: boolean;
  hasPriorityQueue: boolean;
}

export const FREE_TIER_LIMITS: TierLimits = {
  monthlyBroinCap: 500,
  dailyDocumentLimit: 5,
  pdfMaxPages: 50,
  textMaxChars: 50000,
  maxFileSizeMB: 10,
  historyLimit: 5,
  dailyBonus: 10,
  levelUpBonus: 25,
  streakBonus: 50,
  referralBonus: 100,
  hasStreakProtection: false,
  hasPriorityQueue: false,
};

export const PRO_TIER_LIMITS: TierLimits = {
  monthlyBroinCap: null,
  dailyDocumentLimit: null,
  pdfMaxPages: 300,
  textMaxChars: 100000,
  maxFileSizeMB: 50,
  historyLimit: null,
  dailyBonus: 20,
  levelUpBonus: 50,
  streakBonus: 100,
  referralBonus: 200,
  hasStreakProtection: true,
  hasPriorityQueue: true,
};

// ============================================
// Profile Types
// ============================================

export interface ProfileResponse {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  tier: UserTier;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate?: string;
  subscriptionExpiresAt?: string;
  balance: number;
  level: number;
  experience: number;
  currentStreak: number;
  longestStreak: number;
  totalDocuments: number;
  totalReferrals: number;
  badgesEarned: number;
  createdAt: string;
  lastActivityDate?: string;
}

// Public profile visible to other users
export interface PublicProfileResponse {
  id: string;
  username: string;
  avatarUrl?: string;
  isPro: boolean;
  level: number;
  experience: number;
  currentStreak: number;
  longestStreak: number;
  totalDocuments: number;
  badgesEarned: number;
  displayBadgeIcon?: string;
  displayBadgeName?: string;
  badges: PublicBadgeInfo[];
  joinedAt: string;
}

export interface PublicBadgeInfo {
  type: string;
  name: string;
  icon: string;
  earnedAt: string;
}

// ============================================
// Subscription History Types
// ============================================

export interface SubscriptionHistoryEntry {
  id: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  amountUSD: number;
  totalRenewals: number;
  cancelledAt?: string;
  createdAt: string;
}

export interface SubscriptionHistoryResponse {
  history: SubscriptionHistoryEntry[];
  totalCount: number;
}

// ============================================
// Dashboard Types
// ============================================

// Weekly Activity for Streak Calendar
export interface WeeklyActivity {
  date: string;
  dayOfWeek: string;
  isActive: boolean;
  isProtected: boolean; // Day was skipped but streak was saved by protection
  xpEarned: number;
  flashcardsStudied: number;
}

export interface WeeklyActivityResponse {
  activities: WeeklyActivity[];
  currentStreak: number;
  weeklyTotal: {
    xpEarned: number;
    flashcardsStudied: number;
    activeDays: number;
  };
  isPro: boolean;
  streakProtectionUsedThisMonth: boolean;
}

// Full Activity History (all days since account creation)
export interface ActivityHistoryResponse {
  activities: WeeklyActivity[];
  totalDays: number;
  activeDays: number;
  protectedDays: number;
  currentStreak: number;
  longestStreak: number;
  accountCreatedAt: string;
  isPro: boolean;
}

// Quick Action Type
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Dashboard Filter Type
export type DashboardFilter = 'all' | 'in_progress' | 'completed';

// ============================================
// Admin Analytics Types
// ============================================

export interface UserStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface RevenueStats {
  totalUSD: number;
  thisMonthUSD: number;
  totalTransactions: number;
}

export interface ContentStats {
  totalUploads: number;
  totalPdfs: number;
  totalFlashcards: number;
}

export interface EconomyStats {
  totalBroinsInCirculation: number;
  totalBroinsSpent: number;
  totalBroinsPurchased: number;
}

export interface AnalyticsOverviewResponse {
  users: UserStats;
  revenue: RevenueStats;
  content: ContentStats;
  economy: EconomyStats;
}

export interface UserGrowthDataPoint {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface UserGrowthResponse {
  period: string;
  data: UserGrowthDataPoint[];
}

export interface RevenueTrendDataPoint {
  date: string;
  revenueUSD: number;
  transactions: number;
}

export interface RevenueTrendResponse {
  period: string;
  data: RevenueTrendDataPoint[];
}

export interface TopPageItem {
  path: string;
  viewCount: number;
  uniqueUsers: number;
}

export interface TopPagesResponse {
  pages: TopPageItem[];
}

export interface TransactionTypeStats {
  type: string;
  count: number;
  totalBroins: number;
}

export interface RecentPurchaseItem {
  userId: string;
  username: string;
  amountUSD: number;
  broins: number;
  date: string;
}

export interface TransactionBreakdownResponse {
  byType: TransactionTypeStats[];
  recentPurchases: RecentPurchaseItem[];
}

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y';
