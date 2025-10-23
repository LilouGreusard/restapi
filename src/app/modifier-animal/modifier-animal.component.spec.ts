import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModifierAnimalComponent } from './modifier-animal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { CompagnonService } from '../services/compagnon.service';
import { RaceService } from '../services/race.service';
import { EspeceService } from '../services/espece.service';
import { NatureService } from '../services/nature.service';
import { Compagnon } from '../models/compagnon.model';
import { Race } from '../models/race.model';
import { Nature } from '../models/nature.model';

// --- Mocks ---
const mockRace: Race = { id: 1, name: 'Labrador', espece: { id: 1, name: 'Chien' } };
const mockNature: Nature = { id: 1, name: 'Affectueux' };
const mockCompagnon: Compagnon = {
  id: 1,
  name: 'Rex',
  age: 5,
  race: mockRace,
  natures: [mockNature],
  description: 'Chien gentil',
  size: 3
};

const compagnonServiceMock = {
  getById: jasmine.createSpy('getById').and.returnValue(of(mockCompagnon))
};

const raceServiceMock = {
  getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve([mockRace])),
  getByEpeceId: jasmine.createSpy('getByEpeceId').and.returnValue(Promise.resolve([mockRace]))
};

const especeServiceMock = {
  getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve([{ id: 1, name: 'Chien' }]))
};

const natureServiceMock = {
  getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve([mockNature]))
};

const routerMock = { navigate: jasmine.createSpy('navigate') };

// Mock global ApiService
const apiGetSpy = jasmine.createSpy('get');
const apiPostSpy = jasmine.createSpy('postData');
(globalThis as any).ApiService = {
  get: apiGetSpy,
  postData: apiPostSpy
};

describe('ModifierAnimalComponent', () => {
  let component: ModifierAnimalComponent;
  let fixture: ComponentFixture<ModifierAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ModifierAnimalComponent],
      providers: [
        { provide: CompagnonService, useValue: compagnonServiceMock },
        { provide: RaceService, useValue: raceServiceMock },
        { provide: EspeceService, useValue: especeServiceMock },
        { provide: NatureService, useValue: natureServiceMock },
        { provide: Router, useValue: routerMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModifierAnimalComponent);
    component = fixture.componentInstance;

    // Simuler COMPAGNON_ID dans localStorage
    spyOn(localStorage, 'getItem').and.callFake((key) => key === 'COMPAGNON_ID' ? JSON.stringify(1) : null);

    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit doit appeler afficherEspece et afficherNature et loadCompagnon', async () => {
    spyOn(component, 'afficherEspece').and.callThrough();
    spyOn(component, 'afficherNature').and.callThrough();
    spyOn(component, 'loadcompagnon').and.callThrough();

    await component.ngOnInit();

    expect(component.afficherEspece).toHaveBeenCalled();
    expect(component.afficherNature).toHaveBeenCalled();
    expect(component.loadcompagnon).toHaveBeenCalledWith(1);
  });

  it('loadcompagnon doit patcher le formulaire', () => {
    component.loadcompagnon(1);
    expect(component.modifierAnimal.value.name).toBe('Rex');
    expect(component.modifierAnimal.value.race).toBe(1);
    expect(component.modifierAnimal.value.age).toBe(5);
    expect(component.modifierAnimal.value.natures).toEqual([1]);
  });

  it('getRaceById doit retourner la race correspondante', () => {
    component.races = [mockRace];
    const race = component.getRaceById(1);
    expect(race).toEqual(mockRace);
  });

  it('onSubmit invalide doit afficher une alerte', async () => {
    spyOn(window, 'alert');
    component.modifierAnimal.controls['name'].setValue('');
    await component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Champs Invalide !');
  });

  it('onSubmit valide doit appeler ApiService.postData et naviguer', async () => {
    spyOn(window, 'alert');
    component.races = [mockRace];
    component.modifierAnimal.patchValue({
      id: 1,
      name: 'Rex',
      race: 1,
      age: 5,
      natures: [1],
      description: 'Chien gentil',
      size: 'GRAND'
    });
    apiGetSpy.and.returnValue(Promise.resolve(mockNature));
    apiPostSpy.and.returnValue(Promise.resolve(mockCompagnon));

    await component.onSubmit();

    expect(apiPostSpy).toHaveBeenCalledWith('/compagnons/update', jasmine.objectContaining({
      name: 'Rex',
      age: 5
    }));
    expect(window.alert).toHaveBeenCalledWith('Compagnon modifié avec succès !');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mon-compte']);
  });

  it('onSubmit avec erreur ApiService doit afficher une alerte', async () => {
    spyOn(window, 'alert');
    component.races = [mockRace];
    component.modifierAnimal.patchValue({
      id: 1,
      name: 'Rex',
      race: 1,
      age: 5,
      natures: [1],
      description: 'Chien gentil',
      size: 'GRAND'
    });
    apiGetSpy.and.returnValue(Promise.resolve(mockNature));
    apiPostSpy.and.returnValue(Promise.reject({ status: 500 }));

    await component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Erreur lors de la modification du compagnon.');
  });
});
