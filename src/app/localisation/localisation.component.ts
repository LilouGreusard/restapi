import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdresseService } from '../services/adresse.service';
import { CodePostal } from '../models/code-postal.model';
import { map, Observable, startWith } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Adresse } from '../models/adresse.model';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-localisation',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [AdresseService],
  templateUrl: './localisation.component.html',
  styleUrl: './localisation.component.scss',
})
export class LocalisationComponent implements OnInit {
  codesPostaux: CodePostal[] = [];
  filteredCodePostaux: Observable<String[]> | undefined ;
  formLocalisation: FormGroup = new FormGroup({});
  adressesParCodePostal: Adresse[] = [];
  lieuCtrl = new FormControl('', [Validators.required]);

  @Input() lilou : String = '';
  @Output() adresseEmit = new EventEmitter<Adresse>();
  
  constructor(private adresseService: AdresseService) {}

  ngOnInit(): void {
    this.formLocalisation = new FormGroup({
      lieu: this.lieuCtrl,
      adresseCtrl: new FormControl('', [Validators.required]),
    });

    this.adresseService
      .getAllCp()
      .then((data) => (this.codesPostaux = data))
      .catch((err) =>
        console.log('erreur lors de la récupération des codes postaux')
      );
    // on ajoute l'auto complétion sur les codes postaux
    this.filteredCodePostaux = this.formLocalisation
      .get('lieu')
      ?.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || ''))
      );
    this.formLocalisation.get('lieu')?.valueChanges.subscribe((value) => {
      if (!value) this.adressesParCodePostal = [];
      else this.getAdresseByCp(value);
    });
  }

  getAdresseByCp(codePostalSelected: String) {
    const codePostal = this.getCodePostalByCp(codePostalSelected);
    if (codePostal?.id)
      this.adresseService
        .getByCodePostalId(codePostal?.id)
        .then((data) => (this.adressesParCodePostal = data));
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.codesPostaux
      .filter((cp) => cp.name?.toLowerCase().includes(filterValue))
      .map((cp) => cp?.codePostal + ', ' + cp?.name || '');
  }

  getCodePostalByCp(codepostalSelected: String) {
    const cpNameSelected = codepostalSelected.split(',');
    return this.codesPostaux.find(
      (cp) => cp.codePostal === Number.parseInt(cpNameSelected[0])
    );
  }

  getAdressById(id: number) {
    return this.adressesParCodePostal.find((adr) => adr.id == id);
  }

  emettreLieu(){
    const adresseId = this.formLocalisation.get('adresseCtrl')?.value;
    const adresse = this.getAdressById(adresseId);
    this.adresseEmit.emit(adresse);
  }
}
