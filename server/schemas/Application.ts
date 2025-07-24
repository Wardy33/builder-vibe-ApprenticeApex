import mongoose, { Document, Schema, Model } from 'mongoose';
import { z } from 'zod';

// Zod validation schemas
export const applicationStatusSchema = z.enum([
  'draft', 'submitted', 'under_review', 'interview_scheduled', 'interview_completed',
  'assessment_pending', 'offer_pending', 'offer_made', 'offer_accepted', 
  'offer_declined', 'rejected', 'withdrawn', 'hired', 'unsuccessful'
]);

export const interviewTypeSchema = z.enum([
  'phone', 'video', 'in_person', 'group', 'panel', 'technical', 'assessment_center'
]);

// MongoDB Interfaces
export interface IApplication extends Document {
  _id: string;
  applicationId: string; // Unique reference number for external use
  
  // Core relationships
  userId: string; // Student/candidate ID
  apprenticeshipId: string; // Job posting ID
  companyId: string; // Company ID for quick lookup
  
  // Application data
  status: ApplicationStatus;
  submittedAt?: Date;
  lastStatusChange: Date;
  statusHistory: IStatusChange[];
  
  // Application content
  coverLetter?: string;
  customAnswers: ICustomAnswer[];
  attachments: IAttachment[];
  
  // Assessment and screening
  prescreeningAnswers?: IPrescreeningAnswer[];
  assessmentResults?: IAssessmentResult[];
  
  // Interview process
  interviews: IInterview[];
  nextInterviewDate?: Date;
  interviewFeedback?: IInterviewFeedback[];
  
  // Matching and scoring
  matchScore: number; // 0-100 compatibility score
  aiRecommendationScore?: number;
  skillsMatch: ISkillsMatch;
  locationCompatibility: number;
  salaryCompatibility: number;
  
  // Communication and timeline
  messages: string[]; // Message IDs
  lastContactDate?: Date;
  responseDeadline?: Date;
  
  // Source tracking
  applicationSource: 'direct' | 'swipe' | 'search' | 'recommendation' | 'referral';
  referralSource?: string;
  campaignSource?: string;
  
  // Privacy and consent
  consentToContact: boolean;
  consentToShare: boolean;
  gdprConsent: boolean;
  marketingConsent: boolean;
  
  // Employer feedback
  employerNotes?: string;
  employerRating?: number; // 1-5 rating of candidate
  employerTags?: string[];
  
  // System metadata
  isActive: boolean;
  isArchived: boolean;
  archivedAt?: Date;
  archivedReason?: string;
  
  // Compliance and verification
  backgroundCheckRequired: boolean;
  backgroundCheckStatus?: 'pending' | 'in_progress' | 'completed' | 'failed';
  backgroundCheckResults?: IBackgroundCheck;
  
  // Success metrics
  successMetrics?: {
    timeToHire?: number; // Days from application to hire
    interviewToOfferTime?: number;
    offerToAcceptanceTime?: number;
    dropOffStage?: string;
  };
  
