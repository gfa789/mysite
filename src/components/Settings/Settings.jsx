import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase.config';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser, updateEmail } from 'firebase/auth';
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import PasswordStrengthBar from 'react-password-strength-bar';
import { useNavigate, Link } from 'react-router-dom';
import './Settings.css';


function Settings() {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePictureURL, setProfilePictureURL] = useState('');
  
  const [newEmail, setNewEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || '');
          setPhoneNumber(userDoc.data().phoneNumber || '');
          setProfilePictureURL(userDoc.data().photoURL || '/default-profile-picture.png');
        }
      }
    };
    fetchUserData();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmNewPassword) {
      setError("New passwords don't match");
      return;
    }
    const user = auth.currentUser;
    if (user) {
      try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setSuccess('Password updated successfully');
        setNewPassword('');
        setConfirmNewPassword('');
        setCurrentPassword('');
        window.location.reload(); // Refresh the page
      } catch (error) {
        setError('Failed to update password. Make sure your current password is correct.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
      if (confirmed) {
        try {
          // Delete profile picture from storage
          if (user.photoURL && !user.photoURL.includes('default-profile-picture.png')) {
            const pictureRef = ref(storage, `profile_pictures/${user.uid}`);
            await deleteObject(pictureRef);
          }
          // Delete user document from Firestore
          await deleteDoc(doc(db, 'users', user.uid));
          // Delete user account from Authentication
          await deleteUser(user);
          navigate('/');
        } catch (error) {
          setError('Failed to delete account. You may need to re-authenticate.');
          console.error(error);
        }
      }
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const user = auth.currentUser;
    if (user) {
      try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, newEmail);
        await updateDoc(doc(db, 'users', user.uid), { email: newEmail });
        setSuccess('Email updated successfully');
        window.location.reload();
      } catch (error) {
        setError('Failed to update email. Make sure your current password is correct.');
      }
    }
  };

  const handlePhoneNumberChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { phoneNumber: phoneNumber });
        setSuccess('Phone number updated successfully');
      } catch (error) {
        setError('Failed to update phone number');
      }
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleEmailChange}>
        <h3>Change Email</h3>
        <input
          type="email"
          placeholder="New Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <button type="submit">Update Email</button>
      </form>

      <form onSubmit={handlePasswordChange}>
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <PasswordStrengthBar password={newPassword} />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
      <form onSubmit={handlePhoneNumberChange}>
        <h3>Change Phone Number</h3>
        <input
          type="tel"
          placeholder="New Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <button type="submit">Update Phone Number</button>
      </form>
      <div className="mfa-section">
        <h3>Two-Factor Authentication</h3>
        <Link to="/mfa-enrollment" className="mfa-enroll-btn">Enroll in 2FA</Link>
      </div>

      <div className="delete-account-section">
        <h3>Delete Account</h3>
        <button onClick={handleDeleteAccount} className="delete-account-btn">Delete My Account</button>
      </div>
    </div>
  );
}

export default Settings;