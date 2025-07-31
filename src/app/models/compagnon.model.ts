import { Nature } from "./nature.model";
import { Race } from "./race.model";

export interface Compagnon {
  id?: number;
  picture?: string;
  name?: string;
  race?: Race;
  age?: number;
  natures?: Nature[];

}