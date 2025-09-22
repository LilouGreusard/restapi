import { Routes } from '@angular/router';
import { CreationCompteComponent } from './creation-compte/creation-compte.component';
import { CreationAnimalComponent } from './creation-animal/creation-animal.component';
import { MesCompagnonsComponent } from './mes-compagnons/mes-compagnons.component';
import { CreationBalladeComponent } from './creation-ballade/creation-ballade.component';
import { MesBalladesComponent } from './mes-ballades/mes-ballades.component';
import { CarteBaladesComponent } from './carte-balades/carte-balades.component';

export const routes: Routes = [
    { path: 'creation-compte', component: CreationCompteComponent },
    { path: 'creation-compagnon', component: CreationAnimalComponent },
    { path: 'mes-compagnons/:id', component: MesCompagnonsComponent },
    { path: 'creation-ballade', component: CreationBalladeComponent},
    { path: 'mes-ballades', component: MesBalladesComponent},
    { path: 'carte-balades', component: CarteBaladesComponent},
];
