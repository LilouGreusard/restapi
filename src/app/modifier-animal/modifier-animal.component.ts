import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CompagnonService } from '../services/compagnon.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Race } from '../models/race.model';
import { RaceService } from '../services/race.service';
import { Espece } from '../models/espece.model';
import { EspeceService } from '../services/espece.service';
import { NatureService } from '../services/nature.service';
import { Nature } from '../models/nature.model';
import { Compagnon } from '../models/compagnon.model';
import { LocalisationComponent } from '../localisation/localisation.component';
import { ApiService } from '../services/api.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';


@Component({
  selector: 'app-modifier-animal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LocalisationComponent,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './modifier-animal.component.html',
  styleUrl: './modifier-animal.component.scss',
  providers: [RaceService, EspeceService, NatureService],
})
export class ModifierAnimalComponent {

  modifierAnimal: FormGroup;
  races: Race[] = [];
  especes: Espece[] = [];
  naturesList: Nature[] = [];
  compagnonId = 0;

  constructor(
    private compagnonService: CompagnonService,
    private raceService: RaceService,
    private especeService: EspeceService,
    private natureService: NatureService,
  ) {
    this.modifierAnimal = new FormGroup({
      id: new FormControl(null),
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

  ngOnInit(){
    this.afficherEspece();
    this.afficherNature();

    // récupère l'id compagnon stocker
    const storeId = localStorage.getItem('COMPAGNON_ID');
    // si id présent récupère les infos
    if(storeId){
      this.compagnonId =  JSON.parse(storeId);
      this.loadcompagnon (this.compagnonId);
      console.log(this.compagnonId);
    } else {
      console.log("Erreur : aucun COMPAGNON_ID trouvé en localStorage");
    }
  }

  // Fonction récupérant les infos d'un compagnon par son id
  loadcompagnon(id: number){
    this.compagnonService.getById(id).subscribe({
      next: (compagnon)=>{    
      console.log('Compagnon récupéré:', compagnon);
      if (!compagnon) {
        console.warn('Compagnon est null ou undefined, impossible de patcher le formulaire');
        return;
      }
      
      this.modifierAnimal.patchValue({
          id: compagnon.id,
          name : compagnon.name,
          race: compagnon.race ? compagnon.race.id : null,
          espece: compagnon.race?.espece ? compagnon.race.espece.id : null,
          age : compagnon.age,
          natures: compagnon.natures?.map(n => n.id),
          description: compagnon.description,
          size: compagnon.size,
        });
      },
      error: (err)=>
        console.error('Erreur récupération compagnon', err)
    });
  }

  // quand bouton cliqué
  async onSubmit() {
    this.modifierAnimal.markAllAsTouched();

    // valoriser la race à partir de l'id recu dans le form
    const raceId: number = this.modifierAnimal.get('race')?.value;
    let race: Race | undefined = undefined;
    if (raceId) {
      race = this.getRaceById(raceId);
    }

    // Récupérer les IDs des natures sélectionnées
    const selectedNatureIds: number[] = this.modifierAnimal.get('natures')?.value || [];

    // Transformer les IDs en objets Nature via ApiService
    const selectedNatures: Nature[] = await Promise.all(
      selectedNatureIds.map(id => ApiService.get(`/nature/${id}`))
    );

    // "créer" un compagnon avec les données modifiés ou laissé tel quelle
    let compagnon: Compagnon = {
      id:this.modifierAnimal.controls['id'].value,
      name:this.modifierAnimal.controls['name'].value,
      race:race,
      age:this.modifierAnimal.controls['age'].value,
      natures:selectedNatures,
      description:this.modifierAnimal.controls['description'].value,
      size:this.modifierAnimal.controls['size'].value,
    };
    
    // si tout les champs valides envoie les modif au back
    if (this.modifierAnimal.valid) {
      console.log(compagnon)
      ApiService.postData('/compagnons/update', compagnon)
        .then((res: Compagnon) => {
          console.log('Succès ! Compagnon modifié:', res);
          alert('Compagnon modifié avec succès !');
        })
        .catch((err) => {
          console.error('Erreur lors de la modification :', err);
          alert('Erreur lors de la modification du compagnon.');
        });
    } else {
      alert('Champs Invalide !');
    }
  }
}