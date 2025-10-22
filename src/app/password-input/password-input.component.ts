import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.scss'
})
export class PasswordInputComponent {
  @Input() control!: FormControl;
  @Input() placeholder: string = 'Votre mot de passe';

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
