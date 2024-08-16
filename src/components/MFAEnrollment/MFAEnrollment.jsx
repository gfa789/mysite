import React, { useState } from 'react';
import { auth } from '../../firebase';
import { PhoneAuthProvider, PhoneMultiFactorGenerator, multiFactor, RecaptchaVerifier } from 'firebase/auth';
import './MFAEnrollment.css';

function MFAEnrollment() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
          // reCAPTCHA solved, allow sending SMS
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          setError('reCAPTCHA expired. Please solve it again.');
        }
      }, auth);

      const session = await multiFactor(auth.currentUser).getSession();
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
          phoneNumber: phoneNumber,
          session: session
        },
        recaptchaVerifier
      );
      setVerificationId(verificationId);
      setStep(2);
      setMessage('Verification code sent. Please check your phone.');
    } catch (error) {
      setError('Error sending verification code. Please try again.');
      console.error(error);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(auth.currentUser).enroll(multiFactorAssertion, 'Phone Number');
      setMessage('MFA enrolled successfully.');
    } catch (error) {
      setError('Error enrolling MFA. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="mfa-enrollment-container">
      <h2>Enroll in Multifactor Authentication</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
          <div id="recaptcha-container"></div>
          <button type="submit">Send Verification Code</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            required
          />
          <button type="submit">Verify Code</button>
        </form>
      )}
    </div>
  );
}

export default MFAEnrollment;