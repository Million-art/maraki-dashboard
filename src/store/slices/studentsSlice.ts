import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studentsApi, type StudentUser, type StudentAnalytics } from '../../services/api';

interface StudentsState {
  students: StudentUser[];
  analytics: StudentAnalytics | null;
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  analyticsLoading: boolean;
  error: string | null;
}

const initialState: StudentsState = {
  students: [],
  analytics: null,
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  analyticsLoading: false,
  error: null,
};

export const fetchStudents = createAsyncThunk(
  'students/fetchAll',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    subscription?: string;
    sort?: string;
    order?: string;
  } = {}, { rejectWithValue }) => {
    try {
      return await studentsApi.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch students');
    }
  }
);

export const fetchStudentAnalytics = createAsyncThunk(
  'students/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      return await studentsApi.getAnalytics();
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const updateStudentSubscription = createAsyncThunk(
  'students/updateSubscription',
  async ({ telegramId, tier, daysToAdd }: { telegramId: string; tier: string; daysToAdd?: number }, { rejectWithValue }) => {
    try {
      return await studentsApi.updateSubscription(telegramId, tier, daysToAdd);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update subscription');
    }
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchStudentAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchStudentAnalytics.rejected, (state) => {
        state.analyticsLoading = false;
      })
      .addCase(updateStudentSubscription.fulfilled, (state, action) => {
        const idx = state.students.findIndex(s => s.telegramId === action.payload.telegramId);
        if (idx !== -1) state.students[idx] = action.payload;
      });
  },
});

export const { clearError } = studentsSlice.actions;
export default studentsSlice.reducer;
