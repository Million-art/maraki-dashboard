import { ApiService, API_ENDPOINTS } from '../config/api';
import type { User, Quiz, Material, CreateUserForm, UpdateUserForm, CreateQuizForm, UpdateQuizForm, CreateMaterialForm, UpdateMaterialForm } from '../types';

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => 
    ApiService.post<{ access_token: string; user: User }>(API_ENDPOINTS.AUTH_LOGIN, credentials),
  register: (userData: { name: string; email: string; password: string; role?: string }) => 
    ApiService.post<{ access_token: string; user: User }>(API_ENDPOINTS.AUTH_REGISTER, userData),
  getProfile: () => ApiService.get<User>(API_ENDPOINTS.AUTH_PROFILE),
  refreshToken: () => ApiService.post<{ access_token: string }>(API_ENDPOINTS.AUTH_REFRESH),
  forgotPassword: (email: string) => 
    ApiService.post<{ message: string }>(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email }),
  resetPassword: (token: string, password: string) => 
    ApiService.post<{ message: string }>(API_ENDPOINTS.AUTH_RESET_PASSWORD, { token, password }),
};

// Users API
export const usersApi = {
  getAll: () => ApiService.get<User[]>(API_ENDPOINTS.USERS),
  getById: (id: string) => ApiService.get<User>(API_ENDPOINTS.USER_BY_ID(id)),
  create: (data: CreateUserForm) => ApiService.post<User>(API_ENDPOINTS.USERS, data),
  update: (id: string, data: UpdateUserForm) => ApiService.put<User>(API_ENDPOINTS.USER_BY_ID(id), data),
  delete: (id: string) => ApiService.delete<void>(API_ENDPOINTS.USER_BY_ID(id)),
};

// Quizzes API
export const quizzesApi = {
  getAll: () => ApiService.get<Quiz[]>(API_ENDPOINTS.QUIZZES),
  getById: (id: string) => ApiService.get<Quiz>(API_ENDPOINTS.QUIZ_BY_ID(id)),
  create: (data: CreateQuizForm) => ApiService.post<Quiz>(API_ENDPOINTS.QUIZZES, data),
  update: (id: string, data: UpdateQuizForm) => ApiService.put<Quiz>(API_ENDPOINTS.QUIZ_BY_ID(id), data),
  delete: (id: string) => ApiService.delete<void>(API_ENDPOINTS.QUIZ_BY_ID(id)),
  activate: (id: string) => ApiService.patch<Quiz>(API_ENDPOINTS.QUIZ_ACTIVATE(id)),
  deactivate: (id: string) => ApiService.patch<Quiz>(API_ENDPOINTS.QUIZ_DEACTIVATE(id)),
};

// Materials API
export const materialsApi = {
  getAll: () => ApiService.get<Material[]>(API_ENDPOINTS.MATERIALS),
  getById: (id: string) => ApiService.get<Material>(API_ENDPOINTS.MATERIAL_BY_ID(id)),
  create: (data: CreateMaterialForm) => ApiService.post<Material>(API_ENDPOINTS.MATERIALS, data),
  update: (id: string, data: UpdateMaterialForm) => ApiService.put<Material>(API_ENDPOINTS.MATERIAL_BY_ID(id), data),
  delete: (id: string) => ApiService.delete<void>(API_ENDPOINTS.MATERIAL_BY_ID(id)),
  uploadFile: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return ApiService.post<{
      public_id: string;
      secure_url: string;
      original_filename: string;
      format: string;
      resource_type: string;
      bytes: number;
      width?: number;
      height?: number;
    }>(`${API_ENDPOINTS.MATERIALS}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Health API
export const healthApi = {
  check: () => ApiService.get<{ status: string; service: string; timestamp: string }>(API_ENDPOINTS.HEALTH),
};
