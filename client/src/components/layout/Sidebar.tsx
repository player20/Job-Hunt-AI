/**
 * Sidebar Component
 * Side navigation menu
 */

import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/resumes', label: 'Resumes', icon: '📄' },
    { path: '/jobs', label: 'Job Search', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📋' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? 'active' : ''
            }`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
