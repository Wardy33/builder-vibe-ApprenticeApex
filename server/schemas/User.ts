import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Zod validation schemas for runtime validation
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must not exceed 254 characters')
  .toLowerCase()
  .trim();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .optional();

export const postcodeSchema = z.string()
  .regex(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i, 'Invalid UK postcode format')
  .transform(val => val.toUpperCase().trim());

// MongoDB Interfaces
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  role: 'student' | 'company' | 'admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  profile: IStudentProfile | ICompanyProfile;
  settings: IUserSettings;
  lastLoginAt?: Date;
  lastActivityAt: Date;
  isActive: boolean;
  deactivatedAt?: Date;
  deactivationReason?: string;

  // Stripe integration
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';
  subscriptionPlan?: 'professional' | 'business' | 'enterprise';
  trialStatus?: 'pending' | 'paid' | 'used';
  trialPaidAt?: Date;

  // Email management
  emailVerifiedAt?: Date;
  emailPreferences?: {
    applicationNotifications: boolean;
    paymentNotifications: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
    interviewReminders: boolean;
    unsubscribedAt?: Date;
    updatedAt?: Date;
  };
  unsubscribeToken?: string;

  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
  updateLastActivity(): Promise<void>;
}

export interface IStudentProfile {
  firstName: string;
  lastName: string;
  displayName?: string;
  dateOfBirth?: Date;
  phone?: string;
  bio?: string;
  skills: string[];
  hasDriversLicense: boolean;
  assistedNeeds?: string;
  education: IEducation[];
  experience: IExperience[];
  certifications: ICertification[];
  videoProfile?: {
    url: string;
    cloudinaryId: string;
    thumbnail: string;
    uploadedAt: Date;
  };
  profilePicture?: {
    url: string;
    cloudinaryId: string;
    uploadedAt: Date;
  };
  location: {
    city: string;
    postcode: string;
    coordinates: [number, number]; // [longitude, latitude]
    country: string;
  };
  preferences: {
    industries: string[];
    maxDistance: number; // in miles
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    workTypes: ('full-time' | 'part-time' | 'remote' | 'hybrid')[];
    startDate?: Date;
    willingToRelocate: boolean;
  };
  transportModes: string[];
  cvUrl?: string;
  portfolioUrl?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  availability: {
    startDate?: Date;
    noticePeriod?: string;
    flexibleStart: boolean;
  };
  profileCompleteness: number;
  isProfilePublic: boolean;
  seekingOpportunities: boolean;
}

export interface ICompanyProfile {
  companyName: string;
  legalName?: string;
  industry: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  description: string;
  website?: string;
  foundedYear?: number;
  logo?: {
    url: string;
    cloudinaryId: string;
    uploadedAt: Date;
  };
  location: {
    address: string;
    city: string;
    postcode: string;
    country: string;
    coordinates: [number, number];
  };
  contactPerson: {
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    phone?: string;
  };
  socialLinks?: {
    linkedin?: string;
    website?: string;
    twitter?: string;
  };
  companyValues?: string[];
  benefits?: string[];
  workCulture?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments?: {
    businessRegistration?: {
      url: string;
      cloudinaryId: string;
      uploadedAt: Date;
    };
    insuranceCertificate?: {
      url: string;
      cloudinaryId: string;
      uploadedAt: Date;
    };
  };
  complianceChecks: {
    hasPublicLiabilityInsurance: boolean;
    hasEmployersLiabilityInsurance: boolean;
    isRegisteredForApprenticeships: boolean;
    lastComplianceCheck?: Date;
  };
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  grade?: string;
  description?: string;
}

export interface IExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
  skills: string[];
  location?: string;
}

export interface ICertification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

