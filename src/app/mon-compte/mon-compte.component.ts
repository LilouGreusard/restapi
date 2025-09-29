import { Component, OnInit } from '@angular/core';
import { User } from '../models/compte.model';
import { CompteService } from '../services/compte.service';
import { BalladeService } from '../services/ballade.service';
import { Ballade } from '../models/ballade.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [ CommonModule, MatButtonModule],
  templateUrl: './mon-compte.component.html',
  styleUrl: './mon-compte.component.scss'
})

export class MonCompteComponent implements OnInit {

    monCompte : User | null = null;
    loading = false;
    error = '';
    picture = '';
    userId = localStorage.getItem('USER_ID');
    ballades: Ballade[] = [];
  
    constructor(
      private compteService: CompteService,
      private balladeService: BalladeService,
      private router: Router,
    ) {}

  ngOnInit(): void {
    if (!this.userId) {
      this.router.navigate(['login/']);
      return;
    }

    this.loading = true;

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

    onSubmitModifier(){
      if (this.userId){
        this.router.navigate(['/modifier-compte'], { queryParams: { id: this.userId} });
      }
    }

    onSubmitAnnimaux(){
      if (this.userId){
        this.router.navigate(['mes-compagnons/:id'], { queryParams: { id: this.userId} });
      }
    }

    onSubmitBallades(){
      if (this.userId){
        this.router.navigate(['mes-ballades'], { queryParams: { id: this.userId} });
      }
    }

    async onSubmitSupprimer() {
      // Si le compte n'est pas chargé, on sort
      if (!this.monCompte) return;
      console.log(this.userId);

      const password = prompt("Veuillez entrer votre mot de passe pour confirmer la suppression :");
      if (!password) {
        alert("Suppression annulée : mot de passe non renseigné.");
        return;
      }

      // Vérifier le mot de passe via login
      this.compteService.login(this.monCompte.email!, password).subscribe({
        next: async (user) => {
          // Mot de passe correct → demander confirmation
          if (confirm("Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible !")) {
            // Ici on force TypeScript à considérer que Id existe
            if (this.monCompte!.Id !== undefined) {
              
              try {
                this.loading = true;
                const ballades = await this.balladeService.getMesBallades(this.userId!);

              for (const b of ballades.filter(b => b.id !== undefined)) {
                await this.balladeService.deletedById(b.id!);
              }

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
 