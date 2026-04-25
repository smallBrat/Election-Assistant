/**
 * Shared utility functions for type conversions and calculations
 */
import type { SectionKey } from '../context/ProgressContext';
import { VALID_SECTION_KEYS } from '../constants/app';

/**
 * Converts a Firestore Timestamp object to ISO string format
 * @param value - The value to convert (should be a Firestore Timestamp with toDate method)
 * @returns ISO string or undefined if not a valid timestamp
 */
export function toIsoString(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  if ('toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return undefined;
}

/**
 * Normalizes and validates an array of section keys
 * @param value - The value to normalize
 * @returns Array of valid section keys
 */
export function normalizeCompletedSections(value: unknown): SectionKey[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is SectionKey => VALID_SECTION_KEYS.includes(item as SectionKey));
}

/**
 * Validates that a UID is a non-empty string
 * @param uid - The UID to validate
 * @throws {Error} If UID is invalid
 */
export function ensureValidUid(uid: string): void {
  if (!uid || typeof uid !== 'string') {
    throw new Error('A valid user id is required for Firestore operations.');
  }
}

/**
 * Calculates progress percentage based on completed and total sections
 * @param completedCount - Number of completed sections
 * @param totalCount - Total number of sections
 * @returns Percentage rounded to nearest integer
 */
export function calculateProgressPercentage(completedCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

/**
 * Normalizes a string value for use in Firestore fields
 * @param value - The string value to validate
 * @param defaultValue - Default value if validation fails
 * @returns Normalized string or default
 */
export function normalizeStringField(value: unknown, defaultValue: string | null = null): string | null {
  if (typeof value === 'string') {
    return value;
  }
  return defaultValue;
}

/**
 * Normalizes a number value for use in Firestore fields
 * @param value - The value to validate
 * @param defaultValue - Default value if validation fails
 * @returns Normalized number or default
 */
export function normalizeNumberField(value: unknown, defaultValue: number | null): number | null {
  if (typeof value === 'number') {
    return value;
  }
  return defaultValue;
}
