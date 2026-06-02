/**
 * Resume Data Types
 * 
 * This file defines all TypeScript interfaces for the ATS CV Generator application.
 * These types represent the core data structures used throughout the application.
 */

/**
 * PersonalDetails interface
 * 
 * Represents personal information of the resume owner.
 * Fields are categorized as required, recommended, and optional.
 */
export interface PersonalDetails {
  // Required fields
  fullName: string;
  email: string;
  phoneNumber: string;
  jobTarget: string;
  country: string;

  // Recommended fields
  lastName?: string;
  address?: string;
  cityState?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;

  // Optional fields
  postalCode?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  website?: string;
  additionalContact?: string;
}

/**
 * ExperienceEntry interface
 * 
 * Represents a single work experience entry in the resume.
 */
export interface ExperienceEntry {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format or "Present"
  description: string; // Bullet points or paragraph
}

/**
 * EducationEntry interface
 * 
 * Represents a single education entry in the resume.
 */
export interface EducationEntry {
  id: string;
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string; // YYYY-MM-DD format
  description?: string;
}

/**
 * SkillEntry interface
 * 
 * Represents a single skill entry with optional proficiency level.
 */
export interface SkillEntry {
  id: string;
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

/**
 * CertificationEntry interface
 * 
 * Represents a single certification entry in the resume.
 */
export interface CertificationEntry {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string; // YYYY-MM-DD format
  expirationDate?: string; // YYYY-MM-DD format
}

/**
 * ATSScoreData interface
 *
 * Full ATS score result persisted alongside the resume so the breakdown,
 * issues, and quick-wins survive page refreshes and navigation.
 */
export interface ATSScoreData {
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
 * ResumeMetadata interface
 * 
 * Represents metadata about the resume including completion progress and ATS score.
 */
export interface ResumeMetadata {
  completionProgress: number; // 0-100
  atsScore: number; // 0-100  (kept for quick badge display)
  atsScoreData?: ATSScoreData | null; // full breakdown — persisted so it survives refresh
  language: 'EN' | 'ID';
}

/**
 * Resume interface
 * 
 * Represents a complete resume with all sections and metadata.
 * This is the main data structure for a CV in the application.
 */
export interface Resume {
  id: string; // UUID
  title: string; // Resume title
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
  personalDetails: PersonalDetails;
  professionalSummary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  certifications: CertificationEntry[];
  metadata: ResumeMetadata;
}
