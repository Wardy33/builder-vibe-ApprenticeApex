import mongoose, { Document, Schema } from "mongoose";

export interface IApplication extends Document {
  _id: string;
  studentId: string;
  apprenticeshipId: string;
  companyId: string;
  status:
    | "applied"
    | "viewed"
    | "shortlisted"
    | "interview_scheduled"
    | "rejected"
    | "accepted";
  coverLetter?: string;
  cvUrl?: string;
  aiMatchScore: number; // AI-calculated compatibility score (0-100)
  studentVideoUrl?: string;
  companyNotes?: string;
  interviewDetails?: {
    scheduledDate: Date;
    meetingUrl: string;
    interviewerNotes?: string;
    studentFeedback?: string;
  };
  swipeDirection: "right" | "left";
  appliedAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    studentId: {
      type: String,
      required: true,
      ref: "User",
    },
    apprenticeshipId: {
      type: String,
      required: true,
      ref: "Apprenticeship",
    },
    companyId: {
      type: String,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: [
        "applied",
        "viewed",
        "shortlisted",
        "interview_scheduled",
        "rejected",
        "accepted",
      ],
      default: "applied",
    },
    coverLetter: {
      type: String,
      maxlength: 1000,
    },
    cvUrl: { type: String },
    aiMatchScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    studentVideoUrl: { type: String },
    companyNotes: {
      type: String,
      maxlength: 500,
    },
    interviewDetails: {
      scheduledDate: { type: Date },
      meetingUrl: { type: String },
      interviewerNotes: { type: String },
      studentFeedback: { type: String },
    },
    swipeDirection: {
      type: String,
      enum: ["right", "left"],
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes are managed centrally in server/config/indexes.ts
// Note: studentId + apprenticeshipId unique constraint is preserved

export const Application = mongoose.models.Application || mongoose.model<IApplication>(
  "Application",
  applicationSchema,
);

// Message model for real-time chat
export interface IMessage extends Document {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageType: "text" | "file" | "video" | "image";
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  readAt?: Date;
  sentAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversationId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
    ref: "User",
  },
  receiverId: {
    type: String,
    required: true,
    ref: "User",
  },
  messageType: {
    type: String,
    enum: ["text", "file", "video", "image"],
    default: "text",
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: { type: Date },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes are managed centrally in server/config/indexes.ts

export const Message = mongoose.model<IMessage>("Message", messageSchema);

// Conversation model
export interface IConversation extends Document {
  _id: string;
  participants: string[];
  applicationId?: string;
  lastMessage?: {
    content: string;
    sentAt: Date;
    senderId: string;
  };
  unreadCount: {
    [userId: string]: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: String,
        ref: "User",
        required: true,
      },
    ],
    applicationId: {
      type: String,
      ref: "Application",
    },
    lastMessage: {
      content: { type: String },
      sentAt: { type: Date },
      senderId: { type: String },
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes are managed centrally in server/config/indexes.ts
// Note: participants unique constraint is preserved

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
