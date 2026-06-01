/**
 * AI Client
 * 
 * This module provides client-side functions for calling AI API routes.
 * All functions handle API communication for AI features including:
 * - Summary generation and improvement
 * - Experience generation and improvement
 * - Education improvement
 * - Skill suggestions
 * - ATS score calculation
 * 
 * All API calls are made through Next.js API routes to keep the Gemini API key secure.
 */

import { Resume } from '@/types/resume';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Error class for AI client errors
 */
export class AIClientError extends Error {
  constructor(
    message: string,
    public code: string = 'AI_ERROR',
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIClientError';
  }
}

/**
 * Interface for API error responses
 */
interface APIErrorResponse {
  error: string;
  code?: string;
  retryable?: boolean;
}

/**
 * Interface for ATS score breakdown
 */
export interface ATSScoreBreakdown {
  score: number;
  components: {
    [key: string]: {
      score: number;
      feedback: string;
    };
  };
  topIssues: string[];
  quickWins: string[];
}

/**
 * Checks if a response is an error response
 */
function isErrorResponse(data: unknown): data is APIErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as APIErrorResponse).error === 'string'
  );
}

/**
 * Handles API errors and throws appropriate AIClientError
 */
function handleAPIError(error: unknown, defaultMessage: string): never {
  if (error instanceof Response) {
    throw new AIClientError(
      `API Error: ${error.statusText}`,
      `HTTP_${error.status}`,
      error.status >= 500 || error.status === 429
    );
  }

  if (error instanceof Error) {
    throw new AIClientError(error.message, 'NETWORK_ERROR', true);
  }

  throw new AIClientError(defaultMessage, 'UNKNOWN_ERROR', false);
}

/**
 * Generates a professional summary using AI
 * 
 * Calls the /api/ai/generate-summary endpoint with job title and skills.
 * Returns a generated professional summary (50-100 words).
 * 
 * @param {string} jobTitle - The target job title
 * @param {string[]} skills - Array of key skills
 * @param {string} language - Language for generation ('EN' or 'ID')
 * @returns {Promise<string>} Generated professional summary
 * @throws {AIClientError} If API call fails
 * 
 * @example
 * const summary = await generateSummary('Software Engineer', ['React', 'Node.js'], 'EN');
 * console.log(summary); // "Experienced Software Engineer with 5+ years..."
 */
export async function generateSummary(
  jobTitle: string,
  skills: string[],
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.GENERATE_SUMMARY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobTitle,
        skills,
        language,
      }),
    });

    if (!response.ok) {
      handleAPIError(response, 'Failed to generate summary');
    }

    const data = await response.json();

    if (isErrorResponse(data)) {
      throw new AIClientError(
        data.error,
        data.code || 'GENERATE_SUMMARY_ERROR',
        data.retryable ?? false
      );
    }

    if (!data.summary || typeof data.summary !== 'string') {
      throw new AIClientError(
        'Invalid response format: missing summary',
        'INVALID_RESPONSE'
      );
    }

    return data.summary;
  } catch (error) {
    if (error instanceof AIClientError) {
      throw error;
    }
    handleAPIError(error, 'Failed to generate summary');
  }
}

/**
 * Improves an existing professional summary using AI
 * 
 * Calls the /api/ai/improve-summary endpoint with an existing summary.
 * Returns an improved version that is more compelling and ATS-friendly.
 * 
 * @param {string} summary - The existing professional summary to improve
 * @param {string} language - Language for improvement ('EN' or 'ID')
 * @returns {Promise<string>} Improved professional summary
 * @throws {AIClientError} If API call fails
 * 
 * @example
 * const improved = await improveSummary('I am a software engineer', 'EN');
 * console.log(improved); // "Experienced Software Engineer with expertise in..."
 */
export async function improveSummary(
  summary: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.IMPROVE_SUMMARY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        language,
      }),
    });

    if (!response.ok) {
      handleAPIError(response, 'Failed to improve summary');
    }

    const data = await response.json();

    if (isErrorResponse(data)) {
      throw new AIClientError(
        data.error,
        data.code || 'IMPROVE_SUMMARY_ERROR',
        data.retryable ?? false
      );
    }

    if (!data.improvedSummary || typeof data.improvedSummary !== 'string') {
      throw new AIClientError(
        'Invalid response format: missing improvedSummary',
        'INVALID_RESPONSE'
      );
    }

    return data.improvedSummary;
  } catch (error) {
    if (error instanceof AIClientError) {
      throw error;
    }
    handleAPIError(error, 'Failed to improve summary');
  }
}

