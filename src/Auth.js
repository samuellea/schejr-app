import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import TagsIcon from './Components/Icons/TagsIcon';

function Auth({ auth, provider, handleSignInSuccess, setLoading }) {
  const navigate = useNavigate();
  provider.addScope('https://www.googleapis.com/auth/calendar');
  // provider.addScope('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');

  const handleLogin = () => {
    setLoading(true);
    // signInWithRedirect(auth, provider);
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        localStorage.setItem('displayName', user.displayName);
        localStorage.setItem('email', user.email);
        localStorage.setItem('firebaseID', user.uid);
        localStorage.setItem('expires', user.stsTokenManager.expirationTime);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        localStorage.setItem('googleAccessToken', accessToken);
        // localStorage.setItem('accessToken', user.accessToken); // think this is firebase access token
        navigate('/');
        // redirect logic
        handleSignInSuccess(user);
      })
      .catch((error) => {
        // Handle Errors here.
        setLoading(false);

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
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <h1 className={styles.title}>Schejr.</h1>
          <h1 className={styles.shadow}>Schejr.</h1>
        </div>
        <div className={styles.emojiContainer}>
          <span className={styles.emoji}>📝</span>
        </div>
      </div>

      <span className={styles.description}>
        A Notion-like web app for making lists and scheduling.
      </span>
      <button className={styles.logonButton} onClick={handleLogin}>
        Login with Google
      </button>
      <div className={styles.bottomGap} />
      <div className={styles.copyright}>
        2024 Sam Lea |{' '}
        <a
          href="https://www.github.com/samuellea"
          target="_blank"
          rel="noreferrer"
        >
          Github
        </a>
      </div>
    </div>
  );
}

export default Auth;
