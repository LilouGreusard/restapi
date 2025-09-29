import { Component, OnInit } from '@angular/core';
import { Compagnon } from '../models/compagnon.model';
import { CompagnonService } from '../services/compagnon.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

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
  userId = localStorage.getItem('USER_ID');

  constructor(
    private compagnonService: CompagnonService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    
    //un compte existe en localStorage
    if (this.userId) {
      this.loading = true;
      this.compagnonService
        .getMesCompagnons(this.userId)
        .then((data) => {
          this.mesCompagnons = data;
          this.loading = false;
        })
        .catch((err) => {
          this.error = 'Erreur lors du chargement de mes compagnons';
          this.loading = false;
        });
    }
    //pas de compte en localStorage
    else {
      //TODO
      //rediriger vers la page de connexion /création de compte
    }
  }
  onSubmitCreer(compagnonId: any){
    this.router.navigate(['/creation-ballade'], { queryParams: { user: this.userId, compagnon: compagnonId} })
  }
  onSubmitModifier(compagnonId: any){
    localStorage.setItem('COMPAGNON_ID', compagnonId.toString());
    console.log('ID stocké :', localStorage.getItem('COMPAGNON_ID'));
    this.router.navigate(['/modifier-animal']);
  }
  onSubmitCreerA(){
    this.router.navigate(['/creation-compagnon']);
  }
  onSubmitRejoindre(){
    this.router.navigate(['/cartes-balades'], { });
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
