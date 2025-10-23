import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let routerMock: any;

  beforeEach(async () => {
    routerMock = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [{ provide: Router, useValue: routerMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('logout vide le localStorage et navigue vers login', () => {
    spyOn(localStorage, 'clear');
    component.logout();
    expect(localStorage.clear).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('monCompte navigue vers /mon-compte', () => {
    component.monCompte();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mon-compte']);
  });

  it('mesBallades navigue vers /mes-ballades', () => {
    component.mesBallades();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mes-ballades']);
  });

  it('carteBallade navigue vers /carte-ballades', () => {
    component.carteBallade();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/carte-ballades']);
  });
});
