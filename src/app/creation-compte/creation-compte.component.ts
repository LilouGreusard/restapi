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
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  ngOnInit(): void{
    if(localStorage.getItem('USER_ID') !== null){
      this.router.navigate(['/mon-compte']);
    }

    this.creationCompte.get('username')?.valueChanges.subscribe(() => this.checkUsername());
    this.creationCompte.get('email')?.valueChanges.subscribe(() => this.checkEmail());
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

 checkEmail() {
    const email = this.creationCompte.get('email')?.value;
    if (!email) return;

    ApiService.get(`/users/check-email?email=${email}`)
      .then((res: { exists: boolean }) => {
        if (res.exists) {
          this.creationCompte.get('email')?.setErrors({ emailExists: true });
        } else {
          this.creationCompte.get('email')?.setErrors(null);
        }
      })
      .catch(err => console.error('Erreur vérification email:', err));
  }

  checkUsername() {
    const username = this.creationCompte.get('username')?.value;
    if (!username) return;

    ApiService.get(`/users/check-username?username=${username}`)
      .then((res: { exists: boolean }) => {
        if (res.exists) {
          this.creationCompte.get('username')?.setErrors({ usernameExists: true });
        } else {
          this.creationCompte.get('username')?.setErrors(null);
        }
      })
      .catch(err => console.error('Erreur vérification username:', err));
  }

  onSubmit() {
    this.creationCompte.markAllAsTouched();

    let compte: User = {};
    if (this.creationCompte.valid) {

      compte.firstName = this.creationCompte.controls['firstName'].value;
      compte.lastName = this.creationCompte.controls['lastName'].value;
      compte.username = this.creationCompte.controls['username'].value;
      compte.age = this.creationCompte.controls['age'].value;
      compte.adresse = this.adresse;
      compte.email = this.creationCompte.controls['email'].value;
      compte.password = this.creationCompte.controls['password'].value;
    
      ApiService.postData('/users/save', compte)
        .then((res: User) => {
          console.log('Succès ! Utilisateur créé :', res);
          if (res?.Id) localStorage.setItem('USER_ID', JSON.stringify(res.Id));
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
