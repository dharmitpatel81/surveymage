import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCmW0GWt5rFinwZZDSHqp8gHgPWRCmRCO4",
  authDomain: "surveymage-0.firebaseapp.com",
  projectId: "surveymage-0",
  storageBucket: "surveymage-0.firebasestorage.app",
  messagingSenderId: "399560611213",
  appId: "1:399560611213:web:bb9f838f30448966e999c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;