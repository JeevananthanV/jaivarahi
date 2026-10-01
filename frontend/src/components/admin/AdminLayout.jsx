import React, { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AdminLayout = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('adminTheme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === '1');
  useEffect(() => { localStorage.setItem('adminTheme', isDark ? 'dark' : 'light'); }, [isDark]);
  useEffect(() => { localStorage.setItem('adminSidebarCollapsed', sidebarCollapsed ? '1' : '0'); }, [sidebarCollapsed]);
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('admin-menu-open');
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('admin-menu-open');
    };
  }, [sidebarOpen]);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);
  const toggleSidebarCollapsed = useCallback(() => setSidebarCollapsed((collapsed) => !collapsed), []);
  const toggleTheme = useCallback(() => setIsDark((dark) => !dark), []);

  return (
    <div className="admin-app" data-dark={isDark ? '1' : '0'} data-sidebar-collapsed={sidebarCollapsed ? '1' : '0'}>
      <div className="shell">
        {sidebarOpen && <button type="button" className="sb-backdrop" aria-label="Close navigation" onClick={closeSidebar} />}
        <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} onClose={closeSidebar} />
        <div className="main">
          <Navbar isDark={isDark} toggleDark={toggleTheme} sidebarOpen={sidebarOpen} onMenuToggle={toggleSidebar} sidebarCollapsed={sidebarCollapsed} onSidebarCollapseToggle={toggleSidebarCollapsed} />
          <div className="content"><Outlet /></div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
