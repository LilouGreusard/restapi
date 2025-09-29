import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompteService } from '../services/compte.service';
import { LocalisationComponent } from '../localisation/localisation.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LocalisationComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  login: FormGroup;

  constructor(private compteService: CompteService,private router: Router) {
    this.login = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  onSubmit() {
    this.login.markAllAsTouched();

    if (this.login.valid) {
      const email = this.login.controls['email']?.value;
      const password = this.login.controls['password']?.value;

      this.compteService.login(email, password).subscribe({
        next: (res) => {
          if (res.Id !== undefined) {
            console.log('Connexion réussie :', res);
            localStorage.setItem('USER_ID', res.Id.toString());
            alert('Connexion réussie !');
            this.router.navigate(['/mon-compte']);
          }
        },
        error: (err) => {
          console.error('Erreur de connexion :', err);
          alert('Email ou mot de passe incorrect.');
        }
      });
    } else {
      alert('Champs invalides !');
    }
  }
}
