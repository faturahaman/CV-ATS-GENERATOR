// ATS CV Generator - Internationalization Translations

export type Language = 'EN' | 'ID';

export interface Translations {
  // App
  appTitle: string;

  // Navigation
  nav: {
    home: string;
    backToList: string;
  };

  // Resume List
  resumeList: {
    title: string;
    createNew: string;
    empty: string;
    edit: string;
    duplicate: string;
    delete: string;
    completion: string;
    atsScore: string;
  };

  // Editor sections (sidebar/tabs)
  sections: {
    personalDetails: string;
    professionalSummary: string;
    experience: string;
    education: string;
    skills: string;
    certifications: string;
    export: string;
  };

  // Personal Details
  personalDetails: {
    title: string;
    fullName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    jobTarget: string;
    country: string;
    address: string;
    cityState: string;
    linkedinUrl: string;
    portfolioUrl: string;
    githubUrl: string;
    postalCode: string;
    dateOfBirth: string;
    placeOfBirth: string;
    nationality: string;
    website: string;
    additionalContact: string;
    requiredFields: string;
    recommendedFields: string;
    optionalFields: string;
  };

  // Professional Summary
  professionalSummary: {
    title: string;
    placeholder: string;
    characterCount: string; // "{count}/500 characters"
  };

  // Experience
  experience: {
    title: string;
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    description: string;
    addExperience: string;
    present: string;
    empty: string;
  };

  // Education
  education: {
    title: string;
    schoolName: string;
    degree: string;
    fieldOfStudy: string;
    graduationDate: string;
    description: string;
    addEducation: string;
    empty: string;
  };

  // Skills
  skills: {
    title: string;
    skillName: string;
    addSkill: string;
    empty: string;
  };

  // Certifications
  certifications: {
    title: string;
    certificationName: string;
    issuingOrganization: string;
    issueDate: string;
    expirationDate: string;
    addCertification: string;
    empty: string;
  };

  // AI Buttons
  ai: {
    generate: string;
    improve: string;
    generateSummary: string;
    improveSummary: string;
    generateDescription: string;
    improveDescription: string;
    suggestSkills: string;
    checkAtsScore: string;
    generating: string;
    improving: string;
  };

  // Modals
  modals: {
    createResume: {
      title: string;
      resumeTitle: string;
      create: string;
      cancel: string;
    };
    confirmDelete: {
      title: string;
      message: string;
      delete: string;
      cancel: string;
    };
    aiResult: {
      accept: string;
      reject: string;
      close: string;
      tryAgain: string;
    };
  };

  // Export
  export: {
    title: string;
    exportAsPdf: string;
    exportAsDocx: string;
    exportAsText: string;
    exporting: string;
  };

  // Progress
  progress: {
    title: string;
    complete: string;
    incompleteSections: string;
  };

  // ATS Score
  atsScore: {
    title: string;
    checkScore: string;
    scoreBreakdown: string;
    topIssues: string;
    quickWins: string;
    contactInfo: string;
    summary: string;
    experience: string;
    education: string;
    skills: string;
    certifications: string;
    formatting: string;
    notChecked: string;
  };

  // Validation errors
  validation: {
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidUrl: string;
    minLength: string; // "Minimum {min} characters required"
    maxLength: string; // "Maximum {max} characters allowed"
    dateOrder: string;
  };

  // Status messages
  status: {
    saving: string;
    saved: string;
    errorSaving: string;
    loading: string;
    online: string;
    offline: string;
    offlineAiDisabled: string;
  };

  // Error messages
  errors: {
    generic: string;
    network: string;
    aiQuotaExceeded: string;
    failedPdf: string;
    failedDocx: string;
    failedText: string;
  };

  // Language selector
  language: {
    english: string;
    indonesian: string;
  };

  // Privacy notice
  privacy: {
    message: string;
    dismiss: string;
  };
}

