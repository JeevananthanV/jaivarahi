import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAdminAuth } from './AdminAuthContext';
import { LogOut } from 'lucide-react';

const AdminLayout = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('adminTheme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-app" data-dark={isDark ? "1" : "0"}>
      <div className="shell">
        <Sidebar />
        <div className="main">
          <Navbar isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
