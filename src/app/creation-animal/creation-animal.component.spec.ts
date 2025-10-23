import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreationAnimalComponent } from './creation-animal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// --- Mocks --- //
const raceServiceMock = {
  getAll: jasmine.createSpy('getAll').and.returnValue(
    Promise.resolve([{ id: 1, name: 'Labrador', espece: { id: 1, name: 'Chien' } }])
  ),
  getByEpeceId: jasmine.createSpy('getByEpeceId').and.returnValue(
    Promise.resolve([{ id: 1, name: 'Labrador', espece: { id: 1, name: 'Chien' } }])
  ),
};

const especeServiceMock = {
  getAll: jasmine.createSpy('getAll').and.returnValue(
    Promise.resolve([{ id: 1, name: 'Chien' }])
  ),
};

const natureServiceMock = {
  getAll: jasmine.createSpy('getAll').and.returnValue(
    Promise.resolve([{ id: 1, name: 'Joueur' }])
  ),
};

const routerMock = {
  navigate: jasmine.createSpy('navigate'),
};

// --- Mock global d'ApiService (statique) --- //
const apiPostSpy = jasmine.createSpy('postData').and.returnValue(
  Promise.resolve({ id: 1, name: 'Rex' })
);
(globalThis as any).ApiService = { postData: apiPostSpy };

describe('CreationAnimalComponent', () => {
  let component: CreationAnimalComponent;
  let fixture: ComponentFixture<CreationAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, CreationAnimalComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: 'RaceService', useValue: raceServiceMock },
        { provide: 'EspeceService', useValue: especeServiceMock },
        { provide: 'NatureService', useValue: natureServiceMock },
      ],
    })
      .overrideComponent(CreationAnimalComponent, {
        set: {
          providers: [
            { provide: Router, useValue: routerMock },
            { provide: 'RaceService', useValue: raceServiceMock },
            { provide: 'EspeceService', useValue: especeServiceMock },
            { provide: 'NatureService', useValue: natureServiceMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CreationAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('doit initialiser les espèces et les natures au ngOnInit', async () => {
    await component.ngOnInit();
    expect(especeServiceMock.getAll).toHaveBeenCalled();
    expect(natureServiceMock.getAll).toHaveBeenCalled();
  });

  it('doit récupérer les races selon une espèce', async () => {
    await component.getRacesById(1);
    expect(raceServiceMock.getByEpeceId).toHaveBeenCalledWith(1);
    expect(component.races.length).toBeGreaterThan(0);
  });

  it('getRaceById doit retourner la bonne race', () => {
    component.races = [{ id: 2, name: 'Beagle', espece: { id: 1, name: 'Chien' } }];
    const race = component.getRaceById(2);
    expect(race?.name).toBe('Beagle');
  });

  it('onSubmit invalide doit afficher une alerte', () => {
    spyOn(window, 'alert');
    component.creationAnimal.reset(); // Formulaire invalide
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Champs Invalide !');
  });

  it('onSubmit valide doit appeler ApiService.postData et rediriger', async () => {
    spyOn(window, 'alert');

    component.races = [{ id: 1, name: 'Labrador', espece: { id: 1, name: 'Chien' } }];
    component.creationAnimal.patchValue({
      name: 'Rex',
      age: 4,
      espece: 1,
      race: 1,
      size: 1,
      natures: [{ id: 1, name: 'Joueur' }],
      description: 'Super chien',
    });

    await component.onSubmit();

    expect(apiPostSpy).toHaveBeenCalledWith(
      '/compagnons/save',
      jasmine.objectContaining({
        name: 'Rex',
        age: 4,
        description: 'Super chien',
      })
    );
    expect(window.alert).toHaveBeenCalledWith('Compagnon créé avec succès !');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mon-compte']);
  });

  it('onSubmit avec erreur doit afficher une erreur', async () => {
    spyOn(window, 'alert');
    apiPostSpy.and.returnValue(Promise.reject({ status: 500 }));

    component.creationAnimal.patchValue({
      name: 'Rex',
      age: 4,
      espece: 1,
      race: 1,
      size: 1,
    });

    await component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Erreur lors de la création du compagnon.');
  });
});
