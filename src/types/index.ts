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
  duration: number;
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  questions: Question[];
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'text';
  options?: string[];
  correctAnswer: string | boolean;
  points: number;
  explanation?: string;
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
  downloadCount: number;
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
  duration: number;
  totalQuestions: number;
  passingScore: number;
  questions: Omit<Question, 'id'>[];
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UpdateQuizForm {
  title?: string;
  description?: string;
  duration?: number;
  totalQuestions?: number;
  passingScore?: number;
  questions?: Omit<Question, 'id'>[];
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
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
