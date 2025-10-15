import { z } from 'zod';

// Shared password validation schema
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be less than 100 characters');

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'moderator', 'superadmin'], {
    message: 'Please select a role',
  }),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  role: z.enum(['admin', 'moderator', 'superadmin']).optional(),
});

// Quiz validation schemas
export const createQuizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(300, 'Duration must be less than 300 minutes'),
  totalQuestions: z.number().min(1, 'Must have at least 1 question').max(100, 'Cannot have more than 100 questions'),
  passingScore: z.number().min(0, 'Passing score cannot be negative').max(100, 'Passing score cannot exceed 100'),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questions: z.array(z.object({
    id: z.string().min(1, 'Question ID is required'),
    question: z.string().min(5, 'Question must be at least 5 characters'),
    type: z.enum(['multiple-choice', 'true-false', 'text']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.boolean()]),
    points: z.number().min(1, 'Points must be at least 1').max(10, 'Points cannot exceed 10'),
    explanation: z.string().optional(),
  })).min(1, 'Must have at least 1 question'),
});

export const updateQuizSchema = createQuizSchema.partial();

// Material validation schemas
export const createMaterialSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  type: z.enum(['pdf', 'video', 'image', 'document', 'link', 'presentation']),
  url: z.string().url('Please enter a valid URL').optional(),
  filePath: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().min(0, 'File size cannot be negative').optional(),
  mimeType: z.string().optional(),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const updateMaterialSchema = createMaterialSchema.partial();

// Type exports for forms
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreateQuizFormData = z.infer<typeof createQuizSchema>;
export type UpdateQuizFormData = z.infer<typeof updateQuizSchema>;
export type CreateMaterialFormData = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialFormData = z.infer<typeof updateMaterialSchema>;
