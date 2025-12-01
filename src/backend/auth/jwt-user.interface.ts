import {Role} from './role.enum'

export interface JwtUser {
  sub: number;
  userId: number;
  email: string;
  role: Role;
}