export interface IUserSettings {
  notifications: {
    email: {
      jobMatches: boolean;
      applications: boolean;
      messages: boolean;
      marketing: boolean;
      systemUpdates: boolean;
    };
    push: {
      jobMatches: boolean;
      applications: boolean;
      messages: boolean;
    };
    sms: {
      urgent: boolean;
      interviews: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'recruiters-only';
    showContactInfo: boolean;
    allowDirectMessages: boolean;
    searchable: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

// Mongoose Schemas
const educationSchema = new Schema<IEducation>({
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true,
    maxlength: [200, 'Institution name must not exceed 200 characters']
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
    maxlength: [100, 'Degree must not exceed 100 characters']
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true,
    maxlength: [100, 'Field of study must not exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Start date cannot be in the future'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: IEducation, v: Date) {
        return !v || v >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  grade: {
    type: String,
    trim: true,
    maxlength: [20, 'Grade must not exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must not exceed 500 characters']
  }
}, { _id: false });

const experienceSchema = new Schema<IExperience>({
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
    maxlength: [200, 'Company name must not exceed 200 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position must not exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: IExperience, v: Date) {
        return !v || v >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description must not exceed 1000 characters']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill must not exceed 50 characters']
  }],
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location must not exceed 100 characters']
  }
}, { _id: false });

const certificationSchema = new Schema<ICertification>({
  name: {
    type: String,
    required: [true, 'Certification name is required'],
    trim: true,
    maxlength: [200, 'Certification name must not exceed 200 characters']
  },
  issuer: {
    type: String,
    required: [true, 'Issuer is required'],
    trim: true,
    maxlength: [200, 'Issuer must not exceed 200 characters']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required']
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(this: ICertification, v: Date) {
        return !v || v >= this.issueDate;
      },
      message: 'Expiry date must be after issue date'
    }
  },
  credentialId: {
    type: String,
    trim: true,
    maxlength: [100, 'Credential ID must not exceed 100 characters']
  },
  credentialUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Credential URL must be a valid URL'
    }
  }
}, { _id: false });

