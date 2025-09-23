import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface UserPayload {
    userId: string;
    role: 'student' | 'company' | 'admin' | 'master_admin';
    email?: string;
  }
  interface Request {
    user?: UserPayload;
  }
}
