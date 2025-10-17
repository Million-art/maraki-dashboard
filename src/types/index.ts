// Core types for the application
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'superadmin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMinutes: number;
  passingScorePercentage: number;
  maxAttempts: number;
  isActive: boolean;
  isRandomized: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  totalQuestions: number;
  totalPoints: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  questionText: string;
  explanation?: string;
  questionType: 'multiple-choice' | 'true-false';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  orderIndex: number;
  timeLimitSeconds?: number;
  options: QuestionOption[];
  totalAttempts?: number;
  correctAttempts?: number;
  successRate?: number;
}

export interface QuestionOption {
  id: string;
  optionText: string;
  orderIndex: number;
  isCorrect?: boolean; // Only shown after submission
  selectionCount?: number; // For analytics
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'image' | 'document' | 'link' | 'presentation';
  url?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface CreateUserForm {
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'superadmin';
}

export interface UpdateUserForm {
  name?: string;
  email?: string;
  role?: 'admin' | 'moderator' | 'superadmin';
}

export interface CreateQuizForm {
  title: string;
  description?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMinutes: number;
  passingScorePercentage: number;
  maxAttempts?: number;
  isRandomized?: boolean;
  showCorrectAnswers?: boolean;
  showExplanations?: boolean;
  questions: Omit<Question, 'id'>[];
}

export interface UpdateQuizForm {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  durationMinutes?: number;
  passingScorePercentage?: number;
  maxAttempts?: number;
  isRandomized?: boolean;
  showCorrectAnswers?: boolean;
  showExplanations?: boolean;
  questions?: Omit<Question, 'id'>[];
}

export interface CreateMaterialForm {
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'image' | 'document' | 'link' | 'presentation';
  url?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UpdateMaterialForm {
  title?: string;
  description?: string;
  type?: 'pdf' | 'video' | 'image' | 'document' | 'link' | 'presentation';
  url?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface TableState {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  current?: boolean;
  children?: NavItem[];
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalQuizzes: number;
  totalMaterials: number;
  activeQuizzes: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'user' | 'quiz' | 'material';
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  entityName: string;
  timestamp: string;
  user: string;
}

// Telegram Bot Analytics Types
export interface TelegramUserAnalytics {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  marakiPremiumUsers: number;
  levelBreakdown: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  subscriptionBreakdown: {
    free: number;
    premium: number;
    pro: number;
  };
  recentUsers: number;
  averageUsage: {
    dailyGrammarUsage: number;
    weeklyLessonUsage: number;
    dailyChatUsage: number;
    dailyTranslationUsage: number;
  };
  engagement: {
    totalQuizzesCompleted: number;
    totalMaterialsAccessed: number;
    totalTimeSpent: number;
  };
}

export interface TelegramUserSummary {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  levelBreakdown: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  subscriptionBreakdown: {
    free: number;
    premium: number;
    pro: number;
  };
}