const studentProfileSchema = new Schema<IStudentProfile>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [1, 'First name must be at least 1 character'],
    maxlength: [50, 'First name must not exceed 50 characters'],
    match: [/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [1, 'Last name must be at least 1 character'],
    maxlength: [50, 'Last name must not exceed 50 characters'],
    match: [/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes']
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: [100, 'Display name must not exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        if (!v) return true;
        const age = Math.floor((Date.now() - v.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 16 && age <= 100;
      },
      message: 'Age must be between 16 and 100 years'
    }
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio must not exceed 1000 characters']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill must not exceed 50 characters']
  }],
  hasDriversLicense: {
    type: Boolean,
    default: false
  },
  assistedNeeds: {
    type: String,
    trim: true,
    maxlength: [500, 'Assisted needs description must not exceed 500 characters']
  },
  education: [educationSchema],
  experience: [experienceSchema],
  certifications: [certificationSchema],
  videoProfile: {
    url: String,
    cloudinaryId: String,
    thumbnail: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  profilePicture: {
    url: String,
    cloudinaryId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City must not exceed 100 characters']
    },
    postcode: {
      type: String,
      required: [true, 'Postcode is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/, 'Invalid UK postcode format']
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function(v: number[]) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates format'
      },
      index: '2dsphere'
    },
    country: {
      type: String,
      default: 'United Kingdom',
      trim: true
    }
  },
  preferences: {
    industries: [{
      type: String,
      trim: true,
      maxlength: [100, 'Industry must not exceed 100 characters']
    }],
    maxDistance: {
      type: Number,
      min: [0, 'Max distance must be positive'],
      max: [500, 'Max distance must not exceed 500 miles'],
      default: 25
    },
    salaryRange: {
      min: {
        type: Number,
        min: [0, 'Minimum salary must be positive'],
        required: [true, 'Minimum salary is required']
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary must be positive'],
        required: [true, 'Maximum salary is required'],
        validate: {
          validator: function(this: any, v: number) {
            return v >= this.min;
          },
          message: 'Maximum salary must be greater than or equal to minimum salary'
        }
      },
      currency: {
        type: String,
        default: 'GBP',
        enum: ['GBP', 'USD', 'EUR']
      }
    },
    workTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'hybrid']
    }],
    startDate: Date,
    willingToRelocate: {
      type: Boolean,
      default: false
    }
  },
  transportModes: [{
    type: String,
    trim: true,
    maxlength: [50, 'Transport mode must not exceed 50 characters']
  }],
  cvUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'CV URL must be a valid URL'
    }
  },
  portfolioUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Portfolio URL must be a valid URL'
    }
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
        },
        message: 'LinkedIn URL must be a valid LinkedIn profile URL'
      }
    },
    github: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?github\.com\/.+/.test(v);
        },
        message: 'GitHub URL must be a valid GitHub profile URL'
      }
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Website URL must be a valid URL'
      }
    }
  },
  availability: {
    startDate: Date,
    noticePeriod: {
      type: String,
      trim: true,
      maxlength: [100, 'Notice period must not exceed 100 characters']
    },
    flexibleStart: {
      type: Boolean,
      default: true
    }
  },
  profileCompleteness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isProfilePublic: {
    type: Boolean,
    default: true
  },
  seekingOpportunities: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const companyProfileSchema = new Schema<ICompanyProfile>({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters'],
    maxlength: [200, 'Company name must not exceed 200 characters']
  },
  legalName: {
    type: String,
    trim: true,
    maxlength: [200, 'Legal name must not exceed 200 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    maxlength: [100, 'Industry must not exceed 100 characters']
  },
  companySize: {
    type: String,
    required: [true, 'Company size is required'],
    enum: {
      values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      message: 'Invalid company size'
    }
  },
  description: {
    type: String,
    required: [true, 'Company description is required'],
    trim: true,
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [2000, 'Description must not exceed 2000 characters']
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  foundedYear: {
    type: Number,
    validate: {
      validator: function(v: number) {
        return !v || (v >= 1800 && v <= new Date().getFullYear());
      },
      message: 'Founded year must be between 1800 and current year'
    }
  },
  logo: {
    url: String,
    cloudinaryId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [200, 'Address must not exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City must not exceed 100 characters']
    },
    postcode: {
      type: String,
      required: [true, 'Postcode is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/, 'Invalid UK postcode format']
    },
    country: {
      type: String,
      default: 'United Kingdom',
      trim: true
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function(v: number[]) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates format'
      },
      index: '2dsphere'
    }
  },
  contactPerson: {
    firstName: {
      type: String,
      required: [true, 'Contact first name is required'],
      trim: true,
      maxlength: [50, 'First name must not exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Contact last name is required'],
      trim: true,
      maxlength: [50, 'Last name must not exceed 50 characters']
    },
    position: {
      type: String,
      required: [true, 'Contact position is required'],
      trim: true,
      maxlength: [100, 'Position must not exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    }
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
        },
        message: 'LinkedIn URL must be a valid LinkedIn company page URL'
      }
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Website URL must be a valid URL'
      }
    },
    twitter: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?twitter\.com\/.+/.test(v);
        },
        message: 'Twitter URL must be a valid Twitter profile URL'
      }
    }
  },
  companyValues: [{
    type: String,
    trim: true,
    maxlength: [100, 'Company value must not exceed 100 characters']
  }],
  benefits: [{
    type: String,
    trim: true,
    maxlength: [100, 'Benefit must not exceed 100 characters']
  }],
  workCulture: {
    type: String,
    trim: true,
    maxlength: [1000, 'Work culture description must not exceed 1000 characters']
  },
  verificationStatus: {
    type: String,
    default: 'pending',
    enum: {
      values: ['pending', 'verified', 'rejected'],
      message: 'Invalid verification status'
    }
  },
  verificationDocuments: {
    businessRegistration: {
      url: String,
      cloudinaryId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    },
    insuranceCertificate: {
      url: String,
      cloudinaryId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  complianceChecks: {
    hasPublicLiabilityInsurance: {
      type: Boolean,
      default: false
    },
    hasEmployersLiabilityInsurance: {
      type: Boolean,
      default: false
    },
    isRegisteredForApprenticeships: {
      type: Boolean,
      default: false
    },
    lastComplianceCheck: Date
  }
}, { _id: false });

