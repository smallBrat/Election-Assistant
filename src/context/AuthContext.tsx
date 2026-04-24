import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  isFirebaseEnabled: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: false,
  authError: null,
  isFirebaseEnabled: false,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase auth state listener failed', error);
        setAuthError('Unable to initialize sign-in state.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      setAuthError('Firebase is not configured yet. Add VITE_FIREBASE_* variables to enable sign-in.');
      return;
    }

    setAuthError(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in failed', error);
      setAuthError('Sign-in failed. Please try again.');
    }
  };

  const signOutUser = async () => {
    if (!auth) {
      return;
    }

    setAuthError(null);

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out failed', error);
      setAuthError('Sign-out failed. Please try again.');
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      isFirebaseEnabled: isFirebaseConfigured,
      signInWithGoogle,
      signOutUser,
    }),
    [user, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);