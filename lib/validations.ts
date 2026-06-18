/**
 * Zod Validation Schemas
 * 
 * This file defines all Zod schemas for validating resume data.
 * These schemas are derived from the TypeScript interfaces in types/resume.ts
 * and implement all validation rules from the requirements document.
 */

import { z } from 'zod';

/**
 * Email validation using RFC 5322 standard
 * Simplified pattern that covers most common email formats
 */
const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must not exceed 254 characters');

/**
 * URL validation for LinkedIn, Portfolio, and GitHub URLs
 */
const urlSchema = z
  .string()
  .url('Invalid URL format')
  .min(10, 'URL must be at least 10 characters')
  .max(2048, 'URL must not exceed 2048 characters');

/**
 * Phone number validation
 * Allows digits and common separators: +, -, space
 */
const phoneSchema = z
  .string()
  .regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    'Invalid phone number format'
  )
  .min(7, 'Phone number must be at least 7 characters')
  .max(20, 'Phone number must not exceed 20 characters');

/**
 * Date validation in YYYY-MM-DD format
 */
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

/**
 * PersonalDetailsSchema
 * Validates personal information with required, recommended, and optional fields
 * 
 * Validates: Requirements 6, 7, 8
 */
export const PersonalDetailsSchema = z.object({
  // Required fields
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  
  email: emailSchema,
  
  phoneNumber: phoneSchema,
  
  jobTarget: z
    .string()
    .min(2, 'Job target must be at least 2 characters')
    .max(100, 'Job target must not exceed 100 characters'),
  
  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must not exceed 100 characters'),

  // Recommended fields
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  
  address: z
    .string()
    .min(2, 'Address must be at least 2 characters')
    .max(200, 'Address must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
  
  cityState: z
    .string()
    .min(2, 'City/State must be at least 2 characters')
    .max(100, 'City/State must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  
  linkedinUrl: urlSchema.optional().or(z.literal('')),
  
  portfolioUrl: urlSchema.optional().or(z.literal('')),
  
  githubUrl: urlSchema.optional().or(z.literal('')),

  // Optional fields
  postalCode: z
    .string()
    .max(20, 'Postal code must not exceed 20 characters')
    .optional()
    .or(z.literal('')),
  
  dateOfBirth: dateSchema.optional().or(z.literal('')),
  
  placeOfBirth: z
    .string()
    .max(100, 'Place of birth must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  
  nationality: z
    .string()
    .max(100, 'Nationality must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  
  website: urlSchema.optional().or(z.literal('')),
  
  additionalContact: z
    .string()
    .max(200, 'Additional contact must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * ExperienceEntrySchema
 * Validates a single work experience entry
 * 
 * Validates: Requirements 12, 13, 14, 15
 */
export const ExperienceEntrySchema = z.object({
  id: z.string().uuid('Invalid ID format'),
  
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters'),
  
  jobTitle: z
    .string()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must not exceed 100 characters'),
  
  startDate: dateSchema,
  
  endDate: z.union([
    dateSchema,
    z.literal('Present')
  ]),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
}).refine(
  (data) => {
    if (data.endDate === 'Present') return true;
    return new Date(data.startDate) < new Date(data.endDate);
  },
  {
    message: 'Start date must be before end date',
    path: ['endDate'],
  }
);

/**
 * EducationEntrySchema
 * Validates a single education entry
 * 
 * Validates: Requirements 16, 17, 18
 */
export const EducationEntrySchema = z.object({
  id: z.string().uuid('Invalid ID format'),
  
  schoolName: z
    .string()
    .min(2, 'School/University name must be at least 2 characters')
    .max(100, 'School/University name must not exceed 100 characters'),
  
  degree: z
    .string()
    .min(2, 'Degree must be at least 2 characters')
    .max(100, 'Degree must not exceed 100 characters'),
  
  fieldOfStudy: z
    .string()
    .min(2, 'Field of study must be at least 2 characters')
    .max(100, 'Field of study must not exceed 100 characters'),
  
  graduationDate: dateSchema,
  
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * SkillEntrySchema
 * Validates a single skill entry with optional proficiency level
 * 
 * Validates: Requirements 19, 20, 21
 */
export const SkillEntrySchema = z.object({
  id: z.string().uuid('Invalid ID format'),
  
  name: z
    .string()
    .min(2, 'Skill name must be at least 2 characters')
    .max(100, 'Skill name must not exceed 100 characters'),
  
  level: z
    .enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .optional(),
});

/**
 * CertificationEntrySchema
 * Validates a single certification entry
 * 
 * Validates: Requirements 22, 23
 */
export const CertificationEntrySchema = z.object({
  id: z.string().uuid('Invalid ID format'),
  
  certificationName: z
    .string()
    .min(2, 'Certification name must be at least 2 characters')
    .max(100, 'Certification name must not exceed 100 characters'),
  
  issuingOrganization: z
    .string()
    .min(2, 'Issuing organization must be at least 2 characters')
    .max(100, 'Issuing organization must not exceed 100 characters'),
  
  issueDate: dateSchema,
  
  expirationDate: dateSchema.optional().or(z.literal('')),

  neverExpires: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.neverExpires) return true;
    if (!data.expirationDate || data.expirationDate === '') return true;
    return new Date(data.issueDate) < new Date(data.expirationDate);
  },
  {
    message: 'Issue date must be before expiration date',
    path: ['expirationDate'],
  }
);

/**
 * ResumeMetadataSchema
 * Validates resume metadata including completion progress and ATS score
 */
export const ResumeMetadataSchema = z.object({
  completionProgress: z
    .number()
    .min(0, 'Completion progress must be at least 0')
    .max(100, 'Completion progress must not exceed 100'),
  
  atsScore: z
    .number()
    .min(0, 'ATS score must be at least 0')
    .max(100, 'ATS score must not exceed 100'),
  
  language: z.enum(['EN', 'ID']),
});

/**
 * ResumeSchema
 * Main schema that validates the complete resume structure
 * This serves as the single source of truth for resume validation
 * 
 * Validates: Requirements 1-45 (all resume-related requirements)
 */
export const ResumeSchema = z.object({
  id: z.string().uuid('Invalid resume ID'),
  
  title: z
    .string()
    .min(1, 'Resume title is required')
    .max(100, 'Resume title must not exceed 100 characters'),
  
  createdAt: z.date(),
  
  updatedAt: z.date(),
  
  personalDetails: PersonalDetailsSchema,
  
  professionalSummary: z
    .string()
    .min(0, 'Professional summary cannot be negative')
    .max(500, 'Professional summary must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  
  experience: z.array(ExperienceEntrySchema),
  
  education: z.array(EducationEntrySchema),
  
  skills: z.array(SkillEntrySchema),
  
  certifications: z.array(CertificationEntrySchema),
  
  metadata: ResumeMetadataSchema,
});

/**
 * Type exports for TypeScript inference
 * These types are automatically derived from the Zod schemas
 */
export type PersonalDetails = z.infer<typeof PersonalDetailsSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type SkillEntry = z.infer<typeof SkillEntrySchema>;
export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;
export type ResumeMetadata = z.infer<typeof ResumeMetadataSchema>;
export type Resume = z.infer<typeof ResumeSchema>;
