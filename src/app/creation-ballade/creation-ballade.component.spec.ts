import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreationBalladeComponent } from './creation-ballade.component';
import { ReactiveFormsModule, FormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BalladeService } from '../services/ballade.service';
import { AdresseService } from '../services/adresse.service';
import { ActivatedRoute } from '@angular/router';

// --- Mocks ---
class RouterMock {
  navigate = jasmine.createSpy('navigate')
}

const balladeServiceMock = jasmine.createSpyObj('BalladeService', ['createBallade']);
balladeServiceMock.createBallade.and.returnValue(of({ id: 1, infos: 'Balade test' }));

const adresseServiceMock = jasmine.createSpyObj('AdresseService', ['getAllCp', 'getByCodePostalId']);
adresseServiceMock.getAllCp.and.returnValue(Promise.resolve([]));
adresseServiceMock.getByCodePostalId.and.returnValue(Promise.resolve([]));

const activatedRouteMock = {
  queryParams: of({ compagnon: '5' })
};

describe('CreationBalladeComponent', () => {
  let component: CreationBalladeComponent;
  let fixture: ComponentFixture<CreationBalladeComponent>;
  let router: RouterMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        CreationBalladeComponent
      ],
      providers: [
        { provide: Router, useClass: RouterMock },
        { provide: BalladeService, useValue: balladeServiceMock },
        { provide: AdresseService, useValue: adresseServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();


    fixture = TestBed.createComponent(CreationBalladeComponent);
    component = fixture.componentInstance;
    balladeServiceMock.createBallade.and.returnValue(of({ id: 1, infos: 'Balade test' }));

    // Initialisation du formulaire avant de détecter les changements
    component.creationBallade = new FormGroup({
      horaire: new FormControl('', [Validators.required]),
      date: new FormControl([], [Validators.required]),
      duree: new FormControl('', [Validators.required]),
      infos: new FormControl(''),
    });

    fixture.detectChanges();
    router = TestBed.inject(Router) as unknown as RouterMock;
  });


  afterEach(() => {
    localStorage.clear();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('doit initialiser le formulaire avec les champs requis', () => {
    const form = component.creationBallade;
    expect(form.contains('horaire')).toBeTrue();
    expect(form.contains('date')).toBeTrue();
    expect(form.contains('duree')).toBeTrue();
    expect(form.contains('infos')).toBeTrue();
  });

  it('toggleAllSelection doit sélectionner tous les jours si sélectionné', () => {
    component.allSelected = { selected: true, select: () => {}, deselect: () => {} } as any;
    spyOn(component.allSelected, 'select');

    component.toggleAllSelection();
    expect(component.creationBallade.get('date')?.value).toEqual(component.jours);
    expect(component.allSelected.select).toHaveBeenCalled();
  });

  it('toggleOne doit déselectionner tout si un jour est retiré', () => {
    component.allSelected = { selected: true, select: () => {}, deselect: () => {} } as any;
    spyOn(component.allSelected, 'deselect');

    component.creationBallade.get('date')?.setValue(['Lundi', 'Mardi']);
    component.toggleOne();

    expect(component.allSelected.deselect).toHaveBeenCalled();
  });

  it('setAdresse doit mettre à jour l\'adresse de la balade', () => {
    const adresse = { id: 1, rue: 'Rue test' };
    component.setAdresse(adresse as any);
    expect(component.balade.lieu).toEqual(adresse);
  });

  it('onSubmit valide doit appeler BalladeService.createBallade et router.navigate', () => {
    spyOn(window, 'alert');

    component.creationBallade.patchValue({
      horaire: '18:00',
      date: ['Lundi', 'Mardi'],
      duree: 30,
      infos: 'Balade test'
    });
    component.compagnon = '5';
    component.balade.lieu = { id: 1 } as any;

    component.onSubmit();

    expect(balladeServiceMock.createBallade).toHaveBeenCalledWith(jasmine.objectContaining({
      compagnon: { id: 5 },
      jours: 'Lundi, Mardi',
      dureeMinute: 30,
      heure: '18:00',
      infos: 'Balade test'
    }));
    expect(window.alert).toHaveBeenCalledWith('Ballade créé avec succès !');
    expect(component.router.navigate).toHaveBeenCalledWith(['/mes-ballades']);
  });

  it('onSubmit invalide doit afficher une alerte', () => {
    spyOn(window, 'alert');
    component.creationBallade.reset(); // formulaire invalide
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Champs Invalide !');
  });

  it('onSubmit avec erreur 401 doit rediriger vers login', () => {
    spyOn(window, 'alert');
    balladeServiceMock.createBallade.and.returnValue(
      throwError({ status: 401 })
    );

    component.creationBallade.patchValue({
      horaire: '18:00',
      date: ['Lundi'],
      duree: 15,
      infos: 'Balade'
    });
    component.compagnon = '5';
    component.balade.lieu = { id: 1 } as any;

    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Session expirée, veuillez vous reconnecter.');
    expect(component.router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
