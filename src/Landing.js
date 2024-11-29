import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';
import TagsIcon from './Components/Icons/TagsIcon';
import Privacy from './Privacy';

import logo from './Components/Icons/g-logo.png';
function Landing({ auth, provider, handleSignInSuccess, setLoading }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const navigate = useNavigate();
  provider.addScope('https://www.googleapis.com/auth/calendar');

  const togglePrivacyPolicy = () => {
    setShowPrivacy((prev) => !prev);
  };

  const closePrivacy = () => {
    setShowPrivacy(false);
  };

  const handleStart = () => {
    const email = localStorage.getItem('email');
    const idToken = localStorage.getItem('firebaseID');
    const auth = email && idToken;
    if (auth) {
      navigate('/home');
    } else {
      navigate('/login');
    }
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
              src="https://www.youtube.com/embed/NjkhdHgicOc?autoplay=1&mute=1&vq=hd720"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
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
          {window.innerWidth > 768 ? (
            <span className={styles.privacyDisclaimer}>
              To see how Schejr uses the data you provide and works with
              third-party services,
              <br /> please see our{' '}
              <span
                onClick={togglePrivacyPolicy}
                className={styles.privacyPolicyLink}
              >
                Privacy Policy
              </span>{' '}
              before using.
            </span>
          ) : (
            <span className={styles.privacyDisclaimer}>
              To see how Schejr uses the data you <br />
              provide and works with third-party services, <br />
              please see our{' '}
              <span
                onClick={togglePrivacyPolicy}
                className={styles.privacyPolicyLink}
              >
                Privacy Policy
              </span>{' '}
              before using.
            </span>
          )}

          <button className={styles.startButton} onClick={handleStart}>
            Start
          </button>
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

export default Landing;
