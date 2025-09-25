// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7SH4xr3K0zDAeNL5Ri5KX2KHsag7aKkI",
  authDomain: "pdfbullet-new.firebaseapp.com",
  projectId: "pdfbullet-new",
  storageBucket: "pdfbullet-new.appspot.com",
  messagingSenderId: "415789226795",
  appId: "1:415789226795:web:778d189b2aafed0b7b436e",
  measurementId: "G-D5553YDTM8"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { auth, db, storage, firebase };