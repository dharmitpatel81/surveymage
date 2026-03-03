import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCmW0GWt5rFinwZZDSHqp8gHgPWRCmRCO4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "surveymage-0.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "surveymage-0",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "surveymage-0.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "399560611213",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:399560611213:web:bb9f838f30448966e999c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;