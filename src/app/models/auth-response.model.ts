import { User } from './compte.model';

export interface LoginResponse {
  token: string;
  user: User;
}
