import { Request, Response, NextFunction } from "express";
import { getEnvConfig } from "../config/env";
import { ErrorResponse } from "../types/api";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const env = getEnvConfig();

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "UNKNOWN_ERROR";

  // Enhanced security logging
  const errorDetails = {
    message: err.message,
    name: err.name,
    code: (err as any).code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.userId,
    timestamp: new Date().toISOString(),
  };

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error: " + err.message;
    code = "VALIDATION_ERROR";
  }

  // Mongoose duplicate key error
  if (err.name === "MongoError" && (err as any).code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
    code = "DUPLICATE_FIELD";
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
    code = "INVALID_RESOURCE_ID";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  }

  // Rate limiting errors
  if (err.message.includes('Too many requests')) {
    statusCode = 429;
    message = 'Rate limit exceeded';
    code = 'RATE_LIMIT_EXCEEDED';
  }

  // CORS errors
  if (err.message.includes('Not allowed by CORS')) {
    statusCode = 403;
    message = 'CORS policy violation';
    code = 'CORS_VIOLATION';
  }

  // Log security-related errors with higher severity
  if (statusCode === 401 || statusCode === 403 || err.name.includes('Token')) {
    console.warn('🚨 Security Error:', errorDetails);
  } else if (statusCode >= 500) {
    console.error('❌ Server Error:', errorDetails);
  } else {
    console.warn('⚠️  Client Error:', errorDetails);
  }

  const response: ErrorResponse = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };

  // Include additional details only in development
  if (env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.details = errorDetails;
  }

  res.status(statusCode).json(response);
}

export class CustomError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, isOperational: boolean = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function asyncHandler<T = any>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
