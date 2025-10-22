import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Race } from '../models/race.model';
import { RaceService } from '../services/race.service';
import { Espece } from '../models/espece.model';
import { EspeceService } from '../services/espece.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NatureService } from '../services/nature.service';
import { Nature } from '../models/nature.model';
import { Router } from '@angular/router';
import { CompteService } from '../services/compte.service';
import { ApiService } from '../services/api.service';
import { Compagnon } from '../models/compagnon.model';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-creation-animal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    HeaderComponent
  ],
  templateUrl: './creation-animal.component.html',
  styleUrl: './creation-animal.component.scss',
  providers: [RaceService, EspeceService, NatureService, CompteService],
})
export class CreationAnimalComponent implements OnInit {
  creationAnimal: FormGroup;
  races: Race[] = [];
  especes: Espece[] = [];
  naturesList: Nature[] = [];

  constructor(
    private raceService: RaceService,
    private especeService: EspeceService,
    private natureService: NatureService,
    private router: Router
  ) {
    this.creationAnimal = new FormGroup({
      name: new FormControl('', [Validators.required]),
      age: new FormControl('', [Validators.required]),
      espece: new FormControl('', [Validators.required]),
      race: new FormControl('', [Validators.required]),
      size: new FormControl(''),
      natures: new FormControl([]),
      description: new FormControl(''),
    });
  }

  // récupérer la liste des especes
  afficherEspece() {
    this.especeService
      .getAll()
      .then((data) => {
        this.especes = data;
      })
      .catch();
  }

  // récupérer la liste des races
  afficherRaces() {
    this.raceService
      .getAll()
      .then((data) => {
        this.races = data;
      })
      .catch();
  }
  // récupérer la liste des races en fonction de especes
  getRacesById(especeId: number) {
    this.raceService.getByEpeceId(especeId).then((data) => (this.races = data));
  }

  // récupérer la liste des natures
  afficherNature() {
    this.natureService
      .getAll()
      .then((data) => {
        this.naturesList = data;
      })
      .catch();
  }

  getRaceById(id: number): Race | undefined {
    return this.races.find((r) => r.id == id);
  }

  ngOnInit() {
    this.afficherEspece();
    this.afficherNature();
  }

  onSubmit() {
    this.creationAnimal.markAllAsTouched();

    const postForm = { ...this.creationAnimal.value }; 

    // valoriser la race à partir de l'id recu dans le form
    const raceId: number = this.creationAnimal.get('race')?.value;
    if (raceId) postForm.race = this.getRaceById(raceId);


    if (this.creationAnimal.valid) {
      ApiService.postData('/compagnons/save', postForm)
        .then((res: Compagnon) => {
          console.log('Succès ! Compagnon créé :', res);

          alert('Compagnon créé avec succès !');
          this.router.navigate(['/mon-compte']);
        })
        .catch((err) => {
          console.error('Erreur lors de la création :', err);
          alert('Erreur lors de la création du compagnon.');
        });
    } else {
      alert('Champs Invalide !');
    }
  }
}
