import mongoose, { Document, Schema, Model } from 'mongoose';
import { z } from 'zod';

// Zod validation schemas
export const salaryRangeSchema = z.object({
  min: z.number().min(0, 'Minimum salary must be positive'),
  max: z.number().min(0, 'Maximum salary must be positive'),
  currency: z.enum(['GBP', 'USD', 'EUR']).default('GBP')
}).refine(data => data.max >= data.min, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['max']
});

export const locationSchema = z.object({
  address: z.string().min(1, 'Address is required').max(200, 'Address must not exceed 200 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must not exceed 100 characters'),
  postcode: z.string().regex(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i, 'Invalid UK postcode format'),
  country: z.string().default('United Kingdom'),
  coordinates: z.array(z.number()).length(2, 'Coordinates must be [longitude, latitude]')
    .refine(coords => coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90, 
      'Invalid coordinates')
});

// MongoDB Interfaces
export interface IApprenticeship extends Document {
  _id: string;
  companyId: string;
  jobTitle: string;
  jobReference?: string;
  description: string;
  shortDescription?: string;
  industry: string;
  sector?: string;
  apprenticeshipLevel: 'Intermediate' | 'Advanced' | 'Higher' | 'Degree';
  qualificationTitle: string;
  qualificationLevel: number; // 2-7 (Level 2 to Level 7)
  
  location: IJobLocation;
  isRemote: boolean;
  hybridWorking?: {
    daysInOffice: number;
    flexibleArrangement: boolean;
  };
  
  requirements: IJobRequirements;
  skills: ISkillRequirement[];
  desirableSkills?: string[];
  
  duration: {
    years: number;
    months: number;
    totalMonths: number;
  };
  
  salary: ISalaryDetails;
  benefits: IBenefit[];
  
  workingHours: {
    hoursPerWeek: number;
    workingPattern: string;
    shiftWork: boolean;
    weekendWork: boolean;
  };
  
  trainingDetails: {
    provider: string;
    deliveryMethod: 'day-release' | 'block-release' | 'remote' | 'mixed';
    studyTime: string;
    qualificationOutcome: string;
  };
  
  applicationProcess: {
    applicationDeadline?: Date;
    startDate?: Date;
    interviewProcess: string[];
    assessmentMethods?: string[];
    applicationUrl?: string;
  };
  
  accessibility: {
    accessibilitySupport: boolean;
    accessibilityDetails?: string;
    wheelchairAccessible: boolean;
    assistiveTechnology: boolean;
  };
  
  // Engagement metrics
  applicationCount: number;
  viewCount: number;
  swipeStats: {
    totalSwipes: number;
    rightSwipes: number;
    leftSwipes: number;
    swipeToApplicationRate: number;
  };
  
  // Status and visibility
  status: 'draft' | 'active' | 'paused' | 'closed' | 'cancelled';
  isActive: boolean;
  isFeatured: boolean;
  isPremiumListing: boolean;
  
  // SEO and marketing
  seoKeywords?: string[];
  socialMediaPreview?: {
    title: string;
    description: string;
    imageUrl?: string;
  };
  
  // Moderation and compliance
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  complianceChecks: {
    apprenticeshipStandardCompliant: boolean;
    minimumWageCompliant: boolean;
    qualificationRecognised: boolean;
    providerApproved: boolean;
    lastChecked?: Date;
  };
  
  // Auto-matching
  autoMatchEnabled: boolean;
  matchCriteria?: {
    prioritizeLocalCandidates: boolean;
    requiredSkillsWeight: number;
    experienceWeight: number;
    educationWeight: number;
  };
  
  // Analytics and performance
  performance: {
    averageTimeToFill?: number;
    qualityScore: number;
    engagementRate: number;
    conversionRate: number;
  };
  
  // Contact and communication
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
    preferredContactMethod: 'email' | 'phone' | 'either';
  };
  
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastModifiedBy: string;
  
  // Instance methods
  calculateMatchScore(candidateProfile: any): number;
  updateEngagementMetrics(action: string): Promise<void>;
  checkComplianceStatus(): Promise<boolean>;
}

export interface IJobLocation {
  address: string;
  city: string;
  postcode: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  region?: string;
  travelRequired?: boolean;
  travelDetails?: string;
}

