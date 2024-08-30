import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Components/Home/Home';
import Auth from './Auth';
import PrivateRoute from './PrivateRoute';
// import firebase from 'firebase/compat/app';
import './App.css';
import { GoogleAuthProvider } from 'firebase/auth';

function App({ auth, database }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = new GoogleAuthProvider();

  // useEffect(() => {
  //   console.log('App.js useEffect');
  // }, []);

  const handleSignInSuccess = (userObj) => {
    // console.log(userObj);
  };

  return (
    <div className="App">
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
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
