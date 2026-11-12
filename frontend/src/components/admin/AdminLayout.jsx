import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAdminAuth } from './AdminAuthContext';

const AdminLayout = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('adminTheme');
    return saved === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Auto-close mobile sidebar drawer on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const { logout } = useAdminAuth();

  return (
    <div className="admin-app" data-dark={isDark ? "1" : "0"}>
      <div className="shell">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div 
            className="sb-overlay" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
        )}
        
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="main">
          <Navbar 
            isDark={isDark} 
            toggleDark={() => setIsDark(!isDark)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

