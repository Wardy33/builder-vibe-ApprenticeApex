import mongoose, { Document, Schema, Model } from 'mongoose';
import { z } from 'zod';

// Zod validation schemas
export const paymentStatusSchema = z.enum([
  'pending', 'processing', 'succeeded', 'failed', 'cancelled', 
  'refunded', 'partially_refunded', 'disputed', 'chargeback'
]);

export const subscriptionStatusSchema = z.enum([
  'active', 'cancelled', 'expired', 'trial', 'past_due', 
  'unpaid', 'paused', 'incomplete', 'incomplete_expired'
]);

export const planTypeSchema = z.enum([
  'basic', 'premium', 'enterprise', 'trial', 'custom'
]);

// MongoDB Interfaces
export interface IPayment extends Document {
  _id: string;
  paymentId: string; // Unique reference number
  
  // Core relationships
  userId: string;
  companyId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  
  // Stripe integration
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeCustomerId?: string;
  stripeInvoiceId?: string;
  
  // Payment details
  amount: number; // in smallest currency unit (pence for GBP)
  currency: string;
  description: string;
  status: PaymentStatus;
  
  // Payment method
  paymentMethodType: 'card' | 'bank_transfer' | 'direct_debit' | 'paypal' | 'apple_pay' | 'google_pay';
  paymentMethodDetails?: IPaymentMethodDetails;
  
  // Transaction type
  type: 'subscription' | 'one_time' | 'refund' | 'setup' | 'usage_based';
  billingPeriod?: 'monthly' | 'quarterly' | 'annually' | 'one_time';
  
  // Metadata and context
  metadata?: IPaymentMetadata;
  
  // Failure handling
  failureCode?: string;
  failureReason?: string;
  failureDetails?: string;
  retryAttempts: number;
  maxRetries: number;
  nextRetryAt?: Date;
  
  // Refunds and disputes
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  refundDetails?: IRefundDetails;
  disputeAmount?: number;
  disputeReason?: string;
  disputeStatus?: 'pending' | 'won' | 'lost' | 'warning_needs_response';
  disputeEvidence?: IDisputeEvidence;
  
  // Tax and compliance
  taxAmount?: number;
  taxRate?: number;
  taxRegion?: string;
  vatNumber?: string;
  invoiceRequired: boolean;
  
  // Processing timestamps
  processedAt?: Date;
  settledAt?: Date;
  refundedAt?: Date;
  
  // Webhook and notifications
  webhookDelivered: boolean;
  webhookAttempts: number;
  notificationsSent: INotificationSent[];
  
  // Security and fraud
  riskScore?: number;
  fraudCheckStatus?: 'pending' | 'passed' | 'failed' | 'review';
  fraudCheckDetails?: IFraudCheckDetails;
  
  // Customer communication
  receiptSent: boolean;
  receiptUrl?: string;
  customerNotified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  processRefund(amount?: number, reason?: string): Promise<void>;
  sendReceipt(): Promise<void>;
  calculateTax(): number;
  updateStripeStatus(stripeData: any): Promise<void>;
}

export interface ISubscription extends Document {
  _id: string;
  subscriptionId: string; // Unique reference number
  
  // Core relationships
  userId: string;
  companyId?: string;
  
  // Stripe integration
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  
  // Plan details
  plan: PlanType;
  planName: string;
  status: SubscriptionStatus;
  
  // Billing cycle
  billingPeriod: 'monthly' | 'quarterly' | 'annually';
  amount: number; // in smallest currency unit
  currency: string;
  
  // Trial information
  trialStart?: Date;
  trialEnd?: Date;
  trialDays?: number;
  
  // Current period
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  
  // Features and limits
  features: ISubscriptionFeatures;
  usage: IUsageTracking;
  
  // Payment history
  billingHistory: string[]; // Payment IDs
  nextBillingDate: Date;
  lastBillingDate?: Date;
  lastBillingAmount?: number;
  
  // Cancellation
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  cancelAtPeriodEnd: boolean;
  
