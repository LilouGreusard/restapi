import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../models/compte.model';
import { LocalisationComponent } from '../localisation/localisation.component';
import { Adresse } from '../models/adresse.model';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-creation-compte',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LocalisationComponent,
  ],
  templateUrl: './creation-compte.component.html',
  styleUrl: './creation-compte.component.scss',
})
export class CreationCompteComponent {
  creationCompte: FormGroup;
  adresse: Adresse = {};

  constructor(private router: Router) {
    this.creationCompte = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      username: new FormControl(''),
      profilePicture: new FormControl(''),
      age: new FormControl(''),
      adresse: new FormControl(''),
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  connexion(){
    this.router.navigate(['/login']);
  }

  get verifAge(): boolean {
    return (this.creationCompte.get('age')?.value ?? 0) < 18;
  }

  setAdresse(adresse: Adresse) {
    this.adresse = adresse;
  }

  onSubmit() {
    this.creationCompte.markAllAsTouched();

    let compte: User = {};

    compte.firstName = this.creationCompte.controls['firstName'].value;
    compte.lastName = this.creationCompte.controls['lastName'].value;
    compte.username = this.creationCompte.controls['username'].value;
    compte.age = this.creationCompte.controls['age'].value;
    compte.adresse = this.adresse;
    compte.email = this.creationCompte.controls['email'].value;
    compte.password = this.creationCompte.controls['password'].value;
    
    if (this.creationCompte.valid) {
      ApiService.postData('/users/save', compte)
        .then((res: User) => {
          console.log('Succès ! Utilisateur créé :', res);
          if (res?.Id) localStorage.setItem('USER_ID', JSON.stringify(res.Id));
          alert('Compte créé avec succès !');
          this.router.navigate(['/mon-compte']);
        })
        .catch((err) => {
          console.error('Erreur lors de la création :', err);
          alert('Erreur lors de la création du compte.');
        });
    } else {
      alert('Champs Invalide !');
    }
  }
}
