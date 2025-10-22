import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CompteService } from '../services/compte.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordInputComponent } from '../password-input/password-input.component';

@Component({
  selector: 'app-modifier-mot-de-passe',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule, CommonModule, PasswordInputComponent,],
  templateUrl: './modifier-mot-de-passe.component.html',
  styleUrl: './modifier-mot-de-passe.component.scss'
})
export class ModifierMotDePasseComponent {

  modifierMotDePasse: FormGroup;
  showPassword = false;

  constructor(private compteService: CompteService,private router: Router,) {
    this.modifierMotDePasse = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  get passwordControl(): FormControl {
    return this.modifierMotDePasse.get('password') as FormControl;
  }

  ngOnInit() {
    const token = localStorage.getItem('TOKEN');
    if (!token) {
      alert('Vous devez être connecté pour modifier votre mot de passe.');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit(){
    if (this.modifierMotDePasse.invalid) {
      this.modifierMotDePasse.markAllAsTouched();
      return;
    }
    
    const nouveauPassword = this.modifierMotDePasse.get('password')?.value;

    this.compteService.updatePassword(nouveauPassword).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.router.navigate(['/mon-compte']);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('TOKEN');
          this.router.navigate(['/login']);
        } else {
          alert('Erreur lors de la modification du mot de passe.');
        }
      }
    });
  }
}
