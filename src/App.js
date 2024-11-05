import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Components/Home/Home';
import Auth from './Auth';
import PrivateRoute from './PrivateRoute';
// import firebase from 'firebase/compat/app';
import './App.css';
import { GoogleAuthProvider } from 'firebase/auth';
import styles from './Components/ListItemEditPane/ListItemEditPane.module.css';
import SyncIcon from './Components/Icons/SyncIcon';
import ToggleSwitch from './Components/ToggleSwitch/ToggleSwitch';

function App({ auth, database }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = new GoogleAuthProvider();

  // useEffect(() => {
  //
  // }, []);

  const handleSignInSuccess = (userObj) => {
    //
  };

  const setAppHeight = () => {
    const appElement = document.getElementById('app');
    const vh = window.innerHeight * 0.01; // Calculate 1vh in pixels
    appElement.style.setProperty('--app-height', `${vh * 100}px`); // Set a CSS variable
  };

  // Call on load and on resize
  useEffect(() => {
    setAppHeight(); // Set height on initial load
    window.addEventListener('resize', setAppHeight); // Update on resize

    return () => {
      window.removeEventListener('resize', setAppHeight); // Clean up listener on unmount
    };
  }, []);

  return (
    <div id="app" className="App">
      <Routes>
        <Route exact path="/" element={<PrivateRoute />}>
          <Route exact path="/" element={<Home />} />
        </Route>
        <Route
          exact
          path="/login"
          element={
            <Auth
              auth={auth}
              provider={provider}
              handleSignInSuccess={handleSignInSuccess}
              setLoading={setLoading}
              GoogleAuthProvider={GoogleAuthProvider}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
