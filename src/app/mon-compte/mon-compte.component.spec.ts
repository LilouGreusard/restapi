import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonCompteComponent } from './mon-compte.component';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CompteService } from '../services/compte.service';
import { User } from '../models/compte.model';
import { BalladeService } from '../services/ballade.service';
import { CompagnonService } from '../services/compagnon.service';

// --- Mocks ---
const mockUser: User = {
  Id: 1,
  firstName: 'Jean',
  lastName: 'Dupont',
  username: 'jdupont',
  email: 'jean@dupont.com',
  age: 30,
  adresse: { id: 1 }
};

const compteServiceMock = {
  getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(of(mockUser)),
  login: jasmine.createSpy('login').and.returnValue(of(true)),
  deletedById: jasmine.createSpy('deletedById').and.returnValue(of(true))
};

const balladeServiceMock = {};
const compagnonServiceMock = {};
const routerMock = { navigate: jasmine.createSpy('navigate') };

describe('MonCompteComponent', () => {
  let component: MonCompteComponent;
  let fixture: ComponentFixture<MonCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonCompteComponent],
      providers: [
        { provide: CompteService, useValue: compteServiceMock },
        { provide: BalladeService, useValue: balladeServiceMock },
        { provide: CompagnonService, useValue: compagnonServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  // --- ngOnInit ---
  it('ngOnInit charge le user si token présent', () => {
    spyOn(localStorage, 'getItem').and.returnValue('token');
    const spyLoad = spyOn(component, 'ngOnInit').and.callThrough();
    component.ngOnInit();
    expect(spyLoad).toHaveBeenCalled();
  });

  it('ngOnInit redirige vers /login si pas de token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  // --- Boutons navigation ---
  it('onSubmitModifier redirige vers /modifier-compte', () => {
    component.onSubmitModifier();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/modifier-compte']);
  });

  it('onSubmitMotDePasse redirige vers /modifier-mot-de-passe', () => {
    component.onSubmitMotDePasse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/modifier-mot-de-passe']);
  });

  // --- Suppression de compte ---
  it('onSubmitSupprimer annule si monCompte non défini', async () => {
    component.monCompte = null;
    spyOn(window, 'prompt');
    await component.onSubmitSupprimer();
    expect(compteServiceMock.login).not.toHaveBeenCalled();
  });

  it('onSubmitSupprimer annule si mot de passe vide', async () => {
    component.monCompte = mockUser;
    spyOn(window, 'prompt').and.returnValue('');
    spyOn(window, 'alert');
    await component.onSubmitSupprimer();
    expect(window.alert).toHaveBeenCalledWith('Suppression annulée : mot de passe non renseigné.');
  });

  it('onSubmitSupprimer supprime le compte si mot de passe correct et confirmé', async () => {
    component.monCompte = mockUser;
    spyOn(window, 'prompt').and.returnValue('password');
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    await component.onSubmitSupprimer();

    expect(compteServiceMock.login).toHaveBeenCalledWith('jean@dupont.com', 'password');
    expect(compteServiceMock.deletedById).toHaveBeenCalledWith(mockUser.Id);
    expect(window.alert).toHaveBeenCalledWith('Compte supprimé avec succès !');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('onSubmitSupprimer affiche erreur si mot de passe incorrect', async () => {
    component.monCompte = mockUser;
    spyOn(window, 'prompt').and.returnValue('wrong');
    spyOn(window, 'alert');
    compteServiceMock.login.and.returnValue(throwError(() => ({ status: 401 })));

    await component.onSubmitSupprimer();

    expect(window.alert).toHaveBeenCalledWith('Mot de passe incorrect !');
  });
});
