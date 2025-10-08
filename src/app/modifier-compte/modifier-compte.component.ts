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
  userId = 0;

  constructor(
    private compteService: CompteService,
    private router: Router,
  ) {
    this.modifierCompte = new FormGroup({
      Id: new FormControl(null),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      username: new FormControl(''),
      profilePicture: new FormControl(''),
      age: new FormControl(''),
      adresse: new FormControl(''),
      email: new FormControl('', [Validators.required]),
    });
  }
  get verifAge(): boolean {
    return (this.modifierCompte.get('age')?.value ?? 0) < 18;
  }

  ngOnInit(){
    localStorage.removeItem('COMPAGNON_ID');
    localStorage.removeItem('BALLADE_ID');

    this.modifierCompte.get('username')?.valueChanges.subscribe(() => this.checkUsername());
    this.modifierCompte.get('email')?.valueChanges.subscribe(() => this.checkEmail());

    // récupère l'id user stocker
    const storeId = localStorage.getItem('USER_ID');
    // si id présent récupère les infos
    if(storeId){
      this.userId =  JSON.parse(storeId);
      this.loadUser (this.userId);
    }
  }

  checkEmail() {
 const usernameControl = this.modifierCompte.get('username');
  const username = usernameControl?.value;
  if (!username) return;

  // si le username n'a pas changé, ne pas marquer d'erreur
  if (username === usernameControl?.value && this.userId) {
    ApiService.get(`/users/check-username?username=${username}`)
      .then((res: { exists: boolean }) => {
        if (res.exists && username !== this.modifierCompte.get('username')?.value) {
          const errors = usernameControl.errors || {};
          errors['usernameExists'] = true;
          usernameControl.setErrors(errors);
        } else {
          const errors = usernameControl.errors || {};
          delete errors['usernameExists'];
          usernameControl.setErrors(Object.keys(errors).length ? errors : null);
        }
      })
      .catch(err => console.error('Erreur vérification username:', err));
  }
  }

  checkUsername() {
    const username = this.modifierCompte.get('username')?.value;
    if (!username) return;

    ApiService.get(`/users/check-username?username=${username}`)
      .then((res: { exists: boolean }) => {
        if (res.exists) {
          this.modifierCompte.get('username')?.setErrors({ usernameExists: true });
        } else {
          this.modifierCompte.get('username')?.setErrors(null);
        }
      })
      .catch(err => console.error('Erreur vérification username:', err));
  }


  // fonction récupérant les infos d'un user par son id
  loadUser(id: number){
    this.compteService.getById(id).subscribe({
      next: (user)=>{
        this.adresse = user.adresse || {};    
      
      this.modifierCompte.patchValue({
        Id: user.Id,
        firstName : user.firstName,
        lastName : user.lastName,
        username : user.username,
        age : user.age,
        adresse: user.adresse,
        email: user.email,
        });
      },
      error: (err)=>
        console.error('Erreur récupération user', err)
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

    // "créer" un user avec les données modifiés ou laissé tel quelle
    let compte: User = {
      Id:this.modifierCompte.controls['Id'].value,
      firstName:this.modifierCompte.controls['firstName'].value,
      lastName:this.modifierCompte.controls['lastName'].value,
      username:this.modifierCompte.controls['username'].value,
      age:this.modifierCompte.controls['age'].value,
      adresse:this.adresse,
      email:this.modifierCompte.controls['email'].value,
    };
    
    // Si tout les champs sont valides, envoie les modif au back
    if (this.modifierCompte.valid) {
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
    } else {
      alert('Champs Invalide !');
    }
  }
}