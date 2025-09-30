import { AfterViewInit, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { Ballade } from '../models/ballade.model';
import { BalladeService } from '../services/ballade.service';

@Component({
  selector: 'app-carte-balades',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './carte-balades.component.html',
  styleUrl: './carte-balades.component.scss',
  schemas: [NO_ERRORS_SCHEMA],
})
export class CarteBaladesComponent implements AfterViewInit {
  private map!: L.Map;

  ballades: Ballade[] = [];
  userId: number = 0;

  constructor(private balladeService: BalladeService) {}

  private initMap(): void {
    this.map = L.map('map').setView([47.08, 2.39], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(this.map);
  }

  async ngAfterViewInit(): Promise<void> {
    this.initMap();
    this.ballades = await this.balladeService.getAllBallades();
    this.addMarkers();

    const storedId = localStorage.getItem('USER_ID');
    if (storedId) {
      this.userId = parseInt(storedId, 0);
    }
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
    marker.bindPopup(this.generatePopupHtml(ballade), { closeButton: false });

    marker.on('popupopen', () => {
      const btn = document.getElementById(`btn-rejoindre-${ballade.id}`);
      if (btn && ballade.id !== undefined) {
        btn.onclick = () => this.onToggleParticipation(ballade, marker);
      }
    });
  });

}

  private generatePopupHtml(ballade: Ballade): string {
    const isParticipant = ballade.participants?.some(p => p.Id === this.userId);

    return `
      <div style="max-width: 250px;">
        <img src="${ballade.organisateur?.profilePictures}" alt="${ballade.organisateur?.username}" 
            style="width: 100%; border-radius: 8px; margin-bottom: 8px;" />
        <ul style="padding-left: 20px;">
          <li>Jour : ${ballade.jours}</li>
          <li>Heure : ${ballade.heure}</li>
          <li>Durée : ${ballade.dureeMinute} min</li>
          <li>Infos : ${ballade.infos}</li>
          <li>Organisateur : ${ballade.organisateur?.username}</li>
        </ul>
        <button id="btn-rejoindre-${ballade.id}">
          ${isParticipant ? "Désinscrire" : "Rejoindre"}
        </button>
      </div>
    `;
  }

  private async onToggleParticipation(ballade: Ballade, marker: L.Marker): Promise<void> {
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

  // 🔄 Met à jour le contenu du popup du marker
  marker.setPopupContent(this.generatePopupHtml(ballade));

  // 🔁 Ré-attache le listener sur le nouveau bouton
  setTimeout(() => {
    const btn = document.getElementById(`btn-rejoindre-${ballade.id}`);
    if (btn) {
      btn.onclick = () => this.onToggleParticipation(ballade, marker);
    }
  });
}


}
