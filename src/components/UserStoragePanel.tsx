import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Download, Loader2, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  deleteUserFile,
  listUserFiles,
  uploadUserFile,
  type UserFileRecord,
} from '../services/firebaseStorage';
import { MAX_VISIBLE_FILES } from '../constants/app';

interface StoragePanelState {
  files: UserFileRecord[];
  selectedFile: File | null;
  loadingFiles: boolean;
  uploading: boolean;
  uploadProgress: number;
  statusMessage: string | null;
  errorMessage: string | null;
}

const initialState: StoragePanelState = {
  files: [],
  selectedFile: null,
  loadingFiles: false,
  uploading: false,
  uploadProgress: 0,
  statusMessage: null,
  errorMessage: null,
};

export const UserStoragePanel: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<StoragePanelState>(initialState);
  const uploadInputId = 'firebase-storage-upload-input';

  const sortedFiles = useMemo(
    () => [...state.files].sort((left, right) => (right.timeCreated ?? right.uploadedAt).localeCompare(left.timeCreated ?? left.uploadedAt)),
    [state.files],
  );

  const loadFiles = useCallback(async () => {
    if (!user) {
      setState((prev) => ({ ...prev, files: [] }));
      return;
    }

    setState((prev) => ({ ...prev, loadingFiles: true, errorMessage: null }));

    try {
      const results = await listUserFiles(user.uid);
      setState((prev) => ({ ...prev, files: results, loadingFiles: false }));
    } catch (error) {
      console.error('Failed to load uploaded files', error);
      setState((prev) => ({ ...prev, loadingFiles: false, errorMessage: 'Unable to load uploaded files right now.' }));
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFiles();
  }, [user, loadFiles]);

  const handleUpload = useCallback(async () => {
    if (!user || !state.selectedFile) {
      return;
    }

    setState((prev) => ({ ...prev, uploading: true, uploadProgress: 0, statusMessage: null, errorMessage: null }));

    try {
      const handle = uploadUserFile(user.uid, state.selectedFile);
      handle.task.on('state_changed', (snapshot) => {
        const progress = snapshot.totalBytes > 0 ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) : 0;
        setState((prev) => ({ ...prev, uploadProgress: progress }));
      });

      await handle.completion;
      setState((prev) => ({ ...prev, statusMessage: `Uploaded ${state.selectedFile!.name}.`, selectedFile: null, uploading: false, uploadProgress: 0 }));
      await loadFiles();
    } catch (error) {
      console.error('File upload failed', error);
      setState((prev) => ({ ...prev, uploading: false, uploadProgress: 0, errorMessage: 'Upload failed. Please try again.' }));
    }
  }, [user, state.selectedFile, loadFiles]);

  const handleDelete = useCallback(async (file: UserFileRecord) => {
    if (!user) {
      return;
    }

    setState((prev) => ({ ...prev, statusMessage: null, errorMessage: null }));

    try {
      await deleteUserFile(user.uid, file.fullPath);
      setState((prev) => ({ ...prev, statusMessage: `Deleted ${file.name}.` }));
      await loadFiles();
    } catch (error) {
      console.error('File delete failed', error);
      setState((prev) => ({ ...prev, errorMessage: 'Delete failed. Please try again.' }));
    }
  }, [user, loadFiles]);

  const handleDownload = useCallback((file: UserFileRecord) => {
    window.open(file.downloadUrl, '_blank', 'noopener,noreferrer');
  }, []);

  if (!user) {
    return null;
  }

  return (
    <section className="panel storage-panel panel-hoverable" aria-label="Firebase Storage test panel">
      <div className="storage-panel__header">
        <div>
          <h3 className="storage-panel__title">Your file storage</h3>
          <p className="storage-panel__text">Upload a file to your private Storage path and verify download/delete access.</p>
        </div>
        <button className="btn btn-secondary storage-panel__refresh" type="button" onClick={() => void loadFiles()} disabled={state.loadingFiles || state.uploading}>
          {state.loadingFiles ? <Loader2 size={16} className="storage-panel__spinner" /> : null}
          Refresh
        </button>
      </div>

      <div className="storage-panel__upload-row">
        <label className="storage-panel__file-label" htmlFor={uploadInputId}>
          Choose a file
        </label>
        <input
          id={uploadInputId}
          type="file"
          onChange={(event) => setState((prev) => ({ ...prev, selectedFile: event.target.files?.[0] ?? null }))}
          disabled={state.uploading}
        />
        <button className="btn btn-accent" type="button" onClick={() => void handleUpload()} disabled={!state.selectedFile || state.uploading}>
          {state.uploading ? <Loader2 size={16} className="storage-panel__spinner" /> : <Upload size={16} />}
          {state.uploading ? 'Uploading...' : 'Upload file'}
        </button>
      </div>

      {state.selectedFile && <p className="storage-panel__text">Selected: {state.selectedFile.name}</p>}
      {state.uploading && <progress className="storage-panel__progress" value={state.uploadProgress} max={100} aria-label="Upload progress" />}
      {state.statusMessage && <p className="storage-panel__status">{state.statusMessage}</p>}
      {state.errorMessage && <p className="storage-panel__error">{state.errorMessage}</p>}

      <div className="storage-panel__list-header">
        <h4 className="storage-panel__subtitle">Recent files</h4>
        <span className="storage-panel__count">{sortedFiles.length} file{sortedFiles.length === 1 ? '' : 's'}</span>
      </div>

      {sortedFiles.length === 0 ? (
        <p className="storage-panel__text">No uploaded files yet.</p>
      ) : (
        <ul className="storage-panel__file-list">
          {sortedFiles.slice(0, MAX_VISIBLE_FILES).map((file) => (
            <li key={file.fullPath} className="storage-panel__file-item">
              <div className="storage-panel__file-meta">
                <strong className="storage-panel__file-name">{file.originalName}</strong>
                <span className="storage-panel__file-details">
                  {file.contentType || 'unknown type'} • {Math.max(1, Math.round(file.size / 1024))} KB
                </span>
              </div>
              <div className="storage-panel__actions">
                <button className="btn btn-secondary storage-panel__action" type="button" onClick={() => void handleDownload(file)}>
                  <Download size={16} />
                  Download
                </button>
                <button className="btn btn-secondary storage-panel__action" type="button" onClick={() => void handleDelete(file)}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
