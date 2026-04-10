import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
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
import DirectoryUserDetailsPage from '../pages/DirectoryUserDetailsPage';
import NotFoundPage from '../pages/NotFoundPage';
import NewBookingPage from '../pages/NewBookingPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import AdminBookingsPage from '../pages/AdminBookingsPage';
import CreateTicketPage from '../pages/CreateTicketPage';
import MyTicketsPage from '../pages/MyTicketsPage';
import TicketDetailsPage from '../pages/TicketDetailsPage';
import AdminTicketsPage from '../pages/AdminTicketsPage';
import TechnicianTicketsPage from '../pages/TechnicianTicketsPage';
import { getToken } from '../utils/token';

function ProtectedRoute() {
  if (!getToken()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/pending-approvals" element={<PendingApprovalsPage />} />
            <Route path="/users/:category" element={<UserDirectoryPage />} />
            <Route path="/users/:category/create" element={<CreateDirectoryUserPage />} />
            <Route path="/users/:category/:userId" element={<DirectoryUserDetailsPage />} />
            <Route path="/bookings/new" element={<NewBookingPage />} />
            <Route path="/bookings/my" element={<MyBookingsPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/tickets/create" element={<CreateTicketPage />} />
            <Route path="/tickets/my" element={<MyTicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailsPage />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/technician/tickets" element={<TechnicianTicketsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
