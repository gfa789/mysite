import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme, themes } from '../../ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaCog, FaPaintBrush, FaSignOutAlt, FaSun, FaMoon, FaHome, FaInfoCircle, FaUserPlus, FaSignInAlt, FaChartLine } from 'react-icons/fa';

function Sidebar({ isOpen, onClose, user, profilePicture, onSignOut }) {
  const { theme, updateTheme, error } = useTheme();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const { isAdmin } = useAuth();

  const handleThemeChange = (newTheme) => {
    updateTheme(newTheme);
    setIsThemeDropdownOpen(false);
  };

  const renderThemeDropdown = () => (
    <li className="theme-dropdown-container">
      <button onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}>
        <FaPaintBrush /> Appearance
      </button>
      <ul className={`theme-dropdown ${isThemeDropdownOpen ? 'open' : ''}`}>
        <li>
          <button onClick={() => handleThemeChange(themes.light)}>
            <FaSun /> Light
            {theme === themes.light && <span className="theme-tick"> ✓</span>}
          </button>
        </li>
        <li>
          <button onClick={() => handleThemeChange(themes.dark)}>
            <FaMoon /> Dark
            {theme === themes.dark && <span className="theme-tick"> ✓</span>}
          </button>
        </li>
      </ul>
    </li>
  );

  return (
    <div className={`side-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`side-menu ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <nav>
          <ul className="side-menu-links">
            <li>
              <Link to="/" onClick={onClose}>
                <FaHome /> Home
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={onClose}>
                <FaInfoCircle /> About
              </Link>
            </li>
          </ul>
        </nav>
        <hr className="sidebar-separator" />
        {user ? (
          <>
            <div className="user-info">
              <img src={profilePicture} alt="Profile" className="profile-pic" />
              <div className="user-details">
                <p className="user-name">{user.displayName}</p>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
            <hr className="sidebar-separator" />
            {error && <p className="error-message">{error}</p>}
            <nav>
              <ul className="side-menu-links">
                {isAdmin && (
                  <li>
                    <Link to="/dashboard" onClick={onClose}>
                      <FaChartLine /> Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/profile" onClick={onClose}>
                    <FaUser /> Profile
                  </Link>
                </li>
                <li>
                  <Link to="/settings" onClick={onClose}>
                    <FaCog /> Settings
                  </Link>
                </li>
                {renderThemeDropdown()}
                <li>
                  <button onClick={() => { onSignOut(); onClose(); }}>
                    <FaSignOutAlt /> Sign Out
                  </button>
                </li>
              </ul>
            </nav>
          </>
        ) : (
          <nav>
            <ul className="side-menu-links">
              {renderThemeDropdown()}
              <li>
                <Link to="/register" onClick={onClose}>
                  <FaUserPlus /> Register
                </Link>
              </li>
              <li>
                <Link to="/signin" onClick={onClose}>
                  <FaSignInAlt /> Sign In
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}

export default Sidebar;