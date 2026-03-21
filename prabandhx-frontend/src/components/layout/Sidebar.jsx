import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = {
    ADMIN: [
      { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
      { path: '/admin/users', name: 'Users', icon: '👥' },
      { path: '/admin/projects', name: 'Projects', icon: '📁' },
      { path: '/admin/collaborators', name: 'Collaborators', icon: '🤝' },
      { path: '/admin/activity', name: 'Activity Log', icon: '📊' },
      // Gantt Charts REMOVED
      { path: '/admin/files', name: 'File Manager', icon: '📂' },
      { path: '/admin/reports', name: 'Reports', icon: '📈' },
    ],
    MANAGER: [
      { path: '/manager/dashboard', name: 'Dashboard', icon: '📊' },
      { path: '/manager/projects', name: 'Projects', icon: '📁' },
      // Gantt Charts REMOVED
      { path: '/manager/files', name: 'Project Files', icon: '📂' },
      { path: '/manager/tasks', name: 'Tasks', icon: '✅' },
      { path: '/manager/team', name: 'Team', icon: '👥' },
    ],
    USER: [
      { path: '/user/dashboard', name: 'Dashboard', icon: '📊' },
      { path: '/user/tasks', name: 'My Tasks', icon: '✅' },
      // Gantt Charts REMOVED
      { path: '/user/files', name: 'My Files', icon: '📂' },
      { path: '/user/shared-projects', name: 'Shared with Me', icon: '🤝' },
      { path: '/user/activity', name: 'My Activity', icon: '📊' },
      { path: '/user/leaderboard', name: 'Leaderboard', icon: '🏆' },
      { path: '/user/profile', name: 'Profile', icon: '👤' },
    ]
  };

  const items = menuItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{collapsed ? 'PX' : 'PrabandhX'}</h2>
        <button onClick={() => setCollapsed(!collapsed)} className="collapse-btn">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {!collapsed && <span className="name">{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-link logout-btn"
        >
          <span className="icon">🚪</span>
          {!collapsed && <span className="name">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;