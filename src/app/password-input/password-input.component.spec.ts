import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordInputComponent } from './password-input.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('PasswordInputComponent', () => {
  let component: PasswordInputComponent;
  let fixture: ComponentFixture<PasswordInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordInputComponent);
    component = fixture.componentInstance;
    component.control = new FormControl('');
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('doit afficher le placeholder par défaut', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.placeholder).toBe('Votre mot de passe');
  });

  it('doit afficher le placeholder passé en input', () => {
    component.placeholder = 'Nouveau mot de passe';
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.placeholder).toBe('Nouveau mot de passe');
  });

  it('doit masquer le mot de passe par défaut', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.type).toBe('password');
  });

  it('doit basculer l\'affichage du mot de passe au clic sur le bouton', () => {
    const button = fixture.debugElement.query(By.css('.toggle-btn'));
    const input = fixture.debugElement.query(By.css('input')).nativeElement;

    // au départ type password
    expect(input.type).toBe('password');

    // clic => type text
    button.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(input.type).toBe('text');

    // clic à nouveau => type password
    button.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(input.type).toBe('password');
  });

  it('doit afficher le message d\'erreur si control invalide et touché', () => {
    component.control.markAsTouched();
    component.control.setErrors({ required: true });
    fixture.detectChanges();

    const errorDiv = fixture.debugElement.query(By.css('.condition')).nativeElement;
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toContain('Le mot de passe est obligatoire.');
  });

  it('ne doit pas afficher le message d\'erreur si control valide', () => {
    component.control.setValue('password123');
    component.control.markAsTouched();
    fixture.detectChanges();

    const errorDiv = fixture.debugElement.query(By.css('.condition'));
    expect(errorDiv).toBeNull();
  });
});
