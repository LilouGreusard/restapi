import { AfterViewInit, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { Ballade } from '../models/ballade.model';
import { BalladeService } from '../services/ballade.service';
import { Router } from '@angular/router';
import { Compagnon } from '../models/compagnon.model';
import { CompagnonService } from '../services/compagnon.service';
import { HeaderComponent } from '../header/header.component';
import { lastValueFrom } from 'rxjs';
import { CompteService } from '../services/compte.service';

@Component({
  selector: 'app-carte-balades',
  standalone: true,
  imports: [LeafletModule, HeaderComponent],
  templateUrl: './carte-balades.component.html',
  styleUrl: './carte-balades.component.scss',
  schemas: [NO_ERRORS_SCHEMA],
})
export class CarteBaladesComponent implements AfterViewInit {
  private map!: L.Map;
  mesCompagnons: Compagnon[] = [];
  loading = false;
  error = '';
  ballades: Ballade[] = [];
  userId!: number;

  constructor(private balladeService: BalladeService,private router: Router,private compagnonService: CompagnonService, private compteService: CompteService) {}

  private initMap(coords?: {lat: number; lng: number;}): void {
    const initialCoords = coords ?? { lat: 47.08, lng: 2.39};

    this.map = L.map('map').setView([initialCoords.lat, initialCoords.lng], 19);

    const jawgToken = '8RGCU43AXOqXMyoBl06KlQIeO0e4JftXpvGVqntKAMH3nDUtCDXL3ngZ90Xpn5J6';

    L.tileLayer(`https://tile.jawg.io/jawg-lagoon/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`, {
      attribution:'<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);
  }

  async ngAfterViewInit(): Promise<void> {
    localStorage.removeItem('COMPAGNON_ID');
    localStorage.removeItem('BALLADE_ID');

    let userCoords: {lat: number, lng: number} | undefined;

    try {
      const currentUser = await lastValueFrom(this.compteService.getCurrentUser());
      this.userId = currentUser.Id!;

      if (currentUser.adresse?.positionGps){
        const [latStr, lngStr] = currentUser.adresse.positionGps?.split(",");

        userCoords = {lat: parseFloat(latStr), lng: parseFloat(lngStr)};
      }


    } catch (err) {
      console.error("Erreur récupération userId :", err);
      alert("Impossible de récupérer l'utilisateur connecté.");
      this.router.navigate(['/login']);
      return;
    }

    this.initMap(userCoords);

    this.loading = true;
    try {
      this.mesCompagnons = await lastValueFrom(this.compagnonService.getMesCompagnons());
    } catch (err) {
      this.error = 'Erreur lors du chargement de mes compagnons';
    } finally {
      this.loading = false;
    }

    this.balladeService.getAllBallades().subscribe({
      next: (data) => {
        this.ballades = data;
        this.addMarkers();
      },
      error: (err) => {
        console.error('Erreur chargement des ballades :', err);
        this.error = 'Erreur lors du chargement des ballades';
      }
    }); 
  }

  ngOnDestroy(): void {
    this.map.remove();
  }
  
private getCoordinates(positionGPS?: string): { lat: number; lng: number } {
  if (!positionGPS) return { lat: 47.08, lng: 2.39 };

  const [latStr, lngStr] = positionGPS.split(',');
  return {
    lat: parseFloat(latStr.trim()),
    lng: parseFloat(lngStr.trim()),
  };
}

private addMarkers(): void {

  this.ballades.forEach((ballade) => {
    const coords = this.getCoordinates(ballade.lieu?.positionGps);
    const especeId = ballade.compagnon?.race?.espece?.id ?? 'default'
    const myIcon = L.icon({
      iconUrl: `assets/images/espece_${especeId}.png`,
      iconSize: [60, 60],
      iconAnchor: [30, 60],
      popupAnchor: [0, -60],
    });

    const marker = L.marker([coords.lat, coords.lng], { icon: myIcon }).addTo(this.map);
    marker.bindPopup(this.generatePopupHtml(ballade), { closeButton: false, maxWidth: 500,});

    marker.on('popupopen', () => {
      const btn = document.getElementById(`btn-rejoindre-${ballade.id}`);
      if (!btn) return;

      const isOrganisateur = ballade.organisateur?.Id === this.userId;
      
      if (isOrganisateur) {
        btn.onclick = () => this.onVoirMesBallades();
      } else if (ballade.id !== undefined) {
        btn.onclick = () => this.onToggleParticipation(ballade, marker);
      }
    });
  });

}

private onVoirMesBallades(): void {
  this.router.navigate(['/mes-ballades']);
}

  private generatePopupHtml(ballade: Ballade): string {
    const isOrganisateur = ballade.organisateur?.Id === this.userId;
    const isParticipant = ballade.participants?.some(p => p.Id === this.userId);

    let buttonHtml = '';
    const canJoin = this.mesCompagnons?.some(c => c.race?.espece?.id === ballade.compagnon?.race?.espece?.id);
    if (isOrganisateur) {
      buttonHtml = `<button id="btn-rejoindre-${ballade.id}" class="button">Voir mes balades</button>`;
    } else {
      buttonHtml = `<button id="btn-rejoindre-${ballade.id}" class="button">
                        ${isParticipant ? "Désinscrire" : "Rejoindre"}
                      </button>`;
    }

    return `
      <div class="popup-ballade">

        <img src="/assets/images/espece_${ballade.compagnon?.race?.espece?.id}.png" alt="${ballade.compagnon?.race?.espece?.id}"/>
  
        <div class="infos">

          <div class="center">
            <label>Jour : </label>
            <p>${ballade.jours}</p>
          </div>

          <div class="row">
            <div class="column">
              <div class="info">
                <label>Heure : </label>
                <p>${ballade.heure}</p>
              </div>

              <div class="info">
                <label>Durée : </label>
                <p>${ballade.dureeMinute} min</p>
              </div>
            </div>
            <div class="column">
              <div class="info">
                <label>Annimal : </label>
                <p>${ballade.compagnon?.race?.espece?.name}</p>
              </div>

              <div class="info">
                <label>Organisateur : </label>
                <p>${ballade.organisateur?.username}</p>
              </div>
            </div>
          </div>

          <div class="center">
            <label>Infos : </label>
            <p>${ballade.infos}</p>
          </div>

        </div>

        ${buttonHtml}
      </div>
    `;
  }

private async onToggleParticipation(ballade: Ballade, marker: L.Marker): Promise<void> {
const isOrganisateur = ballade.organisateur?.Id === this.userId;
if (isOrganisateur) return;


  const hasMatchingCompanion = this.mesCompagnons?.some(
    c => c.race?.espece?.id === ballade.compagnon?.race?.espece?.id
  );

  if (!hasMatchingCompanion) {
    alert("Vous ne pouvez rejoindre cette balade car vous n'avez aucun compagnon avec la même race.");
    return;
  }

  const isParticipant = ballade.participants?.some(p => p.Id === this.userId);

  try {
    let updatedBallade: Ballade; 

    if (isParticipant) {
      // Supprimer participant
      updatedBallade = await lastValueFrom(this.balladeService.removeParticipant(ballade.id!));
      alert(`Vous vous êtes désinscrit de la balade : ${ballade.infos}`);
    } else {
      // Ajouter participant
      updatedBallade = await lastValueFrom(this.balladeService.addParticipant(ballade.id!));
      alert(`Vous avez rejoint la balade : ${ballade.infos}`);
    }

    ballade.participants = updatedBallade.participants;// mettre à jour côté front

    // Fermer et rouvrir le popup pour rafraîchir le bouton
    marker.closePopup();
    marker.bindPopup(this.generatePopupHtml(ballade), { closeButton: false, maxWidth: 500 }).openPopup();

    // Réattacher l'événement du bouton
    setTimeout(() => {
      const btn = document.getElementById(`btn-rejoindre-${ballade.id}`);
      if (!btn) return;
      if (!isOrganisateur) btn.onclick = () => this.onToggleParticipation(ballade, marker);
    });
  } catch (err) {
    console.error("Erreur participation :", err);
    alert("Impossible de rejoindre/désinscrire la balade pour le moment.");
  }
}
}
