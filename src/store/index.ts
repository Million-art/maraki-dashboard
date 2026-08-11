import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import usersReducer from './slices/usersSlice';
import quizzesReducer from './slices/quizzesSlice';
import materialsReducer from './slices/materialsSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import studentsReducer from './slices/studentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    quizzes: quizzesReducer,
    materials: materialsReducer,
    students: studentsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
