import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesBalladesComponent } from './mes-ballades.component';
import { BalladeService } from '../services/ballade.service';
import { CompteService } from '../services/compte.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Ballade } from '../models/ballade.model';

const mockBalladesOrganisees: Ballade[] = [
  { id: 1, lieu: { id: 1 }, jours: 'Lundi', heure: '10:00', dureeMinute: 60, compagnon: { name: 'Rex', age: 5, race: { id: 7, name: 'Siamois', espece: { id: 2, name: 'Chat'} }, natures: [] }, participants: [] },
];

const mockBalladesParticipees: Ballade[] = [
  { id: 2, lieu: { id: 2 }, jours: 'Mardi', heure: '14:00', dureeMinute: 90, compagnon: { name: 'Milo', age: 3, race: { id: 1, name: 'Labrador', espece: { id: 1, name: 'Chien'} }, natures: [] }, participants: [{ username: 'user1' }] },
];

const balladeServiceMock = {
  getBalladesOrganisees: jasmine.createSpy('getBalladesOrganisees').and.returnValue(of(mockBalladesOrganisees)),
  getBalladesParticipees: jasmine.createSpy('getBalladesParticipees').and.returnValue(of(mockBalladesParticipees)),
  deletedById: jasmine.createSpy('deletedById').and.returnValue(of({})),
  removeParticipant: jasmine.createSpy('removeParticipant').and.returnValue(of({})),
};

const compteServiceMock = {};

const routerMock = { navigate: jasmine.createSpy('navigate') };

describe('MesBalladesComponent', () => {
  let component: MesBalladesComponent;
  let fixture: ComponentFixture<MesBalladesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesBalladesComponent],
      providers: [
        { provide: BalladeService, useValue: balladeServiceMock },
        { provide: CompteService, useValue: compteServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MesBalladesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit doit charger les ballades', async () => {
    await component.ngOnInit();
    expect(balladeServiceMock.getBalladesOrganisees).toHaveBeenCalled();
    expect(balladeServiceMock.getBalladesParticipees).toHaveBeenCalled();
    expect(component.balladesOrganisees.length).toBe(1);
    expect(component.balladesParticipees.length).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('ngOnInit doit gérer une erreur', async () => {
    balladeServiceMock.getBalladesOrganisees.and.returnValue(throwError(() => new Error('Erreur')));
    balladeServiceMock.getBalladesParticipees.and.returnValue(of([]));
    await component.ngOnInit();
    expect(component.error).toBe('Erreur lors du chargement des ballades');
    expect(component.loading).toBeFalse();
  });

  it('onSubmitModifier doit stocker l\'id et naviguer', () => {
    spyOn(localStorage, 'setItem');
    component.onSubmitModifier(1);
    expect(localStorage.setItem).toHaveBeenCalledWith('BALLADE_ID', '1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/modifier-ballade']);
  });

  it('onSubmitSupprimer doit supprimer la ballade si confirmée', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.balladesOrganisees = [...mockBalladesOrganisees];
    component.onSubmitSupprimer(1);
    expect(balladeServiceMock.deletedById).toHaveBeenCalledWith(1);
    expect(component.balladesOrganisees.length).toBe(0);
  });

  it('onSubmitSupprimer ne fait rien si annulé', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.balladesOrganisees = [...mockBalladesOrganisees];
    component.onSubmitSupprimer(1);
    expect(balladeServiceMock.deletedById).not.toHaveBeenCalled();
    expect(component.balladesOrganisees.length).toBe(1);
  });

  it('onSubmitDesinscrire doit désinscrire un participant si confirmé', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.balladesParticipees = [...mockBalladesParticipees];
    await component.onSubmitDesinscrire(2);
    expect(balladeServiceMock.removeParticipant).toHaveBeenCalledWith(2);
    expect(component.balladesParticipees.length).toBe(0);
  });

  it('onSubmitDesinscrire ne fait rien si annulé', async () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.balladesParticipees = [...mockBalladesParticipees];
    await component.onSubmitDesinscrire(2);
    expect(balladeServiceMock.removeParticipant).not.toHaveBeenCalled();
    expect(component.balladesParticipees.length).toBe(1);
  });

  it('onSubmitDesinscrire gère une erreur', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    balladeServiceMock.removeParticipant.and.returnValue(throwError(() => new Error('Erreur')));
    spyOn(window, 'alert');
    component.balladesParticipees = [...mockBalladesParticipees];
    await component.onSubmitDesinscrire(2);
    expect(window.alert).toHaveBeenCalledWith('Impossible de se désinscrire pour le moment.');
  });
});
