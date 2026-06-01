'use client';

/**
 * useAI Hook
 * 
 * Custom React hook for AI operations with error handling.
 * Provides methods for calling AI endpoints with proper error handling,
 * loading states, and retry logic.
 * 
 * Features:
 * - Generate professional summaries
 * - Improve existing summaries
 * - Generate experience descriptions
 * - Improve experience descriptions
 * - Improve education descriptions
 * - Suggest skills based on job title
 * - Calculate ATS score
 * - Comprehensive error handling
 * - Loading state management
 * - Retry logic for transient failures
 * 
 * Validates: Requirements 9, 10, 13, 14, 17, 20, 29, 30, 40
 */

import { useState, useCallback } from 'react';
import { useResumeStore } from '@/store/resume-store';
import { API_ENDPOINTS, AI_CONFIG } from '@/lib/constants';
import type { Resume } from '@/types/resume';

/**
 * AI Error class for distinguishing AI-specific errors
 */
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * Response types for different AI operations
 */
export interface GenerateSummaryResponse {
  summary: string;
}

export interface ImproveSummaryResponse {
  improvedSummary: string;
}

export interface GenerateExperienceResponse {
  bulletPoints: string[];
}

export interface ImproveExperienceResponse {
  improvedDescription: string;
}

export interface SuggestSkillsResponse {
  skills: string[];
}

export interface ATSScoreResponse {
  score: number;
  breakdown: {
    contactInfo: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    certifications: number;
    formatting: number;
  };
  topIssues: string[];
  quickWins: string[];
}

/**
 * useAI Hook
 * 
 * Provides AI operation methods with error handling and loading states
 */
export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, setError: setStoreError } = useResumeStore();

  /**
   * Helper function to make API calls with retry logic
   * 
   * Implements exponential backoff retry strategy for transient failures
   */
  const callAPI = useCallback(
    async <T,>(
      endpoint: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: Record<string, any>,
      maxRetries: number = AI_CONFIG.RETRY_ATTEMPTS
    ): Promise<T> => {
      // Check online status
      if (!isOnline) {
        const offlineError = new AIError(
          'You are offline. AI features are disabled.',
          'OFFLINE_MODE',
          false
        );
        setError(offlineError.message);
        setStoreError(offlineError.message);
        throw offlineError;
      }

      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          // Handle HTTP errors
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle specific error codes
            if (response.status === 401) {
              throw new AIError(
                'Invalid API key. Please check your configuration.',
                'INVALID_API_KEY',
                false
              );
            }

            if (response.status === 429) {
              throw new AIError(
                'AI quota exceeded. Please try again later.',
                'QUOTA_EXCEEDED',
                true
              );
            }

            if (response.status >= 500) {
              throw new AIError(
                'Server error. Please try again later.',
                'SERVER_ERROR',
                true
              );
            }

            throw new AIError(
              errorData.message || `API error: ${response.status}`,
              'API_ERROR',
              response.status >= 500
            );
          }

          // Parse response
          const data = await response.json();

          // Validate response structure
          if (!data) {
            throw new AIError(
              'Invalid API response: empty response',
              'INVALID_RESPONSE',
              true
            );
          }

          return data as T;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          // Check if error is retryable
          const isRetryable =
            err instanceof AIError
              ? err.retryable
              : err instanceof TypeError; // Network errors are retryable

          // Don't retry if not retryable or last attempt
          if (!isRetryable || attempt === maxRetries - 1) {
            break;
          }

          // Exponential backoff
          const delay = Math.pow(2, attempt) * AI_CONFIG.RETRY_DELAY;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // All retries exhausted
      if (lastError instanceof AIError) {
        setError(lastError.message);
        setStoreError(lastError.message);
        throw lastError;
      }

      const finalError = new AIError(
        lastError?.message || 'An error occurred. Please try again.',
        'UNKNOWN_ERROR',
        false
      );
      setError(finalError.message);
      setStoreError(finalError.message);
      throw finalError;
    },
    [isOnline, setStoreError]
  );

  /**
   * Generate a professional summary using AI
   * 
   * Validates: Requirement 9
   */
  const generateSummary = useCallback(
    async (jobTitle: string, skills: string[], language: 'EN' | 'ID' = 'EN') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await callAPI<GenerateSummaryResponse>(
          API_ENDPOINTS.GENERATE_SUMMARY,
          {
            jobTitle,
            skills,
            language,
          }
        );

        return response.summary;
      } finally {
        setIsLoading(false);
      }
    },
    [callAPI]
  );

  /**
   * Improve an existing professional summary using AI
   * 
   * Validates: Requirement 10
   */
  const improveSummary = useCallback(
    async (summary: string, language: 'EN' | 'ID' = 'EN') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await callAPI<ImproveSummaryResponse>(
          API_ENDPOINTS.IMPROVE_SUMMARY,
          {
            summary,
            language,
          }
        );

        return response.improvedSummary;
      } finally {
        setIsLoading(false);
      }
    },
    [callAPI]
  );

  /**
   * Generate experience descriptions using AI
   * 
   * Validates: Requirement 14
   */
  const generateExperience = useCallback(
    async (jobContext: string, language: 'EN' | 'ID' = 'EN') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await callAPI<GenerateExperienceResponse>(
          API_ENDPOINTS.GENERATE_EXPERIENCE,
          {
            jobContext,
            language,
          }
        );

        return response.bulletPoints;
      } finally {
        setIsLoading(false);
      }
    },
    [callAPI]
  );

  /**
   * Improve experience descriptions using AI
   * 
   * Validates: Requirement 13
   */
  const improveExperience = useCallback(
    async (description: string, language: 'EN' | 'ID' = 'EN') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await callAPI<ImproveExperienceResponse>(
          API_ENDPOINTS.IMPROVE_EXPERIENCE,
          {
            description,
            language,
          }
        );

        return response.improvedDescription;
      } finally {
        setIsLoading(false);
      }
    },
    [callAPI]
  );

  /**
   * Suggest skills based on job title using AI
   * 
   * Validates: Requirement 20
   */
  const suggestSkills = useCallback(
    async (jobTitle: string, language: 'EN' | 'ID' = 'EN') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await callAPI<SuggestSkillsResponse>(
          API_ENDPOINTS.SUGGEST_SKILLS,
          {
            jobTitle,
            language,
          }
        );

        return response.skills;
      } finally {
        setIsLoading(false);
      }
    },
    [callAPI]
  );

  /**
   * Calculate ATS score for a resume using AI
   * 
   * Validates: Requirements 29, 30
   */
  const calculateATSScore = useCallback(
    async (resume: Resume, language: 'EN' | 'ID' = 'EN') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await callAPI<ATSScoreResponse>(
          API_ENDPOINTS.CALCULATE_ATS_SCORE,
          {
            resume,
            language,
          }
        );

        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [callAPI]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,

    // Methods
    generateSummary,
    improveSummary,
    generateExperience,
    improveExperience,
    suggestSkills,
    calculateATSScore,
    clearError,
  };
}

export default useAI;
