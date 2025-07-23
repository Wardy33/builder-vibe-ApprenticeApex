import mongoose, { Document, Schema } from "mongoose";

export interface IApprenticeship extends Document {
  _id: string;
  companyId: string;
  jobTitle: string;
  description: string;
  industry: string;
  location: {
    city: string;
    address: string;
    postcode: string;
    coordinates: [number, number];
  };
  requirements: string[];
  responsibilities: string[];
  duration: {
    years: number;
    months: number;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  workType: "full-time" | "part-time" | "both";
  drivingLicenseRequired: boolean;
  accessibilitySupport: boolean;
  skills: string[];
  benefits: string[];
  applicationDeadline?: Date;
  startDate?: Date;
  isActive: boolean;
  thumbnailImage?: string;
  applicationCount: number;
  viewCount: number;
  swipeStats: {
    totalSwipes: number;
    rightSwipes: number;
    leftSwipes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const apprenticeshipSchema = new Schema<IApprenticeship>(
  {
    companyId: {
      type: String,
      required: true,
      ref: "User",
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    industry: {
      type: String,
      required: true,
      enum: [
        "Technology",
        "Healthcare",
        "Finance",
        "Engineering",
        "Marketing",
        "Education",
        "Manufacturing",
        "Retail",
        "Construction",
        "Hospitality",
        "Other",
      ],
    },
    location: {
      city: { type: String, required: true },
      address: { type: String, required: true },
      postcode: { type: String, required: true },
      coordinates: {
        type: [Number],
        index: "2dsphere",
        required: true,
      },
    },
    requirements: [{ type: String, maxlength: 200 }],
    responsibilities: [{ type: String, maxlength: 200 }],
    duration: {
      years: { type: Number, required: true, min: 0, max: 5 },
      months: { type: Number, required: true, min: 0, max: 11 },
    },
    salary: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "GBP" },
    },
    workType: {
      type: String,
      enum: ["full-time", "part-time", "both"],
      required: true,
    },
    drivingLicenseRequired: {
      type: Boolean,
      default: false,
    },
    accessibilitySupport: {
      type: Boolean,
      default: false,
    },
    skills: [{ type: String }],
    benefits: [{ type: String }],
    applicationDeadline: { type: Date },
    startDate: { type: Date },
    isActive: { type: Boolean, default: true },
    thumbnailImage: { type: String },
    applicationCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    swipeStats: {
      totalSwipes: { type: Number, default: 0 },
      rightSwipes: { type: Number, default: 0 },
      leftSwipes: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
apprenticeshipSchema.index({ companyId: 1 });
apprenticeshipSchema.index({ industry: 1 });
apprenticeshipSchema.index({ isActive: 1 });
apprenticeshipSchema.index({ "location.coordinates": "2dsphere" });
apprenticeshipSchema.index({ createdAt: -1 });
apprenticeshipSchema.index({ applicationDeadline: 1 });

// Virtual for conversion rate
apprenticeshipSchema.virtual("conversionRate").get(function () {
  if (this.swipeStats.totalSwipes === 0) return 0;
  return (this.swipeStats.rightSwipes / this.swipeStats.totalSwipes) * 100;
});

export const Apprenticeship = mongoose.models.Apprenticeship || mongoose.model<IApprenticeship>(
  "Apprenticeship",
  apprenticeshipSchema,
);
