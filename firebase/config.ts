// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD02G-p2zeQZLFRfX89Sm89vcSBOESyMs8",
  authDomain: "pdfbullet-1d791.firebaseapp.com",
  projectId: "pdfbullet-1d791",
  storageBucket: "pdfbullet-1d791.appspot.com",
  messagingSenderId: "196115080623",
  appId: "1:196115080623:web:62afd9a4b96f6a2897fb5a",
  measurementId: "G-YF3R88H1JV"
};

// Initialize Firebase, preventing re-initialization
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { auth, db, storage, firebase };