  // Automated actions
  autoMatchEnabled: boolean;
  autoResponseEnabled: boolean;
  remindersSent: IReminderSent[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  updateStatus(newStatus: ApplicationStatus, reason?: string, userId?: string): Promise<void>;
  calculateMatchScore(): number;
  scheduleInterview(interviewData: Partial<IInterview>): Promise<void>;
  addNote(note: string, userId: string, isPublic?: boolean): Promise<void>;
  sendReminder(type: string): Promise<void>;
}

export type ApplicationStatus = 
  'draft' | 'submitted' | 'under_review' | 'interview_scheduled' | 'interview_completed' |
  'assessment_pending' | 'offer_pending' | 'offer_made' | 'offer_accepted' | 
  'offer_declined' | 'rejected' | 'withdrawn' | 'hired' | 'unsuccessful';

export interface IStatusChange {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy: string;
  reason?: string;
  automated: boolean;
  metadata?: Record<string, any>;
}

export interface ICustomAnswer {
  questionId: string;
  question: string;
  answer: string;
  questionType: 'text' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'file';
  isRequired: boolean;
  wordCount?: number;
}

export interface IAttachment {
  type: 'cv' | 'cover_letter' | 'portfolio' | 'certificate' | 'other';
  filename: string;
  originalName: string;
  url: string;
  cloudinaryId?: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  isVerified: boolean;
  virusScanStatus?: 'pending' | 'clean' | 'infected' | 'failed';
}

export interface IPrescreeningAnswer {
  questionId: string;
  question: string;
  answer: string | boolean | number;
  weight: number;
  isCorrect?: boolean;
  score?: number;
}

export interface IAssessmentResult {
  assessmentId: string;
  assessmentName: string;
  assessmentType: 'personality' | 'aptitude' | 'technical' | 'cognitive' | 'situational';
  score: number;
  maxScore: number;
  percentile?: number;
  completedAt: Date;
  timeSpent: number; // minutes
  results: Record<string, any>;
  interpretation?: string;
}

export interface IInterview {
  interviewId: string;
  type: 'phone' | 'video' | 'in_person' | 'group' | 'panel' | 'technical' | 'assessment_center';
  scheduledDate: Date;
  duration: number; // minutes
  location?: string;
  meetingLink?: string;
  interviewers: IInterviewer[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  notes?: string;
  feedback?: string;
  rating?: number; // 1-10
  outcome?: 'pass' | 'fail' | 'maybe';
  nextRound?: boolean;
}

export interface IInterviewer {
  name: string;
  email: string;
  role: string;
  isLead: boolean;
}

export interface IInterviewFeedback {
  interviewId: string;
  interviewerId: string;
  interviewerName: string;
  rating: number; // 1-10
  strengths: string[];
  improvements: string[];
  notes: string;
  recommendation: 'hire' | 'no_hire' | 'maybe';
  submittedAt: Date;
}

export interface ISkillsMatch {
  requiredSkillsMatched: string[];
  requiredSkillsMissing: string[];
  desirableSkillsMatched: string[];
  additionalSkills: string[];
  overallMatchPercentage: number;
  skillGaps: ISkillGap[];
}

export interface ISkillGap {
  skill: string;
  required: boolean;
  candidateLevel?: string;
  requiredLevel: string;
  gapSeverity: 'low' | 'medium' | 'high';
  trainingAvailable: boolean;
}

export interface IBackgroundCheck {
  provider: string;
  checkType: string[];
  status: 'clear' | 'flagged' | 'failed';
  completedAt: Date;
  results: Record<string, any>;
  expiryDate?: Date;
}

export interface IReminderSent {
  type: 'interview' | 'deadline' | 'follow_up' | 'assessment';
  sentAt: Date;
  method: 'email' | 'sms' | 'push';
  successful: boolean;
  responseDeadline?: Date;
}

// Mongoose Schemas
const statusChangeSchema = new Schema<IStatusChange>({
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['draft', 'submitted', 'under_review', 'interview_scheduled', 'interview_completed',
               'assessment_pending', 'offer_pending', 'offer_made', 'offer_accepted', 
               'offer_declined', 'rejected', 'withdrawn', 'hired', 'unsuccessful'],
      message: 'Invalid status'
    }
  },
  changedAt: {
    type: Date,
    required: [true, 'Change date is required'],
    default: Date.now
  },
  changedBy: {
    type: String,
    required: [true, 'Changed by is required']
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason must not exceed 500 characters']
  },
  automated: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, { _id: false });

const customAnswerSchema = new Schema<ICustomAnswer>({
  questionId: {
    type: String,
    required: [true, 'Question ID is required']
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [1000, 'Question must not exceed 1000 characters']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    maxlength: [5000, 'Answer must not exceed 5000 characters']
  },
  questionType: {
    type: String,
    required: [true, 'Question type is required'],
    enum: {
      values: ['text', 'textarea', 'select', 'multiselect', 'boolean', 'file'],
      message: 'Invalid question type'
    }
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  wordCount: {
    type: Number,
    min: [0, 'Word count must be positive']
  }
}, { _id: false });

const attachmentSchema = new Schema<IAttachment>({
  type: {
    type: String,
    required: [true, 'Attachment type is required'],
    enum: {
      values: ['cv', 'cover_letter', 'portfolio', 'certificate', 'other'],
      message: 'Invalid attachment type'
    }
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true,
    maxlength: [255, 'Filename must not exceed 255 characters']
  },
  originalName: {
    type: String,
    required: [true, 'Original name is required'],
    trim: true,
    maxlength: [255, 'Original name must not exceed 255 characters']
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid URL'
    }
  },
  cloudinaryId: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size must be positive'],
    max: [50 * 1024 * 1024, 'File size must not exceed 50MB']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true
  },
  uploadedAt: {
    type: Date,
    required: [true, 'Upload date is required'],
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  virusScanStatus: {
    type: String,
    enum: {
      values: ['pending', 'clean', 'infected', 'failed'],
      message: 'Invalid virus scan status'
    }
  }
}, { _id: false });

const prescreeningAnswerSchema = new Schema<IPrescreeningAnswer>({
  questionId: {
    type: String,
    required: [true, 'Question ID is required']
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [1000, 'Question must not exceed 1000 characters']
  },
  answer: {
    type: Schema.Types.Mixed,
    required: [true, 'Answer is required']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight must be positive'],
    max: [1, 'Weight must not exceed 1']
  },
  isCorrect: {
    type: Boolean
  },
  score: {
    type: Number,
    min: [0, 'Score must be positive'],
    max: [100, 'Score must not exceed 100']
  }
}, { _id: false });

const assessmentResultSchema = new Schema<IAssessmentResult>({
  assessmentId: {
    type: String,
    required: [true, 'Assessment ID is required']
  },
  assessmentName: {
    type: String,
    required: [true, 'Assessment name is required'],
    trim: true,
    maxlength: [200, 'Assessment name must not exceed 200 characters']
  },
  assessmentType: {
    type: String,
    required: [true, 'Assessment type is required'],
    enum: {
      values: ['personality', 'aptitude', 'technical', 'cognitive', 'situational'],
      message: 'Invalid assessment type'
    }
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score must be positive']
  },
  maxScore: {
    type: Number,
    required: [true, 'Max score is required'],
    min: [1, 'Max score must be at least 1']
  },
  percentile: {
    type: Number,
    min: [0, 'Percentile must be positive'],
    max: [100, 'Percentile must not exceed 100']
  },
  completedAt: {
    type: Date,
    required: [true, 'Completion date is required']
  },
  timeSpent: {
    type: Number,
    required: [true, 'Time spent is required'],
    min: [0, 'Time spent must be positive']
  },
  results: {
    type: Schema.Types.Mixed,
    required: [true, 'Results are required']
  },
  interpretation: {
    type: String,
    trim: true,
    maxlength: [2000, 'Interpretation must not exceed 2000 characters']
  }
}, { _id: false });

const interviewerSchema = new Schema<IInterviewer>({
  name: {
    type: String,
    required: [true, 'Interviewer name is required'],
    trim: true,
    maxlength: [100, 'Name must not exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Interviewer email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  role: {
    type: String,
    required: [true, 'Interviewer role is required'],
    trim: true,
    maxlength: [100, 'Role must not exceed 100 characters']
  },
  isLead: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const interviewSchema = new Schema<IInterview>({
  interviewId: {
    type: String,
    required: [true, 'Interview ID is required'],
    unique: true
  },
  type: {
    type: String,
    required: [true, 'Interview type is required'],
    enum: {
      values: ['phone', 'video', 'in_person', 'group', 'panel', 'technical', 'assessment_center'],
      message: 'Invalid interview type'
    }
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    validate: {
      validator: function(v: Date) {
        return v >= new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration must not exceed 8 hours']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location must not exceed 200 characters']
  },
  meetingLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Meeting link must be a valid URL'
    }
  },
  interviewers: {
    type: [interviewerSchema],
    validate: {
      validator: function(v: IInterviewer[]) {
        return v && v.length > 0;
      },
      message: 'At least one interviewer is required'
    }
  },
  status: {
    type: String,
    default: 'scheduled',
    enum: {
      values: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'],
      message: 'Invalid interview status'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes must not exceed 2000 characters']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [2000, 'Feedback must not exceed 2000 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating must not exceed 10']
  },
  outcome: {
    type: String,
    enum: {
      values: ['pass', 'fail', 'maybe'],
      message: 'Invalid interview outcome'
    }
  },
  nextRound: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const interviewFeedbackSchema = new Schema<IInterviewFeedback>({
  interviewId: {
    type: String,
    required: [true, 'Interview ID is required']
  },
  interviewerId: {
    type: String,
    required: [true, 'Interviewer ID is required']
  },
  interviewerName: {
    type: String,
    required: [true, 'Interviewer name is required'],
    trim: true,
    maxlength: [100, 'Name must not exceed 100 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating must not exceed 10']
  },
  strengths: [{
    type: String,
    trim: true,
    maxlength: [200, 'Strength must not exceed 200 characters']
  }],
  improvements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Improvement must not exceed 200 characters']
  }],
  notes: {
    type: String,
    required: [true, 'Notes are required'],
    trim: true,
    maxlength: [2000, 'Notes must not exceed 2000 characters']
  },
  recommendation: {
    type: String,
    required: [true, 'Recommendation is required'],
    enum: {
      values: ['hire', 'no_hire', 'maybe'],
      message: 'Invalid recommendation'
    }
  },
  submittedAt: {
    type: Date,
    required: [true, 'Submission date is required'],
    default: Date.now
  }
}, { _id: false });

const skillGapSchema = new Schema<ISkillGap>({
  skill: {
    type: String,
    required: [true, 'Skill is required'],
    trim: true,
    maxlength: [100, 'Skill must not exceed 100 characters']
  },
  required: {
    type: Boolean,
    default: false
  },
  candidateLevel: {
    type: String,
    trim: true,
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: 'Invalid candidate skill level'
    }
  },
  requiredLevel: {
    type: String,
    required: [true, 'Required level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: 'Invalid required skill level'
    }
  },
  gapSeverity: {
    type: String,
    required: [true, 'Gap severity is required'],
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Invalid gap severity'
    }
  },
  trainingAvailable: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const skillsMatchSchema = new Schema<ISkillsMatch>({
  requiredSkillsMatched: [{
    type: String,
    trim: true
  }],
  requiredSkillsMissing: [{
    type: String,
    trim: true
  }],
  desirableSkillsMatched: [{
    type: String,
    trim: true
  }],
  additionalSkills: [{
    type: String,
    trim: true
  }],
  overallMatchPercentage: {
    type: Number,
    required: [true, 'Overall match percentage is required'],
    min: [0, 'Match percentage must be positive'],
    max: [100, 'Match percentage must not exceed 100']
  },
  skillGaps: [skillGapSchema]
}, { _id: false });

const backgroundCheckSchema = new Schema<IBackgroundCheck>({
  provider: {
    type: String,
    required: [true, 'Provider is required'],
    trim: true,
    maxlength: [100, 'Provider must not exceed 100 characters']
  },
  checkType: [{
    type: String,
    trim: true,
    maxlength: [100, 'Check type must not exceed 100 characters']
  }],
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['clear', 'flagged', 'failed'],
      message: 'Invalid background check status'
    }
  },
  completedAt: {
    type: Date,
    required: [true, 'Completion date is required']
  },
  results: {
    type: Schema.Types.Mixed,
    required: [true, 'Results are required']
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(this: IBackgroundCheck, v: Date) {
        return !v || v > this.completedAt;
      },
      message: 'Expiry date must be after completion date'
    }
  }
}, { _id: false });

const reminderSentSchema = new Schema<IReminderSent>({
  type: {
    type: String,
    required: [true, 'Reminder type is required'],
    enum: {
      values: ['interview', 'deadline', 'follow_up', 'assessment'],
      message: 'Invalid reminder type'
    }
  },
  sentAt: {
    type: Date,
    required: [true, 'Sent date is required'],
    default: Date.now
  },
  method: {
    type: String,
    required: [true, 'Method is required'],
    enum: {
      values: ['email', 'sms', 'push'],
      message: 'Invalid reminder method'
    }
  },
  successful: {
    type: Boolean,
    default: true
  },
  responseDeadline: {
    type: Date,
    validate: {
      validator: function(this: IReminderSent, v: Date) {
        return !v || v > this.sentAt;
      },
      message: 'Response deadline must be after sent date'
    }
  }
}, { _id: false });

// Main Application Schema
const applicationSchema = new Schema<IApplication>({
  applicationId: {
    type: String,
    required: [true, 'Application ID is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  apprenticeshipId: {
    type: String,
    required: [true, 'Apprenticeship ID is required'],
    index: true
  },
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    index: true
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    default: 'draft',
    enum: {
      values: ['draft', 'submitted', 'under_review', 'interview_scheduled', 'interview_completed',
               'assessment_pending', 'offer_pending', 'offer_made', 'offer_accepted', 
               'offer_declined', 'rejected', 'withdrawn', 'hired', 'unsuccessful'],
      message: 'Invalid status'
    },
    index: true
  },
  submittedAt: {
    type: Date,
    index: true
  },
  lastStatusChange: {
    type: Date,
    required: [true, 'Last status change is required'],
    default: Date.now
  },
  statusHistory: {
    type: [statusChangeSchema],
    default: []
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [2000, 'Cover letter must not exceed 2000 characters']
  },
  customAnswers: [customAnswerSchema],
  attachments: [attachmentSchema],
  prescreeningAnswers: [prescreeningAnswerSchema],
  assessmentResults: [assessmentResultSchema],
  interviews: [interviewSchema],
  nextInterviewDate: {
    type: Date,
    index: true
  },
  interviewFeedback: [interviewFeedbackSchema],
  matchScore: {
    type: Number,
    required: [true, 'Match score is required'],
    min: [0, 'Match score must be positive'],
    max: [100, 'Match score must not exceed 100'],
    default: 0
  },
  aiRecommendationScore: {
    type: Number,
    min: [0, 'AI recommendation score must be positive'],
    max: [100, 'AI recommendation score must not exceed 100']
  },
  skillsMatch: {
    type: skillsMatchSchema,
    required: [true, 'Skills match is required']
  },
  locationCompatibility: {
    type: Number,
    required: [true, 'Location compatibility is required'],
    min: [0, 'Location compatibility must be positive'],
    max: [100, 'Location compatibility must not exceed 100'],
    default: 0
  },
  salaryCompatibility: {
    type: Number,
    required: [true, 'Salary compatibility is required'],
    min: [0, 'Salary compatibility must be positive'],
    max: [100, 'Salary compatibility must not exceed 100'],
    default: 0
  },
  messages: [{
    type: String
  }],
  lastContactDate: Date,
  responseDeadline: Date,
  applicationSource: {
    type: String,
    required: [true, 'Application source is required'],
    enum: {
      values: ['direct', 'swipe', 'search', 'recommendation', 'referral'],
      message: 'Invalid application source'
    },
    default: 'direct'
  },
  referralSource: {
    type: String,
    trim: true,
    maxlength: [200, 'Referral source must not exceed 200 characters']
  },
  campaignSource: {
    type: String,
    trim: true,
    maxlength: [200, 'Campaign source must not exceed 200 characters']
  },
  consentToContact: {
    type: Boolean,
    required: [true, 'Consent to contact is required'],
    default: true
  },
  consentToShare: {
    type: Boolean,
    default: false
  },
  gdprConsent: {
    type: Boolean,
    required: [true, 'GDPR consent is required'],
    default: true
  },
  marketingConsent: {
    type: Boolean,
    default: false
  },
  employerNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Employer notes must not exceed 2000 characters']
  },
  employerRating: {
    type: Number,
    min: [1, 'Employer rating must be at least 1'],
    max: [5, 'Employer rating must not exceed 5']
  },
  employerTags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag must not exceed 50 characters']
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: Date,
  archivedReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Archived reason must not exceed 500 characters']
  },
  backgroundCheckRequired: {
    type: Boolean,
    default: false
  },
  backgroundCheckStatus: {
    type: String,
    enum: {
      values: ['pending', 'in_progress', 'completed', 'failed'],
      message: 'Invalid background check status'
    }
  },
  backgroundCheckResults: backgroundCheckSchema,
  successMetrics: {
    timeToHire: {
      type: Number,
      min: [0, 'Time to hire must be positive']
    },
    interviewToOfferTime: {
      type: Number,
      min: [0, 'Interview to offer time must be positive']
    },
    offerToAcceptanceTime: {
      type: Number,
      min: [0, 'Offer to acceptance time must be positive']
    },
    dropOffStage: {
      type: String,
      trim: true,
      maxlength: [100, 'Drop off stage must not exceed 100 characters']
    }
  },
  autoMatchEnabled: {
    type: Boolean,
    default: true
  },
  autoResponseEnabled: {
    type: Boolean,
    default: false
  },
  remindersSent: [reminderSentSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ apprenticeshipId: 1, status: 1 });
