import React, { useState, useEffect } from 'react';
import styles from './Privacy.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

function Privacy({ closePrivacy }) {
  return (
    <div
      className={styles.PrivacyPolicyContainer}
      style={{
        width: window.innerWidth < 768 ? '100%' : '50%',
      }}
    >
      <div className={styles.PrivacyPolicy}>
        <span>Privacy Policy</span>
        <p
          style={{
            textAlign: 'center',
            border: '1px solid white',
            margin: '25px 10px 20px 10px',
          }}
        >
          By using this web app, you confirm you have read and accept the terms
          of the privacy policy as stated below -
        </p>
        <h3>Use of Google account</h3>
        <p>
          By signing in to this app using your Google Account, you agree to
          grant the app temporary read and write access to your Google Calendar,
          for as long as you are logged in. This is necessary to allow the app
          to create events in your calendar when using the 'Sync with Google
          Calendar' functionality. <br />
          <br />
          It also allows for the deletion only of Google Calendar events created
          by Schejr - the app cannot delete, edit or otherwise change events or
          settings on your Google Calendar which not associated with Schejr. It
          *only* edits and deletes events created by the app itself. The 'Sync
          with Google Calendar' functionality can be turned off by the user at
          any time.
          <br />
          <br />
          Signing out of the app clears and removes all credentials supplied by
          Google for accessing Google Calendar data. You can also remove access
          by visting{' '}
          <a
            href="https://myaccount.google.com/permissions"
            style={{ color: 'white', fontWeight: 900 }}
            target="_blank"
            rel="noreferrer"
          >
            Account Settings
          </a>{' '}
          in your Google account (under 'Third-party apps with account access')
          <br />
          <br />
          Schejr's use and transfer of information received from Google APIs to
          any other app will adhere to{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            style={{ color: 'white', fontWeight: 900 }}
            target="_blank"
            rel="noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>

        <h3>Closing your app account</h3>
        <p>
          Should you wish to close your Schejr account and remove any stored
          data from the app, this can be done at any time. Once logged in, tap
          the{' '}
          <FontAwesomeIcon
            icon={faCog}
            pointerEvents="none"
            style={{
              margin: '0px 6px 0px 2px',
              color: 'white',
              fontSize: '14px',
            }}
          />
          icon at the top of the screen and then{' '}
          <span
            style={{
              fontWeight: 900,
              textDecoration: 'none',
              fontSize: '13px',
            }}
          >
            Delete My Account
          </span>{' '}
          to permanently delete both your user account and all related data
          stored in our database.
        </p>
        <button
          type="button"
          className={styles.logonButton}
          onClick={() => closePrivacy()}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Privacy;
