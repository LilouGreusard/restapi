import { Routes } from '@angular/router';
import { CreationCompteComponent } from './creation-compte/creation-compte.component';
import { CreationAnimalComponent } from './creation-animal/creation-animal.component';
import { MesCompagnonsComponent } from './mes-compagnons/mes-compagnons.component';
import { CreationBalladeComponent } from './creation-ballade/creation-ballade.component';
import { MesBalladesComponent } from './mes-ballades/mes-ballades.component';
import { CarteBaladesComponent } from './carte-balades/carte-balades.component';
import { LoginComponent } from './login/login.component';
import { MonCompteComponent } from './mon-compte/mon-compte.component';
import { ModifierCompteComponent } from './modifier-compte/modifier-compte.component';
import { ModifierAnimalComponent } from './modifier-animal/modifier-animal.component';
import { modifierBalladeComponent } from './modifier-ballade/modifier-ballade.component';

export const routes: Routes = [
    { path: 'creation-compte', component: CreationCompteComponent },
    { path: 'creation-compagnon', component: CreationAnimalComponent },
    { path: 'creation-ballade', component: CreationBalladeComponent},
    { path: 'mes-compagnons/:id', component: MesCompagnonsComponent },
    { path: 'mes-ballades', component: MesBalladesComponent},
    { path: 'mon-compte', component: MonCompteComponent},
    { path: 'modifier-animal', component: ModifierAnimalComponent },
    { path: 'modifier-compte', component: ModifierCompteComponent},
    { path: 'modifier-ballade', component: modifierBalladeComponent},
    { path: 'login', component: LoginComponent},
    { path: 'carte-balades', component: CarteBaladesComponent},
];
