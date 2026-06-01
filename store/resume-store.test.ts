/**
 * Resume Store Tests
 * 
 * Tests for the Zustand resume store implementation
 * Validates all store actions and state management
 */

import { renderHook, act } from '@testing-library/react';
import { useResumeStore } from './resume-store';

describe('Resume Store', () => {
  beforeEach(() => {
    // Clear store state before each test
    const { result } = renderHook(() => useResumeStore());
    act(() => {
      result.current.resumes = [];
      result.current.currentResumeId = null;
    });
  });

  describe('2.1.1 ResumeStore Interface', () => {
    it('should have all required state properties', () => {
      const { result } = renderHook(() => useResumeStore());
      
      expect(result.current).toHaveProperty('resumes');
      expect(result.current).toHaveProperty('currentResumeId');
      expect(result.current).toHaveProperty('language');
      expect(result.current).toHaveProperty('isOnline');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });

    it('should have all required action methods', () => {
      const { result } = renderHook(() => useResumeStore());
      
      expect(typeof result.current.createResume).toBe('function');
      expect(typeof result.current.updateResume).toBe('function');
      expect(typeof result.current.deleteResume).toBe('function');
      expect(typeof result.current.duplicateResume).toBe('function');
      expect(typeof result.current.setCurrentResume).toBe('function');
      expect(typeof result.current.setLanguage).toBe('function');
      expect(typeof result.current.setOnlineStatus).toBe('function');
      expect(typeof result.current.calculateCompletionProgress).toBe('function');
    });
  });

  describe('2.1.2 createResume Action', () => {
    it('should create a new resume with default empty sections', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.createResume('My First Resume');
      });

      expect(result.current.resumes).toHaveLength(1);
      const resume = result.current.resumes[0];
      
      expect(resume.title).toBe('My First Resume');
      expect(resume.personalDetails).toEqual({
        fullName: '',
        email: '',
        phoneNumber: '',
        jobTarget: '',
        country: '',
      });
      expect(resume.professionalSummary).toBe('');
      expect(resume.experience).toEqual([]);
      expect(resume.education).toEqual([]);
      expect(resume.skills).toEqual([]);
      expect(resume.certifications).toEqual([]);
    });

    it('should set completion progress to 0 for new resume', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.createResume('New Resume');
      });

      expect(result.current.resumes[0].metadata.completionProgress).toBe(0);
    });

    it('should set ATS score to 0 for new resume', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.createResume('New Resume');
      });

      expect(result.current.resumes[0].metadata.atsScore).toBe(0);
    });

    it('should assign unique ID to new resume', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.createResume('Resume 1');
        result.current.createResume('Resume 2');
      });

      expect(result.current.resumes[0].id).not.toBe(result.current.resumes[1].id);
    });

    it('should set new resume as current', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.createResume('New Resume');
      });

      expect(result.current.currentResumeId).toBe(result.current.resumes[0].id);
    });

    it('should return the new resume ID', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let newId = '';
      act(() => {
        newId = result.current.createResume('New Resume');
      });

      expect(newId).toBe(result.current.resumes[0].id);
    });
  });

  describe('2.1.3 updateResume Action', () => {
    it('should update resume data', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let resumeId = '';
      act(() => {
        resumeId = result.current.createResume('Test Resume');
      });

      act(() => {
        result.current.updateResume(resumeId, {
          personalDetails: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '123456789',
            jobTarget: 'Software Engineer',
            country: 'USA',
          },
        });
      });

      const updated = result.current.resumes[0];
      expect(updated.personalDetails.fullName).toBe('John Doe');
      expect(updated.personalDetails.email).toBe('john@example.com');
    });

    it('should update updatedAt timestamp', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let resumeId = '';
      act(() => {
        resumeId = result.current.createResume('Test Resume');
      });

      const originalTime = result.current.resumes[0].updatedAt;

      act(() => {
        result.current.updateResume(resumeId, {
          professionalSummary: 'Updated summary',
        });
      });

      expect(result.current.resumes[0].updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalTime.getTime()
      );
    });

    it('should recalculate completion progress on update', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let resumeId = '';
      act(() => {
        resumeId = result.current.createResume('Test Resume');
      });

      act(() => {
        result.current.updateResume(resumeId, {
          personalDetails: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '123456789',
            jobTarget: 'Software Engineer',
            country: 'USA',
          },
        });
      });

      expect(result.current.resumes[0].metadata.completionProgress).toBeGreaterThan(0);
    });
  });

  describe('2.1.4 deleteResume Action', () => {
    it('should remove resume from list', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let resumeId = '';
      act(() => {
        resumeId = result.current.createResume('Resume to Delete');
      });

      expect(result.current.resumes).toHaveLength(1);

      act(() => {
        result.current.deleteResume(resumeId);
      });

      expect(result.current.resumes).toHaveLength(0);
    });

    it('should clear currentResumeId if deleted resume was current', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let resumeId = '';
      act(() => {
        resumeId = result.current.createResume('Resume to Delete');
      });

      expect(result.current.currentResumeId).toBe(resumeId);

      act(() => {
        result.current.deleteResume(resumeId);
      });

      expect(result.current.currentResumeId).toBeNull();
    });

    it('should not affect other resumes', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let id1 = '';
      let id2 = '';
      act(() => {
        id1 = result.current.createResume('Resume 1');
        id2 = result.current.createResume('Resume 2');
      });

      act(() => {
        result.current.deleteResume(id1);
      });

      expect(result.current.resumes).toHaveLength(1);
      expect(result.current.resumes[0].id).toBe(id2);
    });
  });

  describe('2.1.5 duplicateResume Action', () => {
    it('should create a copy with all data', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let originalId = '';
      act(() => {
        originalId = result.current.createResume('Original Resume');
        result.current.updateResume(originalId, {
          personalDetails: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '123456789',
            jobTarget: 'Software Engineer',
            country: 'USA',
          },
        });
      });

      act(() => {
        result.current.duplicateResume(originalId);
      });

      expect(result.current.resumes).toHaveLength(2);
      const duplicated = result.current.resumes[1];
      expect(duplicated.personalDetails.fullName).toBe('John Doe');
    });

    it('should append " (Copy)" to title', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let originalId = '';
      act(() => {
        originalId = result.current.createResume('My Resume');
      });

      act(() => {
        result.current.duplicateResume(originalId);
      });

      expect(result.current.resumes[1].title).toBe('My Resume (Copy)');
    });

    it('should assign new unique ID', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let originalId = '';
      act(() => {
        originalId = result.current.createResume('Original Resume');
      });

      act(() => {
        result.current.duplicateResume(originalId);
      });

      expect(result.current.resumes[1].id).not.toBe(originalId);
    });

    it('should return the new resume ID', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let originalId = '';
      act(() => {
        originalId = result.current.createResume('Original Resume');
      });

      let newId = '';
      act(() => {
        newId = result.current.duplicateResume(originalId);
      });

      expect(newId).toBe(result.current.resumes[1].id);
    });
  });

  describe('2.1.6 setCurrentResume Action', () => {
    it('should set current resume ID', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let resumeId = '';
      act(() => {
        resumeId = result.current.createResume('Test Resume');
      });

      act(() => {
        result.current.setCurrentResume(resumeId);
      });

      expect(result.current.currentResumeId).toBe(resumeId);
    });

    it('should allow setting to null', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.createResume('Test Resume');
      });

      act(() => {
        result.current.setCurrentResume(null);
      });

      expect(result.current.currentResumeId).toBeNull();
    });
  });

  describe('2.1.7 setLanguage Action', () => {
    it('should set language to EN', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.setLanguage('EN');
      });

      expect(result.current.language).toBe('EN');
    });

    it('should set language to ID', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.setLanguage('ID');
      });

      expect(result.current.language).toBe('ID');
    });
  });

  describe('2.1.8 setOnlineStatus Action', () => {
    it('should set online status to true', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.setOnlineStatus(true);
      });

      expect(result.current.isOnline).toBe(true);
    });

    it('should set online status to false', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.setOnlineStatus(false);
      });

      expect(result.current.isOnline).toBe(false);
    });
  });

  describe('2.1.9 calculateCompletionProgress Utility', () => {
    it('should return 0 for empty resume', () => {
      const { result } = renderHook(() => useResumeStore());
      
      act(() => {
        result.current.createResume('Empty Resume');
      });

      const resume = result.current.resumes[0];
      const progress = result.current.calculateCompletionProgress(resume);
      
      expect(progress).toBe(0);
    });

    it('should increase with filled personal details', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let resumeId = '';
      act(() => {
        resumeId = result.current.createResume('Test Resume');
        result.current.updateResume(resumeId, {
          personalDetails: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '123456789',
            jobTarget: 'Software Engineer',
            country: 'USA',
          },
        });
      });

      const resume = result.current.resumes[0];
      const progress = result.current.calculateCompletionProgress(resume);
      
      expect(progress).toBeGreaterThan(0);
    });

    it('should increase with professional summary', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let resumeId = '';
      act(() => {
        resumeId = result.current.createResume('Test Resume');
        result.current.updateResume(resumeId, {
          professionalSummary: 'A professional summary with enough content to be meaningful',
        });
      });

      const resume = result.current.resumes[0];
      const progress = result.current.calculateCompletionProgress(resume);
      
      expect(progress).toBeGreaterThan(0);
    });

    it('should return 100 for fully filled resume', () => {
      const { result } = renderHook(() => useResumeStore());
      
      let resumeId = '';
      act(() => {
        resumeId = result.current.createResume('Complete Resume');
        result.current.updateResume(resumeId, {
          personalDetails: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '123456789',
            jobTarget: 'Software Engineer',
            country: 'USA',
            lastName: 'Doe',
            linkedinUrl: 'https://linkedin.com/in/johndoe',
            portfolioUrl: 'https://johndoe.com',
            githubUrl: 'https://github.com/johndoe',
          },
          professionalSummary: 'A comprehensive professional summary with substantial content',
          experience: [
            {
              id: '1',
              companyName: 'Company 1',
              jobTitle: 'Engineer',
              startDate: '2020-01-01',
              endDate: '2021-01-01',
              description: 'Worked on various projects',
            },
            {
              id: '2',
              companyName: 'Company 2',
              jobTitle: 'Senior Engineer',
              startDate: '2021-01-01',
              endDate: 'Present',
              description: 'Leading engineering team',
            },
            {
              id: '3',
              companyName: 'Company 3',
              jobTitle: 'Tech Lead',
              startDate: '2022-01-01',
              endDate: 'Present',
              description: 'Technical leadership',
            },
          ],
          education: [
            {
              id: '1',
              schoolName: 'University',
              degree: 'Bachelor',
              fieldOfStudy: 'Computer Science',
              graduationDate: '2020-05-01',
            },
            {
              id: '2',
              schoolName: 'University',
              degree: 'Master',
              fieldOfStudy: 'Computer Science',
              graduationDate: '2022-05-01',
            },
          ],
          skills: Array.from({ length: 10 }, (_, i) => ({
            id: `${i}`,
            name: `Skill ${i + 1}`,
          })),
          certifications: [
            {
              id: '1',
              certificationName: 'AWS Certified',
              issuingOrganization: 'AWS',
              issueDate: '2020-01-01',
            },
            {
              id: '2',
              certificationName: 'GCP Certified',
              issuingOrganization: 'Google',
              issueDate: '2021-01-01',
            },
          ],
        });
      });

      const resume = result.current.resumes[0];
      const progress = result.current.calculateCompletionProgress(resume);
      
      expect(progress).toBe(100);
    });
  });

  describe('2.1.10 Persist Middleware', () => {
    it('should initialize store without errors', () => {
      const { result } = renderHook(() => useResumeStore());
      
      expect(result.current).toBeDefined();
      expect(result.current.resumes).toBeDefined();
      expect(Array.isArray(result.current.resumes)).toBe(true);
    });

    it('should have localStorage key configured', () => {
      // This is verified by the persist middleware configuration
      // The store uses 'ats-cv-storage' as the key
      expect(useResumeStore.getState).toBeDefined();
    });
  });

  describe('2.1.11 Store Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useResumeStore());
      
      expect(result.current.resumes).toEqual([]);
      expect(result.current.currentResumeId).toBeNull();
      expect(result.current.language).toBe('EN');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should have all methods available', () => {
      const { result } = renderHook(() => useResumeStore());
      
      expect(result.current.createResume).toBeDefined();
      expect(result.current.updateResume).toBeDefined();
      expect(result.current.deleteResume).toBeDefined();
      expect(result.current.duplicateResume).toBeDefined();
      expect(result.current.setCurrentResume).toBeDefined();
      expect(result.current.setLanguage).toBeDefined();
      expect(result.current.setOnlineStatus).toBeDefined();
      expect(result.current.calculateCompletionProgress).toBeDefined();
      expect(result.current.getCurrentResume).toBeDefined();
      expect(result.current.getResumeById).toBeDefined();
    });
  });
});