  // Discounts and coupons
  discounts?: IDiscount[];
  promoCode?: string;
  
  // Metadata
  metadata?: ISubscriptionMetadata;
  
  // Compliance and tax
  taxExempt: boolean;
  taxIds?: ITaxId[];
  
  // Notifications and communication
  billingEmails: string[];
  invoiceDelivery: 'email' | 'postal' | 'both';
  
  // Analytics
  analytics: ISubscriptionAnalytics;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  calculateNextBilling(): Date;
  checkUsageLimits(): Promise<IUsageCheck>;
  cancel(reason?: string, immediately?: boolean): Promise<void>;
  upgradeDowngrade(newPlan: PlanType): Promise<void>;
  applyDiscount(discountCode: string): Promise<boolean>;
}

export interface IInvoice extends Document {
  _id: string;
  invoiceId: string; // Unique reference number
  invoiceNumber: string; // Human-readable invoice number
  
  // Core relationships
  userId: string;
  companyId?: string;
  subscriptionId?: string;
  paymentId?: string;
  
  // Stripe integration
  stripeInvoiceId?: string;
  
  // Invoice details
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  description: string;
  
  // Amounts
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  
  // Line items
  lineItems: IInvoiceLineItem[];
  
  // Dates
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  voidedAt?: Date;
  
  // Customer information
  billingAddress: IBillingAddress;
  customerInfo: ICustomerInfo;
  
  // Tax information
  taxRate: number;
  taxRegion: string;
  vatNumber?: string;
  taxExempt: boolean;
  
  // Payment terms
  paymentTerms: string;
  paymentMethods: string[];
  
  // Document URLs
  pdfUrl?: string;
  hostedInvoiceUrl?: string;
  
  // Collections
  attemptCount: number;
  nextPaymentAttempt?: Date;
  
  // Notes and references
  notes?: string;
  footer?: string;
  memo?: string;
  purchaseOrder?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  generatePDF(): Promise<string>;
  sendToCustomer(): Promise<void>;
  markAsPaid(amount: number, paymentDate?: Date): Promise<void>;
  void(reason?: string): Promise<void>;
}

// Supporting interfaces
export type PaymentStatus = 
  'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 
  'refunded' | 'partially_refunded' | 'disputed' | 'chargeback';

export type SubscriptionStatus = 
  'active' | 'cancelled' | 'expired' | 'trial' | 'past_due' | 
  'unpaid' | 'paused' | 'incomplete' | 'incomplete_expired';

export type PlanType = 'basic' | 'premium' | 'enterprise' | 'trial' | 'custom';

export interface IPaymentMethodDetails {
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  fingerprint?: string;
  country?: string;
  funding?: 'credit' | 'debit' | 'prepaid' | 'unknown';
  network?: string;
}

export interface IPaymentMetadata {
  plan?: string;
  billingPeriod?: string;
  jobListingId?: string;
  features?: string[];
  promoCode?: string;
  referralCode?: string;
  campaignId?: string;
  upgradeFromPlan?: string;
}

export interface IRefundDetails {
  refundId: string;
  stripeRefundId?: string;
  amount: number;
  reason: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  processedAt?: Date;
  settlementDate?: Date;
}

export interface IDisputeEvidence {
  accessActivityLog?: string;
  billingAddress?: string;
  cancellationPolicy?: string;
  cancellationPolicyDisclosure?: string;
  customerCommunication?: string;
  customerEmailAddress?: string;
  customerName?: string;
  customerPurchaseIp?: string;
  customerSignature?: string;
  duplicateChargeDocumentation?: string;
  duplicateChargeExplanation?: string;
  duplicateChargeId?: string;
  productDescription?: string;
  receipt?: string;
  refundPolicy?: string;
  refundPolicyDisclosure?: string;
  refundRefusalExplanation?: string;
  serviceDate?: string;
  serviceDocumentation?: string;
  shippingAddress?: string;
  shippingCarrier?: string;
  shippingDate?: string;
  shippingDocumentation?: string;
  shippingTrackingNumber?: string;
  uncategorizedFile?: string;
  uncategorizedText?: string;
}

