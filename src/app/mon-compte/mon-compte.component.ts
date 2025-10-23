import { Component, OnInit } from '@angular/core';
import { User } from '../models/compte.model';
import { CompteService } from '../services/compte.service';
import { BalladeService } from '../services/ballade.service';
import { Ballade } from '../models/ballade.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { CompagnonService } from '../services/compagnon.service';
import { HeaderComponent } from '../header/header.component';
import { MesCompagnonsComponent } from '../mes-compagnons/mes-compagnons.component';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [ CommonModule, MatButtonModule, HeaderComponent, MesCompagnonsComponent],
  templateUrl: './mon-compte.component.html',
  styleUrl: './mon-compte.component.scss'
})

export class MonCompteComponent implements OnInit {

    monCompte : User | null = null;
    loading = false;
    error = '';
    ballades: Ballade[] = [];
  
    constructor(
      private compteService: CompteService,
      private balladeService: BalladeService,
      private compagnonService: CompagnonService,
      private router: Router,
    ) {}

  ngOnInit(): void {
    localStorage.removeItem('COMPAGNON_ID');
    localStorage.removeItem('BALLADE_ID');

    // vérifie la présence du token dans local storage sinon redirige vers login
    const token = localStorage.getItem('TOKEN');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }   

    this.loading = true;

    // récupère les infos de user par son token
    this.compteService.getCurrentUser().subscribe({
          next: (user) => {
            this.monCompte = user;
            this.loading = false;
            console.log("Utilisateur connecté :", user);
          },
          error: (err) => {
            console.error("Erreur lors du chargement de l'utilisateur :", err);
            this.loading = false;
            if (err.status === 401) {
              alert("Session expirée, veuillez vous reconnecter.");
              localStorage.removeItem('TOKEN');
              this.router.navigate(['/login']);
            } else {
              this.error = "Impossible de charger votre compte.";
            }
          }
        });
    }

    // bouton redirige vers moidifer compte
    onSubmitModifier(){
      this.router.navigate(['/modifier-compte']);
    }

    // bouton redirige vers moidifer mot de passe
    onSubmitMotDePasse(){
      this.router.navigate(['/modifier-mot-de-passe']);
    }

    // bouton suppression compte
    async onSubmitSupprimer() {
      // vérifie si le compte est chargé
      if (!this.monCompte) return;

      // demande de mot de passe
      const password = prompt("Veuillez entrer votre mot de passe pour confirmer la suppression :");
      if (!password) {
        alert("Suppression annulée : mot de passe non renseigné.");
        return;
      }

      // vérifie mot de passe via login (backend)
    this.compteService.login(this.monCompte.email!, password).subscribe({
      next: () => {
        if (confirm("Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible !")) {
          this.compteService.deletedById(this.monCompte!.Id!).subscribe({
            next: () => {
              alert("Compte supprimé avec succès !");
              localStorage.removeItem('TOKEN');
              this.router.navigate(['/login']);
            },
            error: (err) => console.error("Erreur suppression compte :", err)
          });
        }
      },
      error: () => alert("Mot de passe incorrect !"),
    });
  }
}
