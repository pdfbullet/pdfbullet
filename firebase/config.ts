// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJIAxP7WoMK8AuSFz1QVKhxs1kcuu43Zw",
  authDomain: "i-love-pdfly.firebaseapp.com",
  projectId: "i-love-pdfly",
  storageBucket: "i-love-pdfly.appspot.com",
  messagingSenderId: "445098814659",
  appId: "1:445098814659:web:ea4d3d6fa9501d207f8676",
  measurementId: "G-6B54TL0D8K"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Initialize Analytics if supported
let analytics;
firebase.analytics.isSupported().then((supported) => {
    if (supported) {
        analytics = firebase.analytics();
    }
});

export { app, auth, db, storage, analytics };