export interface INotificationSent {
  type: 'receipt' | 'invoice' | 'payment_failed' | 'payment_succeeded' | 'refund' | 'dispute';
  method: 'email' | 'sms' | 'webhook';
  recipient: string;
  sentAt: Date;
  successful: boolean;
  errorMessage?: string;
}

export interface IFraudCheckDetails {
  provider: string;
  score: number;
  outcome: 'approve' | 'decline' | 'review';
  rules: string[];
  checks: {
    cvvCheck?: 'pass' | 'fail' | 'unavailable';
    addressCheck?: 'pass' | 'fail' | 'unavailable';
    zipCheck?: 'pass' | 'fail' | 'unavailable';
  };
}

export interface ISubscriptionFeatures {
  maxJobListings: number;
  maxApplications: number;
  maxUsers: number;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  bulkOperations: boolean;
  exportData: boolean;
  webhooks: boolean;
  sso: boolean;
  auditLogs: boolean;
}

export interface IUsageTracking {
  jobListings: {
    current: number;
    limit: number;
    resetDate: Date;
  };
  applications: {
    current: number;
    limit: number;
    resetDate: Date;
  };
  users: {
    current: number;
    limit: number;
  };
  apiCalls: {
    current: number;
    limit: number;
    resetDate: Date;
  };
  storage: {
    current: number; // in MB
    limit: number;
  };
}

export interface IUsageCheck {
  withinLimits: boolean;
  warnings: string[];
  exceeded: string[];
  recommendations?: string[];
}

export interface IDiscount {
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  currency?: string;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  appliedAt: Date;
  expiresAt?: Date;
  maxRedemptions?: number;
  timesRedeemed: number;
}

export interface ISubscriptionMetadata {
  source?: string;
  referralCode?: string;
  campaignId?: string;
  salesPersonId?: string;
  contractId?: string;
  customFields?: Record<string, any>;
}

export interface ITaxId {
  type: 'eu_vat' | 'gb_vat' | 'us_ein' | 'ca_bn' | 'au_abn' | 'in_gst';
  value: string;
  verified: boolean;
  verifiedAt?: Date;
}

export interface ISubscriptionAnalytics {
  activationDate?: Date;
  churnProbability?: number;
  lifetimeValue: number;
  monthlyRecurringRevenue: number;
  revenueToDate: number;
  engagementScore?: number;
  healthScore?: number;
  lastActivity?: Date;
  featureUsage?: Record<string, number>;
}

export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency: string;
  period?: {
    start: Date;
    end: Date;
  };
  prorated: boolean;
  metadata?: Record<string, any>;
}

export interface IBillingAddress {
  name: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ICustomerInfo {
  name: string;
  email: string;
  phone?: string;
  taxId?: string;
  vatNumber?: string;
}

// Mongoose Schemas
const paymentMethodDetailsSchema = new Schema<IPaymentMethodDetails>({
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand must not exceed 50 characters']
  },
  last4: {
    type: String,
    match: [/^\d{4}$/, 'Last4 must be 4 digits']
  },
  expMonth: {
    type: Number,
    min: [1, 'Expiry month must be between 1 and 12'],
    max: [12, 'Expiry month must be between 1 and 12']
  },
  expYear: {
    type: Number,
    min: [2020, 'Expiry year must be valid']
  },
  fingerprint: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    length: [2, 'Country must be 2 characters']
  },
  funding: {
    type: String,
    enum: {
      values: ['credit', 'debit', 'prepaid', 'unknown'],
      message: 'Invalid funding type'
    }
  },
  network: {
    type: String,
    trim: true,
    maxlength: [50, 'Network must not exceed 50 characters']
  }
}, { _id: false });

