import { CompteService } from '../services/compte.service';
import { Router } from '@angular/router';
import { BalladeService } from '../services/ballade.service';
import { Component, EventEmitter, ViewChild, Output } from '@angular/core';
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
import { CodePostal } from '../models/code-postal.model';
import { Adresse } from '../models/adresse.model';
import { AdresseService } from '../services/adresse.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Ballade } from '../models/ballade.model';
import { LocalisationComponent } from '../localisation/localisation.component';
import { ApiService } from '../services/api.service';
import { map, Observable, startWith } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HeaderComponent } from '../header/header.component';


@Component({
  selector: 'app-modifier-ballade',
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
    MatFormFieldModule,
    HeaderComponent,
  ],
  providers: [AdresseService],
  templateUrl: './modifier-ballade.component.html',
  styleUrl: './modifier-ballade.component.scss'
})

export class modifierBalladeComponent {
  codesPostaux: CodePostal[] = [];
  filteredCodePostaux: Observable<String[]> | undefined ;
  formLocalisation: FormGroup = new FormGroup({});
  adressesParCodePostal: Adresse[] = [];
  lieuCtrl = new FormControl('', [Validators.required]);
  modifierBallade: FormGroup;
  adresse: Adresse = {};
  balladeId = 0;
  userId = 0;
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
  @Output() adresseEmit = new EventEmitter<Adresse>();

  constructor(
    private balladeService: BalladeService,
    private compteService: CompteService,
    private adresseService: AdresseService,
    private router: Router,
  ) {
    this.modifierBallade = new FormGroup({
      id: new FormControl(null),
      infos: new FormControl(''),
      jours: new FormControl([], [Validators.required]),
      heure: new FormControl('', [Validators.required]),
      dureeMinute: new FormControl('', [Validators.required]),
      compagnon: new FormControl('', [Validators.required]),
      organisateur: new FormControl('', [Validators.required]),
      lieu: this.lieuCtrl,
      adresseCtrl: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(){
    localStorage.removeItem('COMPAGNON_ID');

    this.adresseService
      .getAllCp()
      .then((data) => (this.codesPostaux = data))
      .catch((err) =>
         console.log('erreur lors de la récupération des codes postaux')
      );
    // auto complétion codes postaux
    this.filteredCodePostaux = this.formLocalisation
      .get('lieu')
      ?.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || ''))
      );
    this.modifierBallade.get('lieu')?.valueChanges.subscribe((value) => {
      if (!value) this.adressesParCodePostal = [];
      else this.getAdresseByCp(value);
    });

    this.compteService.getCurrentUser().subscribe({
      next: (user) => {
        this.userId = user.Id!;
        this.adresse = user.adresse || {};
        console.log('Utilisateur connecté :', user);
      },
      error: (err) => {
        console.error('Erreur récupération user courant', err);
        alert('Session expirée, veuillez vous reconnecter.');
        localStorage.removeItem('TOKEN');
        this.router.navigate(['/login']);
      }
    });

    // récupère id ballade stocker
    const storeBalladeId = localStorage.getItem('BALLADE_ID');
    // si id présent récupère infos
    if(storeBalladeId){
      this.balladeId =  JSON.parse(storeBalladeId);
      this.loadBallade (this.balladeId);
    }else{
      this.router.navigate(['/mes-ballades']);
    }

  }

