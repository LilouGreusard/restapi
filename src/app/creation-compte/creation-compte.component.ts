import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-creation-compte',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './creation-compte.component.html',
  styleUrl: './creation-compte.component.scss'
})
export class CreationCompteComponent {

  creationCompte: FormGroup;

  constructor(private http: HttpClient){
    this.creationCompte = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      username: new FormControl(''),
      profilePicture: new FormControl(''),
      age: new FormControl(''),
      localisation: new FormControl(''),
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),

    });
  }
    get verifAge(): boolean {
      return (this.creationCompte.get('age')?.value ?? 0) < 18;
    }

   onSubmit(){
    this.creationCompte.markAllAsTouched();

    if (this.creationCompte.valid){
      this.http.post('http://localhost:8080/api/users/save', this.creationCompte.value)
        .subscribe({
          next: (res) => {
            console.log('Succès ! Utilisateur créé :', res);
            
            alert('Compte créé avec succès !');
          },
          error: (err) => {
            console.error('Erreur lors de la création :', err);
            alert('Erreur lors de la création du compte.');
          }
        })
    }else{
      alert("Champs Invalide !");
    }
   }
}