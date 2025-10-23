import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarteBaladesComponent } from './carte-balades.component';
import { BalladeService } from '../services/ballade.service';
import { CompagnonService } from '../services/compagnon.service';
import { CompteService } from '../services/compte.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import * as L from 'leaflet';

describe('CarteBaladesComponent', () => {
  let component: CarteBaladesComponent;
  let fixture: ComponentFixture<CarteBaladesComponent>;
  let balladeServiceMock: any;
  let compagnonServiceMock: any;
  let compteServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    balladeServiceMock = {
      getAllBallades: jasmine.createSpy('getAllBallades').and.returnValue(of([])),
      addParticipant: jasmine.createSpy('addParticipant').and.returnValue(of({ participants: [] })),
      removeParticipant: jasmine.createSpy('removeParticipant').and.returnValue(of({ participants: [] }))
    };
    compagnonServiceMock = {
      getMesCompagnons: jasmine.createSpy('getMesCompagnons').and.returnValue(of([]))
    };
    compteServiceMock = {
      getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(of({ Id: 1 }))
    };
    routerMock = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [CarteBaladesComponent],
      providers: [
        { provide: BalladeService, useValue: balladeServiceMock },
        { provide: CompagnonService, useValue: compagnonServiceMock },
        { provide: CompteService, useValue: compteServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarteBaladesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('initMap initialise une carte Leaflet', () => {
    // Supprime l’ancienne carte si elle existe
    if ((component as any).map) {
      (component as any).map.remove();
    }
    component['initMap']();
    expect(component['map']).toBeTruthy();
  });


  it('getCoordinates retourne coordonnées par défaut si positionGPS manquant', () => {
    const coords = component['getCoordinates']();
    expect(coords.lat).toBe(47.08);
    expect(coords.lng).toBe(2.39);
  });

  it('getCoordinates parse correctement les coordonnées GPS', () => {
    const coords = component['getCoordinates']('48.85, 2.35');
    expect(coords.lat).toBeCloseTo(48.85);
    expect(coords.lng).toBeCloseTo(2.35);
  });

  it('generatePopupHtml retourne un HTML avec bouton Voir mes balades si organisateur', () => {
    const html = component['generatePopupHtml']({
      id: 1,
      organisateur: { Id: 1 },
      participants: [],
      compagnon: { race: { espece: { id: 1, name: 'Chien' } } },
      jours: 'Lundi',
      heure: '10:00',
      dureeMinute: 60,
      infos: 'Test'
    } as any);
    expect(html).toContain('Voir mes balades');
  });

  it('generatePopupHtml retourne un HTML avec Rejoindre si non participant', () => {
    component['userId'] = 2;
    const html = component['generatePopupHtml']({
      id: 1,
      organisateur: { Id: 1 },
      participants: [],
      compagnon: { race: { espece: { id: 1, name: 'Chien' } } },
      jours: 'Lundi',
      heure: '10:00',
      dureeMinute: 60,
      infos: 'Test'
    } as any);
    expect(html).toContain('Rejoindre');
  });

  it('onVoirMesBallades navigue vers /mes-ballades', () => {
    component['onVoirMesBallades']();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/mes-ballades']);
  });

  it('onToggleParticipation alerte si aucun compagnon compatible', async () => {
    spyOn(window, 'alert');
    component.mesCompagnons = [];
    await component['onToggleParticipation']({ id: 1, participants: [], organisateur: { Id: 2 }, compagnon: { race: { espece: { id: 1 } } }, infos: 'Test' } as any, {} as any);
    expect(window.alert).toHaveBeenCalledWith('Vous ne pouvez rejoindre cette balade car vous n\'avez aucun compagnon avec la même race.');
  });
});
