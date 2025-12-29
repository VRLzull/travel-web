import { IUser, IAdminUser } from '../user';

declare global {
  namespace Express {
    interface Request {
      user?: IUser | IAdminUser;
      userType?: 'user' | 'admin';
      role?: 'user' | 'ADMIN' | 'SUPERADMIN';
    }
  }
}
