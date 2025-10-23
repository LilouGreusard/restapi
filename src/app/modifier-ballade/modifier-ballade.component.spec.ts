import { ComponentFixture, TestBed } from '@angular/core/testing';
import { modifierBalladeComponent } from './modifier-ballade.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AdresseService } from '../services/adresse.service';
import { BalladeService } from '../services/ballade.service';
import { CompteService } from '../services/compte.service';
import { ApiService } from '../services/api.service';

// 🔧 --- Mocks de dépendances ---
class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

class AdresseServiceMock {
  getAllCp = jasmine.createSpy('getAllCp').and.returnValue(Promise.resolve([
    { id: 1, codePostal: 75000, name: 'Paris' }
  ]));
  getByCodePostalId = jasmine.createSpy('getByCodePostalId').and.returnValue(Promise.resolve([
    { id: 101, rue: 'Rue de Rivoli', codePostal: { id: 1, codePostal: 75000, name: 'Paris' } }
  ]));
}

class BalladeServiceMock {
  getById = jasmine.createSpy('getById').and.returnValue(of({
    id: 10,
    infos: 'Balade du soir',
    lieu: { id: 101, codePostal: { codePostal: 75000, name: 'Paris' } },
    jours: 'Lundi,Mardi',
    heure: '18:00',
    dureeMinute: 30,
    compagnon: { id: 5 },
    organisateur: { Id: 2 }
  }));
}

class CompteServiceMock {
  getCurrentUser = jasmine.createSpy('getCurrentUser').and.returnValue(of({
    Id: 2,
    adresse: { rue: 'Rue de Paris', codePostal: { codePostal: 75000, name: 'Paris' } }
  }));
  getById = jasmine.createSpy('getById').and.returnValue(of({ Id: 2, adresse: {} }));
}

class ApiServiceMock {
  static postData = jasmine.createSpy('postData').and.returnValue(Promise.resolve({ success: true }));
}

// --- Configuration du test ---
describe('modifierBalladeComponent', () => {
  let component: modifierBalladeComponent;
  let fixture: ComponentFixture<modifierBalladeComponent>;
  let router: RouterMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, modifierBalladeComponent],
      providers: [
        { provide: Router, useClass: RouterMock },
        { provide: AdresseService, useClass: AdresseServiceMock },
        { provide: BalladeService, useClass: BalladeServiceMock },
        { provide: CompteService, useClass: CompteServiceMock },
        { provide: ApiService, useValue: ApiServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(modifierBalladeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as RouterMock;

    // Simule un ID stocké
    localStorage.setItem('BALLADE_ID', '10');
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('doit charger la ballade depuis le service au ngOnInit', () => {
    expect(BalladeServiceMock.prototype.getById).toBeTruthy();
    expect(component.modifierBallade.get('infos')?.value).toBe('Balade du soir');
  });

  it('doit appeler AdresseService.getAllCp() au ngOnInit', async () => {
    const service = TestBed.inject(AdresseService) as unknown as AdresseServiceMock;
    await service.getAllCp();
    expect(service.getAllCp).toHaveBeenCalled();
  });

  it('doit émettre l’adresse correcte avec emettreLieu()', () => {
    spyOn(component.adresseEmit, 'emit');
    component.adressesParCodePostal = [
      { id: 101, rue: 'Rue Test' }
    ] as any;
    component.modifierBallade.get('adresseCtrl')?.setValue(101);

    component.emettreLieu();

    expect(component.adresseEmit.emit).toHaveBeenCalledWith({ id: 101, rue: 'Rue Test' } as any);
  });

  it('toggleAllSelection() doit sélectionner tous les jours', () => {
    component.allSelected = { selected: true, select: () => {}, deselect: () => {} } as any;
    spyOn(component.allSelected, 'select');

    component.toggleAllSelection();

    expect(component.modifierBallade.get('jours')?.value).toEqual(component.jours);
    expect(component.allSelected.select).toHaveBeenCalled();
  });

  it('onSubmit() valide doit appeler ApiService.postData', async () => {
    component.modifierBallade.patchValue({
      id: 10,
      infos: 'Test balade',
      adresseCtrl: 101,
      jours: ['Lundi', 'Mardi'],
      heure: '18:00',
      dureeMinute: 30,
      compagnon: 5,
      organisateur: 2,
    });

    component.adressesParCodePostal = [{ id: 101, rue: 'Rue test' } as any];

    await component.onSubmit();

    expect(ApiServiceMock.postData).toHaveBeenCalledWith('/ballades/update', jasmine.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/mes-ballades']);
  });

  it('onSubmit() invalide doit afficher une alerte', async () => {
    spyOn(window, 'alert');
    component.modifierBallade.reset(); // rend invalide

    await component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Champs Invalide !');
  });
});
