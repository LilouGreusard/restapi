import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesCompagnonsComponent } from './mes-compagnons.component';
import { Router } from '@angular/router';
import { CompagnonService } from '../services/compagnon.service';
import { of, throwError } from 'rxjs';
import { Compagnon } from '../models/compagnon.model';

const mockCompagnons: Compagnon[] = [
  { id: 1, name: 'Rex', age: 5, race: { id: 1, name: 'Labrador', espece: { id: 1, name: 'Chien' } }, natures: [], description: 'Gentil', size: 3 },
  { id: 2, name: 'Milo', age: 3, race: { id: 2, name: 'Siamois', espece: { id: 2, name: 'Chat' } }, natures: [], description: 'Joueur', size: 2 }
];

const compagnonServiceMock = {
  getMesCompagnons: jasmine.createSpy('getMesCompagnons').and.returnValue(of(mockCompagnons)),
  deletedById: jasmine.createSpy('deletedById').and.returnValue(of({}))
};

const routerMock = {
  navigate: jasmine.createSpy('navigate')
};

describe('MesCompagnonsComponent', () => {
  let component: MesCompagnonsComponent;
  let fixture: ComponentFixture<MesCompagnonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesCompagnonsComponent],
      providers: [
        { provide: CompagnonService, useValue: compagnonServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MesCompagnonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    compagnonServiceMock.getMesCompagnons.calls.reset();
    compagnonServiceMock.deletedById.calls.reset();
    (window.confirm as any).and?.stub();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit doit charger les compagnons', (done) => {
    component.ngOnInit();
    setTimeout(() => {
      expect(compagnonServiceMock.getMesCompagnons).toHaveBeenCalled();
      expect(component.mesCompagnons.length).toBe(2);
      expect(component.loading).toBeFalse();
      done();
    }, 0);
  });

  it('ngOnInit doit gérer une erreur', async () => {
    compagnonServiceMock.getMesCompagnons.and.returnValue(throwError(() => new Error('Erreur')));
    await component.ngOnInit();
    await fixture.whenStable();
    expect(component.error).toBe('Erreur lors du chargement de mes compagnons');
    expect(component.loading).toBeFalse();
  });

  it('onSubmitCreer doit naviguer vers creation-ballade', () => {
    component.onSubmitCreer(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/creation-ballade'], { queryParams: { compagnon: 1 } });
  });

  it('onSubmitModifier doit stocker l\'id et naviguer', () => {
    spyOn(localStorage, 'setItem');
    component.onSubmitModifier(2);
    expect(localStorage.setItem).toHaveBeenCalledWith('COMPAGNON_ID', '2');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/modifier-animal']);
  });

  it('onSubmitCreerA doit naviguer vers creation-compagnon', () => {
    component.onSubmitCreerA();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/creation-compagnon']);
  });

  it('onSubmitSupprimer doit supprimer le compagnon si confirmé', (done) => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.mesCompagnons = [...mockCompagnons];

    component.onSubmitSupprimer(1);

    setTimeout(() => {
      expect(compagnonServiceMock.deletedById).toHaveBeenCalledWith(1);
      expect(component.mesCompagnons.length).toBe(1);
      expect(component.mesCompagnons[0].id).toBe(2);
      done();
    }, 0);
  });


  it('onSubmitSupprimer ne fait rien si annule', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.mesCompagnons = [...mockCompagnons];
    component.onSubmitSupprimer(1);
    expect(compagnonServiceMock.deletedById).not.toHaveBeenCalled();
    expect(component.mesCompagnons.length).toBe(2);
  });

  it('onSubmitSupprimer gère une erreur de suppression', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    compagnonServiceMock.deletedById.and.returnValue(throwError(() => new Error('Erreur')));
    spyOn(console, 'error');
    component.mesCompagnons = [...mockCompagnons];

    component.onSubmitSupprimer(1);
    await fixture.whenStable();

    expect(console.error).toHaveBeenCalledWith('Erreur suppression :', jasmine.any(Error));
  });
});
