import { Routes } from '@angular/router';
import { CreationCompteComponent } from './creation-compte/creation-compte.component';
import { CreationAnimalComponent } from './creation-animal/creation-animal.component';

export const routes: Routes = [
    { path: '', component: CreationCompteComponent },
    { path: 'animal', component: CreationAnimalComponent },
];
