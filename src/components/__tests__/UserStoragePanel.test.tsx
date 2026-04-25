import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserStoragePanel } from '../UserStoragePanel';

vi.mock('../../context/AuthContext', () => ({
  useAuth: (() => {
    const mockAuthResult = {
      user: { uid: 'test-user-123', email: 'test@example.com' },
      loading: false,
      authError: null,
      isFirebaseEnabled: true,
      signInWithGoogle: vi.fn(),
      signOutUser: vi.fn(),
    };

    return () => mockAuthResult;
  })(),
}));

vi.mock('../../services/firebaseStorage', () => ({
  listUserFiles: vi.fn().mockResolvedValue([]),
  uploadUserFile: vi.fn(),
  deleteUserFile: vi.fn(),
}));

describe('UserStoragePanel', () => {
  it('renders the storage panel for signed-in users', () => {
    render(<UserStoragePanel />);

    expect(screen.getByText(/your file storage/i)).toBeInTheDocument();
    expect(screen.getByText(/no uploaded files yet/i)).toBeInTheDocument();
  });
});
