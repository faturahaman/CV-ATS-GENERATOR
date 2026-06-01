'use client';

/**
 * Resume Hooks
 * 
 * This file provides custom React hooks that wrap the Zustand store for resume operations.
 * These hooks provide a convenient interface for components to interact with resume data
 * and perform common operations like creating, updating, deleting, and listing resumes.
 * 
 * Hooks:
 * - useResume: Access and manipulate a single resume
 * - useResumeList: Access and manage the list of all resumes
 */

import { useCallback, useMemo } from 'react';
import { useResumeStore } from '@/store/resume-store';
import type { PersonalDetails, ExperienceEntry, EducationEntry, SkillEntry, CertificationEntry } from '@/types/resume';

/**
 * useResume Hook
 * 
 * Provides access to the currently selected resume and operations to modify it.
 * This hook is useful for components that are editing a specific resume.
 * 
 * Returns:
 * - resume: The currently selected resume object (or undefined if none selected)
 * - isLoading: Whether a resume operation is in progress
 * - error: Any error message from the last operation
 * - updatePersonalDetails: Update personal details section
 * - updateProfessionalSummary: Update professional summary
 * - addExperience: Add a new experience entry
 * - updateExperience: Update an existing experience entry
 * - deleteExperience: Delete an experience entry
 * - addEducation: Add a new education entry
 * - updateEducation: Update an existing education entry
 * - deleteEducation: Delete an education entry
 * - addSkill: Add a new skill
 * - updateSkill: Update an existing skill
 * - deleteSkill: Delete a skill
 * - addCertification: Add a new certification
 * - updateCertification: Update an existing certification
 * - deleteCertification: Delete a certification
 * - clearError: Clear the error message
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 * 
 * @example
 * const { resume, updatePersonalDetails, addExperience } = useResume();
 * 
 * // Update personal details
 * updatePersonalDetails({ fullName: 'John Doe', email: 'john@example.com' });
 * 
 * // Add experience
 * addExperience({
 *   companyName: 'Acme Corp',
 *   jobTitle: 'Software Engineer',
 *   startDate: '2020-01-01',
 *   endDate: '2021-12-31',
 *   description: 'Developed web applications'
 * });
 */
