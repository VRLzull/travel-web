import { Request } from 'express';

export interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: Date;
}

export interface IAdminUser {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'SUPERADMIN' | 'ADMIN';
  created_at: Date;
}

export type UserRole = 'user' | 'ADMIN' | 'SUPERADMIN';

export interface IAuthRequest extends Request {
  user?: IUser | IAdminUser;
  role?: UserRole;
}
