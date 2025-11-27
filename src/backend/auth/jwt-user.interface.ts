import {Role} from './role.enum'

export interface JwtUser {
  userId: number;
  email: string;
  role: Role;
}