import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private router: Router) {}

  monCompte() {
    this.router.navigate(['/mon-compte']);
  }

  mesBallades() {
    this.router.navigate(['/mes-ballades']);
  }

  carteBallade() {
    this.router.navigate(['/carte-ballades']);
  }

}