export interface IJobRequirements {
  minimumAge?: number;
  maximumAge?: number;
  educationLevel: string;
  previousExperience: 'none' | 'some' | 'experienced';
  experienceDetails?: string;
  drivingLicenseRequired: boolean;
  drivingLicenseType?: 'provisional' | 'full' | 'commercial';
  backgroundCheckRequired: boolean;
  rightToWorkRequired: boolean;
  healthRequirements?: string[];
  otherRequirements?: string[];
}

export interface ISkillRequirement {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
  yearsExperience?: number;
  certificationRequired?: boolean;
}

export interface ISalaryDetails {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'weekly' | 'monthly' | 'annually';
  probationarySalary?: number;
  salaryProgression?: {
    year1: number;
    year2?: number;
    year3?: number;
    qualified?: number;
  };
  bonusStructure?: string;
  overtimeRate?: number;
}

export interface IBenefit {
  type: string;
  description: string;
  value?: string;
  eligibilityPeriod?: string;
}

// Mongoose Schema
const jobLocationSchema = new Schema<IJobLocation>({
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
    maxlength: [100, 'City must not exceed 100 characters'],
    index: true
  },
  postcode: {
    type: String,
    required: [true, 'Postcode is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/, 'Invalid UK postcode format'],
    index: true
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
  },
  region: {
    type: String,
    trim: true,
    maxlength: [100, 'Region must not exceed 100 characters']
  },
  travelRequired: {
    type: Boolean,
    default: false
  },
  travelDetails: {
    type: String,
    trim: true,
    maxlength: [500, 'Travel details must not exceed 500 characters']
  }
}, { _id: false });

const jobRequirementsSchema = new Schema<IJobRequirements>({
  minimumAge: {
    type: Number,
    min: [16, 'Minimum age must be at least 16'],
    max: [65, 'Minimum age must not exceed 65']
  },
  maximumAge: {
    type: Number,
    min: [16, 'Maximum age must be at least 16'],
    max: [100, 'Maximum age must not exceed 100'],
    validate: {
      validator: function(this: IJobRequirements, v: number) {
        return !v || !this.minimumAge || v >= this.minimumAge;
      },
      message: 'Maximum age must be greater than minimum age'
    }
  },
  educationLevel: {
    type: String,
    required: [true, 'Education level is required'],
    trim: true,
    maxlength: [100, 'Education level must not exceed 100 characters']
  },
  previousExperience: {
    type: String,
    required: [true, 'Previous experience requirement is required'],
    enum: {
      values: ['none', 'some', 'experienced'],
      message: 'Invalid experience level'
    }
  },
  experienceDetails: {
    type: String,
    trim: true,
    maxlength: [1000, 'Experience details must not exceed 1000 characters']
  },
  drivingLicenseRequired: {
    type: Boolean,
    default: false
  },
  drivingLicenseType: {
    type: String,
    enum: {
      values: ['provisional', 'full', 'commercial'],
      message: 'Invalid driving license type'
    },
    validate: {
      validator: function(this: IJobRequirements, v: string) {
        return !v || this.drivingLicenseRequired;
      },
      message: 'Driving license type can only be set if license is required'
    }
  },
  backgroundCheckRequired: {
    type: Boolean,
    default: false
  },
  rightToWorkRequired: {
    type: Boolean,
    default: true
  },
  healthRequirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Health requirement must not exceed 200 characters']
  }],
  otherRequirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Requirement must not exceed 200 characters']
  }]
}, { _id: false });

