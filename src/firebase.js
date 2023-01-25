// Import the functions you need from the SDKs you need
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAoWkEQFo8B-5hXZAFHjs4tV5roYAoaVHc',
  authDomain: 'vic3calc.firebaseapp.com',
  projectId: 'vic3calc',
  storageBucket: 'vic3calc.appspot.com',
  messagingSenderId: '803804122115',
  appId: '1:803804122115:web:5fe7c6596aec9a25731236',
  measurementId: 'G-YZ416LBZ9D',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
