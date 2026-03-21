import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="navbar">
      <div className="navbar-right">
        <button className="navbar-icon">🔔</button>
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span>{user?.name || 'User'}</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;