import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Quizzes from './pages/Quizzes';
import Materials from './pages/Materials';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetPassword from './pages/SetPassword';
import AppInitializer from './components/auth/AppInitializer';
import AuthGuard from './components/auth/AuthGuard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Notification from './components/ui/Notification';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppInitializer>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
              <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />
              <Route path="/reset-password" element={<ErrorBoundary><ResetPassword /></ErrorBoundary>} />
              <Route path="/auth/reset-password" element={<ErrorBoundary><ResetPassword /></ErrorBoundary>} />
              <Route path="/auth/set-password" element={<ErrorBoundary><SetPassword /></ErrorBoundary>} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ErrorBoundary>
                  <AuthGuard>
                    <Layout />
                  </AuthGuard>
                </ErrorBoundary>
              }>
                <Route index element={<ErrorBoundary><ProtectedRoute><Dashboard /></ProtectedRoute></ErrorBoundary>} />
                <Route path="users" element={<ErrorBoundary><ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute></ErrorBoundary>} />
                <Route path="quizzes" element={<ErrorBoundary><ProtectedRoute><Quizzes /></ProtectedRoute></ErrorBoundary>} />
                <Route path="materials" element={<ErrorBoundary><ProtectedRoute><Materials /></ProtectedRoute></ErrorBoundary>} />
                <Route path="settings" element={<ErrorBoundary><ProtectedRoute><Settings /></ProtectedRoute></ErrorBoundary>} />
              </Route>
            </Routes>
            <Notification />
          </Router>
        </AppInitializer>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;