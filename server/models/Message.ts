import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  readAt?: Date;
  editedAt?: Date;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
    systemMessage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  _id: string;
  participants: string[]; // User IDs
  lastMessage?: string;
  lastMessageAt?: Date;
  isActive: boolean;
  metadata?: {
    applicationId?: string;
    interviewId?: string;
    jobTitle?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    readAt: { type: Date },
    editedAt: { type: Date },
    metadata: {
      fileName: { type: String },
      fileSize: { type: Number },
      imageUrl: { type: String },
      systemMessage: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    isActive: { type: Boolean, default: true },
    metadata: {
      applicationId: { type: String },
      interviewId: { type: String },
      jobTitle: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, readAt: 1 });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
