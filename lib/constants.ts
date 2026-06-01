/**
 * Application Constants
 * 
 * This file defines all application-wide constants including:
 * - Validation rules (min/max lengths, patterns)
 * - API endpoints
 * - UI configuration (colors, spacing)
 * - Storage keys
 * - AI configuration
 */

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Validation rules for form fields
 * These constants define min/max lengths and patterns for all user inputs
 */
export const VALIDATION = {
  // Personal Details
  FULL_NAME: {
    MIN: 2,
    MAX: 100,
  },
  LAST_NAME: {
    MIN: 2,
    MAX: 100,
  },
  EMAIL: {
    MIN: 5,
    MAX: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE_NUMBER: {
    MIN: 7,
    MAX: 20,
    PATTERN: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  },
  JOB_TARGET: {
    MIN: 2,
    MAX: 100,
  },
  COUNTRY: {
    MIN: 2,
    MAX: 100,
  },
  ADDRESS: {
    MIN: 2,
    MAX: 200,
  },
  CITY_STATE: {
    MIN: 2,
    MAX: 100,
  },
  POSTAL_CODE: {
    MAX: 20,
  },
  PLACE_OF_BIRTH: {
    MAX: 100,
  },
  NATIONALITY: {
    MAX: 100,
  },
  ADDITIONAL_CONTACT: {
    MAX: 200,
  },

  // URLs
  URL: {
    MIN: 10,
    MAX: 2048,
    PATTERN: /^https?:\/\/.+/,
  },
  LINKEDIN_URL: {
    PATTERN: /^https?:\/\/(www\.)?linkedin\.com/,
  },
  GITHUB_URL: {
    PATTERN: /^https?:\/\/(www\.)?github\.com/,
  },

  // Professional Summary
  PROFESSIONAL_SUMMARY: {
    MIN: 50,
    MAX: 500,
  },

  // Experience
  COMPANY_NAME: {
    MIN: 2,
    MAX: 100,
  },
  JOB_TITLE: {
    MIN: 2,
    MAX: 100,
  },
  EXPERIENCE_DESCRIPTION: {
    MIN: 10,
    MAX: 1000,
  },

  // Education
  SCHOOL_NAME: {
    MIN: 2,
    MAX: 100,
  },
  DEGREE: {
    MIN: 2,
    MAX: 100,
  },
  FIELD_OF_STUDY: {
    MIN: 2,
    MAX: 100,
  },
  EDUCATION_DESCRIPTION: {
    MAX: 500,
  },

  // Skills
  SKILL_NAME: {
    MIN: 2,
    MAX: 100,
  },

  // Certifications
  CERTIFICATION_NAME: {
    MIN: 2,
    MAX: 100,
  },
  ISSUING_ORGANIZATION: {
    MIN: 2,
    MAX: 100,
  },

  // Resume
  RESUME_TITLE: {
    MIN: 1,
    MAX: 100,
  },

  // Date format
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * API endpoints for backend routes
 * All AI features are routed through Next.js API routes for security
 */
export const API_ENDPOINTS = {
  // AI Generation endpoints
  GENERATE_SUMMARY: '/api/ai/generate-summary',
  IMPROVE_SUMMARY: '/api/ai/improve-summary',
  GENERATE_EXPERIENCE: '/api/ai/generate-experience',
  IMPROVE_EXPERIENCE: '/api/ai/improve-experience',
  SUGGEST_SKILLS: '/api/ai/suggest-skills',
  CALCULATE_ATS_SCORE: '/api/ai/calculate-ats-score',
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * Local Storage keys for persisting application data
 */
export const STORAGE_KEYS = {
  RESUMES: 'ats-cv-resumes',
  LANGUAGE_PREFERENCE: 'ats-cv-language-preference',
  CURRENT_RESUME_ID: 'ats-cv-current-resume-id',
} as const;

// ============================================================================
// UI CONSTANTS - COLORS
// ============================================================================

/**
 * Color palette for the application
 * Follows WCAG AA accessibility standards for contrast ratios
 */
export const COLORS = {
  // Primary colors
  PRIMARY: '#3B82F6',
  PRIMARY_LIGHT: '#DBEAFE',
  PRIMARY_DARK: '#1E40AF',

  // Secondary colors
  SECONDARY: '#6B7280',
  SECONDARY_LIGHT: '#F3F4F6',
  SECONDARY_DARK: '#374151',

  // Status colors
  SUCCESS: '#10B981',
  SUCCESS_LIGHT: '#D1FAE5',
  SUCCESS_DARK: '#047857',

  WARNING: '#F59E0B',
  WARNING_LIGHT: '#FEF3C7',
  WARNING_DARK: '#D97706',

  ERROR: '#EF4444',
  ERROR_LIGHT: '#FEE2E2',
  ERROR_DARK: '#DC2626',

  // Neutral colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',

  // Text colors
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_LIGHT: '#9CA3AF',

  // Background colors
  BG_PRIMARY: '#FFFFFF',
  BG_SECONDARY: '#F9FAFB',
  BG_TERTIARY: '#F3F4F6',

  // Border colors
  BORDER_LIGHT: '#E5E7EB',
  BORDER_DEFAULT: '#D1D5DB',
  BORDER_DARK: '#9CA3AF',
} as const;

// ============================================================================
// UI CONSTANTS - SPACING
// ============================================================================

/**
 * Spacing scale for consistent padding and margins
 * Based on 4px base unit (Tailwind CSS convention)
 */
export const SPACING = {
  XS: '0.25rem',    // 4px
  SM: '0.5rem',     // 8px
  MD: '1rem',       // 16px
  LG: '1.5rem',     // 24px
  XL: '2rem',       // 32px
  XXL: '3rem',      // 48px
  XXXL: '4rem',     // 64px
} as const;

// ============================================================================
// UI CONSTANTS - TYPOGRAPHY
// ============================================================================

/**
 * Typography configuration for consistent text styling
 */
export const TYPOGRAPHY = {
  // Font families
  FONT_FAMILY: {
    SANS: 'system-ui, -apple-system, sans-serif',
    MONO: 'ui-monospace, SFMono-Regular, monospace',
  },

  // Font sizes
  FONT_SIZE: {
    XS: '0.75rem',    // 12px
    SM: '0.875rem',   // 14px
    BASE: '1rem',     // 16px
    LG: '1.125rem',   // 18px
    XL: '1.25rem',    // 20px
    XXL: '1.5rem',    // 24px
    XXXL: '1.875rem', // 30px
    XXXXL: '2.25rem', // 36px
  },

  // Font weights
  FONT_WEIGHT: {
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },

  // Line heights
  LINE_HEIGHT: {
    TIGHT: 1.2,
    NORMAL: 1.5,
    RELAXED: 1.75,
    LOOSE: 2,
  },
} as const;

// ============================================================================
// UI CONSTANTS - BREAKPOINTS
// ============================================================================

/**
 * Responsive design breakpoints
 * Used for responsive layout decisions
 */
export const BREAKPOINTS = {
  MOBILE: 320,
  MOBILE_MAX: 767,
  TABLET: 768,
  TABLET_MAX: 1024,
  DESKTOP: 1025,
  DESKTOP_MAX: 1920,
  LARGE_DESKTOP: 1921,
} as const;

// ============================================================================
// UI CONSTANTS - BORDER RADIUS
// ============================================================================

/**
 * Border radius values for consistent rounded corners
 */
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.125rem',   // 2px
  MD: '0.375rem',   // 6px
  LG: '0.5rem',     // 8px
  XL: '0.75rem',    // 12px
  FULL: '9999px',
} as const;

// ============================================================================
// UI CONSTANTS - SHADOWS
// ============================================================================

/**
 * Shadow values for depth and elevation
 */
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

// ============================================================================
// UI CONSTANTS - TRANSITIONS
// ============================================================================

/**
 * Animation and transition durations
 */
export const TRANSITIONS = {
  FAST: '150ms',
  BASE: '200ms',
  SLOW: '300ms',
  SLOWER: '500ms',
  EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================================================
// AI CONFIGURATION
// ============================================================================

/**
 * AI/Gemini API configuration
 */
export const AI_CONFIG = {
  // Model configuration
  MODEL: 'gemini-2.0-flash',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',

  // Temperature settings for different use cases
  TEMPERATURE: {
    // For content generation (creative, varied outputs)
    GENERATION: 0.7,
    // For content improvement (balanced creativity)
    IMPROVEMENT: 0.7,
    // For scoring/analysis (deterministic, consistent)
    SCORING: 0.2,
  },

  // Token limits
  MAX_OUTPUT_TOKENS: {
    SUMMARY: 200,
    EXPERIENCE: 500,
    EDUCATION: 300,
    SKILLS: 200,
    ATS_SCORE: 1000,
  },

  // Timeout settings (in milliseconds)
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// ============================================================================
// DEBOUNCE & THROTTLE TIMINGS
// ============================================================================

/**
 * Debounce and throttle timings for performance optimization
 */
export const TIMINGS = {
  // Preview update debounce (300ms as per requirements)
  PREVIEW_UPDATE: 300,
  // Auto-save debounce (500ms as per requirements)
  AUTO_SAVE: 500,
  // Form input debounce
  FORM_INPUT: 300,
  // Search debounce
  SEARCH: 300,
} as const;

// ============================================================================
// COMPLETION PROGRESS WEIGHTS
// ============================================================================

/**
 * Weights for calculating completion progress
 * Total should equal 1.0 (100%)
 */
export const COMPLETION_WEIGHTS = {
  PERSONAL_DETAILS: 0.25,
  PROFESSIONAL_SUMMARY: 0.15,
  EXPERIENCE: 0.25,
  EDUCATION: 0.15,
  SKILLS: 0.10,
  CERTIFICATIONS: 0.10,
} as const;

// ============================================================================
// COMPLETION PROGRESS THRESHOLDS
// ============================================================================

/**
 * Thresholds for personal details completion
 */
export const PERSONAL_DETAILS_THRESHOLDS = {
  REQUIRED_FIELDS_WEIGHT: 0.7,
  RECOMMENDED_FIELDS_WEIGHT: 0.3,
  REQUIRED_FIELDS: [
    'fullName',
    'email',
    'phoneNumber',
    'jobTarget',
    'country',
  ],
  RECOMMENDED_FIELDS: [
    'lastName',
    'linkedinUrl',
    'portfolioUrl',
    'githubUrl',
  ],
} as const;

// ============================================================================
// EXPERIENCE THRESHOLDS
// ============================================================================

/**
 * Thresholds for experience completion
 */
export const EXPERIENCE_THRESHOLDS = {
  TARGET_COUNT: 3,
} as const;

// ============================================================================
// EDUCATION THRESHOLDS
// ============================================================================

/**
 * Thresholds for education completion
 */
export const EDUCATION_THRESHOLDS = {
  TARGET_COUNT: 2,
} as const;

// ============================================================================
// SKILLS THRESHOLDS
// ============================================================================

/**
 * Thresholds for skills completion
 */
export const SKILLS_THRESHOLDS = {
  TARGET_COUNT: 10,
} as const;

// ============================================================================
// CERTIFICATIONS THRESHOLDS
// ============================================================================

/**
 * Thresholds for certifications completion
 */
export const CERTIFICATIONS_THRESHOLDS = {
  TARGET_COUNT: 2,
} as const;

// ============================================================================
// LANGUAGE CONFIGURATION
// ============================================================================

/**
 * Supported languages and their configurations
 */
export const LANGUAGES = {
  EN: 'EN',
  ID: 'ID',
} as const;

export const LANGUAGE_NAMES = {
  EN: 'English',
  ID: 'Bahasa Indonesia',
} as const;

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

/**
 * Configuration for export functionality
 */
export const EXPORT_CONFIG = {
  // Filename format: CV_[Full_Name]_[Date].[extension]
  FILENAME_FORMAT: 'CV_{name}_{date}',
  DATE_FORMAT: 'YYYY-MM-DD',

  // File types
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TEXT: 'text/plain',

  // Extensions
  PDF_EXT: '.pdf',
  DOCX_EXT: '.docx',
  TEXT_EXT: '.txt',
} as const;

// ============================================================================
// ATS SCORE CONFIGURATION
// ============================================================================

/**
 * Configuration for ATS score calculation
 */
export const ATS_SCORE_CONFIG = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  COMPONENTS: {
    CONTACT_INFO: 'Contact Information',
    SUMMARY: 'Professional Summary',
    EXPERIENCE: 'Work Experience',
    EDUCATION: 'Education',
    SKILLS: 'Skills',
    CERTIFICATIONS: 'Certifications',
    FORMATTING: 'Formatting',
  },
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded. Please delete some resumes.',
  STORAGE_ACCESS_DENIED: 'Unable to access local storage. Please check your browser settings.',
  INVALID_RESUME_DATA: 'Invalid resume data. Please refresh and try again.',
  API_ERROR: 'An error occurred. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  OFFLINE_MODE: 'You are offline. AI features are disabled.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
  RESUME_CREATED: 'Resume created successfully.',
  RESUME_UPDATED: 'Resume updated successfully.',
  RESUME_DELETED: 'Resume deleted successfully.',
  RESUME_DUPLICATED: 'Resume duplicated successfully.',
  EXPORTED_PDF: 'CV exported as PDF successfully.',
  EXPORTED_DOCX: 'CV exported as DOCX successfully.',
  EXPORTED_TEXT: 'CV exported as text successfully.',
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

/**
 * Common regex patterns for validation
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  LINKEDIN: /^https?:\/\/(www\.)?linkedin\.com/,
  GITHUB: /^https?:\/\/(www\.)?github\.com/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;

// ============================================================================
// SKILL LEVELS
// ============================================================================

/**
 * Proficiency levels for skills
 */
export const SKILL_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
} as const;

export const SKILL_LEVELS_ARRAY = [
  SKILL_LEVELS.BEGINNER,
  SKILL_LEVELS.INTERMEDIATE,
  SKILL_LEVELS.ADVANCED,
  SKILL_LEVELS.EXPERT,
] as const;

// ============================================================================
// RESUME COPY SUFFIX
// ============================================================================

/**
 * Suffix for duplicated resumes
 */
export const RESUME_COPY_SUFFIX = ' (Copy)' as const;
