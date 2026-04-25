import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytesResumable,
  type FullMetadata,
  type ListResult,
  type StorageReference,
  type UploadMetadata,
  type UploadTask,
} from 'firebase/storage';
import { storage } from '../firebaseClient';

export interface UserFileRecord {
  fullPath: string;
  name: string;
  downloadUrl: string;
  contentType: string | null;
  size: number;
  timeCreated: string | null;
  updated: string | null;
  uploadedAt: string;
  originalName: string;
}

export interface UploadUserFileOptions {
  folder?: string;
  metadata?: UploadMetadata;
}

export interface UserFileUploadHandle {
  task: UploadTask;
  fileRef: StorageReference;
  fullPath: string;
  uploadedAt: string;
  completion: Promise<UserFileRecord>;
}

function getStorageOrThrow() {
  if (!storage) {
    throw new Error('Firebase Storage is not available. Check that the core Firebase config is present.');
  }

  return storage;
}

function requireUid(uid: string): void {
  if (!uid || typeof uid !== 'string') {
    throw new Error('A valid authenticated user id is required.');
  }
}

function sanitizePathSegment(segment: string | undefined): string | null {
  if (!segment) {
    return null;
  }

  const cleaned = segment.trim().replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

function sanitizeFileName(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop() || 'upload';
  const cleaned = baseName.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return cleaned.length > 0 ? cleaned : 'upload';
}

function buildUploadPath(uid: string, fileName: string, folder?: string): string {
  const safeFolder = sanitizePathSegment(folder);
  const safeFileName = sanitizeFileName(fileName);
  const uniquePrefix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const folderPath = safeFolder ? `${safeFolder}/` : '';
  return `users/${uid}/uploads/${folderPath}${uniquePrefix}-${safeFileName}`;
}

function resolveUserPath(uid: string, pathOrName: string): string {
  const normalizedPath = pathOrName.trim().replace(/^\/+/, '');
  if (!normalizedPath || normalizedPath.includes('..')) {
    throw new Error('Invalid storage path.');
  }

  const userRoot = `users/${uid}/`;
  if (normalizedPath.startsWith(userRoot)) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith('uploads/')) {
    return `${userRoot}${normalizedPath}`;
  }

  if (normalizedPath === 'uploads') {
    return `${userRoot}uploads`;
  }

  return `${userRoot}uploads/${normalizedPath}`;
}

function resolveUploadsFolderPath(uid: string, folder = ''): string {
  const trimmedFolder = folder.trim().replace(/^\/+|\/+$/g, '');
  if (trimmedFolder.includes('..')) {
    throw new Error('Invalid storage folder.');
  }

  return trimmedFolder ? `users/${uid}/uploads/${trimmedFolder}` : `users/${uid}/uploads`;
}

function toIsoString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return null;
}

function mapMetadataToRecord(
  snapshot: Pick<FullMetadata, 'fullPath' | 'name' | 'contentType' | 'size' | 'timeCreated' | 'updated'>,
  downloadUrl: string,
  uploadedAt: string,
  originalName: string,
): UserFileRecord {
  return {
    fullPath: snapshot.fullPath,
    name: snapshot.name,
    downloadUrl,
    contentType: snapshot.contentType ?? null,
    size: snapshot.size,
    timeCreated: toIsoString(snapshot.timeCreated),
    updated: toIsoString(snapshot.updated),
    uploadedAt,
    originalName,
  };
}

async function toUserFileRecord(fileRef: StorageReference, uploadedAt: string, originalName: string): Promise<UserFileRecord> {
  const [downloadUrl, metadata] = await Promise.all([
    getDownloadURL(fileRef),
    getMetadata(fileRef).catch(() => null),
  ]);

  if (!metadata) {
    return {
      fullPath: fileRef.fullPath,
      name: fileRef.name,
      downloadUrl,
      contentType: null,
      size: 0,
      timeCreated: null,
      updated: null,
      uploadedAt,
      originalName,
    };
  }

  return mapMetadataToRecord(metadata, downloadUrl, uploadedAt, originalName);
}

export function uploadUserFile(uid: string, file: File, options: UploadUserFileOptions = {}): UserFileUploadHandle {
  const firebaseStorage = getStorageOrThrow();
  requireUid(uid);

  if (!(file instanceof File)) {
    throw new Error('A valid file is required for upload.');
  }

  const uploadedAt = new Date().toISOString();
  const fullPath = buildUploadPath(uid, file.name, options.folder);
  const fileRef = ref(firebaseStorage, fullPath);
  const uploadMetadata: UploadMetadata = {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      originalName: file.name,
      uploadedAt,
      userId: uid,
      ...(options.metadata?.customMetadata ?? {}),
    },
    ...(options.metadata ?? {}),
  };

  const task = uploadBytesResumable(fileRef, file, uploadMetadata);
  const completion: Promise<UserFileRecord> = Promise.resolve(task).then((snapshot) =>
    toUserFileRecord(snapshot.ref, uploadedAt, file.name),
  );

  return {
    task,
    fileRef,
    fullPath,
    uploadedAt,
    completion,
  };
}

export async function getUserFileDownloadUrl(uid: string, pathOrName: string): Promise<string> {
  const firebaseStorage = getStorageOrThrow();
  requireUid(uid);

  const fileRef = ref(firebaseStorage, resolveUserPath(uid, pathOrName));
  return getDownloadURL(fileRef);
}

export async function deleteUserFile(uid: string, pathOrName: string): Promise<void> {
  const firebaseStorage = getStorageOrThrow();
  requireUid(uid);

  const fileRef = ref(firebaseStorage, resolveUserPath(uid, pathOrName));
  await deleteObject(fileRef);
}

export async function listUserFiles(uid: string, folder = ''): Promise<UserFileRecord[]> {
  const firebaseStorage = getStorageOrThrow();
  requireUid(uid);

  const basePath = resolveUploadsFolderPath(uid, folder);
  const folderRef = ref(firebaseStorage, basePath);
  const listing: ListResult = await listAll(folderRef);

  return Promise.all(
    listing.items.map(async (item) => {
      const [downloadUrl, metadata] = await Promise.all([
        getDownloadURL(item),
        getMetadata(item).catch(() => null),
      ]);

      if (!metadata) {
        return {
          fullPath: item.fullPath,
          name: item.name,
          downloadUrl,
          contentType: null,
          size: 0,
          timeCreated: null,
          updated: null,
          uploadedAt: new Date().toISOString(),
          originalName: item.name,
        };
      }

      return mapMetadataToRecord(metadata, downloadUrl, toIsoString(metadata.timeCreated) ?? new Date().toISOString(), metadata.customMetadata?.originalName ?? item.name);
    }),
  );
}
