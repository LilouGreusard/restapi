import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Ballade } from '../models/ballade.model';

@Injectable({
  providedIn: 'root',
})
export class BalladeService {
  private apiUrl = 'http://localhost:8080/api/ballades';

  constructor(private http: HttpClient) {}

  // Récupère les ballades que l'utilisateur organise 
  async getBalladesOrganisees(userId: number): Promise<Ballade[]> {
    return ApiService.get(`/ballades/mes-ballades/organisateur${userId}`);
  }

  // Récupère les ballades auxquelles l'utilisateur participe 
  async getBalladesParticipees(userId: number): Promise<Ballade[]> {
    return ApiService.get(`/ballades/mes-ballades/participants${userId}`);
  }

  // Récupère toute les ballades 
  async getAllBallades(): Promise<Ballade[]> {
    return ApiService.get('/ballades/all');
  }

  // Récupère une ballade par son id 
  getById(balladeId: number): Observable<Ballade> {
    return this.http.get<Ballade>(`${this.apiUrl}/${balladeId}`);
  }

  // Modifie la ballade
  onSubmitModifier(ballade: Ballade): Observable<Ballade> {
    return this.http.post<Ballade>(`${this.apiUrl}/update`, ballade);
  }

  // Supprime la ballade par son id
  deletedById(balladeId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${balladeId}`);
  }

  // Ajoute un participant a une ballade avec id ballade et id user
  async addParticipant(balladeId: number, userId: number): Promise<Ballade> {
    return await firstValueFrom(
      this.http.post<Ballade>(`${this.apiUrl}/${balladeId}/participants/${userId}`, {})
    );
  }

  // Supprime un participant a une ballade avec id ballade et id user
  async removeParticipant(balladeId: number, userId: number): Promise<Ballade> {
    return await firstValueFrom(
      this.http.delete<Ballade>(`${this.apiUrl}/${balladeId}/participants/${userId}`)
    );
  }
}
