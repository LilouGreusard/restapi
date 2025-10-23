import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModifierMotDePasseComponent } from './modifier-mot-de-passe.component';
import { Router } from '@angular/router';
import { CompteService } from '../services/compte.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// --- Mocks ---
const compteServiceMock = {
  updatePassword: jasmine.createSpy('updatePassword').and.returnValue(of({ message: 'Mot de passe modifié !' }))
};

const routerMock = {
  navigate: jasmine.createSpy('navigate')
};

describe('ModifierMotDePasseComponent', () => {
  let component: ModifierMotDePasseComponent;
  let fixture: ComponentFixture<ModifierMotDePasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierMotDePasseComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: CompteService, useValue: compteServiceMock },
        { provide: Router, useValue: routerMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModifierMotDePasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  // --- ngOnInit ---
  it('ngOnInit redirige si token absent', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(window, 'alert');
    component.ngOnInit();
    expect(window.alert).toHaveBeenCalledWith('Vous devez être connecté pour modifier votre mot de passe.');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  // --- passwordMatchValidator ---
  it('passwordMatchValidator retourne null si mots de passe identiques', () => {
    component.modifierMotDePasse.patchValue({ password: 'password123', confirmPassword: 'password123' });
    const result = component.passwordMatchValidator(component.modifierMotDePasse);
    expect(result).toBeNull();
  });

  it('passwordMatchValidator retourne erreur si mots de passe différents', () => {
    component.modifierMotDePasse.patchValue({ password: 'password123', confirmPassword: 'different' });
    const result = component.passwordMatchValidator(component.modifierMotDePasse);
    expect(result).toEqual({ passwordMismatch: true });
  });

  // --- onSubmit ---
  it('onSubmit ne fait rien si formulaire invalide', () => {
    component.modifierMotDePasse.patchValue({ password: null, confirmPassword: null });
    component.onSubmit();
    expect(component.modifierMotDePasse.touched).toBeTruthy();
    expect(compteServiceMock.updatePassword).not.toHaveBeenCalled();
  });

  it('onSubmit appelle updatePassword si formulaire valide', () => {
    spyOn(window, 'alert');
    component.modifierMotDePasse.patchValue({ password: 'password123', confirmPassword: 'password123' });

    component.onSubmit();

    expect(compteServiceMock.updatePassword).toHaveBeenCalledWith('password123');
    expect(window.alert).toHaveBeenCalledWith('Mot de passe modifié !');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mon-compte']);
  });

  it('onSubmit gère erreur 401', () => {
    spyOn(window, 'alert');
    compteServiceMock.updatePassword.and.returnValue(throwError(() => ({ status: 401 })));
    spyOn(localStorage, 'removeItem');

    component.modifierMotDePasse.patchValue({ password: 'password123', confirmPassword: 'password123' });
    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Session expirée. Veuillez vous reconnecter.');
    expect(localStorage.removeItem).toHaveBeenCalledWith('TOKEN');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('onSubmit gère autres erreurs', () => {
    spyOn(window, 'alert');
    compteServiceMock.updatePassword.and.returnValue(throwError(() => ({ status: 500 })));

    component.modifierMotDePasse.patchValue({ password: 'password123', confirmPassword: 'password123' });
    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Erreur lors de la modification du mot de passe.');
  });
});
