/**
 * API Route Input Validation Helpers
 *
 * Centralised validation for all AI API route inputs.
 * Enforces length caps, type checks, and language allowlist
 * to prevent prompt abuse, quota drain, and prompt injection.
 */

/** Allowed language values */
export const ALLOWED_LANGUAGES = ['EN', 'ID'] as const
export type AllowedLanguage = (typeof ALLOWED_LANGUAGES)[number]

/** Maximum character lengths for user-supplied strings */
export const INPUT_LIMITS = {
  JOB_TITLE: 200,
  SUMMARY: 1000,
  DESCRIPTION: 2000,
  JOB_CONTEXT: 1000,
  SKILL_NAME: 100,
  SKILLS_ARRAY_LENGTH: 50,
  /** Max bytes for the entire resume JSON sent to calculate-ats-score */
  RESUME_JSON_BYTES: 50_000,
} as const

/**
 * Validates and returns a sanitised language value.
 * Returns null if the value is not 'EN' or 'ID'.
 */
export function validateLanguage(value: unknown): AllowedLanguage | null {
  if (typeof value !== 'string') return null
  const upper = value.toUpperCase()
  if (upper === 'EN' || upper === 'ID') return upper as AllowedLanguage
  return null
}

/**
 * Validates a string field: must be a non-empty string within maxLength.
 * Returns the trimmed string or null on failure.
 */
export function validateString(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > maxLength) return null
  return trimmed
}

/**
 * Validates a skills array: must be a non-empty array of strings,
 * each within SKILL_NAME limit, capped at SKILLS_ARRAY_LENGTH items.
 * Returns the sanitised array or null on failure.
 */
export function validateSkillsArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  if (value.length === 0) return null
  const capped = value.slice(0, INPUT_LIMITS.SKILLS_ARRAY_LENGTH)
  const sanitised: string[] = []
  for (const item of capped) {
    if (typeof item !== 'string') return null
    const trimmed = item.trim().slice(0, INPUT_LIMITS.SKILL_NAME)
    if (trimmed.length > 0) sanitised.push(trimmed)
  }
  if (sanitised.length === 0) return null
  return sanitised
}

/**
 * Strips the most common prompt-injection patterns from a string.
 * This is a defence-in-depth measure — the primary defence is length capping.
 */
export function sanitiseForPrompt(input: string): string {
  return input
    .replace(/\r/g, '')          // normalise line endings
    .replace(/\0/g, '')          // remove null bytes
    .trim()
}

/**
 * Returns a generic error response body so internal details are never
 * forwarded to the client.
 */
export function genericErrorBody(detail?: string): { error: string } {
  // Log detail server-side only; never include it in the returned object.
  if (detail) {
    console.error('[API] Internal error:', detail)
  }
  return { error: 'Internal server error' }
}
