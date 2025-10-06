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
    picture = '';
    userId = 0;
    ballades: Ballade[] = [];
  
    constructor(
      private compteService: CompteService,
      private balladeService: BalladeService,
      private compagnonService: CompagnonService,
      private router: Router,
    ) {}

  ngOnInit(): void {
    // vérifie la présence de user id dans local storage sinon redirige vers login
    const storedId = localStorage.getItem('USER_ID');
    if (storedId) this.userId = parseInt(storedId, 10);

    if (!this.userId) {
      this.router.navigate(['login/']);
      return;
    }   

    this.loading = true;

    // récupère les infos de user par son id
    this.compteService.getById(Number(this.userId))
        .subscribe({
          next: (user) => {
            this.monCompte = user;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Erreur lors du chargement de mon compte';
            this.loading = false;
            console.error(err);
          }
        });
    }

    // bouton redirige vers moidifer compte
    onSubmitModifier(){
      if (this.userId){
        this.router.navigate(['/modifier-compte'], { queryParams: { id: this.userId} });
      }
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
        next: async (user) => {
          // si mot de passe correct demande confirmation
          if (confirm("Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible !")) {
            // vérifie que l'id de l'user existe bien
            if (this.monCompte!.Id !== undefined) {
              
              try {
              this.compteService.deletedById(this.monCompte!.Id).subscribe({
                next: () => {
                  alert("Compte supprimé avec succès !");
                  localStorage.removeItem('USER_ID');
                  this.router.navigate(['/login']);
                  this.loading = false;
                },
                error: (err) => {
                  console.error("Erreur suppression compte :", err);
                  this.loading = false;
                }
              });
          } catch (err) {
            console.error("Erreur lors de la suppression des ballades :", err);
            this.error = "Erreur lors de la suppression des ballades";
            this.loading = false;
          }
        }
      }
    },
        error: (err) => {
          alert("Mot de passe incorrect !");
          console.error("Erreur vérification mot de passe :", err);
        }
      });
    }


}
 