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
import { PasswordInputComponent } from '../password-input/password-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LocalisationComponent,
    PasswordInputComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  login: FormGroup;
  showPassword = false;

  constructor(private compteService: CompteService,private router: Router) {
    this.login = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }
  
  get passwordControl(): FormControl {
    return this.login.get('password') as FormControl;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  ngOnInit(): void{
    if(localStorage.getItem('USER_ID') !== null && localStorage.getItem('TOKEN') !== null){
      this.router.navigate(['/mon-compte']);
    }else if(localStorage.getItem('USER_ID') !== null || localStorage.getItem('TOKEN') !== null){
      localStorage.clear;
      this.router.navigate(['/login']);
    }
  }

  inscription(){
    this.router.navigate(['/creation-compte']);
  }

  onSubmit() {
    this.login.markAllAsTouched();

    if (this.login.valid) {
      const email = this.login.controls['email']?.value;
      const password = this.login.controls['password']?.value;

      this.compteService.login(email, password).subscribe({
        next: (res) => {
          if (res.user?.Id !== undefined) {
            console.log('Connexion réussie :', res);
            localStorage.setItem('USER_ID', res.user.Id.toString());
          }

          if (res.token) {
            localStorage.setItem('TOKEN', res.token);
          }

          this.router.navigate(['/mon-compte']);
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
