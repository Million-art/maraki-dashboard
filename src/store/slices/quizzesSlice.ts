import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Quiz, CreateQuizForm, UpdateQuizForm, LoadingState } from '../../types';
import { quizzesApi } from '../../services/api';

interface QuizzesState extends LoadingState {
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
  filters: {
    search: string;
    category: string;
    difficulty: string;
    status: string;
  };
}

const initialState: QuizzesState = {
  quizzes: [],
  selectedQuiz: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    difficulty: '',
    status: '',
  },
};

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  'quizzes/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const quizzes = await quizzesApi.getAll();
      return quizzes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  'quizzes/fetchQuizById',
  async (id: string, { rejectWithValue }) => {
    try {
      const quiz = await quizzesApi.getById(id);
      return quiz;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz');
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quizzes/createQuiz',
  async (quizData: CreateQuizForm, { rejectWithValue }) => {
    try {
      const quiz = await quizzesApi.create(quizData);
      return quiz;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create quiz');
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'quizzes/updateQuiz',
  async ({ id, quizData }: { id: string; quizData: UpdateQuizForm }, { rejectWithValue }) => {
    try {
      const quiz = await quizzesApi.update(id, quizData);
      return quiz;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quiz');
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quizzes/deleteQuiz',
  async (id: string, { rejectWithValue }) => {
    try {
      await quizzesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quiz');
    }
  }
);

export const activateQuiz = createAsyncThunk(
  'quizzes/activateQuiz',
  async (id: string, { rejectWithValue }) => {
    try {
      const quiz = await quizzesApi.activate(id);
      return quiz;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate quiz');
    }
  }
);

export const deactivateQuiz = createAsyncThunk(
  'quizzes/deactivateQuiz',
  async (id: string, { rejectWithValue }) => {
    try {
      const quiz = await quizzesApi.deactivate(id);
      return quiz;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate quiz');
    }
  }
);

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    setSelectedQuiz: (state, action: PayloadAction<Quiz | null>) => {
      state.selectedQuiz = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<QuizzesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch quiz by ID
      .addCase(fetchQuizById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create quiz
      .addCase(createQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizzes.unshift(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update quiz
      .addCase(updateQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.quizzes.findIndex(quiz => quiz.id === action.payload.id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
        if (state.selectedQuiz?.id === action.payload.id) {
          state.selectedQuiz = action.payload;
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizzes = state.quizzes.filter(quiz => quiz.id !== action.payload);
        if (state.selectedQuiz?.id === action.payload) {
          state.selectedQuiz = null;
        }
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Activate quiz
      .addCase(activateQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(activateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.quizzes.findIndex(quiz => quiz.id === action.payload.id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
        if (state.selectedQuiz?.id === action.payload.id) {
          state.selectedQuiz = action.payload;
        }
      })
      .addCase(activateQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Deactivate quiz
      .addCase(deactivateQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deactivateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.quizzes.findIndex(quiz => quiz.id === action.payload.id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
        if (state.selectedQuiz?.id === action.payload.id) {
          state.selectedQuiz = action.payload;
        }
      })
      .addCase(deactivateQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedQuiz, setFilters, clearError } = quizzesSlice.actions;
export default quizzesSlice.reducer;