const skillRequirementSchema = new Schema<ISkillRequirement>({
  skill: {
    type: String,
    required: [true, 'Skill is required'],
    trim: true,
    maxlength: [100, 'Skill must not exceed 100 characters']
  },
  level: {
    type: String,
    required: [true, 'Skill level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: 'Invalid skill level'
    }
  },
  required: {
    type: Boolean,
    default: false
  },
  yearsExperience: {
    type: Number,
    min: [0, 'Years experience must be positive'],
    max: [50, 'Years experience must not exceed 50']
  },
  certificationRequired: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const salaryDetailsSchema = new Schema<ISalaryDetails>({
  min: {
    type: Number,
    required: [true, 'Minimum salary is required'],
    min: [0, 'Minimum salary must be positive']
  },
  max: {
    type: Number,
    required: [true, 'Maximum salary is required'],
    min: [0, 'Maximum salary must be positive'],
    validate: {
      validator: function(this: ISalaryDetails, v: number) {
        return v >= this.min;
      },
      message: 'Maximum salary must be greater than or equal to minimum salary'
    }
  },
  currency: {
    type: String,
    default: 'GBP',
    enum: {
      values: ['GBP', 'USD', 'EUR'],
      message: 'Invalid currency'
    }
  },
  period: {
    type: String,
    required: [true, 'Salary period is required'],
    enum: {
      values: ['hourly', 'weekly', 'monthly', 'annually'],
      message: 'Invalid salary period'
    }
  },
  probationarySalary: {
    type: Number,
    min: [0, 'Probationary salary must be positive']
  },
  salaryProgression: {
    year1: {
      type: Number,
      min: [0, 'Year 1 salary must be positive']
    },
    year2: {
      type: Number,
      min: [0, 'Year 2 salary must be positive']
    },
    year3: {
      type: Number,
      min: [0, 'Year 3 salary must be positive']
    },
    qualified: {
      type: Number,
      min: [0, 'Qualified salary must be positive']
    }
  },
  bonusStructure: {
    type: String,
    trim: true,
    maxlength: [500, 'Bonus structure must not exceed 500 characters']
  },
  overtimeRate: {
    type: Number,
    min: [0, 'Overtime rate must be positive']
  }
}, { _id: false });

const benefitSchema = new Schema<IBenefit>({
  type: {
    type: String,
    required: [true, 'Benefit type is required'],
    trim: true,
    maxlength: [100, 'Benefit type must not exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Benefit description is required'],
    trim: true,
    maxlength: [500, 'Benefit description must not exceed 500 characters']
  },
  value: {
    type: String,
    trim: true,
    maxlength: [100, 'Benefit value must not exceed 100 characters']
  },
  eligibilityPeriod: {
    type: String,
    trim: true,
    maxlength: [100, 'Eligibility period must not exceed 100 characters']
  }
}, { _id: false });

// Main Apprenticeship Schema
const apprenticeshipSchema = new Schema<IApprenticeship>({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    index: true
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [3, 'Job title must be at least 3 characters'],
    maxlength: [200, 'Job title must not exceed 200 characters'],
    index: 'text'
  },
  jobReference: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: [50, 'Job reference must not exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    minlength: [100, 'Description must be at least 100 characters'],
    maxlength: [5000, 'Description must not exceed 5000 characters'],
    index: 'text'
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description must not exceed 500 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    maxlength: [100, 'Industry must not exceed 100 characters'],
    index: true
  },
  sector: {
    type: String,
    trim: true,
    maxlength: [100, 'Sector must not exceed 100 characters']
  },
  apprenticeshipLevel: {
    type: String,
    required: [true, 'Apprenticeship level is required'],
    enum: {
      values: ['Intermediate', 'Advanced', 'Higher', 'Degree'],
      message: 'Invalid apprenticeship level'
    },
    index: true
  },
  qualificationTitle: {
    type: String,
    required: [true, 'Qualification title is required'],
    trim: true,
    maxlength: [200, 'Qualification title must not exceed 200 characters']
  },
  qualificationLevel: {
    type: Number,
    required: [true, 'Qualification level is required'],
    min: [2, 'Qualification level must be at least 2'],
    max: [7, 'Qualification level must not exceed 7'],
    index: true
  },
  location: {
    type: jobLocationSchema,
    required: [true, 'Location is required']
  },
  isRemote: {
    type: Boolean,
    default: false,
    index: true
  },
  hybridWorking: {
    daysInOffice: {
      type: Number,
      min: [0, 'Days in office must be positive'],
      max: [7, 'Days in office must not exceed 7']
    },
    flexibleArrangement: {
      type: Boolean,
      default: false
    }
  },
  requirements: {
    type: jobRequirementsSchema,
    required: [true, 'Requirements are required']
  },
  skills: [skillRequirementSchema],
  desirableSkills: [{
    type: String,
    trim: true,
    maxlength: [100, 'Skill must not exceed 100 characters']
  }],
  duration: {
    years: {
      type: Number,
      required: [true, 'Duration years is required'],
      min: [0, 'Duration years must be positive'],
      max: [10, 'Duration years must not exceed 10']
    },
    months: {
      type: Number,
      required: [true, 'Duration months is required'],
      min: [0, 'Duration months must be positive'],
      max: [11, 'Duration months must not exceed 11']
    },
    totalMonths: {
      type: Number,
      required: [true, 'Total duration months is required'],
      min: [1, 'Total duration must be at least 1 month'],
      max: [120, 'Total duration must not exceed 120 months']
    }
  },
  salary: {
    type: salaryDetailsSchema,
    required: [true, 'Salary details are required']
  },
  benefits: [benefitSchema],
  workingHours: {
    hoursPerWeek: {
      type: Number,
      required: [true, 'Hours per week is required'],
      min: [1, 'Hours per week must be at least 1'],
      max: [48, 'Hours per week must not exceed 48']
    },
    workingPattern: {
      type: String,
      required: [true, 'Working pattern is required'],
      trim: true,
      maxlength: [200, 'Working pattern must not exceed 200 characters']
    },
    shiftWork: {
      type: Boolean,
      default: false
    },
    weekendWork: {
      type: Boolean,
      default: false
    }
  },
  trainingDetails: {
    provider: {
      type: String,
      required: [true, 'Training provider is required'],
      trim: true,
      maxlength: [200, 'Training provider must not exceed 200 characters']
    },
    deliveryMethod: {
      type: String,
      required: [true, 'Delivery method is required'],
      enum: {
        values: ['day-release', 'block-release', 'remote', 'mixed'],
        message: 'Invalid delivery method'
      }
    },
    studyTime: {
      type: String,
      required: [true, 'Study time is required'],
      trim: true,
      maxlength: [200, 'Study time must not exceed 200 characters']
    },
    qualificationOutcome: {
      type: String,
      required: [true, 'Qualification outcome is required'],
      trim: true,
      maxlength: [500, 'Qualification outcome must not exceed 500 characters']
    }
  },
  applicationProcess: {
    applicationDeadline: Date,
    startDate: Date,
    interviewProcess: [{
      type: String,
      trim: true,
      maxlength: [200, 'Interview process step must not exceed 200 characters']
    }],
    assessmentMethods: [{
      type: String,
      trim: true,
      maxlength: [200, 'Assessment method must not exceed 200 characters']
    }],
    applicationUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Application URL must be a valid URL'
      }
    }
  },
  accessibility: {
    accessibilitySupport: {
      type: Boolean,
      default: true
    },
    accessibilityDetails: {
      type: String,
      trim: true,
      maxlength: [1000, 'Accessibility details must not exceed 1000 characters']
    },
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    assistiveTechnology: {
      type: Boolean,
      default: false
    }
  },
  // Engagement metrics
  applicationCount: {
    type: Number,
    default: 0,
    min: [0, 'Application count must be positive']
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count must be positive']
  },
  swipeStats: {
    totalSwipes: {
      type: Number,
      default: 0,
      min: [0, 'Total swipes must be positive']
    },
    rightSwipes: {
      type: Number,
      default: 0,
      min: [0, 'Right swipes must be positive']
    },
    leftSwipes: {
      type: Number,
      default: 0,
      min: [0, 'Left swipes must be positive']
    },
    swipeToApplicationRate: {
      type: Number,
      default: 0,
      min: [0, 'Swipe to application rate must be positive'],
      max: [1, 'Swipe to application rate must not exceed 1']
    }
  },
  status: {
    type: String,
    default: 'draft',
    enum: {
      values: ['draft', 'active', 'paused', 'closed', 'cancelled'],
      message: 'Invalid status'
    },
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isPremiumListing: {
    type: Boolean,
    default: false,
    index: true
  },
  seoKeywords: [{
    type: String,
    trim: true,
    maxlength: [100, 'SEO keyword must not exceed 100 characters']
  }],
  socialMediaPreview: {
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Social media title must not exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Social media description must not exceed 200 characters']
    },
    imageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Social media image URL must be a valid URL'
      }
    }
  },
  moderationStatus: {
    type: String,
    default: 'pending',
    enum: {
      values: ['pending', 'approved', 'rejected', 'flagged'],
      message: 'Invalid moderation status'
    },
    index: true
  },
  moderationNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Moderation notes must not exceed 1000 characters']
  },
  complianceChecks: {
    apprenticeshipStandardCompliant: {
      type: Boolean,
      default: false
    },
    minimumWageCompliant: {
      type: Boolean,
      default: false
    },
    qualificationRecognised: {
      type: Boolean,
      default: false
    },
    providerApproved: {
      type: Boolean,
      default: false
    },
    lastChecked: Date
  },
  autoMatchEnabled: {
    type: Boolean,
    default: true
  },
  matchCriteria: {
    prioritizeLocalCandidates: {
      type: Boolean,
      default: true
    },
    requiredSkillsWeight: {
      type: Number,
      default: 0.4,
      min: [0, 'Weight must be positive'],
      max: [1, 'Weight must not exceed 1']
    },
    experienceWeight: {
      type: Number,
      default: 0.3,
      min: [0, 'Weight must be positive'],
      max: [1, 'Weight must not exceed 1']
    },
    educationWeight: {
      type: Number,
      default: 0.3,
      min: [0, 'Weight must be positive'],
      max: [1, 'Weight must not exceed 1']
    }
  },
  performance: {
    averageTimeToFill: {
      type: Number,
      min: [0, 'Average time to fill must be positive']
    },
    qualityScore: {
      type: Number,
      default: 0,
      min: [0, 'Quality score must be positive'],
      max: [100, 'Quality score must not exceed 100']
    },
    engagementRate: {
      type: Number,
      default: 0,
      min: [0, 'Engagement rate must be positive'],
      max: [1, 'Engagement rate must not exceed 1']
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: [0, 'Conversion rate must be positive'],
      max: [1, 'Conversion rate must not exceed 1']
    }
  },
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
      maxlength: [100, 'Contact name must not exceed 100 characters']
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
    },
    preferredContactMethod: {
      type: String,
      default: 'email',
      enum: {
        values: ['email', 'phone', 'either'],
        message: 'Invalid contact method'
      }
    }
  },
  publishedAt: Date,
  lastModifiedBy: {
    type: String,
    required: [true, 'Last modified by is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
apprenticeshipSchema.index({ companyId: 1, status: 1 });
apprenticeshipSchema.index({ industry: 1, apprenticeshipLevel: 1 });
apprenticeshipSchema.index({ 'location.coordinates': '2dsphere' });
apprenticeshipSchema.index({ 'location.city': 1, isActive: 1 });
apprenticeshipSchema.index({ 'salary.min': 1, 'salary.max': 1 });
apprenticeshipSchema.index({ qualificationLevel: 1, isActive: 1 });
apprenticeshipSchema.index({ createdAt: -1 });
apprenticeshipSchema.index({ isFeatured: 1, publishedAt: -1 });
apprenticeshipSchema.index({ moderationStatus: 1 });

// Text search index
apprenticeshipSchema.index({
  jobTitle: 'text',
  description: 'text',
  'skills.skill': 'text',
  industry: 'text'
}, {
  weights: {
    jobTitle: 10,
    'skills.skill': 5,
    industry: 3,
    description: 1
  }
});

// Pre-save middleware
apprenticeshipSchema.pre('save', function(next) {
  // Calculate total months
  if (this.isModified('duration')) {
    this.duration.totalMonths = this.duration.years * 12 + this.duration.months;
  }
  
  // Update swipe to application rate
  if (this.isModified('swipeStats') || this.isModified('applicationCount')) {
    if (this.swipeStats.rightSwipes > 0) {
      this.swipeStats.swipeToApplicationRate = this.applicationCount / this.swipeStats.rightSwipes;
    }
  }
  
  // Set published date when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Instance methods
apprenticeshipSchema.methods.calculateMatchScore = function(candidateProfile: any): number {
  let score = 0;
  const weights = this.matchCriteria || {
    requiredSkillsWeight: 0.4,
    experienceWeight: 0.3,
    educationWeight: 0.3
  };
  
  // Skill matching
  const requiredSkills = this.skills.filter((s: ISkillRequirement) => s.required).map((s: ISkillRequirement) => s.skill.toLowerCase());
  const candidateSkills = (candidateProfile.skills || []).map((s: string) => s.toLowerCase());
  const skillMatches = requiredSkills.filter((skill: string) => candidateSkills.includes(skill));
  const skillScore = requiredSkills.length > 0 ? skillMatches.length / requiredSkills.length : 0;
  
  // Experience matching
  const experienceScore = candidateProfile.experience?.length > 0 ? 0.8 : 0.3;
  
  // Education matching
  const educationScore = candidateProfile.education?.length > 0 ? 0.8 : 0.5;
  
  score = (skillScore * weights.requiredSkillsWeight) + 
          (experienceScore * weights.experienceWeight) + 
          (educationScore * weights.educationWeight);
  
  return Math.round(score * 100);
};

apprenticeshipSchema.methods.updateEngagementMetrics = async function(action: string): Promise<void> {
  switch (action) {
    case 'view':
      this.viewCount += 1;
      break;
    case 'swipe_right':
      this.swipeStats.totalSwipes += 1;
      this.swipeStats.rightSwipes += 1;
      break;
    case 'swipe_left':
      this.swipeStats.totalSwipes += 1;
      this.swipeStats.leftSwipes += 1;
      break;
    case 'apply':
      this.applicationCount += 1;
      break;
  }
  
  // Calculate engagement rate
  if (this.viewCount > 0) {
    this.performance.engagementRate = this.swipeStats.totalSwipes / this.viewCount;
  }
  
  // Calculate conversion rate
  if (this.swipeStats.rightSwipes > 0) {
    this.performance.conversionRate = this.applicationCount / this.swipeStats.rightSwipes;
    this.swipeStats.swipeToApplicationRate = this.performance.conversionRate;
  }
  
  await this.save({ validateBeforeSave: false });
};

apprenticeshipSchema.methods.checkComplianceStatus = async function(): Promise<boolean> {
  // This would integrate with external compliance checking services
  // For now, return a basic check
  const isCompliant = this.complianceChecks.apprenticeshipStandardCompliant &&
                     this.complianceChecks.minimumWageCompliant &&
                     this.complianceChecks.qualificationRecognised &&
                     this.complianceChecks.providerApproved;
  
  this.complianceChecks.lastChecked = new Date();
  await this.save({ validateBeforeSave: false });
  
  return isCompliant;
};

// Static methods
apprenticeshipSchema.statics.findActiveJobs = function() {
  return this.find({ status: 'active', isActive: true, moderationStatus: 'approved' });
};

apprenticeshipSchema.statics.findJobsByLocation = function(coordinates: [number, number], maxDistance: number = 25) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: maxDistance * 1609.34 // Convert miles to meters
      }
    },
    status: 'active',
    isActive: true
  });
};

