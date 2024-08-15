import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import "./Navbar.css"
import SignIn from '../SignIn/SignIn';
import Sidebar from '../Sidebar/Sidebar';
import { FaSignOutAlt } from 'react-icons/fa';

function Navbar() {


    const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error('Error signing out:', error));
  };

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
    document.body.style.overflow = isSideMenuOpen ? 'auto' : 'hidden';
  };

  return (
    <>
    <nav className="navbar">
      <div className="navbar-title">
        <span className="title-word">George</span>
        <span className="title-word title-right">Atkinson</span>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        {user ? (
          <>
            <li className="profile-pic" onClick={toggleSideMenu}>
              <img 
                src={user.photoURL} 
                alt="Profile" 
              />
            </li>
            <li>
                <button className="sign-out-btn" onClick={() => handleSignOut()}>
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </li>
          </>
        ) : (
          <SignIn />
        )}
      </ul>
    </nav>
    {user && (
        <Sidebar
          isOpen={isSideMenuOpen}
          onClose={toggleSideMenu}
          user={user}
          onSignOut={handleSignOut}
        />
      )}
      </>
  );
}

export default Navbar;