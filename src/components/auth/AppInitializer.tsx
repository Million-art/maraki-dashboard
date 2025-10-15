import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { validateToken } from '../../store/slices/authSlice';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { token, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState<number | null>(null);

  useEffect(() => {
    // Only attempt validation once per session
    if (token && !isAuthenticated && !validationAttempted) {
      setValidationAttempted(true);
      
      // Set a hard timeout - if validation takes more than 8 seconds, give up
      const timeout = setTimeout(() => {
        setValidationAttempted(false);
      }, 8000);
      
      setValidationTimeout(timeout);
      dispatch(validateToken());
    }
  }, [dispatch, token, isAuthenticated, validationAttempted]);

  // Clear timeout when validation completes
  useEffect(() => {
    if (!isLoading && validationTimeout) {
      clearTimeout(validationTimeout);
      setValidationTimeout(null);
    }
  }, [isLoading, validationTimeout]);

  // Show loading screen ONLY if we're actively validating
  if (token && isLoading && validationAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating session...</p>
          <p className="text-sm text-gray-500 mt-2">Maximum 8 seconds</p>
        </div>
      </div>
    );
  }

  // If we have a token but validation failed or timed out, show error
  if (token && !isAuthenticated && validationAttempted && !isLoading) {
    // Clear the invalid token and redirect
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};

export default AppInitializer;
