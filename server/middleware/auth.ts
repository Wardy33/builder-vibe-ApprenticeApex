import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnvConfig } from "../config/env";

// Define user types
export interface User {
  userId: string;
  role: 'student' | 'company' | 'admin';
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// JWT payload interface
interface JWTPayload {
  userId: string;
  role: 'student' | 'company' | 'admin';
  email: string;
  iat: number;
  exp: number;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      error: "Access token required",
      code: "MISSING_TOKEN"
    });
    return;
  }

  try {
    const env = getEnvConfig();
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.warn(`🚨 Invalid token attempt from IP: ${req.ip}`);
    res.status(403).json({
      error: "Invalid or expired token",
      code: "INVALID_TOKEN"
    });
    return;
  }
}

export function requireRole(roles: Array<'student' | 'company' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        code: "NO_AUTH"
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`🚨 Unauthorized access attempt: ${req.user.email} (${req.user.role}) tried to access ${req.path}`);
      res.status(403).json({
        error: "Insufficient permissions for this action",
        code: "INSUFFICIENT_PERMISSIONS",
        required: roles,
        current: req.user.role
      });
      return;
    }

    next();
  };
}

export function requireStudentRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  requireRole(["student"])(req, res, next);
}

export function requireCompanyRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  requireRole(["company"])(req, res, next);
}

export function requireAdminRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  requireRole(["admin"])(req, res, next);
}
