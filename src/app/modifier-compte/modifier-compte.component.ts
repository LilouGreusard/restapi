import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompteService } from '../services/compte.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../models/compte.model';
import { LocalisationComponent } from '../localisation/localisation.component';
import { Adresse } from '../models/adresse.model';
import { ApiService } from '../services/api.service';
import { HeaderComponent } from '../header/header.component';


@Component({
  selector: 'app-modifier-compte',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LocalisationComponent,
    HeaderComponent,
  ],
  templateUrl: './modifier-compte.component.html',
  styleUrl: './modifier-compte.component.scss'
})
export class ModifierCompteComponent {

  modifierCompte: FormGroup;
  adresse: Adresse = {};
  originalUsername = '';
  originalEmail = '';
  currentUser?: User;

  constructor(
    private compteService: CompteService,
    private router: Router,
  ) {
    this.modifierCompte = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      username: new FormControl(''),
      profilePicture: new FormControl(''),
      age: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }
  get verifAge(): boolean {
    return (this.modifierCompte.get('age')?.value ?? 0) < 18;
  }

  ngOnInit(){
    localStorage.removeItem('COMPAGNON_ID');
    localStorage.removeItem('BALLADE_ID');



    // récupère le token user stocker
    const token = localStorage.getItem('TOKEN')
    // si token non présent redirection login
    if (!token) {
      alert('Vous devez être connecté pour modifier votre compte.');
      this.router.navigate(['/login']);
      return;
    }

    // charger l'utilisateur via backend
    this.loadUser();

    this.modifierCompte.get('username')?.valueChanges.subscribe(() => this.checkUsername());
    this.modifierCompte.get('email')?.valueChanges.subscribe(() => this.checkEmail());
  }

  checkEmail() {
    const emailControl = this.modifierCompte.get('email');
    const email = emailControl?.value;
    if (email === this.originalEmail) {
      // L'email n'a pas changé => pas d'erreur
      emailControl?.setErrors(null);
      return;
    }

    ApiService.get(`/users/check-email?email=${email}`)
      .then((res: { exists: boolean }) => {
        if (res.exists) {
          emailControl?.setErrors({ emailExists: true });
        } else {
          return;
        }
      })
      .catch(err => console.error('Erreur vérification email:', err));
  }

  checkUsername() {
    const usernameControl = this.modifierCompte.get('username');
    const username = usernameControl?.value;
    if (username === this.originalUsername) {
      // Le pseudo n’a pas changé => pas d’erreur
      usernameControl?.setErrors(null);
      return;
    }

    ApiService.get(`/users/check-username?username=${username}`)
      .then((res: { exists: boolean }) => {
        if (res.exists) {
          usernameControl?.setErrors({ usernameExists: true });
        } else {
          usernameControl?.setErrors(null);
        }
      })
      .catch(err => console.error('Erreur vérification username:', err));
  }

  // fonction récupérant les infos d'un user par son id
  loadUser(){
    
    this.compteService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.currentUser = user;
        this.adresse = user.adresse || {};    
        this.originalUsername = user.username ?? '';
        this.originalEmail = user.email ?? '';
        
        this.modifierCompte.patchValue({
          firstName : user.firstName,
          lastName : user.lastName,
          username : user.username,
          age : user.age,
          adresse: user.adresse,
          email: user.email,
        });
      },
      error: (err) => {
        console.error('Erreur récupération user :', err)
        if (err.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('TOKEN');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // défini nouvelle adresse
  setAdresse(adresse: Adresse) {
    this.adresse = adresse;
    this.modifierCompte.patchValue({adresse: this.adresse});
  }

  // Quand bouton cliqué
  onSubmit() {
    this.modifierCompte.markAllAsTouched();

    if (!this.modifierCompte.valid) {
      alert('Champs invalides !');
      return;
    }

    // "créer" un user avec les données modifiés ou laissé tel quelle
    const compte: User = {
      ...this.currentUser,
      firstName:this.modifierCompte.value.firstName,
      lastName:this.modifierCompte.value.lastName,
      username:this.modifierCompte.value.username,
      age:this.modifierCompte.value.age,
      adresse:this.adresse,
      email:this.modifierCompte.value.email,
    };
    
    // Si tout les champs sont valides, envoie les modif au back
    ApiService.postData('/users/update', compte)
      .then((res: User) => {
        console.log('Succès ! Utilisateur modifié:', res);
        this.router.navigate(['/mon-compte']);
        alert('Compte modifié avec succès !');
      })
      .catch((err) => {
        console.error('Erreur lors de la modification :', err);
        alert('Erreur lors de la modification du compte.');
      });
  }
}