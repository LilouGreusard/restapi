import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CompteService } from '../services/compte.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modifier-mot-de-passe',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule, CommonModule,],
  templateUrl: './modifier-mot-de-passe.component.html',
  styleUrl: './modifier-mot-de-passe.component.scss'
})
export class ModifierMotDePasseComponent {

  modifierMotDePasse: FormGroup;
  userId = 0;

  constructor(private compteService: CompteService,private router: Router,) {
    this.modifierMotDePasse = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  ngOnInit() {
    const storeId = localStorage.getItem('USER_ID');
    if (storeId) {
      this.userId = JSON.parse(storeId);
    } else {
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit(){
    if (this.modifierMotDePasse.valid) {
      const nouveauPassword = this.modifierMotDePasse.get('password')?.value;

      this.compteService.updatePassword(this.userId, nouveauPassword).subscribe({
        next: (res: any) => {
          alert(res.message);
          this.router.navigate(['/mon-compte']);
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la modification du mot de passe.');
        }
      });
    } else {
      this.modifierMotDePasse.markAllAsTouched();
    }
  }
}