// Export model
export const Apprenticeship: Model<IApprenticeship> = 
  mongoose.models.Apprenticeship || mongoose.model<IApprenticeship>('Apprenticeship', apprenticeshipSchema);

// Validation helpers
export function validateApprenticeshipCreation(data: any) {
  const schema = z.object({
    jobTitle: z.string().min(3).max(200),
    description: z.string().min(100).max(5000),
    industry: z.string().min(1).max(100),
    apprenticeshipLevel: z.enum(['Intermediate', 'Advanced', 'Higher', 'Degree']),
    qualificationTitle: z.string().min(1).max(200),
    qualificationLevel: z.number().min(2).max(7),
    location: locationSchema,
    salary: salaryRangeSchema.extend({
      period: z.enum(['hourly', 'weekly', 'monthly', 'annually'])
    }),
    duration: z.object({
      years: z.number().min(0).max(10),
      months: z.number().min(0).max(11)
    }),
    requirements: z.object({
      educationLevel: z.string().min(1),
      previousExperience: z.enum(['none', 'some', 'experienced']),
      drivingLicenseRequired: z.boolean()
    }).passthrough()
  });
  
  return schema.safeParse(data);
}

export function validateApprenticeshipUpdate(data: any) {
  const schema = z.object({
    jobTitle: z.string().min(3).max(200).optional(),
    description: z.string().min(100).max(5000).optional(),
    status: z.enum(['draft', 'active', 'paused', 'closed', 'cancelled']).optional(),
    salary: salaryRangeSchema.optional(),
    location: locationSchema.optional()
  }).passthrough();
  
  return schema.safeParse(data);
}
