import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnvConfig } from "../config/env";

// Define user types
export interface User {
  userId: string;
  role: 'candidate' | 'company' | 'admin' | 'master_admin';
  email: string;
  isMasterAdmin?: boolean;
  adminPermissions?: {
    canViewAllUsers: boolean;
    canViewFinancials: boolean;
    canModerateContent: boolean;
    canAccessSystemLogs: boolean;
    canExportData: boolean;
    canManageAdmins: boolean;
    canConfigureSystem: boolean;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// JWT payload interface
interface JWTPayload {
  userId: string;
  role: 'candidate' | 'company' | 'admin' | 'master_admin';
  email: string;
  isMasterAdmin?: boolean;
  adminPermissions?: any;
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
      isMasterAdmin: decoded.isMasterAdmin,
      adminPermissions: decoded.adminPermissions,
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

export function requireRole(roles: Array<'candidate' | 'company' | 'admin' | 'master_admin'>) {
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

export function requireCandidateRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  requireRole(["candidate"])(req, res, next);
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
  requireRole(["admin", "master_admin"])(req, res, next);
}

export function requireMasterAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({
      error: "Authentication required",
      code: "NO_AUTH"
    });
    return;
  }

  if (req.user.role !== 'master_admin' || !req.user.isMasterAdmin) {
    console.warn(`🚨 Master admin access denied: ${req.user.email} (${req.user.role}) tried to access ${req.path}`);
    res.status(403).json({
      error: "Master admin access required",
      code: "MASTER_ADMIN_REQUIRED",
      message: "This endpoint requires Master Admin privileges"
    });
    return;
  }

  next();
}

export function requireAdminPermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        code: "NO_AUTH"
      });
      return;
    }

    if (req.user.role !== 'master_admin' && req.user.role !== 'admin') {
      res.status(403).json({
        error: "Admin access required",
        code: "ADMIN_ACCESS_REQUIRED"
      });
      return;
    }

    // Master admin has all permissions
    if (req.user.role === 'master_admin') {
      next();
      return;
    }

    // Check specific permission for regular admin
    const hasPermission = req.user.adminPermissions && (req.user.adminPermissions as any)[permission];
    if (!hasPermission) {
      res.status(403).json({
        error: `Permission '${permission}' required`,
        code: "INSUFFICIENT_ADMIN_PERMISSIONS"
      });
      return;
    }

    next();
  };
}
