import React, { useEffect, useState } from 'react';
import { FaSignOutAlt, FaBars, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Sidebar from '../Sidebar/Sidebar';
import './Navbar.css';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState('/default-profile-picture.png');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().photoURL) {
          setProfilePicture(userDoc.data().photoURL);
        } else {
          setProfilePicture(currentUser.photoURL || '/default-profile-picture.png');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error('Error signing out:', error));
    navigate('/');
  };

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
    document.body.style.overflow = isSideMenuOpen ? 'auto' : 'hidden';
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-title" onClick={() => navigate('/')}>
          <span className="title-word">Your</span>
          <span className="title-word">Name</span>
        </div>
        <ul className="navbar-links">
          {user ? (
            <>
              <li className="profile-pic" onClick={toggleSideMenu}>
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                />
              </li>
              <li className="hide-mobile">
                <button className="sign-out-btn" onClick={handleSignOut}>
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="hide-mobile">
                <Link to="/signin">
                  <FaSignInAlt /> Sign In
                </Link>
              </li>
              <li className="hide-mobile">
                <Link to="/register">
                  <FaUserPlus /> Register
                </Link>
              </li>
              <li>
                <button className="menu-btn" onClick={toggleSideMenu}>
                  <FaBars />
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Sidebar
        isOpen={isSideMenuOpen}
        onClose={toggleSideMenu}
        user={user}
        profilePicture={profilePicture}
        onSignOut={handleSignOut}
      />
    </>
  );
}

export default Navbar;