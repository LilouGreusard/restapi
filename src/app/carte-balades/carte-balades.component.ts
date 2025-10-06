import { AfterViewInit, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { Ballade } from '../models/ballade.model';
import { BalladeService } from '../services/ballade.service';
import { Router } from '@angular/router';
import { Compagnon } from '../models/compagnon.model';
import { CompagnonService } from '../services/compagnon.service';
import { HeaderComponent } from '../header/header.component';

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
  userId: number = 0;

  constructor(private balladeService: BalladeService,private router: Router,private compagnonService: CompagnonService) {}

  private initMap(): void {
    this.map = L.map('map').setView([47.08, 2.39], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(this.map);
  }

  async ngAfterViewInit(): Promise<void> {
    const storedId = localStorage.getItem('USER_ID');
    if (storedId) {
      this.userId = parseInt(storedId, 0);
    }

    this.initMap();

    if (this.userId) {
      this.loading = true;
      try {
        this.mesCompagnons = await this.compagnonService.getMesCompagnons(this.userId);
      } catch (err) {
        this.error = 'Erreur lors du chargement de mes compagnons';
      } finally {
        this.loading = false;
      }
    }
    this.ballades = await this.balladeService.getAllBallades();
    this.addMarkers();

    
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
  const myIcon = L.icon({
    iconUrl: 'assets/images/local.gif',
    iconSize: [60, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -60],
  });

  this.ballades.forEach((ballade) => {
    const coords = this.getCoordinates(ballade.lieu?.positionGps);

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
    const isParticipant = ballade.participants?.some(p => p.Id === this.userId);
    const isOrganisateur = ballade.organisateur?.Id === this.userId;

    let buttonHtml = '';
    const canJoin = this.mesCompagnons?.some(c => c.race?.espece?.id === ballade.compagnon?.race?.espece?.id);
    if (isOrganisateur) {
      buttonHtml = `<button id="btn-rejoindre-${ballade.id}" class="button">Voir mes balades</button>`;
    } else {
      buttonHtml = `<button id="btn-rejoindre-${ballade.id}" ${!canJoin ? 'disabled' : ''} class="button">
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

  if (isParticipant) {
    await this.balladeService.removeParticipant(ballade.id!, this.userId);
    ballade.participants = ballade.participants?.filter(p => p.Id !== this.userId) || [];
    alert(`Vous vous êtes désinscrit de la balade : ${ballade.infos}`);
  } else {
    await this.balladeService.addParticipant(ballade.id!, this.userId);
    ballade.participants = [...(ballade.participants || []), { Id: this.userId } as any];
    alert(`Vous avez rejoint la balade : ${ballade.infos}`);
  }

  marker.setPopupContent(this.generatePopupHtml(ballade));

  setTimeout(() => {
    const btn = document.getElementById(`btn-rejoindre-${ballade.id}`);
    if (!btn) return;

    if (!isOrganisateur) {
      btn.onclick = () => this.onToggleParticipation(ballade, marker);
    }
  });
}


}
