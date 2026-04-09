import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import NewBookingPage from "./pages/NewBookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import { getCurrentUser, setDemoUser } from "./api/bookingApi";


const studentUser = {
  id: "user001",
  name: "Abish",
  role: "USER",
};

const adminUser = {
  id: "admin001",
  name: "Admin User",
  role: "ADMIN",
};

export default function App() {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    if (!localStorage.getItem("demoUser")) {
      setDemoUser(studentUser);
      setUser(studentUser);
    }
  }, []);

  const switchToStudent = () => {
    setDemoUser(studentUser);
    setUser(studentUser);
  };

  const switchToAdmin = () => {
    setDemoUser(adminUser);
    setUser(adminUser);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Smart Campus Booking</h1>
        </div>

        <div className="user-switcher">
          <div className="user-card">
            <span><strong>User:</strong> {user.name}</span>
            <span><strong>Role:</strong> {user.role}</span>
          </div>

          <div className="switch-buttons">
            <button onClick={switchToStudent}>Use Student</button>
            <button onClick={switchToAdmin}>Use Admin</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <NavLink to="/bookings/new">New Booking</NavLink>
        <NavLink to="/bookings/my">My Bookings</NavLink>
        <NavLink to="/admin/bookings">Admin Bookings</NavLink>
      </nav>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<Navigate to="/bookings/new" replace />} />
          <Route path="/bookings/new" element={<NewBookingPage user={user} />} />
          <Route path="/bookings/my" element={<MyBookingsPage user={user} />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage user={user} />} />
        </Routes>
      </main>
    </div>
  );
}