import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  _id: string;
  userId: string;
  plan: "basic" | "premium" | "enterprise";
  status: "active" | "cancelled" | "expired" | "trial" | "past_due";
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  features: {
    maxJobListings: number;
    maxApplications: number;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
  billingHistory: string[]; // Payment IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  _id: string;
  userId: string;
  subscriptionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  amount: number; // in cents
  currency: string;
  status: "pending" | "succeeded" | "failed" | "cancelled" | "refunded";
  type: "subscription" | "one_time" | "refund";
  description: string;
  metadata?: {
    plan?: string;
    billingPeriod?: string;
    jobListingId?: string;
    features?: string[];
  };
  failureReason?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoice extends Document {
  _id: string;
  userId: string;
  subscriptionId: string;
  paymentId?: string;
  stripeInvoiceId?: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  dueDate: Date;
  paidAt?: Date;
  lineItems: {
    description: string;
    quantity: number;
    unitAmount: number;
    totalAmount: number;
  }[];
  tax?: {
    rate: number;
    amount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "trial", "past_due"],
      default: "trial",
    },
    stripeSubscriptionId: { type: String },
    stripeCustomerId: { type: String },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    trialEnd: { type: Date },
    features: {
      maxJobListings: { type: Number, required: true },
      maxApplications: { type: Number, required: true },
      advancedAnalytics: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
    },
    billingHistory: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: String,
      required: true,
    },
    subscriptionId: { type: String },
    stripePaymentIntentId: { type: String },
    stripeChargeId: { type: String },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "gbp",
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["subscription", "one_time", "refund"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      plan: { type: String },
      billingPeriod: { type: String },
      jobListingId: { type: String },
      features: [{ type: String }],
    },
    failureReason: { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
  },
  {
    timestamps: true,
  },
);

const invoiceSchema = new Schema<IInvoice>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    subscriptionId: {
      type: String,
      required: true,
      index: true,
    },
    paymentId: { type: String },
    stripeInvoiceId: { type: String, index: true },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "gbp",
    },
    status: {
      type: String,
      enum: ["draft", "open", "paid", "void", "uncollectible"],
      default: "draft",
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAt: { type: Date },
    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitAmount: { type: Number, required: true, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
      },
    ],
    tax: {
      rate: { type: Number, min: 0, max: 1 },
      amount: { type: Number, min: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
subscriptionSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
invoiceSchema.index({ userId: 1, status: 1 });

export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);
export const Payment = mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);
export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", invoiceSchema);