const userSettingsSchema = new Schema<IUserSettings>({
  notifications: {
    email: {
      jobMatches: { type: Boolean, default: true },
      applications: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      systemUpdates: { type: Boolean, default: true }
    },
    push: {
      jobMatches: { type: Boolean, default: true },
      applications: { type: Boolean, default: true },
      messages: { type: Boolean, default: true }
    },
    sms: {
      urgent: { type: Boolean, default: false },
      interviews: { type: Boolean, default: false }
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      default: 'public',
      enum: ['public', 'private', 'recruiters-only']
    },
    showContactInfo: { type: Boolean, default: false },
    allowDirectMessages: { type: Boolean, default: true },
    searchable: { type: Boolean, default: true }
  },
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Europe/London' },
    currency: { type: String, default: 'GBP' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    }
  }
}, { _id: false });

// Main User Schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [5, 'Email must be at least 5 characters'],
    maxlength: [254, 'Email must not exceed 254 characters'],
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [128, 'Password must not exceed 128 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['student', 'company', 'admin'],
      message: 'Invalid role'
    },
    default: 'student',
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  emailVerificationToken: {
    type: String,
    sparse: true,
    index: { expireAfterSeconds: 3600 } // 1 hour
  },
  emailVerificationExpires: Date,
  passwordResetToken: {
    type: String,
    sparse: true,
    index: { expireAfterSeconds: 3600 } // 1 hour
  },
  passwordResetExpires: Date,
  profile: {
    type: Schema.Types.Mixed,
    validate: {
      validator: function(this: IUser, v: any) {
        if (this.role === 'student') {
          return v && typeof v === 'object' && 'firstName' in v && 'lastName' in v;
        } else if (this.role === 'company') {
          return v && typeof v === 'object' && 'companyName' in v;
        }
        return true;
      },
      message: 'Profile must match the user role'
    }
  },
  settings: {
    type: userSettingsSchema,
    default: () => ({})
  },
  lastLoginAt: Date,
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  deactivatedAt: Date,
  deactivationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Deactivation reason must not exceed 500 characters']
  },

  // Stripe integration fields
  stripeCustomerId: {
    type: String,
    sparse: true,
    index: true
  },
  subscriptionStatus: {
    type: String,
    enum: {
      values: ['active', 'cancelled', 'past_due', 'trialing', 'incomplete'],
      message: 'Invalid subscription status'
    },
    index: true
  },
  subscriptionPlan: {
    type: String,
    enum: {
      values: ['professional', 'business', 'enterprise'],
      message: 'Invalid subscription plan'
    }
  },
  trialStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'used'],
      message: 'Invalid trial status'
    }
  },
  trialPaidAt: {
    type: Date
  },

  // Email management fields
  emailVerifiedAt: {
    type: Date
  },
  emailPreferences: {
    applicationNotifications: {
      type: Boolean,
      default: true
    },
    paymentNotifications: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: true
    },
    interviewReminders: {
      type: Boolean,
      default: true
    },
    unsubscribedAt: {
      type: Date
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  unsubscribeToken: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ lastActivityAt: 1 });
userSchema.index({ 'profile.location.coordinates': '2dsphere' });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ 'profile.preferences.industries': 1 });
userSchema.index({ createdAt: 1 });

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function(): string {
  const token = Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
  this.emailVerificationToken = token;
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

userSchema.methods.generatePasswordResetToken = function(): string {
  const token = Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
  this.passwordResetToken = token;
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token;
};

userSchema.methods.updateLastActivity = async function(): Promise<void> {
  this.lastActivityAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Static methods
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findByRole = function(role: string) {
  return this.find({ role, isActive: true });
};

// Export model
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Validation helpers
export function validateUserRegistration(data: any) {
  const schema = z.object({
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(['student', 'company']),
    profile: z.object({}).passthrough() // Profile validation happens at schema level
  });
  
  return schema.safeParse(data);
}

export function validateUserUpdate(data: any) {
  const schema = z.object({
    email: emailSchema.optional(),
    profile: z.object({}).passthrough().optional(),
    settings: z.object({}).passthrough().optional()
  });
  
  return schema.safeParse(data);
}
