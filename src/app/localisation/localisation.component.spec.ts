import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LocalisationComponent } from './localisation.component';
import { AdresseService } from '../services/adresse.service';
import { of } from 'rxjs';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

describe('LocalisationComponent', () => {
  let component: LocalisationComponent;
  let fixture: ComponentFixture<LocalisationComponent>;
  let adresseServiceMock: any;

  const mockCp = [
    { id: 1, codePostal: 75001, name: 'Paris' },
    { id: 2, codePostal: 69001, name: 'Lyon' }
  ];

  const mockAdresses = [
    { id: 1, rue: 'Rue de Paris', codePostalId: 1 },
    { id: 2, rue: 'Rue de Lyon', codePostalId: 2 }
  ];

  beforeEach(async () => {
    adresseServiceMock = {
      getAllCp: jasmine.createSpy('getAllCp').and.returnValue(Promise.resolve(mockCp)),
      getByCodePostalId: jasmine.createSpy('getByCodePostalId').and.callFake((id: number) => {
        return Promise.resolve(mockAdresses.filter(a => a.codePostalId === id));
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        LocalisationComponent,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
        MatSelectModule,
        MatFormFieldModule
      ],
      providers: [{ provide: AdresseService, useValue: adresseServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(LocalisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit charge les codes postaux', fakeAsync(() => {
    tick();
    expect(component.codesPostaux.length).toBe(2);
    expect(adresseServiceMock.getAllCp).toHaveBeenCalled();
  }));

  it('filtre les codes postaux correctement', fakeAsync(() => {
    tick();
    const result = component['_filter']('Paris');
    expect(result).toContain('75001, Paris');
    expect(result.length).toBe(1);
  }));

  it('getCodePostalByCp retourne le bon code postal', fakeAsync(() => {
    tick();
    const cp = component.getCodePostalByCp('75001, Paris');
    expect(cp?.id).toBe(1);
  }));

  it('getAdresseByCp met à jour adressesParCodePostal', fakeAsync(() => {
    tick();
    component.getAdresseByCp('75001, Paris');
    tick();
    expect(component.adressesParCodePostal.length).toBe(1);
    expect(component.adressesParCodePostal[0].rue).toBe('Rue de Paris');
  }));

  it('emettreLieu émet la bonne adresse', fakeAsync(() => {
    tick();
    spyOn(component.adresseEmit, 'emit');
    component.adressesParCodePostal = mockAdresses;
    component.formLocalisation.get('adresseCtrl')?.setValue(1);
    component.emettreLieu();
    expect(component.adresseEmit.emit).toHaveBeenCalledWith(mockAdresses[0]);
  }));
});
