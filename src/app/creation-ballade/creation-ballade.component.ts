import { Component, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatOption,
  MatSelectModule,
} from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { CodePostal } from '../models/code-postal.model';
import { Adresse } from '../models/adresse.model';
import { AdresseService } from '../services/adresse.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Ballade } from '../models/ballade.model';
import { Statuts } from '../enums/status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalisationComponent } from '../localisation/localisation.component';
import { ApiService } from '../services/api.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-creation-ballade',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatFormField,
    MatInputModule,
    MatAutocompleteModule,
    AsyncPipe,
    CommonModule,
    LocalisationComponent,
    HeaderComponent,
  ],
  providers: [AdresseService],
  templateUrl: './creation-ballade.component.html',
  styleUrl: './creation-ballade.component.scss',
})
export class CreationBalladeComponent {
  creationBallade: FormGroup = new FormGroup({});
  codesPostaux: CodePostal[] = [];
  filteredCodePostaux: Observable<String[]> | undefined;
  adressesParCodePostal: Adresse[] = [];
  lieuCtrl = new FormControl('', [Validators.required]);
  organisateur = '';
  compagnon = '';
  balade: Ballade = {};
  jours: string[] = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  @ViewChild('allSelected') allSelected!: MatOption;

  constructor(
    private adresseService: AdresseService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.organisateur = params['user'];
      this.compagnon = params['compagnon'];
    });
    this.creationBallade = new FormGroup({
      horaire: new FormControl('', [Validators.required]),
      date: new FormControl([], [Validators.required]),
      duree: new FormControl('', [Validators.required]),
      infos: new FormControl(''),
    });
  }

  toggleOne(): void {
    const selected = this.creationBallade.controls['date'].value.filter(
      (v: any) => v
    );
    // Sélection de "Tout les jours" si chaque jour est individuellement sélectionné
    if (selected.length === this.jours.length) {
      this.allSelected.select();
      // Déselection de "Tout les jours" si un jour est individuellement déselectionné
    } else if (selected.length !== this.jours.length) {
      this.allSelected.deselect();
    }
    this.creationBallade.controls['date'];
  }

  toggleAllSelection(): void {

    // Sélection de "Tout les jours"
    if (this.allSelected.selected) {
      this.creationBallade.controls['date'].patchValue([...this.jours]);
      this.allSelected.select();
      // Déselection de "Tout les jours"
    } else if (!this.allSelected.selected) {
      this.creationBallade.controls['date'].patchValue([]);
      this.allSelected.deselect();
    }
  }
  
  setAdresse(adresse: Adresse) {
    this.balade.lieu = adresse;
  }

  onSubmit() {
    this.creationBallade.markAllAsTouched();

    //supprimer la valeur undefined due à la case selectAll
    const joursSelected = this.creationBallade.controls['date'].value.filter(
      (v: any) => v
    );

    this.balade.compagnon = { id: Number.parseInt(this.compagnon) };
    this.balade.organisateur = { Id: Number.parseInt(this.organisateur) };
    this.balade.jours = joursSelected.join(',');
    this.balade.dureeMinute = this.creationBallade.controls['duree'].value;
    this.balade.heure = this.creationBallade.controls['horaire'].value;
    this.balade.infos = this.creationBallade.controls['infos'].value;
    this.balade.statut = Statuts.FUTUR;

    console.log(this.organisateur);
    console.log(this.compagnon);
    console.log(this.balade);
    
    if (this.creationBallade.valid) {
      ApiService.postData(
        '/ballades/save',
        this.balade
      )
        .then((res: Ballade) => {
          console.log('Succès ! Ballade créé :', res);
          alert('Ballade créé avec succès !');
          this.router.navigate(['/mes-ballades']);
        })
        .catch((err) => {
          console.error('Erreur lors de la création :', err);
          alert('Erreur lors de la création de la Ballade.');
        });
    } else {
      alert('Champs Invalide !');
    }
  }
}
