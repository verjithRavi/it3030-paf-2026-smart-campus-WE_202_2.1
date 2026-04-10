import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Navbar from './Navbar';
import { getCurrentUser } from '../api/authApi';
import { getCurrentUserData, setCurrentUserData } from '../utils/token';

function AppLayout() {
  const [user, setUser] = useState(getCurrentUserData());

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setUser(data);
        setCurrentUserData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {user?.role === 'ADMIN' && <AdminSidebar />}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Navbar />
        <main className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(15,110,86,0.12),transparent_58%)]" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