export const translations: Record<Language, Translations> = {
  EN: {
    appTitle: 'ATS CV Generator',

    nav: {
      home: 'Home',
      backToList: 'Back to List',
    },

    resumeList: {
      title: 'My Resumes',
      createNew: 'Create New Resume',
      empty: 'No resumes yet. Create your first resume!',
      edit: 'Edit',
      duplicate: 'Duplicate',
      delete: 'Delete',
      completion: 'Completion',
      atsScore: 'ATS Score',
    },

    sections: {
      personalDetails: 'Personal Details',
      professionalSummary: 'Professional Summary',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      certifications: 'Certifications',
      export: 'Export',
    },

    personalDetails: {
      title: 'Personal Details',
      fullName: 'Full Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      jobTarget: 'Job Target',
      country: 'Country',
      address: 'Address',
      cityState: 'City/State',
      linkedinUrl: 'LinkedIn URL',
      portfolioUrl: 'Portfolio URL',
      githubUrl: 'GitHub URL',
      postalCode: 'Postal Code',
      dateOfBirth: 'Date of Birth',
      placeOfBirth: 'Place of Birth',
      nationality: 'Nationality',
      website: 'Website',
      additionalContact: 'Additional Contact',
      requiredFields: 'Required Fields',
      recommendedFields: 'Recommended Fields',
      optionalFields: 'Optional Fields',
    },

    professionalSummary: {
      title: 'Professional Summary',
      placeholder: 'Write a compelling summary...',
      characterCount: '{count}/500 characters',
    },

    experience: {
      title: 'Work Experience',
      companyName: 'Company Name',
      jobTitle: 'Job Title',
      startDate: 'Start Date',
      endDate: 'End Date',
      description: 'Description',
      addExperience: 'Add Experience',
      present: 'Present',
      empty: 'No experience added yet',
    },

    education: {
      title: 'Education',
      schoolName: 'School/University Name',
      degree: 'Degree',
      fieldOfStudy: 'Field of Study',
      graduationDate: 'Graduation Date',
      description: 'Description',
      addEducation: 'Add Education',
      empty: 'No education added yet',
    },

    skills: {
      title: 'Skills',
      skillName: 'Skill Name',
      addSkill: 'Add Skill',
      empty: 'No skills added yet',
    },

    certifications: {
      title: 'Certifications',
      certificationName: 'Certification Name',
      issuingOrganization: 'Issuing Organization',
      issueDate: 'Issue Date',
      expirationDate: 'Expiration Date',
      addCertification: 'Add Certification',
      empty: 'No certifications added yet',
    },

    ai: {
      generate: 'Generate',
      improve: 'Improve',
      generateSummary: 'Generate Summary',
      improveSummary: 'Improve Summary',
      generateDescription: 'Generate Description',
      improveDescription: 'Improve Description',
      suggestSkills: 'Suggest Skills',
      checkAtsScore: 'Check ATS Score',
      generating: 'Generating...',
      improving: 'Improving...',
    },

    modals: {
      createResume: {
        title: 'Create New Resume',
        resumeTitle: 'Resume Title',
        create: 'Create',
        cancel: 'Cancel',
      },
      confirmDelete: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this resume?',
        delete: 'Delete',
        cancel: 'Cancel',
      },
      aiResult: {
        accept: 'Accept',
        reject: 'Reject',
        close: 'Close',
        tryAgain: 'Try Again',
      },
    },

    export: {
      title: 'Export',
      exportAsPdf: 'Export as PDF',
      exportAsDocx: 'Export as DOCX',
      exportAsText: 'Export as Text',
      exporting: 'Exporting...',
    },

    progress: {
      title: 'Completion Progress',
      complete: 'Complete',
      incompleteSections: 'Incomplete sections:',
    },

    atsScore: {
      title: 'ATS Score',
      checkScore: 'Check ATS Score',
      scoreBreakdown: 'Score Breakdown',
      topIssues: 'Top Issues',
      quickWins: 'Quick Wins',
      contactInfo: 'Contact Info',
      summary: 'Summary',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      certifications: 'Certifications',
      formatting: 'Formatting',
      notChecked: 'Not checked yet',
    },

    validation: {
      required: 'This field is required',
      invalidEmail: 'Invalid email format',
      invalidPhone: 'Invalid phone number',
      invalidUrl: 'Invalid URL format',
      minLength: 'Minimum {min} characters required',
      maxLength: 'Maximum {max} characters allowed',
      dateOrder: 'Start date must be before end date',
    },

    status: {
      saving: 'Saving...',
      saved: 'Saved',
      errorSaving: 'Error saving',
      loading: 'Loading...',
      online: 'Online',
      offline: 'Offline',
      offlineAiDisabled: 'AI features are disabled while offline',
    },

    errors: {
      generic: 'An error occurred. Please try again.',
      network: 'Network error. Please check your connection.',
      aiQuotaExceeded: 'AI quota exceeded. Please try again later.',
      failedPdf: 'Failed to generate PDF',
      failedDocx: 'Failed to generate DOCX',
      failedText: 'Failed to export text',
    },

    language: {
      english: 'English',
      indonesian: 'Indonesian',
    },

    privacy: {
      message: 'Your data is stored locally in your browser — nothing is sent to any server. Your resume stays completely private.',
      dismiss: 'Got it',
    },
  },

  ID: {
    appTitle: 'ATS CV Generator',

    nav: {
      home: 'Beranda',
      backToList: 'Kembali ke Daftar',
    },

    resumeList: {
      title: 'CV Saya',
      createNew: 'Buat CV Baru',
      empty: 'Belum ada CV. Buat CV pertama Anda!',
      edit: 'Edit',
      duplicate: 'Duplikat',
      delete: 'Hapus',
      completion: 'Kelengkapan',
      atsScore: 'Skor ATS',
    },

    sections: {
      personalDetails: 'Data Pribadi',
      professionalSummary: 'Ringkasan Profesional',
      experience: 'Pengalaman',
      education: 'Pendidikan',
      skills: 'Keahlian',
      certifications: 'Sertifikasi',
      export: 'Ekspor',
    },

    personalDetails: {
      title: 'Data Pribadi',
      fullName: 'Nama Depan',
      lastName: 'Nama Belakang',
      email: 'Email',
      phoneNumber: 'Nomor Telepon',
      jobTarget: 'Target Pekerjaan',
      country: 'Negara',
      address: 'Alamat',
      cityState: 'Kota/Provinsi',
      linkedinUrl: 'URL LinkedIn',
      portfolioUrl: 'URL Portofolio',
      githubUrl: 'URL GitHub',
      postalCode: 'Kode Pos',
      dateOfBirth: 'Tanggal Lahir',
      placeOfBirth: 'Tempat Lahir',
      nationality: 'Kewarganegaraan',
      website: 'Website',
      additionalContact: 'Kontak Tambahan',
      requiredFields: 'Kolom Wajib',
      recommendedFields: 'Kolom Disarankan',
      optionalFields: 'Kolom Opsional',
    },

    professionalSummary: {
      title: 'Ringkasan Profesional',
      placeholder: 'Tulis ringkasan yang menarik...',
      characterCount: '{count}/500 karakter',
    },

    experience: {
      title: 'Pengalaman Kerja',
      companyName: 'Nama Perusahaan',
      jobTitle: 'Jabatan',
      startDate: 'Tanggal Mulai',
      endDate: 'Tanggal Selesai',
      description: 'Deskripsi',
      addExperience: 'Tambah Pengalaman',
      present: 'Sekarang',
      empty: 'Belum ada pengalaman yang ditambahkan',
    },

    education: {
      title: 'Pendidikan',
      schoolName: 'Nama Sekolah/Universitas',
      degree: 'Gelar',
      fieldOfStudy: 'Bidang Studi',
      graduationDate: 'Tanggal Kelulusan',
      description: 'Deskripsi',
      addEducation: 'Tambah Pendidikan',
      empty: 'Belum ada pendidikan yang ditambahkan',
    },

    skills: {
      title: 'Keahlian',
      skillName: 'Nama Keahlian',
      addSkill: 'Tambah Keahlian',
      empty: 'Belum ada keahlian yang ditambahkan',
    },

    certifications: {
      title: 'Sertifikasi',
      certificationName: 'Nama Sertifikasi',
      issuingOrganization: 'Organisasi Penerbit',
      issueDate: 'Tanggal Terbit',
      expirationDate: 'Tanggal Kadaluarsa',
      addCertification: 'Tambah Sertifikasi',
      empty: 'Belum ada sertifikasi yang ditambahkan',
    },

    ai: {
      generate: 'Buat',
      improve: 'Tingkatkan',
      generateSummary: 'Buat Ringkasan',
      improveSummary: 'Tingkatkan Ringkasan',
      generateDescription: 'Buat Deskripsi',
      improveDescription: 'Tingkatkan Deskripsi',
      suggestSkills: 'Sarankan Keahlian',
      checkAtsScore: 'Cek Skor ATS',
      generating: 'Membuat...',
      improving: 'Meningkatkan...',
    },

    modals: {
      createResume: {
        title: 'Buat CV Baru',
        resumeTitle: 'Judul CV',
        create: 'Buat',
        cancel: 'Batal',
      },
      confirmDelete: {
        title: 'Konfirmasi Hapus',
        message: 'Apakah Anda yakin ingin menghapus CV ini?',
        delete: 'Hapus',
        cancel: 'Batal',
      },
      aiResult: {
        accept: 'Terima',
        reject: 'Tolak',
        close: 'Tutup',
        tryAgain: 'Coba Lagi',
      },
    },

    export: {
      title: 'Ekspor',
      exportAsPdf: 'Ekspor sebagai PDF',
      exportAsDocx: 'Ekspor sebagai DOCX',
      exportAsText: 'Ekspor sebagai Teks',
      exporting: 'Mengekspor...',
    },

    progress: {
      title: 'Progres Kelengkapan',
      complete: 'Lengkap',
      incompleteSections: 'Bagian yang belum lengkap:',
    },

    atsScore: {
      title: 'Skor ATS',
      checkScore: 'Cek Skor ATS',
      scoreBreakdown: 'Rincian Skor',
      topIssues: 'Masalah Utama',
      quickWins: 'Perbaikan Cepat',
      contactInfo: 'Info Kontak',
      summary: 'Ringkasan',
      experience: 'Pengalaman',
      education: 'Pendidikan',
      skills: 'Keahlian',
      certifications: 'Sertifikasi',
      formatting: 'Format',
      notChecked: 'Belum diperiksa',
    },

    validation: {
      required: 'Kolom ini wajib diisi',
      invalidEmail: 'Format email tidak valid',
      invalidPhone: 'Nomor telepon tidak valid',
      invalidUrl: 'Format URL tidak valid',
      minLength: 'Minimal {min} karakter diperlukan',
      maxLength: 'Maksimal {max} karakter diizinkan',
      dateOrder: 'Tanggal mulai harus sebelum tanggal selesai',
    },

    status: {
      saving: 'Menyimpan...',
      saved: 'Tersimpan',
      errorSaving: 'Gagal menyimpan',
      loading: 'Memuat...',
      online: 'Online',
      offline: 'Offline',
      offlineAiDisabled: 'Fitur AI dinonaktifkan saat offline',
    },

    errors: {
      generic: 'Terjadi kesalahan. Silakan coba lagi.',
      network: 'Kesalahan jaringan. Periksa koneksi Anda.',
      aiQuotaExceeded: 'Kuota AI habis. Silakan coba lagi nanti.',
      failedPdf: 'Gagal membuat PDF',
      failedDocx: 'Gagal membuat DOCX',
      failedText: 'Gagal mengekspor teks',
    },

    language: {
      english: 'English',
      indonesian: 'Indonesian',
    },

    privacy: {
      message: 'Data kamu tersimpan di browser masing-masing — tidak ada yang dikirim ke server manapun. CV kamu sepenuhnya pribadi dan aman.',
      dismiss: 'Mengerti',
    },
  },
};

/**
 * Returns the translation string for the given language.
 * Supports simple template interpolation: t('validation.minLength', { min: 2 })
 * replaces {min} with 2 in the resulting string.
 */
export function t(
  key: string,
  lang: Language = 'EN',
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[lang];

  for (const k of keys) {
    if (value == null || typeof value !== 'object') {
      // Fall back to EN if key not found in requested language
      value = translations['EN'];
      for (const fk of keys) {
        if (value == null || typeof value !== 'object') return key;
        value = value[fk];
      }
      break;
    }
    value = value[k];
  }

  if (typeof value !== 'string') return key;

  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, p) =>
      params[p] !== undefined ? String(params[p]) : `{${p}}`
    );
  }

  return value;
}