applicationSchema.index({ status: 1, submittedAt: -1 });
applicationSchema.index({ matchScore: -1, status: 1 });
applicationSchema.index({ lastStatusChange: -1 });
applicationSchema.index({ nextInterviewDate: 1 });
applicationSchema.index({ isActive: 1, isArchived: 1 });

// Pre-save middleware
applicationSchema.pre('save', function(next) {
  // Generate application ID if not set
  if (!this.applicationId) {
    this.applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  // Update status history when status changes
  if (this.isModified('status')) {
    this.lastStatusChange = new Date();
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: 'system', // This should be set by the calling code
      automated: true
    } as IStatusChange);
  }
  
  // Set submitted date when status changes to submitted
  if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  
  next();
});

// Instance methods
applicationSchema.methods.updateStatus = async function(
  newStatus: ApplicationStatus, 
  reason?: string, 
  userId?: string
): Promise<void> {
  const statusChange: IStatusChange = {
    status: newStatus,
    changedAt: new Date(),
    changedBy: userId || 'system',
    reason,
    automated: !userId
  };
  
  this.status = newStatus;
  this.lastStatusChange = new Date();
  this.statusHistory.push(statusChange);
  
  await this.save();
};

applicationSchema.methods.calculateMatchScore = function(): number {
  // This would implement a sophisticated matching algorithm
  // For now, return a weighted average of different compatibility scores
  const weights = {
    skills: 0.4,
    location: 0.3,
    salary: 0.2,
    other: 0.1
  };
  
  const score = (this.skillsMatch.overallMatchPercentage * weights.skills) +
                (this.locationCompatibility * weights.location) +
                (this.salaryCompatibility * weights.salary) +
                (50 * weights.other); // Base score for other factors
  
  this.matchScore = Math.round(score);
  return this.matchScore;
};

