import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme, themes } from '../../ThemeContext';
import { FaUser, FaCog, FaPaintBrush, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';

function Sidebar({ isOpen, onClose, user, onSignOut }) {
  const { theme, updateTheme, error } = useTheme();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const handleThemeChange = (newTheme) => {
    updateTheme(newTheme);
    setIsThemeDropdownOpen(false);
  };

  return (
    <div className={`side-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`side-menu ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="user-info">
          <img src={user.photoURL} alt="Profile" className="profile-pic" />
          <div className="user-details">
            <p className="user-name">{user.displayName}</p>
            <p className="user-email">{user.email}</p>
          </div>
        </div>
        <hr className="sidebar-separator" />
        {error && <p className="error-message">{error}</p>}
        <nav>
          <ul className="side-menu-links">
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
            <li>
              <button onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}>
                <FaPaintBrush /> Appearance
              </button>
            </li>
            {isThemeDropdownOpen && (
              <ul className="theme-dropdown">
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
            )}
            <hr className='sidebar-separator'/>
            <li>
              <button onClick={() => { onSignOut(); onClose(); }}>
                <FaSignOutAlt /> Sign Out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;