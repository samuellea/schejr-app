import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import './index.css';
// import 'react-datepicker/dist/react-datepicker.css';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY,
  authDomain: 'schejr-app-434314.firebaseapp.com',
  databaseURL: process.env.REACT_APP_FIREBASE_URL,
  projectId: 'schejr-app-434314',
  storageBucket: 'schejr-app-434314.appspot.com',
  messagingSenderId: '391519884385',
  appId: '1:391519884385:web:9ebfd228595097a0708620',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <App auth={auth} database={database} />
  </BrowserRouter>
  // </React.StrictMode>
);

export { database };
