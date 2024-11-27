import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import TagsIcon from './Components/Icons/TagsIcon';
import Privacy from './Privacy';

function Auth({ auth, provider, handleSignInSuccess, setLoading }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
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

  // (window.innerWidth < 768)

  const togglePrivacyPolicy = () => {
    setShowPrivacy((prev) => !prev);
  };

  const closePrivacy = () => {
    setShowPrivacy(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.videoWrapper}>
          <div
            style={{
              width: window.innerWidth < 768 ? '90vw' : '50vw',
              aspectRatio: '16/9',
              position: 'relative',
            }}
            className={styles.videoContainer}
          >
            <iframe
              style={{
                width: '100%',
                height: '100%',
                border: '0',
              }}
              src="https://www.youtube.com/embed/NjkhdHgicOc?si=H4gaEL6GrKZnPWk8?vq=hd1080p"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <h1 className={styles.title}>Schejr.</h1>
            <h1 className={styles.shadow}>Schejr.</h1>
          </div>
          <div className={styles.emojiContainer}>
            <span className={styles.emoji}>📝</span>
          </div>
        </div>

        <div className={styles.descriptionLoginButtonWrapper}>
          <span className={styles.description}>
            A Notion-like web app for making lists and scheduling.
          </span>
          <span className={styles.privacyDisclaimer}>
            To see how Schejr uses the data you provide and works with
            third-party services, <br />
            please see our{' '}
            <span
              onClick={togglePrivacyPolicy}
              className={styles.privacyPolicyLink}
            >
              Privacy Policy
            </span>{' '}
            before using.
          </span>
          <button className={styles.logonButton} onClick={handleLogin}>
            Login with Google
          </button>
        </div>

        {/* <div className={styles.bottomGap} /> */}
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
        {/* <span
          onClick={togglePrivacyPolicy}
          className={styles.privacyPolicyLink}
        >
          Privacy Policy
        </span> */}
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