const refundDetailsSchema = new Schema<IRefundDetails>({
  refundId: {
    type: String,
    required: [true, 'Refund ID is required'],
    trim: true
  },
  stripeRefundId: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Refund amount is required'],
    min: [0, 'Refund amount must be positive']
  },
  reason: {
    type: String,
    required: [true, 'Refund reason is required'],
    trim: true,
    maxlength: [500, 'Refund reason must not exceed 500 characters']
  },
  status: {
    type: String,
    required: [true, 'Refund status is required'],
    enum: {
      values: ['pending', 'succeeded', 'failed', 'cancelled'],
      message: 'Invalid refund status'
    }
  },
  processedAt: Date,
  settlementDate: Date
}, { _id: false });

const notificationSentSchema = new Schema<INotificationSent>({
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: ['receipt', 'invoice', 'payment_failed', 'payment_succeeded', 'refund', 'dispute'],
      message: 'Invalid notification type'
    }
  },
  method: {
    type: String,
    required: [true, 'Notification method is required'],
    enum: {
      values: ['email', 'sms', 'webhook'],
      message: 'Invalid notification method'
    }
  },
  recipient: {
    type: String,
    required: [true, 'Recipient is required'],
    trim: true
  },
  sentAt: {
    type: Date,
    required: [true, 'Sent date is required'],
    default: Date.now
  },
  successful: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Error message must not exceed 500 characters']
  }
}, { _id: false });

const fraudCheckDetailsSchema = new Schema<IFraudCheckDetails>({
  provider: {
    type: String,
    required: [true, 'Fraud check provider is required'],
    trim: true,
    maxlength: [100, 'Provider must not exceed 100 characters']
  },
  score: {
    type: Number,
    required: [true, 'Fraud score is required'],
    min: [0, 'Fraud score must be positive'],
    max: [100, 'Fraud score must not exceed 100']
  },
  outcome: {
    type: String,
    required: [true, 'Fraud check outcome is required'],
    enum: {
      values: ['approve', 'decline', 'review'],
      message: 'Invalid fraud check outcome'
    }
  },
  rules: [{
    type: String,
    trim: true,
    maxlength: [200, 'Rule must not exceed 200 characters']
  }],
  checks: {
    cvvCheck: {
      type: String,
      enum: {
        values: ['pass', 'fail', 'unavailable'],
        message: 'Invalid CVV check result'
      }
    },
    addressCheck: {
      type: String,
      enum: {
        values: ['pass', 'fail', 'unavailable'],
        message: 'Invalid address check result'
      }
    },
    zipCheck: {
      type: String,
      enum: {
        values: ['pass', 'fail', 'unavailable'],
        message: 'Invalid zip check result'
      }
    }
  }
}, { _id: false });

const subscriptionFeaturesSchema = new Schema<ISubscriptionFeatures>({
  maxJobListings: {
    type: Number,
    required: [true, 'Max job listings is required'],
    min: [0, 'Max job listings must be positive']
  },
  maxApplications: {
    type: Number,
    required: [true, 'Max applications is required'],
    min: [0, 'Max applications must be positive']
  },
  maxUsers: {
    type: Number,
    required: [true, 'Max users is required'],
    min: [1, 'Max users must be at least 1']
  },
  advancedAnalytics: {
    type: Boolean,
    default: false
  },
  prioritySupport: {
    type: Boolean,
    default: false
  },
  customBranding: {
    type: Boolean,
    default: false
  },
  apiAccess: {
    type: Boolean,
    default: false
  },
  bulkOperations: {
    type: Boolean,
    default: false
  },
  exportData: {
    type: Boolean,
    default: false
  },
  webhooks: {
    type: Boolean,
    default: false
  },
  sso: {
    type: Boolean,
    default: false
  },
  auditLogs: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const usageTrackingSchema = new Schema<IUsageTracking>({
  jobListings: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current job listings must be positive']
    },
    limit: {
      type: Number,
      required: [true, 'Job listings limit is required'],
      min: [0, 'Job listings limit must be positive']
    },
    resetDate: {
      type: Date,
      required: [true, 'Job listings reset date is required']
    }
  },
  applications: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current applications must be positive']
    },
    limit: {
      type: Number,
      required: [true, 'Applications limit is required'],
      min: [0, 'Applications limit must be positive']
    },
    resetDate: {
      type: Date,
      required: [true, 'Applications reset date is required']
    }
  },
  users: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current users must be positive']
    },
    limit: {
      type: Number,
      required: [true, 'Users limit is required'],
      min: [1, 'Users limit must be at least 1']
    }
  },
  apiCalls: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current API calls must be positive']
    },
    limit: {
      type: Number,
      required: [true, 'API calls limit is required'],
      min: [0, 'API calls limit must be positive']
    },
    resetDate: {
      type: Date,
      required: [true, 'API calls reset date is required']
    }
  },
  storage: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current storage must be positive']
    },
    limit: {
      type: Number,
      required: [true, 'Storage limit is required'],
      min: [0, 'Storage limit must be positive']
    }
  }
}, { _id: false });

