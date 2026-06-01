/**
 * AI Client Tests
 * 
 * Unit tests for the AI client functions
 */

import {
  generateSummary,
  improveSummary,
  generateExperience,
  improveExperience,
  improveEducation,
  suggestSkills,
  calculateATSScore,
  AIClientError,
  ATSScoreBreakdown,
} from './ai-client';
import { Resume } from '@/types/resume';

// Mock fetch for testing
global.fetch = jest.fn();

describe('AI Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSummary', () => {
    it('should call the generate-summary endpoint with correct parameters', async () => {
      const mockResponse = {
        summary: 'Experienced Software Engineer with 5+ years of expertise...',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateSummary(
        'Software Engineer',
        ['React', 'Node.js'],
        'EN'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/generate-summary',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobTitle: 'Software Engineer',
            skills: ['React', 'Node.js'],
            language: 'EN',
          }),
        })
      );

      expect(result).toBe(mockResponse.summary);
    });

    it('should throw AIClientError on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        status: 500,
      });

      await expect(
        generateSummary('Software Engineer', ['React'], 'EN')
      ).rejects.toThrow(AIClientError);
    });

    it('should throw AIClientError on invalid response format', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      });

      await expect(
        generateSummary('Software Engineer', ['React'], 'EN')
      ).rejects.toThrow(AIClientError);
    });
  });

  describe('improveSummary', () => {
    it('should call the improve-summary endpoint with correct parameters', async () => {
      const mockResponse = {
        improvedSummary: 'Experienced Software Engineer with proven track record...',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await improveSummary('I am a software engineer', 'EN');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/improve-summary',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            summary: 'I am a software engineer',
            language: 'EN',
          }),
        })
      );

      expect(result).toBe(mockResponse.improvedSummary);
    });
  });

  describe('generateExperience', () => {
    it('should call the generate-experience endpoint with correct parameters', async () => {
      const mockResponse = {
        bulletPoints: '• Led team of 5 developers\n• Architected microservices',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateExperience(
        'Senior Developer at TechCorp',
        'EN'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/generate-experience',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            jobContext: 'Senior Developer at TechCorp',
            language: 'EN',
          }),
        })
      );

      expect(result).toBe(mockResponse.bulletPoints);
    });
  });

  describe('improveExperience', () => {
    it('should call the improve-experience endpoint with correct parameters', async () => {
      const mockResponse = {
        improvedDescription: '• Delivered 15+ projects on schedule',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await improveExperience('Worked on projects', 'EN');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/improve-experience',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            description: 'Worked on projects',
            language: 'EN',
          }),
        })
      );

      expect(result).toBe(mockResponse.improvedDescription);
    });
  });

  describe('improveEducation', () => {
    it('should call the improve-education endpoint with correct parameters', async () => {
      const mockResponse = {
        improvedDescription: 'Bachelor of Science in Computer Science',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await improveEducation('Studied computer science', 'EN');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/improve-education',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            description: 'Studied computer science',
            language: 'EN',
          }),
        })
      );

      expect(result).toBe(mockResponse.improvedDescription);
    });
  });

  describe('suggestSkills', () => {
    it('should call the suggest-skills endpoint and return array of skills', async () => {
      const mockResponse = {
        skills: ['React', 'TypeScript', 'Node.js', 'CSS', 'JavaScript'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await suggestSkills('Frontend Developer', 'EN');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/suggest-skills',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            jobTitle: 'Frontend Developer',
            language: 'EN',
          }),
        })
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockResponse.skills);
    });

    it('should throw AIClientError if skills is not an array', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skills: 'not an array' }),
      });

      await expect(suggestSkills('Frontend Developer', 'EN')).rejects.toThrow(
        AIClientError
      );
    });
  });

  describe('calculateATSScore', () => {
    it('should call the calculate-ats-score endpoint and return score breakdown', async () => {
      const mockResume: Resume = {
        id: 'test-id',
        title: 'Test Resume',
        createdAt: new Date(),
        updatedAt: new Date(),
        personalDetails: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '555-0123',
          jobTarget: 'Software Engineer',
          country: 'USA',
        },
        professionalSummary: 'Experienced engineer',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        metadata: {
          completionProgress: 50,
          atsScore: 0,
          language: 'EN',
        },
      };

      const mockResponse: ATSScoreBreakdown = {
        score: 85,
        components: {
          contactInfo: { score: 100, feedback: 'Complete' },
          summary: { score: 80, feedback: 'Good' },
        },
        topIssues: ['Missing keywords'],
        quickWins: ['Add more action verbs'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await calculateATSScore(mockResume, 'EN');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/calculate-ats-score',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            resume: mockResume,
            language: 'EN',
          }),
        })
      );

      expect(result.score).toBe(85);
      expect(result.topIssues).toEqual(['Missing keywords']);
      expect(result.quickWins).toEqual(['Add more action verbs']);
    });

    it('should throw AIClientError if score is out of range', async () => {
      const mockResume: Resume = {
        id: 'test-id',
        title: 'Test Resume',
        createdAt: new Date(),
        updatedAt: new Date(),
        personalDetails: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '555-0123',
          jobTarget: 'Software Engineer',
          country: 'USA',
        },
        professionalSummary: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        metadata: {
          completionProgress: 0,
          atsScore: 0,
          language: 'EN',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ score: 150 }),
      });

      await expect(calculateATSScore(mockResume, 'EN')).rejects.toThrow(
        AIClientError
      );
    });
  });

  describe('AIClientError', () => {
    it('should create error with correct properties', () => {
      const error = new AIClientError('Test error', 'TEST_CODE', true);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.retryable).toBe(true);
      expect(error.name).toBe('AIClientError');
    });
  });
});