  // récupère adresse par code postal
  getAdresseByCp(codePostalSelected: String) {
    const codePostal = this.getCodePostalByCp(codePostalSelected);
    // vérifie id codepostal existe
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

  // récupère nom ville par code postal
  getCodePostalByCp(codepostalSelected: String) {
    const cpNameSelected = codepostalSelected.split(',');
    return this.codesPostaux.find(
      (cp) => cp.codePostal === Number.parseInt(cpNameSelected[0])
    );
  }

  // récupère adresse par son id
  getAdressById(id: number) {
    return this.adressesParCodePostal.find((adr) => adr.id == id);
  }

  //
  emettreLieu(){
    const adresseId = this.modifierBallade.get('adresseCtrl')?.value;
    const adresse = this.getAdressById(adresseId);
    this.adresseEmit.emit(adresse);
  }

  toggleOne(): void {
    const selected = this.modifierBallade.controls['jours'].value.filter(
      (v: any) => v
    );
    // Sélection "Tout les jours" si chaque jour est individuellement sélectionné
    if (selected.length === this.jours.length) {
      this.allSelected.select();
      // Déselection "Tout les jours" si un jour est individuellement déselectionné
    } else if (selected.length !== this.jours.length) {
      this.allSelected.deselect();
    }
    this.modifierBallade.controls['jours'];
  }

  toggleAllSelection(): void {
    // vérifie si "Tout les jours" sélectionné
    if (this.allSelected.selected) {
      this.modifierBallade.controls['jours'].patchValue([...this.jours]);
      this.allSelected.select();
      // vérifie si "Tout les jours" désélectionné
    } else if (!this.allSelected.selected) {
      this.modifierBallade.controls['jours'].patchValue([]);
      this.allSelected.deselect();
    }
  }

  // Fonction récupérant les infos de user par son id
  loadUser(id: number){
    this.compteService.getById(id).subscribe({
      next: (user)=>{
        this.adresse = user.adresse || {};    
      },
      error: (err)=>
        console.error('Erreur récupération user', err)
    });
  }

  // Fonction récupérant les infos de ballade par son id  
  loadBallade(id: number){
    this.balladeService.getById(id).subscribe({
      next: (ballade)=>{    
      console.log('Ballade récupéré:', ballade);
      if (!ballade) {
        console.warn('Ballade est null ou undefined, impossible de patcher le formulaire');
        return;
      }

      let joursArray: string[] = ballade.jours ? ballade.jours.split(',') : [];

      // Si tous les jours sont sélectionnés, coche "Tout les jours" visuellement
      if (joursArray.length === 7) {
        this.allSelected.select();
      } else {
         this.allSelected.deselect();
      }
      
      this.modifierBallade.patchValue({
        id: ballade.id,
        infos : ballade.infos,
        lieu : `${ballade.lieu?.codePostal?.codePostal}, ${ballade.lieu?.codePostal?.name}`,
        adresseCtrl : ballade.lieu?.id,
        jours: joursArray, 
        heure : ballade.heure,
        dureeMinute: ballade.dureeMinute,
        compagnon: ballade.compagnon?.id,
        organisateur: ballade.organisateur?.Id,
        });
      },

      error: (err)=>
        console.error('Erreur récupération ballade', err)
    });
  }
  
  // défini la nouvelle adresse
  setAdresse(adresse: Adresse) {
    this.adresse = adresse;
    this.modifierBallade.patchValue({adresse: this.adresse});
  }

  // quand bouton cliqué
  onSubmit() {
    this.modifierBallade.markAllAsTouched();

    const formValues = this.modifierBallade.value;

    const joursString = Array.isArray(formValues.jours) 
    ? formValues.jours.join(',') 
    : '';

    

    // "créer" une ballade avec les données modifiés ou laissé tel quelle
    let ballade: Ballade = {
      id: this.modifierBallade.controls['id'].value,
      infos:this.modifierBallade.controls['infos'].value,
      lieu: this.getAdressById(this.modifierBallade.controls['adresseCtrl'].value),
      jours: joursString, 
      heure:this.modifierBallade.controls['heure'].value,
      dureeMinute:this.modifierBallade.controls['dureeMinute'].value,
      compagnon:{ id: this.modifierBallade.controls['compagnon'].value},
      organisateur:{ Id: this.modifierBallade.controls['organisateur'].value},
    };
    console.log(this.modifierBallade.controls['id'].value)
    console.log(ballade)
    
    // si tout les champs sont valides, envoie les modif au back
    if (this.modifierBallade.valid) {
      console.log(ballade)
      ApiService.postData('/ballades/update', ballade)
        .then((res: Ballade) => {
          console.log('Succès ! Ballade modifié:', res);
          alert('Ballade modifié avec succès !');
          this.router.navigate(['/mes-ballades']);
        })
        .catch((err) => {
          console.error('Erreur lors de la modification :', err);
          alert('Erreur lors de la modification de la ballade.');
        });
    } else {
      alert('Champs Invalide !');
    }
  }
}