import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        T Social
      </NavLink>

      {isAuthenticated ? (
        <nav className="nav-links">
          <NavLink to="/">Feed</NavLink>
          <NavLink to="/explore">Explore</NavLink>
          <NavLink to="/users">People</NavLink>
          <NavLink to="/requests">Requests</NavLink>
          <NavLink to={`/users/${user.id}`}>Profile</NavLink>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      ) : (
        <nav className="nav-links">
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/register" className="btn btn-primary btn-sm">
            Sign up
          </NavLink>
        </nav>
      )}
    </header>
  );
}
