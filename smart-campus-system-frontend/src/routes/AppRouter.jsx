import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getCurrentUser as fetchCurrentUser } from '../api/authApi';
import HomePage from '../pages/HomePage';
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
import NewBookingPage from '../pages/NewBookingPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import AdminBookingsPage from '../pages/AdminBookingsPage';
import { getCurrentUserData, getToken, removeToken, setCurrentUserData } from '../utils/token';

function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRouter() {
  useEffect(() => {
    const syncUser = async () => {
      if (!getToken() || getCurrentUserData()) {
        return;
      }

      try {
        const user = await fetchCurrentUser();
        setCurrentUserData(user);
      } catch {
        removeToken();
      }
    };

    syncUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage />
          }
        />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/bookings/new"
          element={
            <ProtectedRoute>
              <NewBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/my"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <AdminBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
