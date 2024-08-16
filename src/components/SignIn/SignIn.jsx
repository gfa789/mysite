import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, PhoneAuthProvider, PhoneMultiFactorGenerator, multiFactor } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import './SignIn.css';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [mfaInProgress, setMfaInProgress] = useState(false);
  const [mfaInfo, setMfaInfo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/multi-factor-auth-required') {
        setMfaInProgress(true);
        setMfaInfo(multiFactor(error.user).getSession());
      } else {
        setError(error.message);
      }
    }
  };

  const handleMfaVerification = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
          phoneNumber: mfaInfo.hints[0].phoneNumber,
          session: mfaInfo.session
        }
      );
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      await mfaInfo.resolver.resolveSignIn(multiFactorAssertion);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  if (mfaInProgress) {
    return (
      <div className="signin-container">
        <h2>Two-Factor Authentication</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleMfaVerification}>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            required
          />
          <button type="submit">Verify</button>
        </form>
      </div>
    );
  }

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>
      <Link to="/password-reset" className="forgot-password-link">Forgot Password?</Link>
      <div className="divider">or</div>
      <button className="google-btn" onClick={signInWithGoogle}>Sign In with Google</button>
    </div>
  );
}

export default SignIn;