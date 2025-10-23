import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { CompteService } from '../services/compte.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PasswordInputComponent } from '../password-input/password-input.component';
import { CommonModule } from '@angular/common';

const compteServiceMock = {
  login: jasmine.createSpy('login')
};

const routerMock = { navigate: jasmine.createSpy('navigate') };

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule, PasswordInputComponent],
      providers: [
        { provide: CompteService, useValue: compteServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    localStorage.clear();
    compteServiceMock.login.calls.reset();
    routerMock.navigate.calls.reset();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit redirige vers /mon-compte si USER_ID et TOKEN présents', () => {
    localStorage.setItem('USER_ID', '1');
    localStorage.setItem('TOKEN', 'token123');
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mon-compte']);
  });

  it('ngOnInit nettoie et redirige vers /login si seulement USER_ID ou TOKEN présent', () => {
    localStorage.setItem('USER_ID', '1');
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('inscription navigue vers /creation-compte', () => {
    component.inscription();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/creation-compte']);
  });

  it('onSubmit ne fait rien si formulaire invalide', () => {
    spyOn(window, 'alert');
    component.login.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Champs invalides !');
    expect(compteServiceMock.login).not.toHaveBeenCalled();
  });

  it('onSubmit appelle compteService.login si formulaire valide et navigue', fakeAsync(() => {
    const mockResponse = { user: { Id: 1 }, token: 'token123' };
    compteServiceMock.login.and.returnValue(of(mockResponse));
    component.login.setValue({ email: 'test@test.com', password: 'password' });

    component.onSubmit();
    tick();

    expect(compteServiceMock.login).toHaveBeenCalledWith('test@test.com', 'password');
    expect(localStorage.getItem('USER_ID')).toBe('1');
    expect(localStorage.getItem('TOKEN')).toBe('token123');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mon-compte']);
  }));

  it('onSubmit gère une erreur de connexion', fakeAsync(() => {
    compteServiceMock.login.and.returnValue(throwError(() => new Error('Erreur')));
    component.login.setValue({ email: 'test@test.com', password: 'password' });
    spyOn(window, 'alert');

    component.onSubmit();
    tick();

    expect(window.alert).toHaveBeenCalledWith('Email ou mot de passe incorrect.');
  }));
});
