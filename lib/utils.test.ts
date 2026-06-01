import { generateUUID, formatDate, debounce, calculateCompletionProgress } from './utils'
import { Resume } from '@/types/resume'

describe('Utility Functions', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID', () => {
      const uuid = generateUUID()
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuid).toMatch(uuidRegex)
    })

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      expect(uuid1).not.toBe(uuid2)
    })
  })

  describe('formatDate', () => {
    it('should format a Date object correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toBe('Jan 15, 2024')
    })

    it('should format a date string correctly', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toBe('Jan 15, 2024')
    })

    it('should return empty string for invalid date', () => {
      const formatted = formatDate('invalid-date')
      expect(formatted).toBe('')
    })

    it('should handle different months', () => {
      const date = new Date('2024-12-25')
      const formatted = formatDate(date)
      expect(formatted).toBe('Dec 25, 2024')
    })
  })

  describe('debounce', () => {
    it('should delay function execution', (done) => {
      let callCount = 0
      const func = () => {
        callCount++
      }
      const debouncedFunc = debounce(func, 100)

      debouncedFunc()
      debouncedFunc()
      debouncedFunc()

      expect(callCount).toBe(0)

      setTimeout(() => {
        expect(callCount).toBe(1)
        done()
      }, 150)
    })

    it('should pass arguments to the debounced function', (done) => {
      let result = ''
      const func = (value: string) => {
        result = value
      }
      const debouncedFunc = debounce(func, 100)

      debouncedFunc('test')

      setTimeout(() => {
        expect(result).toBe('test')
        done()
      }, 150)
    })
  })

  describe('calculateCompletionProgress', () => {
    it('should return 0 for empty resume', () => {
      const resume: Resume = {
        id: '1',
        title: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        personalDetails: {},
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
      }

      const progress = calculateCompletionProgress(resume)
      expect(progress).toBe(0)
    })

    it('should calculate progress with filled personal details', () => {
      const resume: Resume = {
        id: '1',
        title: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        personalDetails: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '123-456-7890',
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
      }

      const progress = calculateCompletionProgress(resume)
      // Personal details are 25% of total, and all required fields are filled
      expect(progress).toBeGreaterThan(0)
      expect(progress).toBeLessThanOrEqual(100)
    })

    it('should calculate progress with multiple sections filled', () => {
      const resume: Resume = {
        id: '1',
        title: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        personalDetails: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '123-456-7890',
          jobTarget: 'Software Engineer',
          country: 'USA',
        },
        professionalSummary: 'A professional software engineer with 5 years of experience.',
        experience: [
          {
            id: '1',
            companyName: 'Tech Corp',
            jobTitle: 'Senior Developer',
            startDate: '2020-01-01',
            endDate: '2024-01-01',
            description: 'Led development team',
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
        ],
        skills: ['JavaScript', 'React', 'Node.js'],
        certifications: [],
        metadata: {
          completionProgress: 0,
          atsScore: 0,
          language: 'EN',
        },
      }

      const progress = calculateCompletionProgress(resume)
      expect(progress).toBeGreaterThan(50)
      expect(progress).toBeLessThanOrEqual(100)
    })

    it('should return 100 for fully filled resume', () => {
      const resume: Resume = {
        id: '1',
        title: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        personalDetails: {
          fullName: 'John Doe',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '123-456-7890',
          jobTarget: 'Software Engineer',
          country: 'USA',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          portfolioUrl: 'https://johndoe.com',
          githubUrl: 'https://github.com/johndoe',
        },
        professionalSummary: 'A professional software engineer with 5 years of experience in full-stack development.',
        experience: [
          {
            id: '1',
            companyName: 'Tech Corp',
            jobTitle: 'Senior Developer',
            startDate: '2020-01-01',
            endDate: '2024-01-01',
            description: 'Led development team',
          },
          {
            id: '2',
            companyName: 'Another Corp',
            jobTitle: 'Developer',
            startDate: '2018-01-01',
            endDate: '2020-01-01',
            description: 'Developed features',
          },
          {
            id: '3',
            companyName: 'Startup',
            jobTitle: 'Junior Developer',
            startDate: '2016-01-01',
            endDate: '2018-01-01',
            description: 'Built MVP',
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
            schoolName: 'Bootcamp',
            degree: 'Certificate',
            fieldOfStudy: 'Web Development',
            graduationDate: '2016-05-01',
          },
        ],
        skills: [
          'JavaScript',
          'React',
          'Node.js',
          'TypeScript',
          'Python',
          'SQL',
          'Docker',
          'AWS',
          'Git',
          'REST APIs',
        ],
        certifications: [
          {
            id: '1',
            certificationName: 'AWS Solutions Architect',
            issuingOrganization: 'Amazon',
            issueDate: '2023-01-01',
          },
          {
            id: '2',
            certificationName: 'Google Cloud Professional',
            issuingOrganization: 'Google',
            issueDate: '2022-01-01',
          },
        ],
        metadata: {
          completionProgress: 0,
          atsScore: 0,
          language: 'EN',
        },
      }

      const progress = calculateCompletionProgress(resume)
      expect(progress).toBe(100)
    })
  })
})
