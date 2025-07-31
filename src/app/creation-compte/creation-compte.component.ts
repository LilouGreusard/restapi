import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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

@Component({
  selector: 'app-creation-compte',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    LocalisationComponent,
  ],
  templateUrl: './creation-compte.component.html',
  styleUrl: './creation-compte.component.scss',
})
export class CreationCompteComponent {
  creationCompte: FormGroup;
  adresse: Adresse = {};

  constructor(private http: HttpClient) {
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
  get verifAge(): boolean {
    return (this.creationCompte.get('age')?.value ?? 0) < 18;
  }

  setAdresse(adresse: Adresse){
    this.adresse =  adresse
  }

  onSubmit() {
    this.creationCompte.markAllAsTouched();

    let compte: User = {}

    compte.firstName = this.creationCompte.controls['firstName'].value;
    compte.lastName = this.creationCompte.controls['lastName'].value;
    compte.username = this.creationCompte.controls['username'].value;
    compte.age = this.creationCompte.controls['age'].value;
    compte.adresse = this.adresse;
    compte.email = this.creationCompte.controls['email'].value;
    compte.password = this.creationCompte.controls['password'].value;
    
    if (this.creationCompte.valid) {
      this.http
        .post('http://localhost:8080/api/users/save', compte)
        .subscribe({
          next: (res: User) => {
            console.log('Succès ! Utilisateur créé :', res);
            if (res?.Id)
              localStorage.setItem('USER_ID', JSON.stringify(res.Id));
            alert('Compte créé avec succès !');
            
          },
          error: (err) => {
            console.error('Erreur lors de la création :', err);
            alert('Erreur lors de la création du compte.');
          },
        });
    } else {
      alert('Champs Invalide !');
    }
  }
}
