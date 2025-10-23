import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModifierCompteComponent } from './modifier-compte.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { CompteService } from '../services/compte.service';
import { User } from '../models/compte.model';
import { Adresse } from '../models/adresse.model';

// --- Mocks ---
const mockUser: User = {
  Id: 1,
  firstName: 'Jean',
  lastName: 'Dupont',
  username: 'jdupont',
  email: 'jean@dupont.com',
  age: 30,
  adresse: { codePostal: '75000', ville: 'Paris' } as Adresse,
};

const compteServiceMock = {
  getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(of(mockUser)),
};

const routerMock = {
  navigate: jasmine.createSpy('navigate'),
};

// Mock global de ApiService (méthodes statiques)
const apiGetSpy = jasmine.createSpy('get');
const apiPostSpy = jasmine.createSpy('postData');
(globalThis as any).ApiService = {
  get: apiGetSpy,
  postData: apiPostSpy,
};

describe('ModifierCompteComponent', () => {
  let component: ModifierCompteComponent;
  let fixture: ComponentFixture<ModifierCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, ModifierCompteComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: CompteService, useValue: compteServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifierCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- Tests de base ---
  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('doit charger le user au ngOnInit', () => {
    spyOn(localStorage, 'getItem').and.returnValue('token');
    const spyLoad = spyOn(component, 'loadUser');
    component.ngOnInit();
    expect(spyLoad).toHaveBeenCalled();
  });

  it('doit rediriger vers /login si aucun token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(window, 'alert');
    component.ngOnInit();
    expect(window.alert).toHaveBeenCalledWith('Vous devez être connecté pour modifier votre compte.');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  // --- loadUser ---
  it('loadUser doit remplir le formulaire avec les données du user', () => {
    component.loadUser();
    expect(compteServiceMock.getCurrentUser).toHaveBeenCalled();
    expect(component.modifierCompte.value.firstName).toBe('Jean');
    expect(component.originalUsername).toBe('jdupont');
  });

  it('loadUser doit gérer une erreur 401', () => {
    const error401 = { status: 401 };
    compteServiceMock.getCurrentUser.and.returnValue(throwError(() => error401));
    spyOn(window, 'alert');
    const removeSpy = spyOn(localStorage, 'removeItem');

    component.loadUser();

    expect(window.alert).toHaveBeenCalledWith('Session expirée. Veuillez vous reconnecter.');
    expect(removeSpy).toHaveBeenCalledWith('TOKEN');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  // --- checkEmail ---
  it('checkEmail ne fait rien si email original', () => {
    const control = component.modifierCompte.get('email');
    control?.setValue(mockUser.email);
    component.originalEmail = mockUser.email as string;
    component.checkEmail();
    expect(control?.errors).toBeNull();
  });

  it('checkEmail doit définir une erreur si email existe', async () => {
    apiGetSpy.and.returnValue(Promise.resolve({ exists: true }));
    const control = component.modifierCompte.get('email');
    control?.setValue('autre@mail.com');
    await component.checkEmail();
    expect(control?.errors).toEqual({ emailExists: true });
  });

  // --- checkUsername ---
  it('checkUsername ne fait rien si username original', () => {
    const control = component.modifierCompte.get('username');
    control?.setValue(mockUser.username);
    component.originalUsername = mockUser.username as string;
    component.checkUsername();
    expect(control?.errors).toBeNull();
  });

  it('checkUsername doit définir une erreur si username existe', async () => {
    apiGetSpy.and.returnValue(Promise.resolve({ exists: true }));
    const control = component.modifierCompte.get('username');
    control?.setValue('autrePseudo');
    await component.checkUsername();
    expect(control?.errors).toEqual({ usernameExists: true });
  });

  // --- setAdresse ---
  it('setAdresse doit mettre à jour la valeur dans le formulaire', () => {
    const adresse = { codePostal: '69000', ville: 'Lyon' } as Adresse;
    component.setAdresse(adresse);
    expect(component.adresse).toEqual(adresse);
    expect(component.modifierCompte.value.adresse).toEqual(adresse);
  });

  // --- onSubmit ---
  it('onSubmit doit afficher une alerte si invalide', () => {
    spyOn(window, 'alert');
    component.modifierCompte.reset();
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Champs invalides !');
  });

  it('onSubmit valide doit appeler ApiService.postData et rediriger', async () => {
    spyOn(window, 'alert');
    apiPostSpy.and.returnValue(Promise.resolve(mockUser));

    component.currentUser = mockUser;
    component.modifierCompte.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      username: 'jdupont',
      age: 30,
      email: 'jean@dupont.com',
    });

    await component.onSubmit();

    expect(apiPostSpy).toHaveBeenCalledWith('/users/update', jasmine.objectContaining({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@dupont.com',
    }));
    expect(window.alert).toHaveBeenCalledWith('Compte modifié avec succès !');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mon-compte']);
  });

  it('onSubmit doit gérer les erreurs du backend', async () => {
    spyOn(window, 'alert');
    apiPostSpy.and.returnValue(Promise.reject({ status: 500 }));

    component.currentUser = mockUser;
    component.modifierCompte.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      username: 'jdupont',
      age: 30,
      email: 'jean@dupont.com',
    });

    await component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Erreur lors de la modification du compte.');
  });
});
