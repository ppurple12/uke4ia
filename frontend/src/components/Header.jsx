import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import '../styles/app.css';
import Profile from './Profile';
import '../styles/profile.css';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../components/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { userId, admin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (userId < 0) {
      navigate('/login');
    }
  }, [userId, navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="menu-container" ref={menuRef}>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={28} />
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <nav className="dropdown-links">
                <Link to="/upcoming_concerts" className="nav-link" onClick={() => setMenuOpen(false)}>Upcoming Shows</Link>
                <Link to="/past_concerts" className="nav-link" onClick={() => setMenuOpen(false)}>View Past Shows</Link>
                {admin && (
                  <Link to="/view_members" className="nav-link" onClick={() => setMenuOpen(false)}>View Members</Link>
                )}
                <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
              </nav>
            </div>
          )}
        </div>
        <Link to="/">
          <h1>uke4ia logo here</h1>
        </Link>
      </div>

      <div className="navbar-right">
        <Profile />
      </div>
    </header>
  );
}

export default Header;