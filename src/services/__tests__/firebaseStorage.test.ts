import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../firebaseClient', () => ({
  storage: {},
}));

vi.mock('firebase/storage', () => {
  const ref = vi.fn((storage, path) => ({ storage, fullPath: path, name: path.split('/').pop() || 'file' }));
  const listAll = vi.fn();
  const uploadBytesResumable = vi.fn();
  const getDownloadURL = vi.fn();
  const getMetadata = vi.fn();
  const deleteObject = vi.fn();

  return {
    ref,
    listAll,
    uploadBytesResumable,
    getDownloadURL,
    getMetadata,
    deleteObject,
  };
});

import {
  deleteUserFile,
  getUserFileDownloadUrl,
  listUserFiles,
  uploadUserFile,
} from '../../services/firebaseStorage';
import { getDownloadURL, getMetadata, listAll, ref, uploadBytesResumable } from 'firebase/storage';

describe('firebaseStorage service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid user ids', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    expect(() => uploadUserFile('', file)).toThrow('A valid authenticated user id is required.');
    await expect(getUserFileDownloadUrl('', 'file.pdf')).rejects.toThrow('A valid authenticated user id is required.');
    await expect(deleteUserFile('', 'file.pdf')).rejects.toThrow('A valid authenticated user id is required.');
    await expect(listUserFiles('', '')).rejects.toThrow('A valid authenticated user id is required.');
  });

  it('rejects invalid file uploads', () => {
    expect(() => uploadUserFile('user-123', null as never)).toThrow('A valid file is required for upload.');
  });

  it('rejects invalid storage paths', async () => {
    await expect(getUserFileDownloadUrl('user-123', '')).rejects.toThrow('Invalid storage path.');
    await expect(deleteUserFile('user-123', '..')).rejects.toThrow('Invalid storage path.');
    await expect(listUserFiles('user-123', '..')).rejects.toThrow('Invalid storage folder.');
  });

  it('creates upload handles for valid files', async () => {
    const file = new File(['hello'], 'report.txt', { type: 'text/plain' });
    vi.mocked(uploadBytesResumable).mockResolvedValue({ ref: { fullPath: 'users/user-123/uploads/report.txt', name: 'report.txt' } } as never);
    vi.mocked(getDownloadURL).mockResolvedValue('https://example.test/report.txt');
    vi.mocked(getMetadata).mockResolvedValue(null as never);

    const handle = uploadUserFile('user-123', file, { folder: 'docs' });
    const record = await handle.completion;

    expect(ref).toHaveBeenCalled();
    expect(uploadBytesResumable).toHaveBeenCalled();
    expect(record.originalName).toBe('report.txt');
    expect(record.downloadUrl).toBe('https://example.test/report.txt');
  });

  it('lists files and maps metadata', async () => {
    vi.mocked(listAll).mockResolvedValue({
      items: [{ fullPath: 'users/user-123/uploads/report.txt', name: 'report.txt' }],
      prefixes: [],
    } as never);
    vi.mocked(getDownloadURL).mockResolvedValue('https://example.test/report.txt');
    vi.mocked(getMetadata).mockResolvedValue({
      fullPath: 'users/user-123/uploads/report.txt',
      name: 'report.txt',
      contentType: 'text/plain',
      size: 42,
      timeCreated: { toDate: () => new Date('2026-04-23T12:00:00Z') },
      updated: { toDate: () => new Date('2026-04-23T12:00:00Z') },
      customMetadata: { originalName: 'Original report.txt' },
    } as never);

    const files = await listUserFiles('user-123');

    expect(files).toHaveLength(1);
    expect(files[0].originalName).toBe('Original report.txt');
    expect(files[0].contentType).toBe('text/plain');
    expect(files[0].size).toBe(42);
  });
});
