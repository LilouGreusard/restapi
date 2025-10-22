import { Component, OnInit } from '@angular/core';
import { Ballade } from '../models/ballade.model';
import { BalladeService } from '../services/ballade.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { lastValueFrom } from 'rxjs';
import { CompteService } from '../services/compte.service';

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

  constructor(
    private balladeService: BalladeService,
    private router: Router,
    private compteService: CompteService
  ) {}


async ngOnInit() {
  localStorage.removeItem('COMPAGNON_ID');
  localStorage.removeItem('BALLADE_ID');

  try {
    console.log("Chargement des ballades de l'utilisateur connecté...");

    // ballades organisees
    this.balladesOrganisees = await lastValueFrom(
      this.balladeService.getBalladesOrganisees()
    );

    // ballades participees
    this.balladesParticipees = await lastValueFrom(
      this.balladeService.getBalladesParticipees()
    );
    } catch (err) {
      console.error("Erreur lors du chargement des ballades :", err);
      this.error = 'Erreur lors du chargement des ballades';
    } finally {
      this.loading = false;
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
    if (!confirm("Voulez-vous vraiment vous désinscrire de cette ballade ?")) return;

    try {
      // Transformer l'observable en Promise pour utiliser await
      await lastValueFrom(this.balladeService.removeParticipant(balladeId));
      
      // Mettre à jour le front
      this.balladesParticipees = this.balladesParticipees.filter(b => b.id !== balladeId);
    } catch (err) {
      console.error("Erreur désinscription :", err);
      alert("Impossible de se désinscrire pour le moment.");
    }
  }
}
