import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const mockUnsubscribe = jest.fn();
jest.mock('../firebase/config', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb({ email: 'test@test.com', isAnonymous: false });
    return mockUnsubscribe;
  })
}));

function TestComponent() {
  const { currentUser } = useAuth();
  return <div>{currentUser ? 'Logged in' : 'Logged out'}</div>;
}

test('AuthProvider provides auth context', async () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  expect(await screen.findByText(/Logged in/i)).toBeInTheDocument();
});
