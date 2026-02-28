import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

const PERSISTENCE_DELAY_MS = 200;

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const persistenceTimeoutRef = useRef(null);

  const signInAnon = () => signInAnonymously(auth);
  
  const signup = (email, password) => 
    createUserWithEmailAndPassword(auth, email, password);
  
  const login = (email, password) => 
    signInWithEmailAndPassword(auth, email, password);
  
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (persistenceTimeoutRef.current) {
          clearTimeout(persistenceTimeoutRef.current);
          persistenceTimeoutRef.current = null;
        }
        setCurrentUser(user);
        setLoading(false);
        return;
      }
      // user is null: give Firebase a moment to restore from persistence
      // so we don't sign in anonymously before the real user is restored on refresh
      persistenceTimeoutRef.current = setTimeout(() => {
        persistenceTimeoutRef.current = null;
        if (auth.currentUser) {
          setCurrentUser(auth.currentUser);
        } else {
          signInAnon();
        }
        setLoading(false);
      }, PERSISTENCE_DELAY_MS);
    });

    return () => {
      unsubscribe();
      if (persistenceTimeoutRef.current) {
        clearTimeout(persistenceTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle,
    signInAnon,
    isAnonymous: currentUser?.isAnonymous
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}