/**
 * AI Client
 *
 * Client-side functions for calling AI API routes.
 * All API calls go through Next.js API routes to keep the API key server-side.
 */

import { Resume } from '@/types/resume'
import { API_ENDPOINTS } from '@/lib/constants'

// ── Error class ───────────────────────────────────────────────────────────────

export class AIClientError extends Error {
  constructor(
    message: string,
    public code: string = 'AI_ERROR',
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'AIClientError'
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface APIErrorResponse {
  error: string
  code?: string
  retryable?: boolean
}

export interface ATSScoreBreakdown {
  score: number
  components: Record<string, { score: number; feedback: string }>
  topIssues: string[]
  quickWins: string[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isErrorResponse(data: unknown): data is APIErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as APIErrorResponse).error === 'string'
  )
}

function handleAPIError(error: unknown, defaultMessage: string): never {
  if (error instanceof Response) {
    throw new AIClientError(
      `API Error: ${error.statusText}`,
      `HTTP_${error.status}`,
      error.status >= 500 || error.status === 429
    )
  }
  if (error instanceof Error) {
    throw new AIClientError(error.message, 'NETWORK_ERROR', true)
  }
  throw new AIClientError(defaultMessage, 'UNKNOWN_ERROR', false)
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function generateSummary(
  jobTitle: string,
  skills: string[],
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.GENERATE_SUMMARY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, skills, language }),
    })
    if (!response.ok) handleAPIError(response, 'Failed to generate summary')
    const data = await response.json()
    if (isErrorResponse(data)) throw new AIClientError(data.error, data.code ?? 'GENERATE_SUMMARY_ERROR', data.retryable ?? false)
    if (!data.summary || typeof data.summary !== 'string') throw new AIClientError('Invalid response format: missing summary', 'INVALID_RESPONSE')
    return data.summary
  } catch (error) {
    if (error instanceof AIClientError) throw error
    handleAPIError(error, 'Failed to generate summary')
  }
}

export async function improveSummary(
  summary: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.IMPROVE_SUMMARY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, language }),
    })
    if (!response.ok) handleAPIError(response, 'Failed to improve summary')
    const data = await response.json()
    if (isErrorResponse(data)) throw new AIClientError(data.error, data.code ?? 'IMPROVE_SUMMARY_ERROR', data.retryable ?? false)
    if (!data.improvedSummary || typeof data.improvedSummary !== 'string') throw new AIClientError('Invalid response format: missing improvedSummary', 'INVALID_RESPONSE')
    return data.improvedSummary
  } catch (error) {
    if (error instanceof AIClientError) throw error
    handleAPIError(error, 'Failed to improve summary')
  }
}

export async function generateExperience(
  jobContext: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.GENERATE_EXPERIENCE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobContext, language }),
    })
    if (!response.ok) handleAPIError(response, 'Failed to generate experience')
    const data = await response.json()
    if (isErrorResponse(data)) throw new AIClientError(data.error, data.code ?? 'GENERATE_EXPERIENCE_ERROR', data.retryable ?? false)

    // Route returns bulletPoints as string[] — join into newline-separated string
    if (Array.isArray(data.bulletPoints)) {
      return (data.bulletPoints as string[]).join('\n')
    }
    // Fallback: accept plain string too
    if (typeof data.bulletPoints === 'string' && data.bulletPoints) {
      return data.bulletPoints
    }
    throw new AIClientError('Invalid response format: missing bulletPoints', 'INVALID_RESPONSE')
  } catch (error) {
    if (error instanceof AIClientError) throw error
    handleAPIError(error, 'Failed to generate experience')
  }
}

export async function improveExperience(
  description: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.IMPROVE_EXPERIENCE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, language }),
    })
    if (!response.ok) handleAPIError(response, 'Failed to improve experience')
    const data = await response.json()
    if (isErrorResponse(data)) throw new AIClientError(data.error, data.code ?? 'IMPROVE_EXPERIENCE_ERROR', data.retryable ?? false)
    if (!data.improvedDescription || typeof data.improvedDescription !== 'string') throw new AIClientError('Invalid response format: missing improvedDescription', 'INVALID_RESPONSE')
    return data.improvedDescription
  } catch (error) {
    if (error instanceof AIClientError) throw error
    handleAPIError(error, 'Failed to improve experience')
  }
}

export async function improveEducation(
  description: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.IMPROVE_EDUCATION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, language }),
    })
    if (!response.ok) handleAPIError(response, 'Failed to improve education')
    const data = await response.json()
    if (isErrorResponse(data)) throw new AIClientError(data.error, data.code ?? 'IMPROVE_EDUCATION_ERROR', data.retryable ?? false)
    if (!data.improvedDescription || typeof data.improvedDescription !== 'string') throw new AIClientError('Invalid response format: missing improvedDescription', 'INVALID_RESPONSE')
    return data.improvedDescription
  } catch (error) {
    if (error instanceof AIClientError) throw error
    handleAPIError(error, 'Failed to improve education')
  }
}

export async function suggestSkills(
  jobTitle: string,
  language: 'EN' | 'ID' = 'EN'
): Promise<string[]> {
  try {
    const response = await fetch(API_ENDPOINTS.SUGGEST_SKILLS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, language }),
    })
    if (!response.ok) handleAPIError(response, 'Failed to suggest skills')
    const data = await response.json()
    if (isErrorResponse(data)) throw new AIClientError(data.error, data.code ?? 'SUGGEST_SKILLS_ERROR', data.retryable ?? false)
    if (!Array.isArray(data.skills)) throw new AIClientError('Invalid response format: expected skills array', 'INVALID_RESPONSE')
    return data.skills
  } catch (error) {
    if (error instanceof AIClientError) throw error
    handleAPIError(error, 'Failed to suggest skills')
  }
}

export async function calculateATSScore(
  resume: Resume,
  language: 'EN' | 'ID' = 'EN'
): Promise<ATSScoreBreakdown> {
  try {
    const response = await fetch(API_ENDPOINTS.CALCULATE_ATS_SCORE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, language }),
    })
    if (!response.ok) handleAPIError(response, 'Failed to calculate ATS score')
    const data = await response.json()
    if (isErrorResponse(data)) throw new AIClientError(data.error, data.code ?? 'CALCULATE_ATS_SCORE_ERROR', data.retryable ?? false)
    if (typeof data.score !== 'number') throw new AIClientError('Invalid response format: missing score', 'INVALID_RESPONSE')
    if (data.score < 0 || data.score > 100) throw new AIClientError('Invalid score: must be between 0 and 100', 'INVALID_RESPONSE')
    return {
      score: data.score,
      components: data.components ?? {},
      topIssues: Array.isArray(data.topIssues) ? data.topIssues : [],
      quickWins: Array.isArray(data.quickWins) ? data.quickWins : [],
    }
  } catch (error) {
    if (error instanceof AIClientError) throw error
    handleAPIError(error, 'Failed to calculate ATS score')
  }
}
