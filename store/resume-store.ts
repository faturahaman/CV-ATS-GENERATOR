'use client';

/**
 * Resume Store (Zustand)
 * 
 * This file implements the central state management for the ATS CV Generator application.
 * It uses Zustand with the persist middleware to automatically save/load state from localStorage.
 * 
 * Features:
 * - Resume CRUD operations (create, read, update, delete)
 * - Resume duplication with automatic title transformation
 * - Current resume tracking
 * - Language preference management
 * - Online/offline status tracking
 * - Completion progress calculation
 * - Automatic persistence to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as generateUUID } from 'uuid';
import type { Resume, PersonalDetails } from '@/types/resume';

/**
 * ResumeStore Interface
 * 
 * Defines all state and actions available in the store
 */
export interface ResumeStore {
  // State
  resumes: Resume[];
  currentResumeId: string | null;
  language: 'EN' | 'ID';
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;

  // Resume Management Actions
  createResume: (title: string) => string; // Returns the new resume ID
  updateResume: (id: string, data: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  duplicateResume: (id: string) => string; // Returns the new resume ID
  setCurrentResume: (id: string | null) => void;

  // UI State Actions
  setLanguage: (lang: 'EN' | 'ID') => void;
  setOnlineStatus: (online: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Utility Actions
  calculateCompletionProgress: (resume: Resume) => number;
  getCurrentResume: () => Resume | undefined;
  getResumeById: (id: string) => Resume | undefined;
}

/**
 * Helper function to calculate completion progress
 * 
 * Weights:
 * - Personal Details: 25%
 * - Professional Summary: 15%
 * - Experience: 25%
 * - Education: 15%
 * - Skills: 10%
 * - Certifications: 10%
 * 
 * Validates: Requirements 31, 32
 */
function calculateCompletionProgress(resume: Resume): number {
  const weights = {
    personalDetails: 0.25,
    professionalSummary: 0.15,
    experience: 0.25,
    education: 0.15,
    skills: 0.1,
    certifications: 0.1,
  };

  let score = 0;

  // Personal Details (25%)
  // Required fields: fullName, email, phoneNumber, jobTarget, country
  // Recommended fields: lastName, linkedinUrl, portfolioUrl, githubUrl
  const requiredFields = ['fullName', 'email', 'phoneNumber', 'jobTarget', 'country'];
  const recommendedFields = ['lastName', 'linkedinUrl', 'portfolioUrl', 'githubUrl'];

  const filledRequired = requiredFields.filter(
    (f) => resume.personalDetails[f as keyof PersonalDetails]
  ).length;
  const filledRecommended = recommendedFields.filter(
    (f) => resume.personalDetails[f as keyof PersonalDetails]
  ).length;

  const personalScore =
    (filledRequired / requiredFields.length) * 0.7 +
    (filledRecommended / recommendedFields.length) * 0.3;
  score += personalScore * weights.personalDetails;

  // Professional Summary (15%)
  const summaryScore =
    resume.professionalSummary.length > 0
      ? Math.min(resume.professionalSummary.length / 100, 1)
      : 0;
  score += summaryScore * weights.professionalSummary;

  // Experience (25%)
  const experienceScore = Math.min(resume.experience.length / 3, 1);
  score += experienceScore * weights.experience;

  // Education (15%)
  const educationScore = Math.min(resume.education.length / 2, 1);
  score += educationScore * weights.education;

  // Skills (10%)
  const skillsScore = Math.min(resume.skills.length / 10, 1);
  score += skillsScore * weights.skills;

  // Certifications (10%)
  const certScore = Math.min(resume.certifications.length / 2, 1);
  score += certScore * weights.certifications;

  return Math.round(score * 100);
}

/**
 * Create a new empty resume with default values
 * 
 * Validates: Requirements 1.2, 1.3, 1.4
 */
function createEmptyResume(title: string, language: 'EN' | 'ID'): Resume {
  return {
    id: generateUUID(),
    title,
    createdAt: new Date(),
    updatedAt: new Date(),
    personalDetails: {
      fullName: '',
      email: '',
      phoneNumber: '',
      jobTarget: '',
      country: '',
    },
    professionalSummary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    metadata: {
      completionProgress: 0,
      atsScore: 0,
      language,
    },
  };
}

/**
 * Zustand Store Implementation
 * 
 * Uses persist middleware to automatically save/load from localStorage
 * Storage key: 'ats-cv-storage'
 */
export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      resumes: [],
      currentResumeId: null,
      language: 'EN',
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isLoading: false,
      error: null,

      /**
       * Create a new resume
       * 
       * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
       */
      createResume: (title: string) => {
        const newResume = createEmptyResume(title, get().language);
        set((state) => ({
          resumes: [...state.resumes, newResume],
          currentResumeId: newResume.id,
        }));
        return newResume.id;
      },

      /**
       * Update an existing resume
       * 
       * Validates: Requirements 2.1, 2.2, 2.3, 2.4
       */
      updateResume: (id: string, data: Partial<Resume>) => {
        set((state) => ({
          resumes: state.resumes.map((resume) => {
            if (resume.id === id) {
              const updated = {
                ...resume,
                ...data,
                updatedAt: new Date(),
              };
              // Recalculate completion progress
              updated.metadata = {
                ...updated.metadata,
                completionProgress: calculateCompletionProgress(updated),
              };
              return updated;
            }
            return resume;
          }),
        }));
      },

      /**
       * Delete a resume
       * 
       * Validates: Requirements 3.1, 3.2, 3.3, 3.4
       */
      deleteResume: (id: string) => {
        set((state) => {
          const newResumes = state.resumes.filter((resume) => resume.id !== id);
          const newCurrentId =
            state.currentResumeId === id ? null : state.currentResumeId;
          return {
            resumes: newResumes,
            currentResumeId: newCurrentId,
          };
        });
      },

      /**
       * Duplicate a resume
       * 
       * Creates a copy with:
       * - New unique ID
       * - Title with " (Copy)" appended
       * - All data identical to original
       * 
       * Validates: Requirements 4.1, 4.2, 4.3
       */
      duplicateResume: (id: string) => {
        const original = get().getResumeById(id);
        if (!original) {
          set({ error: `Resume with ID ${id} not found` });
          return '';
        }

        // Deep copy preserving Date objects
        const deepCopy = (obj: Resume): Resume => {
          return {
            ...obj,
            createdAt: new Date(obj.createdAt),
            updatedAt: new Date(obj.updatedAt),
            personalDetails: { ...obj.personalDetails },
            experience: obj.experience.map((e) => ({ ...e })),
            education: obj.education.map((e) => ({ ...e })),
            skills: obj.skills.map((s) => ({ ...s })),
            certifications: obj.certifications.map((c) => ({ ...c })),
            metadata: { ...obj.metadata },
          };
        };

        const duplicated: Resume = {
          ...deepCopy(original),
          id: generateUUID(),
          title: `${original.title} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          resumes: [...state.resumes, duplicated],
          currentResumeId: duplicated.id,
        }));

        return duplicated.id;
      },

      /**
       * Set the current resume being edited
       * 
       * Validates: Requirements 5.3
       */
      setCurrentResume: (id: string | null) => {
        set({ currentResumeId: id });
      },

      /**
       * Set the language preference
       * 
       * Validates: Requirements 38 (language support)
       */
      setLanguage: (lang: 'EN' | 'ID') => {
        set({ language: lang });
      },

      /**
       * Set online/offline status
       * 
       * Validates: Requirements 38 (offline support)
       */
      setOnlineStatus: (online: boolean) => {
        set({ isOnline: online });
      },

      /**
       * Set loading state
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      /**
       * Set error message
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * Calculate completion progress for a resume
       * 
       * Validates: Requirements 31, 32
       */
      calculateCompletionProgress: (resume: Resume) => {
        return calculateCompletionProgress(resume);
      },

      /**
       * Get the currently selected resume
       */
      getCurrentResume: () => {
        const { currentResumeId, resumes } = get();
        if (!currentResumeId) return undefined;
        return resumes.find((r) => r.id === currentResumeId);
      },

      /**
       * Get a resume by ID
       */
      getResumeById: (id: string) => {
        return get().resumes.find((r) => r.id === id);
      },
    }),
    {
      name: 'ats-cv-storage', // localStorage key
      version: 1,
      // Only persist specific fields to avoid persisting transient state
      partialize: (state) => ({
        resumes: state.resumes,
        currentResumeId: state.currentResumeId,
        language: state.language,
      }),
      // Restore Date objects that JSON serialization converts to strings
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.resumes = state.resumes.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        }));
      },
    }
  )
);

/**
 * Export hook for use in components
 * 
 * Usage:
 * const { resumes, createResume, updateResume } = useResumeStore();
 */
export default useResumeStore;
