import { Role } from '../models';

declare global {
  namespace Express {
    interface Admin {
      id: number;
      email: string;
      role?: Role;
    }
  }
}
