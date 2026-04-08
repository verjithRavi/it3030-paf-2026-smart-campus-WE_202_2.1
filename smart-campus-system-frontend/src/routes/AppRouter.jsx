import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import OAuthSuccessPage from '../pages/OAuthSuccessPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NotificationsPage from '../pages/NotificationsPage';
import PendingApprovalsPage from '../pages/PendingApprovalsPage';
import UserDirectoryPage from '../pages/UserDirectoryPage';
import CreateDirectoryUserPage from '../pages/CreateDirectoryUserPage';
import NotFoundPage from '../pages/NotFoundPage';
import { getToken, hasToken } from '../utils/token';

function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  if (hasToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-approvals"
          element={
            <ProtectedRoute>
              <PendingApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:category"
          element={
            <ProtectedRoute>
              <UserDirectoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:category/create"
          element={
            <ProtectedRoute>
              <CreateDirectoryUserPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
