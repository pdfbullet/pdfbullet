// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyuWX133uQ8CAxs5IvNiN8Tf9Q09Zi1-E",
  authDomain: "pdfbullet-a766e.firebaseapp.com",
  projectId: "pdfbullet-a766e",
  storageBucket: "pdfbullet-a766e.appspot.com",
  messagingSenderId: "491932898021",
  appId: "1:491932898021:web:a7c1c9f5197e655c1f7a0c",
  measurementId: "G-PYLVB5NKSY"
};

// Initialize Firebase, preventing re-initialization
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { auth, db, storage, firebase };