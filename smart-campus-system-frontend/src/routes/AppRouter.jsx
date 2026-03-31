import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import OAuthSuccessPage from '../pages/OAuthSuccessPage'
import DashboardPage from '../pages/DashboardPage'
import { getToken, hasToken } from '../utils/token'

function ProtectedRoute({ children }) {
  const token = getToken()

  if (!token) {
    return <Navigate to="/" replace />
  }

  return children
}

function GuestRoute({ children }) {
  if (hasToken()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRouter() {
  return (
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
