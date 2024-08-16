import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase.config';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Profile.css';

function Profile() {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureURL, setProfilePictureURL] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || '');
          setProfilePictureURL(userDoc.data().photoURL || '/default-profile-picture.png');
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const user = auth.currentUser;
    if (user) {
      try {
        await updateProfile(user, { displayName: username });
        await updateDoc(doc(db, 'users', user.uid), { username: username });
        setSuccess('Username updated successfully');
      } catch (error) {
        setError('Failed to update username');
      }
    }
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (profilePicture) {
      const user = auth.currentUser;
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      try {
        const snapshot = await uploadBytes(storageRef, profilePicture);
        const downloadURL = await getDownloadURL(snapshot.ref);
        await updateProfile(user, { photoURL: downloadURL });
        await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });
        setProfilePictureURL(downloadURL);
        setSuccess('Profile picture updated successfully');
      } catch (error) {
        setError('Failed to upload profile picture');
      }
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <div className="profile-picture-section">
        <img src={profilePictureURL} alt="Profile" className="profile-picture" />
        <input type="file" onChange={handleProfilePictureChange} />
        <button onClick={handleProfilePictureUpload}>Upload Profile Picture</button>
      </div>
      <form onSubmit={handleUsernameChange}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Update Username</button>
      </form>
    </div>
  );
}

export default Profile;