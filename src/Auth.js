import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Auth({ auth, provider, handleSignInSuccess, setLoading }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    // signInWithRedirect(auth, provider);
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        localStorage.setItem('email', user.email);
        localStorage.setItem('firebaseID', user.uid);
        localStorage.setItem('expires', user.stsTokenManager.expirationTime);
        navigate('/');
        // redirect logic
        handleSignInSuccess(user);
      })
      .catch((error) => {
        // Handle Errors here.
        setLoading(false);
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  return (
    <div className="Auth">
      <h1>Auth</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
}

export default Auth;
