// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  authDomain: "musicmentor-d33b2.firebaseapp.com",
  projectId: "musicmentor-d33b2",
  storageBucket: "musicmentor-d33b2.firebasestorage.app",
  messagingSenderId: "292245656765",
  appId: "1:292245656765:web:67f60ca5bf1d14c3b313d4",
  measurementId: "G-J4PP3Q3Y4K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in production and browser environment
let analytics: any = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
    console.log('Firebase Analytics initialized');
  } catch (error) {
    console.warn('Firebase Analytics failed to initialize:', error);
  }
}

export { app, analytics };