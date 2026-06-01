import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import { Resume } from "@/types/resume"

/**
 * Merges class names using clsx and tailwind-merge
 * Useful for conditional Tailwind CSS classes
 * 
 * @param inputs - Class names to merge
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique UUID (v4)
 * 
 * Used for creating unique identifiers for resumes and entries.
 * 
 * @returns A unique UUID string
 * 
 * @example
 * const id = generateUUID();
 * console.log(id); // "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUUID(): string {
  return uuidv4()
}

/**
 * Formats a date to a readable string format
 * 
 * Converts a Date object or date string to a formatted string.
 * Format: "MMM DD, YYYY" (e.g., "Jan 15, 2024")
 * 
 * @param date - Date object or date string to format
 * @returns Formatted date string, or empty string if date is invalid
 * 
 * @example
 * const date = new Date('2024-01-15');
 * console.log(formatDate(date)); // "Jan 15, 2024"
 * 
 * @example
 * console.log(formatDate('2024-01-15')); // "Jan 15, 2024"
 */
export function formatDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Creates a debounced version of a function
 * 
 * Delays function execution until after the specified wait time has elapsed
 * since the last time the function was called. Useful for optimizing
 * performance on frequent events like input changes or window resizing.
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 * 
 * @example
 * const debouncedSave = debounce((data) => {
 *   console.log('Saving:', data);
 * }, 500);
 * 
 * // Call multiple times rapidly
 * debouncedSave('data1');
 * debouncedSave('data2');
 * debouncedSave('data3');
 * // Only the last call will execute after 500ms
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, wait)
  }
}

/**
 * Calculates the completion progress percentage of a resume
 * 
 * Evaluates how complete a resume is based on filled fields across all sections.
 * Uses weighted scoring:
 * - Personal Details: 25% (required fields weighted 70%, recommended 30%)
 * - Professional Summary: 15%
 * - Experience: 25%
 * - Education: 15%
 * - Skills: 10%
 * - Certifications: 10%
 * 
 * @param resume - Resume object to evaluate
 * @returns Completion progress as a percentage (0-100)
 * 
 * @example
 * const resume = {
 *   personalDetails: { fullName: 'John Doe', email: 'john@example.com', ... },
 *   professionalSummary: 'A brief summary...',
 *   experience: [{ ... }],
 *   education: [{ ... }],
 *   skills: ['JavaScript', 'React'],
 *   certifications: [],
 * };
 * console.log(calculateCompletionProgress(resume)); // 65
 */
export function calculateCompletionProgress(resume: Resume): number {
  const weights = {
    personalDetails: 0.25,
    professionalSummary: 0.15,
    experience: 0.25,
    education: 0.15,
    skills: 0.1,
    certifications: 0.1,
  }

  let score = 0

  // Personal Details (25%)
  // Required fields: fullName, email, phoneNumber, jobTarget, country
  // Recommended fields: lastName, linkedinUrl, portfolioUrl, githubUrl
  const requiredFields = ['fullName', 'email', 'phoneNumber', 'jobTarget', 'country']
  const recommendedFields = ['lastName', 'linkedinUrl', 'portfolioUrl', 'githubUrl']

  const filledRequired = requiredFields.filter(
    (field) => resume.personalDetails[field as keyof typeof resume.personalDetails]
  ).length
  const filledRecommended = recommendedFields.filter(
    (field) => resume.personalDetails[field as keyof typeof resume.personalDetails]
  ).length

  const personalScore =
    (filledRequired / requiredFields.length) * 0.7 +
    (filledRecommended / recommendedFields.length) * 0.3
  score += personalScore * weights.personalDetails

  // Professional Summary (15%)
  const summaryScore =
    resume.professionalSummary && resume.professionalSummary.length > 50
      ? 1
      : (resume.professionalSummary?.length || 0) / 50
  score += summaryScore * weights.professionalSummary

  // Experience (25%)
  const experienceScore = Math.min((resume.experience?.length || 0) / 3, 1)
  score += experienceScore * weights.experience

  // Education (15%)
  const educationScore = Math.min((resume.education?.length || 0) / 2, 1)
  score += educationScore * weights.education

  // Skills (10%)
  const skillsScore = Math.min((resume.skills?.length || 0) / 10, 1)
  score += skillsScore * weights.skills

  // Certifications (10%)
  const certScore = Math.min((resume.certifications?.length || 0) / 2, 1)
  score += certScore * weights.certifications

  return Math.round(score * 100)
}
