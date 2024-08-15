import React from 'react';
import { signInWithPopup, GoogleAuthProvider} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import "./SignIn.css"

function SignIn() {
    const navigate = useNavigate()
    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
          .then((result) => {
            // Handle successful sign-in
            console.log(result.user);
            navigate('/'); // Redirect to home page after successful sign-in
          })
          .catch((error) => {
            // Handle errors
            console.error(error);
          });
      };

  return (
    <div className='signin'>
      <button className='sign-in-btn' onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
}

export default SignIn;