applicationSchema.methods.scheduleInterview = async function(interviewData: Partial<IInterview>): Promise<void> {
  const interview: IInterview = {
    interviewId: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    type: interviewData.type || 'video',
    scheduledDate: interviewData.scheduledDate || new Date(),
    duration: interviewData.duration || 60,
    location: interviewData.location,
    meetingLink: interviewData.meetingLink,
    interviewers: interviewData.interviewers || [],
    status: 'scheduled'
  } as IInterview;
  
  this.interviews.push(interview);
  this.nextInterviewDate = interview.scheduledDate;
  await this.updateStatus('interview_scheduled', 'Interview scheduled');
};

applicationSchema.methods.addNote = async function(note: string, userId: string, isPublic: boolean = false): Promise<void> {
  if (!this.employerNotes) {
    this.employerNotes = '';
  }
  
  const timestamp = new Date().toISOString();
  const noteEntry = `[${timestamp}] ${userId}: ${note}${isPublic ? ' (Public)' : ''}`;
  
  this.employerNotes += (this.employerNotes ? '\n\n' : '') + noteEntry;
  await this.save({ validateBeforeSave: false });
};

applicationSchema.methods.sendReminder = async function(type: string): Promise<void> {
  const reminder: IReminderSent = {
    type: type as any,
    sentAt: new Date(),
    method: 'email',
    successful: true // This would be determined by actual sending logic
  };
  
  this.remindersSent.push(reminder);
  await this.save({ validateBeforeSave: false });
};

