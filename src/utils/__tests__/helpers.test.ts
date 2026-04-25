import { describe, expect, it } from 'vitest';
import {
  calculateProgressPercentage,
  ensureValidUid,
  normalizeCompletedSections,
  normalizeNumberField,
  normalizeStringField,
  toIsoString,
} from '../helpers';

describe('helpers', () => {
  it('converts timestamp-like values to ISO strings', () => {
    const result = toIsoString({
      toDate: () => new Date('2026-04-23T12:00:00Z'),
    });

    expect(result).toBe('2026-04-23T12:00:00.000Z');
  });

  it('returns undefined for plain string inputs', () => {
    expect(toIsoString('2026-04-23T12:00:00.000Z')).toBeUndefined();
  });

  it('returns undefined for non timestamp-like values', () => {
    expect(toIsoString(null)).toBeUndefined();
    expect(toIsoString(undefined)).toBeUndefined();
    expect(toIsoString(123)).toBeUndefined();
    expect(toIsoString({})).toBeUndefined();
  });

  it('filters completed sections to valid section keys', () => {
    expect(normalizeCompletedSections(['timeline', 'guide', 'invalid'])).toEqual(['timeline', 'guide']);
  });

  it('returns an empty array for non-array values', () => {
    expect(normalizeCompletedSections(null)).toEqual([]);
    expect(normalizeCompletedSections(undefined)).toEqual([]);
    expect(normalizeCompletedSections('not-an-array')).toEqual([]);
  });

  it('accepts the full valid section list', () => {
    expect(normalizeCompletedSections([
      'timeline',
      'guide',
      'registration',
      'documents',
      'checklist',
      'faq',
      'glossary',
      'chat',
      'quiz',
      'guided',
    ])).toHaveLength(10);
  });

  it('validates user ids', () => {
    expect(ensureValidUid('user-123')).toBeUndefined();
    expect(() => ensureValidUid('')).toThrow('A valid user id is required for Firestore operations.');
    expect(() => ensureValidUid(undefined as never)).toThrow('A valid user id is required for Firestore operations.');
  });

  it('calculates progress percentages', () => {
    expect(calculateProgressPercentage(0, 10)).toBe(0);
    expect(calculateProgressPercentage(1, 3)).toBe(33);
    expect(calculateProgressPercentage(2, 3)).toBe(67);
    expect(calculateProgressPercentage(5, 0)).toBe(0);
  });

  it('normalizes string fields using the default only for non-strings', () => {
    expect(normalizeStringField('hello', 'default')).toBe('hello');
    expect(normalizeStringField('', 'default')).toBe('');
    expect(normalizeStringField('   ', 'default')).toBe('   ');
    expect(normalizeStringField(123, 'default')).toBe('default');
  });

  it('normalizes numeric fields using the fallback only for non-numbers', () => {
    expect(normalizeNumberField(42, 0)).toBe(42);
    expect(normalizeNumberField(0, 10)).toBe(0);
    expect(normalizeNumberField('42', 10)).toBe(10);
    expect(normalizeNumberField(null, 10)).toBe(10);
    expect(normalizeNumberField(NaN, 10)).toBeNaN();
  });
});