/**
 * Generates professional experience bullet points using AI
 * 
 * Calls the /api/ai/generate-experience endpoint with job context.
 * Returns 3-5 professional bullet points that are action-oriented and impactful.
 * 
 * @param {string} jobContext - Context about the job (company, role, responsibilities)
 * @param {string} language - Language for generation ('EN' or 'ID')
 * @returns {Promise<string>} Generated experience bullet points
 * @throws {AIClientError} If API call fails
 * 
 * @example
 * const experience = await generateExperience(
 *   'Senior Developer at TechCorp, led team of 5, built microservices',
 *   'EN'
 * );
 * console.log(experience); // "• Led team of 5 developers...\n• Architected microservices..."
 */
export async function generateExperience(
  jobContext: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.GENERATE_EXPERIENCE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobContext,
        language,
      }),
    });

    if (!response.ok) {
      handleAPIError(response, 'Failed to generate experience');
    }

    const data = await response.json();

    if (isErrorResponse(data)) {
      throw new AIClientError(
        data.error,
        data.code || 'GENERATE_EXPERIENCE_ERROR',
        data.retryable ?? false
      );
    }

    if (!data.bulletPoints || typeof data.bulletPoints !== 'string') {
      throw new AIClientError(
        'Invalid response format: missing bulletPoints',
        'INVALID_RESPONSE'
      );
    }

    return data.bulletPoints;
  } catch (error) {
    if (error instanceof AIClientError) {
      throw error;
    }
    handleAPIError(error, 'Failed to generate experience');
  }
}

/**
 * Improves existing experience descriptions using AI
 * 
 * Calls the /api/ai/improve-experience endpoint with existing experience text.
 * Returns improved bullet points that are more impactful and ATS-friendly.
 * 
 * @param {string} description - The existing experience description to improve
 * @param {string} language - Language for improvement ('EN' or 'ID')
 * @returns {Promise<string>} Improved experience description
 * @throws {AIClientError} If API call fails
 * 
 * @example
 * const improved = await improveExperience(
 *   'Worked on projects and fixed bugs',
 *   'EN'
 * );
 * console.log(improved); // "• Delivered 15+ projects on schedule...\n• Resolved 200+ bugs..."
 */
export async function improveExperience(
  description: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.IMPROVE_EXPERIENCE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        language,
      }),
    });

    if (!response.ok) {
      handleAPIError(response, 'Failed to improve experience');
    }

    const data = await response.json();

    if (isErrorResponse(data)) {
      throw new AIClientError(
        data.error,
        data.code || 'IMPROVE_EXPERIENCE_ERROR',
        data.retryable ?? false
      );
    }

    if (!data.improvedDescription || typeof data.improvedDescription !== 'string') {
      throw new AIClientError(
        'Invalid response format: missing improvedDescription',
        'INVALID_RESPONSE'
      );
    }

    return data.improvedDescription;
  } catch (error) {
    if (error instanceof AIClientError) {
      throw error;
    }
    handleAPIError(error, 'Failed to improve experience');
  }
}

/**
 * Improves existing education descriptions using AI
 * 
 * Calls the /api/ai/improve-education endpoint with existing education text.
 * Returns improved description that is more professional and impactful.
 * 
 * @param {string} description - The existing education description to improve
 * @param {string} language - Language for improvement ('EN' or 'ID')
 * @returns {Promise<string>} Improved education description
 * @throws {AIClientError} If API call fails
 * 
 * @example
 * const improved = await improveEducation(
 *   'Studied computer science',
 *   'EN'
 * );
 * console.log(improved); // "Bachelor of Science in Computer Science with focus on..."
 */
