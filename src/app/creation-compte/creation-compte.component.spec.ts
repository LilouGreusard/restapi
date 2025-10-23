import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreationCompteComponent } from './creation-compte.component';
import { ApiService } from '../services/api.service';
import { of } from 'rxjs';

// Mock du Router
class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

// Mock de l’ApiService
class ApiServiceMock {
  static get = jasmine
    .createSpy('get')
    .and.returnValue(Promise.resolve({ exists: false }));
  static postData = jasmine
    .createSpy('postData')
    .and.returnValue(Promise.resolve({ user: { Id: 1 }, token: 'abc123' }));
}

describe('CreationCompteComponent', () => {
  let component: CreationCompteComponent;
  let fixture: ComponentFixture<CreationCompteComponent>;
  let router: RouterMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CreationCompteComponent],
      providers: [
        { provide: Router, useClass: RouterMock },
        { provide: ApiService, useValue: ApiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreationCompteComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as RouterMock;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('le formulaire doit être invalide si vide', () => {
    expect(component.creationCompte.valid).toBeFalse();
  });

  it('le champ email doit être requis et au bon format', () => {
    const email = component.creationCompte.get('email');
    email?.setValue('');
    expect(email?.hasError('required')).toBeTrue();

    email?.setValue('test');
    expect(email?.hasError('email')).toBeTrue();

    email?.setValue('test@example.com');
    expect(email?.valid).toBeTrue();
  });

  it('verifAge doit renvoyer true si age < 18', () => {
    component.creationCompte.get('age')?.setValue(16);
    expect(component.verifAge).toBeTrue();
  });

  it('doit appeler ApiService.postData lors du onSubmit si formulaire valide', fakeAsync( () => {
    component.creationCompte.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      username: 'jdupont',
      age: 25,
      email: 'jean@dupont.com',
      password: '12345678',
    });
    ApiServiceMock.postData.and.returnValue(of({ success: true }));

     component.onSubmit();
    tick();
    expect(ApiServiceMock.postData).toHaveBeenCalledWith(
      '/users/save',
      jasmine.any(Object)
    );
    expect(router.navigate).toHaveBeenCalledWith(['/mon-compte']);
  }));

  it('connexion() doit rediriger vers /login', () => {
    component.connexion();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
