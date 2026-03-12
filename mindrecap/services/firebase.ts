import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB9TBo36wYtDUImFWq1QkJKxfVYKFiAdeM",
  authDomain: "mindrecap-59738.firebaseapp.com",
  projectId: "mindrecap-59738",
  storageBucket: "mindrecap-59738.firebasestorage.app",
  messagingSenderId: "84655929994",
  appId: "1:84655929994:web:658e34780c6f88e71bcb73"
};

// Initialize Firebase only if config is present
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
