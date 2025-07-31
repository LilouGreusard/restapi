import { Adresse } from './adresse.model';
import { Compagnon } from './compagnon.model';

export interface User {
  Id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePictures?: string;
  age?: number;
  adresse?: Adresse;
  email?: String;
  password?: String;
  compagnons?: Compagnon[];
}
