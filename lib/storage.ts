/**
 * Local Storage Utilities
 * 
 * This module provides utility functions for managing Local Storage operations
 * including JSON serialization/deserialization and error handling.
 */

import { Resume } from '@/types/resume';

/**
 * Storage keys used in Local Storage
 */
const STORAGE_KEYS = {
  RESUMES: 'ats-cv-resumes',
  LANGUAGE_PREFERENCE: 'ats-cv-language-preference',
  CURRENT_RESUME_ID: 'ats-cv-current-resume-id',
} as const;

/**
 * Error class for storage-related errors
 */
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Loads resume data from Local Storage
 * 
 * Retrieves all stored resumes from Local Storage and deserializes them from JSON.
 * Handles errors gracefully and returns an empty array if no data is found.
 * 
 * @returns {Resume[]} Array of resume objects loaded from storage, or empty array if none exist
 * @throws {StorageError} If Local Storage is not available or data is corrupted
 * 
 * @example
 * const resumes = loadFromStorage();
 * console.log(resumes); // [{ id: '...', title: 'My CV', ... }, ...]
 */
export function loadFromStorage(): Resume[] {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('Local Storage is not available');
      return [];
    }

    const data = window.localStorage.getItem(STORAGE_KEYS.RESUMES);

    // Return empty array if no data exists
    if (!data) {
      return [];
    }

    // Parse JSON data
    const resumes = JSON.parse(data) as Resume[];

    // Validate that we got an array
    if (!Array.isArray(resumes)) {
      throw new StorageError('Invalid resume data format: expected array');
    }

    // Convert date strings back to Date objects
    const deserializedResumes = resumes.map((resume) => ({
      ...resume,
      createdAt: new Date(resume.createdAt),
      updatedAt: new Date(resume.updatedAt),
    }));

    return deserializedResumes;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new StorageError(
        `Failed to parse resume data from Local Storage: ${error.message}`
      );
    }

    throw new StorageError(
      `Failed to load resume data from Local Storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Saves resume data to Local Storage
 * 
 * Serializes resume data to JSON and stores it in Local Storage.
 * Handles JSON serialization of Date objects and error handling.
 * 
 * @param {Resume[]} resumes - Array of resume objects to save
 * @throws {StorageError} If Local Storage is not available or quota is exceeded
 * 
 * @example
 * const resumes = [{ id: '...', title: 'My CV', ... }];
 * saveToStorage(resumes);
 */
export function saveToStorage(resumes: Resume[]): void {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new StorageError('Local Storage is not available');
    }

    // Validate input
    if (!Array.isArray(resumes)) {
      throw new StorageError('Invalid input: expected array of resumes');
    }

    // Serialize to JSON (Date objects are automatically converted to ISO strings)
    const data = JSON.stringify(resumes);

    // Attempt to save to Local Storage
    window.localStorage.setItem(STORAGE_KEYS.RESUMES, data);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    // Handle quota exceeded error
    if (
      error instanceof Error &&
      (error.name === 'QuotaExceededError' ||
        error.message.includes('QuotaExceededError'))
    ) {
      throw new StorageError(
        'Local Storage quota exceeded. Please delete some resumes to free up space.'
      );
    }

    throw new StorageError(
      `Failed to save resume data to Local Storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Clears all resume data from Local Storage
 * 
 * Removes all stored resumes, language preference, and current resume ID from Local Storage.
 * This is a destructive operation and cannot be undone.
 * 
 * @throws {StorageError} If Local Storage is not available
 * 
 * @example
 * clearStorage(); // All resume data is deleted
 */
export function clearStorage(): void {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new StorageError('Local Storage is not available');
    }

    // Clear all storage keys
    window.localStorage.removeItem(STORAGE_KEYS.RESUMES);
    window.localStorage.removeItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
    window.localStorage.removeItem(STORAGE_KEYS.CURRENT_RESUME_ID);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to clear Local Storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Loads language preference from Local Storage
 * 
 * @returns {'EN' | 'ID' | null} The stored language preference, or null if not set
 */
export function loadLanguagePreference(): 'EN' | 'ID' | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const language = window.localStorage.getItem(
      STORAGE_KEYS.LANGUAGE_PREFERENCE
    );
    return (language as 'EN' | 'ID') || null;
  } catch {
    return null;
  }
}

/**
 * Saves language preference to Local Storage
 * 
 * @param {string} language - The language preference to save ('EN' or 'ID')
 */
export function saveLanguagePreference(language: 'EN' | 'ID'): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new StorageError('Local Storage is not available');
    }

    window.localStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, language);
  } catch (error) {
    throw new StorageError(
      `Failed to save language preference: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Loads current resume ID from Local Storage
 * 
 * @returns {string | null} The stored current resume ID, or null if not set
 */
export function loadCurrentResumeId(): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    return window.localStorage.getItem(STORAGE_KEYS.CURRENT_RESUME_ID);
  } catch {
    return null;
  }
}

/**
 * Saves current resume ID to Local Storage
 * 
 * @param {string} resumeId - The resume ID to save as current
 */
export function saveCurrentResumeId(resumeId: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new StorageError('Local Storage is not available');
    }

    window.localStorage.setItem(STORAGE_KEYS.CURRENT_RESUME_ID, resumeId);
  } catch (error) {
    throw new StorageError(
      `Failed to save current resume ID: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