// Main Payment Schema
const paymentSchema = new Schema<IPayment>({
  paymentId: {
    type: String,
    required: [true, 'Payment ID is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  companyId: {
    type: String,
    index: true
  },
  subscriptionId: {
    type: String,
    index: true
  },
  invoiceId: {
    type: String,
    index: true
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  stripeChargeId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeCustomerId: {
    type: String,
    index: true
  },
  stripeInvoiceId: {
    type: String,
    unique: true,
    sparse: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    length: [3, 'Currency must be 3 characters'],
    default: 'GBP'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description must not exceed 500 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    default: 'pending',
    enum: {
      values: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 
               'refunded', 'partially_refunded', 'disputed', 'chargeback'],
      message: 'Invalid payment status'
    },
    index: true
  },
  paymentMethodType: {
    type: String,
    required: [true, 'Payment method type is required'],
    enum: {
      values: ['card', 'bank_transfer', 'direct_debit', 'paypal', 'apple_pay', 'google_pay'],
      message: 'Invalid payment method type'
    }
  },
  paymentMethodDetails: paymentMethodDetailsSchema,
  type: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: {
      values: ['subscription', 'one_time', 'refund', 'setup', 'usage_based'],
      message: 'Invalid payment type'
    }
  },
  billingPeriod: {
    type: String,
    enum: {
      values: ['monthly', 'quarterly', 'annually', 'one_time'],
      message: 'Invalid billing period'
    }
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  failureCode: {
    type: String,
    trim: true
  },
  failureReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Failure reason must not exceed 500 characters']
  },
  failureDetails: {
    type: String,
    trim: true,
    maxlength: [1000, 'Failure details must not exceed 1000 characters']
  },
  retryAttempts: {
    type: Number,
    default: 0,
    min: [0, 'Retry attempts must be positive']
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: [0, 'Max retries must be positive']
  },
  nextRetryAt: Date,
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount must be positive']
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Refund reason must not exceed 500 characters']
  },
  refundDetails: refundDetailsSchema,
  disputeAmount: {
    type: Number,
    min: [0, 'Dispute amount must be positive']
  },
  disputeReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Dispute reason must not exceed 500 characters']
  },
  disputeStatus: {
    type: String,
    enum: {
      values: ['pending', 'won', 'lost', 'warning_needs_response'],
      message: 'Invalid dispute status'
    }
  },
  disputeEvidence: {
    type: Schema.Types.Mixed
  },
  taxAmount: {
    type: Number,
    min: [0, 'Tax amount must be positive'],
    default: 0
  },
  taxRate: {
    type: Number,
    min: [0, 'Tax rate must be positive'],
    max: [1, 'Tax rate must not exceed 100%'],
    default: 0
  },
  taxRegion: {
    type: String,
    trim: true,
    maxlength: [100, 'Tax region must not exceed 100 characters']
  },
  vatNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'VAT number must not exceed 50 characters']
  },
  invoiceRequired: {
    type: Boolean,
    default: false
  },
  processedAt: Date,
  settledAt: Date,
  webhookDelivered: {
    type: Boolean,
    default: false
  },
  webhookAttempts: {
    type: Number,
    default: 0,
    min: [0, 'Webhook attempts must be positive']
  },
  notificationsSent: [notificationSentSchema],
  riskScore: {
    type: Number,
    min: [0, 'Risk score must be positive'],
    max: [100, 'Risk score must not exceed 100']
  },
  fraudCheckStatus: {
    type: String,
    enum: {
      values: ['pending', 'passed', 'failed', 'review'],
      message: 'Invalid fraud check status'
    }
  },
  fraudCheckDetails: fraudCheckDetailsSchema,
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Receipt URL must be a valid URL'
    }
  },
  customerNotified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for Payment
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ companyId: 1, status: 1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ type: 1, billingPeriod: 1 });

