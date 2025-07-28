import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  role: "student" | "company";
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  profile: IStudentProfile | ICompanyProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  phone?: string;
  bio?: string;
  skills: string[];
  hasDriversLicense: boolean;
  assistedNeeds?: string;
  education: IEducation[];
  experience: IExperience[];
  videoProfile?: {
    url: string;
    cloudinaryId: string;
    thumbnail: string;
  };
  location: {
    city: string;
    postcode: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  preferences: {
    industries: string[];
    maxDistance: number; // in miles
    salaryRange: {
      min: number;
      max: number;
    };
  };
  workType: "full-time" | "part-time" | "both";
  transportModes: string[];
  cvUrl?: string;
  isActive: boolean;
}

export interface ICompanyProfile {
  companyName: string;
  industry: string;
  description: string;
  website?: string;
  logo?: string;
  location: {
    city: string;
    address: string;
    coordinates: [number, number];
  };
  contactPerson: {
    firstName: string;
    lastName: string;
    position: string;
    phone?: string;
  };
  isVerified: boolean;
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  isCurrently: boolean;
  grade?: string;
}

export interface IExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  isCurrently: boolean;
  description: string;
}

const educationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrently: { type: Boolean, default: false },
  grade: { type: String },
});

const experienceSchema = new Schema<IExperience>({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrently: { type: Boolean, default: false },
  description: { type: String, required: true },
});

const studentProfileSchema = new Schema<IStudentProfile>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  phone: { type: String },
  bio: { type: String, maxlength: 500 },
  skills: [{ type: String }],
  hasDriversLicense: { type: Boolean, default: false },
  assistedNeeds: { type: String, maxlength: 500 },
  education: [educationSchema],
  experience: [experienceSchema],
  videoProfile: {
    url: { type: String },
    cloudinaryId: { type: String },
    thumbnail: { type: String },
  },
  location: {
    city: { type: String, required: true },
    postcode: { type: String },
    coordinates: {
      type: [Number],
    },
  },
  preferences: {
    industries: [{ type: String }],
    maxDistance: { type: Number, default: 25 },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100000 },
    },
  },
  workType: {
    type: String,
    enum: ["full-time", "part-time", "both"],
    default: "both",
  },
  transportModes: [{ type: String }],
  cvUrl: { type: String },
  isActive: { type: Boolean, default: true },
});

const companyProfileSchema = new Schema<ICompanyProfile>({
  companyName: { type: String, required: true },
  industry: { type: String, required: true },
  description: { type: String, required: true },
  website: { type: String },
  logo: { type: String },
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      type: [Number],
    },
  },
  contactPerson: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    position: { type: String, required: true },
    phone: { type: String },
  },
  isVerified: { type: Boolean, default: false },
});

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "company"],
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    profile: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function (this: IUser, value: any) {
          if (this.role === "student") {
            return value && typeof value === "object" && "firstName" in value;
          } else if (this.role === "company") {
            return value && typeof value === "object" && "companyName" in value;
          }
          return false;
        },
        message: "Profile must match the user role",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes are managed centrally in server/config/indexes.ts

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Import bcrypt dynamically to avoid circular dependencies
    const bcrypt = await import('bcryptjs');
    const saltRounds = 12;
    this.password = await bcrypt.default.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
