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
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  durationMinutes: z.number().min(1, 'Duration must be at least 1 minute').max(300, 'Duration must be less than 300 minutes'),
  passingScorePercentage: z.number().min(0, 'Passing score cannot be negative').max(100, 'Passing score cannot exceed 100'),
  maxAttempts: z.number().min(0, 'Max attempts cannot be negative').max(10, 'Max attempts cannot exceed 10').optional(),
  isRandomized: z.boolean().optional(),
  showCorrectAnswers: z.boolean().optional(),
  showExplanations: z.boolean().optional(),
  questions: z.array(z.object({
    questionText: z.string().min(5, 'Question must be at least 5 characters'),
    questionType: z.enum(['multiple-choice', 'true-false']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    points: z.number().min(1, 'Points must be at least 1').max(10, 'Points cannot exceed 10'),
    orderIndex: z.number().min(0, 'Order index cannot be negative'),
    timeLimitSeconds: z.number().min(1, 'Time limit must be at least 1 second').max(3600, 'Time limit cannot exceed 1 hour').optional(),
    explanation: z.string().optional(),
    options: z.array(z.object({
      optionText: z.string().min(1, 'Option text is required'),
      orderIndex: z.number().min(0, 'Order index cannot be negative'),
      isCorrect: z.boolean().optional(),
    })).min(2, 'Must have at least 2 options').optional(),
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
