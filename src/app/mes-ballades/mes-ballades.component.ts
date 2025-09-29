import { Component, OnInit } from '@angular/core';
import { Ballade } from '../models/ballade.model';
import { BalladeService } from '../services/ballade.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mes-ballades',
  standalone: true,
  imports: [ CommonModule, MatButtonModule],
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

  private loadBallades() {
    if (this.userId) {
      this.balladeService.getMesBallades(this.userId).then(
        (data) => this.ballades = data,
        () => this.error = "Erreur lors du rechargement"
      );
    }
  }


  onSubmitModifier(balladeId: any){
    localStorage.setItem('BALLADE_ID', balladeId.toString());
    console.log('ID stocké :', localStorage.getItem('BALLADE_ID'));
    this.router.navigate(['/modifier-ballade']);
  }

  onSubmitSupprimer(balladeId: any) {
    if (confirm("Voulez-vous vraiment supprimer cette ballade ?")) {
      this.balladeService.deletedById(balladeId).subscribe({
        next: () => {
          this.ballades = this.ballades.filter(b => b.id !== balladeId);
        },
        error: (err) => {
          console.error("Erreur suppression :", err);
        }
      });
    }
  }

}
