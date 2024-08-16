import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase.config';
import { sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './EmailVerification.css';

function EmailVerification() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.emailVerified) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const resendVerificationEmail = async () => {
    const user = auth.currentUser;
    setError('');
    setMessage('');

    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        setMessage('Verification email sent. Please check your inbox.');
      } catch (error) {
        setError('Error sending verification email. Please try again later.');
      }
    }
  };

  return (
    <div className="email-verification-container">
      <h2>Email Verification</h2>
      <p>Please check your email and click on the verification link to verify your account.</p>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      <button onClick={resendVerificationEmail}>Resend Verification Email</button>
    </div>
  );
}

export default EmailVerification;