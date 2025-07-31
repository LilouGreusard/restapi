import { Component, OnInit } from '@angular/core';
import { Ballade } from '../models/ballade.model';
import { BalladeService } from '../services/ballade.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mes-ballades',
  standalone: true,
  imports: [NgSelectModule, CommonModule, MatButtonModule],
  providers: [],
  templateUrl: './mes-ballades.component.html',
  styleUrl: './mes-ballades.component.scss',
})
export class MesBalladesComponent implements OnInit {
  ballades: Ballade[] = [];
  loading = false;
  error = '';
  especeId = '';
  picture = '';
  userId = localStorage.getItem('USER_ID');

  constructor(
    private balladeService: BalladeService,
    private router: Router
  ) {}

  ngOnInit(): void {

    //un compte existe en localStorage
    if (this.userId) {
      this.loading = true;
      this.balladeService
        .getMesBallades(this.userId)
        .then((data) => {
          this.ballades = data;
          this.loading = false;
        })
        .catch((err) => {
          this.error = 'Erreur lors du chargement de mes ballades';
          this.loading = false;
        });
    }
    //pas de compte en localStorage
    else {
      //TODO
      //rediriger vers la page de connexion /création de compte
    }
  }

}