// Pre-save middleware for Payment
paymentSchema.pre('save', function(next) {
  // Generate payment ID if not set
  if (!this.paymentId) {
    this.paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  // Set processed date when status changes to succeeded
  if (this.isModified('status') && this.status === 'succeeded' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  next();
});

// Payment instance methods
paymentSchema.methods.processRefund = async function(amount?: number, reason?: string): Promise<void> {
  const refundAmount = amount || this.amount;
  const refund: IRefundDetails = {
    refundId: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    amount: refundAmount,
    reason: reason || 'Customer request',
    status: 'pending'
  };
  
  this.refundDetails = refund;
  this.refundAmount = refundAmount;
  this.refundReason = reason;
  this.status = refundAmount >= this.amount ? 'refunded' : 'partially_refunded';
  
  await this.save();
};

paymentSchema.methods.sendReceipt = async function(): Promise<void> {
  // This would integrate with email service
  this.receiptSent = true;
  this.customerNotified = true;
  
  const notification: INotificationSent = {
    type: 'receipt',
    method: 'email',
    recipient: 'customer@email.com', // This should come from user data
    sentAt: new Date(),
    successful: true
  };
  
  this.notificationsSent.push(notification);
  await this.save({ validateBeforeSave: false });
};

paymentSchema.methods.calculateTax = function(): number {
  return Math.round(this.amount * this.taxRate);
};

paymentSchema.methods.updateStripeStatus = async function(stripeData: any): Promise<void> {
  this.stripePaymentIntentId = stripeData.id;
  this.status = stripeData.status === 'succeeded' ? 'succeeded' : 'failed';
  
  if (stripeData.charges?.data?.[0]) {
    this.stripeChargeId = stripeData.charges.data[0].id;
    this.receiptUrl = stripeData.charges.data[0].receipt_url;
  }
  
  await this.save();
};

// Export Payment model
export const Payment: Model<IPayment> = 
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);

// Subscription Schema (simplified for this example)
const subscriptionSchema = new Schema<ISubscription>({
  subscriptionId: {
    type: String,
    required: [true, 'Subscription ID is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  companyId: {
    type: String,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  stripeCustomerId: {
    type: String,
    index: true
  },
  stripePriceId: String,
  stripeProductId: String,
  plan: {
    type: String,
    required: [true, 'Plan is required'],
    enum: {
      values: ['basic', 'premium', 'enterprise', 'trial', 'custom'],
      message: 'Invalid plan type'
    },
    default: 'basic'
  },
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [100, 'Plan name must not exceed 100 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    default: 'active',
    enum: {
      values: ['active', 'cancelled', 'expired', 'trial', 'past_due', 
               'unpaid', 'paused', 'incomplete', 'incomplete_expired'],
      message: 'Invalid subscription status'
    },
    index: true
  },
  billingPeriod: {
    type: String,
    required: [true, 'Billing period is required'],
    enum: {
      values: ['monthly', 'quarterly', 'annually'],
      message: 'Invalid billing period'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    length: [3, 'Currency must be 3 characters'],
    default: 'GBP'
  },
  trialStart: Date,
  trialEnd: Date,
  trialDays: {
    type: Number,
    min: [0, 'Trial days must be positive']
  },
  currentPeriodStart: {
    type: Date,
    required: [true, 'Current period start is required']
  },
  currentPeriodEnd: {
    type: Date,
    required: [true, 'Current period end is required']
  },
  features: {
    type: subscriptionFeaturesSchema,
    required: [true, 'Features are required']
  },
  usage: {
    type: usageTrackingSchema,
    required: [true, 'Usage tracking is required']
  },
  billingHistory: [{
    type: String
  }],
  nextBillingDate: {
    type: Date,
    required: [true, 'Next billing date is required'],
    index: true
  },
  lastBillingDate: Date,
  lastBillingAmount: {
    type: Number,
    min: [0, 'Last billing amount must be positive']
  },
  cancelledAt: Date,
  cancelledBy: String,
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason must not exceed 500 characters']
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  discounts: [{
    code: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount']
    },
    value: Number,
    currency: String,
    duration: {
      type: String,
      enum: ['once', 'repeating', 'forever']
    },
    durationInMonths: Number,
    appliedAt: Date,
    expiresAt: Date,
    maxRedemptions: Number,
    timesRedeemed: { type: Number, default: 0 }
  }],
  promoCode: {
    type: String,
    trim: true,
    maxlength: [50, 'Promo code must not exceed 50 characters']
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  taxExempt: {
    type: Boolean,
    default: false
  },
  taxIds: [{
    type: {
      type: String,
      enum: ['eu_vat', 'gb_vat', 'us_ein', 'ca_bn', 'au_abn', 'in_gst']
    },
    value: String,
    verified: { type: Boolean, default: false },
    verifiedAt: Date
  }],
  billingEmails: [{
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  }],
  invoiceDelivery: {
    type: String,
    enum: {
      values: ['email', 'postal', 'both'],
      message: 'Invalid invoice delivery method'
    },
    default: 'email'
  },
  analytics: {
    activationDate: Date,
    churnProbability: {
      type: Number,
      min: [0, 'Churn probability must be positive'],
      max: [1, 'Churn probability must not exceed 1']
    },
    lifetimeValue: {
      type: Number,
      default: 0,
      min: [0, 'Lifetime value must be positive']
    },
    monthlyRecurringRevenue: {
      type: Number,
      default: 0,
      min: [0, 'MRR must be positive']
    },
    revenueToDate: {
      type: Number,
      default: 0,
      min: [0, 'Revenue to date must be positive']
    },
    engagementScore: {
      type: Number,
      min: [0, 'Engagement score must be positive'],
      max: [100, 'Engagement score must not exceed 100']
    },
    healthScore: {
      type: Number,
      min: [0, 'Health score must be positive'],
      max: [100, 'Health score must not exceed 100']
    },
    lastActivity: Date,
    featureUsage: {
      type: Schema.Types.Mixed
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for Subscription
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { unique: true, sparse: true });
subscriptionSchema.index({ status: 1, nextBillingDate: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });

// Export Subscription model
export const Subscription: Model<ISubscription> = 
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', subscriptionSchema);

// Validation helpers
export function validatePaymentCreation(data: any) {
  const schema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    amount: z.number().min(0, 'Amount must be positive'),
    currency: z.string().length(3, 'Currency must be 3 characters').default('GBP'),
    description: z.string().min(1).max(500),
    type: z.enum(['subscription', 'one_time', 'refund', 'setup', 'usage_based']),
    paymentMethodType: z.enum(['card', 'bank_transfer', 'direct_debit', 'paypal', 'apple_pay', 'google_pay'])
  });
  
  return schema.safeParse(data);
}

export function validateSubscriptionCreation(data: any) {
  const schema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    plan: planTypeSchema,
    planName: z.string().min(1).max(100),
    billingPeriod: z.enum(['monthly', 'quarterly', 'annually']),
    amount: z.number().min(0, 'Amount must be positive'),
    currency: z.string().length(3).default('GBP'),
    currentPeriodStart: z.date(),
    currentPeriodEnd: z.date(),
    features: z.object({
      maxJobListings: z.number().min(0),
      maxApplications: z.number().min(0),
      maxUsers: z.number().min(1)
    }).passthrough()
  });
  
  return schema.safeParse(data);
}
