import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../firebaseClient', () => ({
  auth: null,
  isFirebaseConfigured: false,
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn((callback) => {
    callback(null);
    return () => {};
  }),
  signInWithPopup: vi.fn().mockRejectedValue(new Error('Firebase not configured')),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

describe('AuthContext', () => {
  it('exports the provider and hook', async () => {
    const module = await import('../AuthContext');

    expect(module.AuthProvider).toBeDefined();
    expect(module.useAuth).toBeDefined();
  });

  it('can import the provider module without crashing', async () => {
    const { AuthProvider } = await import('../AuthContext');

    render(
      <AuthProvider>
        <div>child</div>
      </AuthProvider>
    );

    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
