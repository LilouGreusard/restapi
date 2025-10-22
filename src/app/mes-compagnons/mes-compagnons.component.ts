import { Component, OnInit } from '@angular/core';
import { Compagnon } from '../models/compagnon.model';
import { CompagnonService } from '../services/compagnon.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-mes-compagnons',
  standalone: true,
  imports: [ CommonModule, MatButtonModule],
  providers: [CompagnonService],
  templateUrl: './mes-compagnons.component.html',
  styleUrl: './mes-compagnons.component.scss',
})
export class MesCompagnonsComponent implements OnInit {
  mesCompagnons: Compagnon[] = [];
  loading = false;
  error = '';
  especeId = '';
  picture = '';

  constructor(
    private compagnonService: CompagnonService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
  localStorage.removeItem('COMPAGNON_ID');
  localStorage.removeItem('BALLADE_ID');

  this.loading = true;
  try {
    console.log("Appel à mes Compagnons...");
    // recupere les compagnons de user via token
    this.mesCompagnons = await lastValueFrom(this.compagnonService.getMesCompagnons())
  } catch (err) {
    console.error("Erreur lors du chargement des compagnons :", err);
    this.error = 'Erreur lors du chargement de mes compagnons';
  } finally {
    this.loading = false;
  }
}

  onSubmitCreer(compagnonId: any){
    this.router.navigate(['/creation-ballade'], { queryParams: { compagnon: compagnonId} })
  }
  onSubmitModifier(compagnonId: any){
    localStorage.setItem('COMPAGNON_ID', compagnonId.toString());
    console.log('ID stocké :', localStorage.getItem('COMPAGNON_ID'));
    this.router.navigate(['/modifier-animal']);
  }
  onSubmitCreerA(){
    this.router.navigate(['/creation-compagnon']);
  }

  onSubmitSupprimer(compagnonId: any) {
    if (confirm("Voulez-vous vraiment supprimer ce compagnon ?")) {
      this.compagnonService.deletedById(compagnonId).subscribe({
        next: () => {
          this.mesCompagnons = this.mesCompagnons.filter(c => c.id !== compagnonId);
        },
        error: (err) => {
          console.error("Erreur suppression :", err);
        }
      });
    }
  }
}
