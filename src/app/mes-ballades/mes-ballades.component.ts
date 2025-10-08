import { Component, OnInit } from '@angular/core';
import { Ballade } from '../models/ballade.model';
import { BalladeService } from '../services/ballade.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-mes-ballades',
  standalone: true,
  imports: [ CommonModule, MatButtonModule, HeaderComponent],
  providers: [],
  templateUrl: './mes-ballades.component.html',
  styleUrl: './mes-ballades.component.scss',
})
export class MesBalladesComponent implements OnInit {
  balladesOrganisees: Ballade[] = [];
  balladesParticipees: Ballade[] = [];
  loading = true;
  error = '';
  especeId = '';
  picture = '';
  userId = 0;


  constructor(
    private balladeService: BalladeService,
    private router: Router
  ) {}




async ngOnInit() {
  localStorage.removeItem('COMPAGNON_ID');
  localStorage.removeItem('BALLADE_ID');

  try {
    const storedId = localStorage.getItem('USER_ID');
    if (storedId) this.userId = parseInt(storedId, 0);

    this.balladesOrganisees = await this.balladeService.getBalladesOrganisees(this.userId);
    this.balladesParticipees = await this.balladeService.getBalladesParticipees(this.userId);

  } catch (err) {
    this.error = 'Erreur lors du chargement des ballades';
  } finally {
    this.loading = false;
  }
}

  private loadBallades() {
    if (this.userId) {
      this.balladeService.getBalladesOrganisees(this.userId).then(
        (data) => this.balladesOrganisees = data,
        () => this.error = "Erreur lors du rechargement"
      );

      this.balladeService.getBalladesParticipees(this.userId).then(
        (data) => this.balladesParticipees = data,
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
          this.balladesOrganisees = this.balladesOrganisees.filter(b => b.id !== balladeId);
        },
        error: (err) => {
          console.error("Erreur suppression :", err);
        }
      });
    }
  }

 async onSubmitDesinscrire(balladeId: number) {
    if (!this.userId) return;

    if (!confirm("Voulez-vous vraiment vous désinscrire de cette ballade ?")) return;

    try {
      await this.balladeService.removeParticipant(balladeId, this.userId);
      this.balladesParticipees = this.balladesParticipees.filter(b => b.id !== balladeId);
    } catch (err) {
      console.error("Erreur désinscription :", err);
    }
  }
}
