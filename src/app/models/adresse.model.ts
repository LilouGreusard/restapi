import { CodePostal } from "./code-postal.model";

export interface Adresse {
  id?: number;
  rue?: string;
  codePostal?: CodePostal;
}