export async function improveEducation(
  description: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.IMPROVE_EDUCATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        language,
      }),
    });

    if (!response.ok) {
      handleAPIError(response, 'Failed to improve education');
    }

    const data = await response.json();

    if (isErrorResponse(data)) {
      throw new AIClientError(
        data.error,
        data.code || 'IMPROVE_EDUCATION_ERROR',
        data.retryable ?? false
      );
    }

    if (!data.improvedDescription || typeof data.improvedDescription !== 'string') {
      throw new AIClientError(
        'Invalid response format: missing improvedDescription',
        'INVALID_RESPONSE'
      );
    }

    return data.improvedDescription;
  } catch (error) {
    if (error instanceof AIClientError) {
      throw error;
    }
    handleAPIError(error, 'Failed to improve education');
  }
}

/**
 * Suggests relevant skills for a target job using AI
 * 
 * Calls the /api/ai/suggest-skills endpoint with a job title.
 * Returns an array of 10 relevant skills for the specified job.
 * 
 * @param {string} jobTitle - The target job title
 * @param {string} language - Language for suggestions ('EN' or 'ID')
 * @returns {Promise<string[]>} Array of suggested skills
 * @throws {AIClientError} If API call fails
 * 
 * @example
 * const skills = await suggestSkills('Frontend Developer', 'EN');
 * console.log(skills); // ['React', 'TypeScript', 'CSS', 'JavaScript', ...]
 */
export async function suggestSkills(
  jobTitle: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string[]> {
  try {
    const response = await fetch(API_ENDPOINTS.SUGGEST_SKILLS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobTitle,
        language,
      }),
    });

    if (!response.ok) {
      handleAPIError(response, 'Failed to suggest skills');
    }

    const data = await response.json();

    if (isErrorResponse(data)) {
      throw new AIClientError(
        data.error,
        data.code || 'SUGGEST_SKILLS_ERROR',
        data.retryable ?? false
      );
    }

    if (!Array.isArray(data.skills)) {
      throw new AIClientError(
        'Invalid response format: expected skills array',
        'INVALID_RESPONSE'
      );
    }

    return data.skills;
  } catch (error) {
    if (error instanceof AIClientError) {
      throw error;
    }
    handleAPIError(error, 'Failed to suggest skills');
  }
}

/**
 * Calculates ATS score for a resume using AI
 * 
 * Calls the /api/ai/calculate-ats-score endpoint with complete resume data.
 * Returns an ATS score (0-100) with detailed breakdown and recommendations.
 * 
 * @param {Resume} resume - The complete resume object to analyze
 * @param {string} language - Language for analysis ('EN' or 'ID')
 * @returns {Promise<ATSScoreBreakdown>} ATS score breakdown with components and feedback
 * @throws {AIClientError} If API call fails
 * 
 * @example
 * const breakdown = await calculateATSScore(resumeData, 'EN');
 * console.log(breakdown.score); // 85
 * console.log(breakdown.topIssues); // ['Missing keywords', 'Weak summary']
 * console.log(breakdown.quickWins); // ['Add more action verbs', 'Expand skills section']
 */
export async function calculateATSScore(
  resume: Resume,
  language: 'EN' | 'ID' = 'EN'
): Promise<ATSScoreBreakdown> {
  try {
    const response = await fetch(API_ENDPOINTS.CALCULATE_ATS_SCORE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume,
        language,
      }),
    });

    if (!response.ok) {
      handleAPIError(response, 'Failed to calculate ATS score');
    }

    const data = await response.json();

    if (isErrorResponse(data)) {
      throw new AIClientError(
        data.error,
        data.code || 'CALCULATE_ATS_SCORE_ERROR',
        data.retryable ?? false
      );
    }

    if (!data.score || typeof data.score !== 'number') {
      throw new AIClientError(
        'Invalid response format: missing score',
        'INVALID_RESPONSE'
      );
    }

    if (data.score < 0 || data.score > 100) {
      throw new AIClientError(
        'Invalid score: must be between 0 and 100',
        'INVALID_RESPONSE'
      );
    }

    return {
      score: data.score,
      components: data.components || {},
      topIssues: Array.isArray(data.topIssues) ? data.topIssues : [],
      quickWins: Array.isArray(data.quickWins) ? data.quickWins : [],
    };
  } catch (error) {
    if (error instanceof AIClientError) {
      throw error;
    }
    handleAPIError(error, 'Failed to calculate ATS score');
  }
}
