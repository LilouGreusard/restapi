import { Adresse } from './adresse.model';
import { Compagnon } from './compagnon.model';
import { User } from './compte.model';

export interface Ballade {

  id?: number;

  infos?: String;

  lieu?: Adresse;

  jours?: String;

  heure?: string; 

  dureeMinute?: number;

  compagnon?: Compagnon;

  statut?: String;

  participants?: Array<User>;

  organisateur?: User;
}
