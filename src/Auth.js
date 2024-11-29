import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import TagsIcon from './Components/Icons/TagsIcon';
import Privacy from './Privacy';

import logo from './Components/Icons/g-logo.png';

function Auth({ auth, provider, handleSignInSuccess, setLoading }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const navigate = useNavigate();
  // provider.addScope('https://www.googleapis.com/auth/calendar.events.owned');
  provider.addScope('https://www.googleapis.com/auth/calendar');

  // provider.addScope('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');

  useEffect(() => {
    const email = localStorage.getItem('email');
    const idToken = localStorage.getItem('firebaseID');
    const auth = email && idToken;
    console.log('auth = ', auth);
    if (auth) {
      navigate('/home');
    }
  }, []);

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
        navigate('/home');
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

  // (window.innerWidth < 768)

  const togglePrivacyPolicy = () => {
    setShowPrivacy((prev) => !prev);
  };

  const closePrivacy = () => {
    setShowPrivacy(false);
  };

  const handleNavigateLanding = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.logoContainer} onClick={handleNavigateLanding}>
          <div className={styles.logo}>
            <h1 className={styles.title}>Schejr.</h1>
            <h1 className={styles.shadow}>Schejr.</h1>
          </div>
          <div className={styles.emojiContainer}>
            <span className={styles.emoji}>📝</span>
          </div>
        </div>

        <div className={styles.descriptionLoginButtonWrapper}>
          <div className={styles.signInButtonWraper}>
            <button
              className={styles.gsiMaterialButton}
              style={{ width: '200px' }}
              onClick={handleLogin}
            >
              <div className={styles.gsiMaterialButtonState}></div>
              <div className={styles.gsiMaterialButtonContentWrapper}>
                <div className={styles.gsiMaterialButtonIcon}>
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className={styles.gsiMaterialButtonContents}>
                  Sign in with Google
                </span>
                <span style={{ display: 'none' }}>Sign in with Google</span>
              </div>
            </button>
            <span className={styles.signInDisclaimer}>
              By proceeding, you confirm that you have read and agree to the
              terms of our
              <span
                onClick={togglePrivacyPolicy}
                className={styles.privacyPolicyLink}
              >
                Privacy Policy
              </span>{' '}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        2024 Sam Lea |{' '}
        <a
          href="https://www.github.com/samuellea"
          target="_blank"
          rel="noreferrer"
        >
          Github
        </a>{' '}
        |{' '}
        <a
          href="https://schejr.netlify.app/privacy"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>{' '}
      </div>

      {showPrivacy ? (
        <div className={styles.privacyPolicy}>
          <Privacy closePrivacy={closePrivacy} />
        </div>
      ) : null}
    </div>
  );
}

export default Auth;