export function useResume() {
  const {
    currentResumeId,
    resumes,
    updateResume,
    setError,
    error,
    isLoading,
  } = useResumeStore();

  // Get the current resume
  const resume = useMemo(() => {
    if (!currentResumeId) return undefined;
    return resumes.find((r) => r.id === currentResumeId);
  }, [currentResumeId, resumes]);

  /**
   * Update personal details
   */
  const updatePersonalDetails = useCallback(
    (details: Partial<PersonalDetails>) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        updateResume(resume.id, {
          personalDetails: {
            ...resume.personalDetails,
            ...details,
          },
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update personal details'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Update professional summary
   */
  const updateProfessionalSummary = useCallback(
    (summary: string) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        updateResume(resume.id, {
          professionalSummary: summary,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update professional summary'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Add a new experience entry
   */
  const addExperience = useCallback(
    (entry: Omit<ExperienceEntry, 'id'>) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const newEntry: ExperienceEntry = {
          ...entry,
          id: crypto.randomUUID(),
        };

        updateResume(resume.id, {
          experience: [...resume.experience, newEntry],
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to add experience'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Update an existing experience entry
   */
  const updateExperience = useCallback(
    (id: string, entry: Partial<ExperienceEntry>) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const updated = resume.experience.map((exp) =>
          exp.id === id ? { ...exp, ...entry } : exp
        );

        updateResume(resume.id, {
          experience: updated,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update experience'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Delete an experience entry
   */
  const deleteExperience = useCallback(
    (id: string) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const updated = resume.experience.filter((exp) => exp.id !== id);

        updateResume(resume.id, {
          experience: updated,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete experience'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Add a new education entry
   */
  const addEducation = useCallback(
    (entry: Omit<EducationEntry, 'id'>) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const newEntry: EducationEntry = {
          ...entry,
          id: crypto.randomUUID(),
        };

        updateResume(resume.id, {
          education: [...resume.education, newEntry],
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to add education'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Update an existing education entry
   */
  const updateEducation = useCallback(
    (id: string, entry: Partial<EducationEntry>) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const updated = resume.education.map((edu) =>
          edu.id === id ? { ...edu, ...entry } : edu
        );

        updateResume(resume.id, {
          education: updated,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update education'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Delete an education entry
   */
  const deleteEducation = useCallback(
    (id: string) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const updated = resume.education.filter((edu) => edu.id !== id);

        updateResume(resume.id, {
          education: updated,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete education'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Add a new skill
   */
  const addSkill = useCallback(
    (entry: Omit<SkillEntry, 'id'>) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const newEntry: SkillEntry = {
          ...entry,
          id: crypto.randomUUID(),
        };

        updateResume(resume.id, {
          skills: [...resume.skills, newEntry],
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to add skill'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Update an existing skill
   */
  const updateSkill = useCallback(
    (id: string, entry: Partial<SkillEntry>) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const updated = resume.skills.map((skill) =>
          skill.id === id ? { ...skill, ...entry } : skill
        );

        updateResume(resume.id, {
          skills: updated,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update skill'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Delete a skill
   */
  const deleteSkill = useCallback(
    (id: string) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const updated = resume.skills.filter((skill) => skill.id !== id);

        updateResume(resume.id, {
          skills: updated,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete skill'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Add a new certification
   */
  const addCertification = useCallback(
    (entry: Omit<CertificationEntry, 'id'>) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const newEntry: CertificationEntry = {
          ...entry,
          id: crypto.randomUUID(),
        };

        updateResume(resume.id, {
          certifications: [...resume.certifications, newEntry],
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to add certification'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Update an existing certification
   */
  const updateCertification = useCallback(
    (id: string, entry: Partial<CertificationEntry>) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const updated = resume.certifications.map((cert) =>
          cert.id === id ? { ...cert, ...entry } : cert
        );

        updateResume(resume.id, {
          certifications: updated,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update certification'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Delete a certification
   */
  const deleteCertification = useCallback(
    (id: string) => {
      if (!resume) {
        setError('No resume selected');
        return;
      }

      try {
        const updated = resume.certifications.filter((cert) => cert.id !== id);

        updateResume(resume.id, {
          certifications: updated,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete certification'
        );
      }
    },
    [resume, updateResume, setError]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    resume,
    isLoading,
    error,
    updatePersonalDetails,
    updateProfessionalSummary,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    addSkill,
    updateSkill,
    deleteSkill,
    addCertification,
    updateCertification,
    deleteCertification,
    clearError,
  };
}

/**
 * useResumeList Hook
 * 
 * Provides access to the list of all resumes and operations to manage them.
 * This hook is useful for components that display a list of resumes or manage resume lifecycle.
 * 
 * Returns:
 * - resumes: Array of all resume objects
 * - isLoading: Whether a resume operation is in progress
 * - error: Any error message from the last operation
 * - createResume: Create a new resume
 * - deleteResume: Delete a resume
 * - duplicateResume: Duplicate an existing resume
 * - setCurrentResume: Set the currently selected resume
 * - currentResumeId: ID of the currently selected resume
 * - clearError: Clear the error message
 * 
 * Validates: Requirements 1.1, 3.1, 4.1, 5.1, 5.2, 5.3
 * 
 * @example
 * const { resumes, createResume, deleteResume, duplicateResume } = useResumeList();
 * 
 * // Create a new resume
 * const newResumeId = createResume('My CV');
 * 
 * // Delete a resume
 * deleteResume(resumeId);
 * 
 * // Duplicate a resume
 * const copiedResumeId = duplicateResume(resumeId);
 */
export function useResumeList() {
  const {
    resumes,
    currentResumeId,
    createResume,
    deleteResume,
    duplicateResume,
    setCurrentResume,
    setError,
    error,
    isLoading,
  } = useResumeStore();

  /**
   * Create a new resume
   */
  const handleCreateResume = useCallback(
    (title: string) => {
      try {
        const newResumeId = createResume(title);
        setError(null);
        return newResumeId;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create resume'
        );
        return '';
      }
    },
    [createResume, setError]
  );

  /**
   * Delete a resume
   */
  const handleDeleteResume = useCallback(
    (id: string) => {
      try {
        deleteResume(id);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete resume'
        );
      }
    },
    [deleteResume, setError]
  );

  /**
   * Duplicate a resume
   */
  const handleDuplicateResume = useCallback(
    (id: string) => {
      try {
        const newResumeId = duplicateResume(id);
        setError(null);
        return newResumeId;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to duplicate resume'
        );
        return '';
      }
    },
    [duplicateResume, setError]
  );

  /**
   * Set the current resume
   */
  const handleSetCurrentResume = useCallback(
    (id: string | null) => {
      try {
        setCurrentResume(id);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to set current resume'
        );
      }
    },
    [setCurrentResume, setError]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    resumes,
    currentResumeId,
    isLoading,
    error,
    createResume: handleCreateResume,
    deleteResume: handleDeleteResume,
    duplicateResume: handleDuplicateResume,
    setCurrentResume: handleSetCurrentResume,
    clearError,
  };
}

/**
 * Export all hooks
 */