// Static methods
applicationSchema.statics.findByStatus = function(status: ApplicationStatus) {
  return this.find({ status, isActive: true });
};

applicationSchema.statics.findByCompany = function(companyId: string) {
  return this.find({ companyId, isActive: true });
};

applicationSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId, isActive: true });
};

// Export model
export const Application: Model<IApplication> = 
  mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);

// Validation helpers
export function validateApplicationCreation(data: any) {
  const schema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    apprenticeshipId: z.string().min(1, 'Apprenticeship ID is required'),
    companyId: z.string().min(1, 'Company ID is required'),
    coverLetter: z.string().max(2000, 'Cover letter must not exceed 2000 characters').optional(),
    consentToContact: z.boolean().default(true),
    gdprConsent: z.boolean().default(true),
    applicationSource: z.enum(['direct', 'swipe', 'search', 'recommendation', 'referral']).default('direct')
  });
  
  return schema.safeParse(data);
}

export function validateApplicationUpdate(data: any) {
  const schema = z.object({
    status: applicationStatusSchema.optional(),
    coverLetter: z.string().max(2000).optional(),
    employerNotes: z.string().max(2000).optional(),
    employerRating: z.number().min(1).max(5).optional(),
    employerTags: z.array(z.string().max(50)).optional()
  });
  
  return schema.safeParse(data);
}
