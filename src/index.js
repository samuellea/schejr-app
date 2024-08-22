import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import './index.css';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAwOlePXrC1j89pUbKq5KTvkmaj-jGG99U',
  authDomain: 'schejr-app.firebaseapp.com',
  databaseURL:
    'https://schejr-app-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'schejr-app',
  storageBucket: 'schejr-app.appspot.com',
  messagingSenderId: '674555454467',
  appId: '1:674555454467:web:c5d233390776d7b3b0da36',
  measurementId: 'G-90WFTJ1F2C',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App auth={auth} database={database} />
    </BrowserRouter>
  </React.StrictMode>
);
