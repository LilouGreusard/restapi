import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Ballade } from '../models/ballade.model';

@Injectable({
  providedIn: 'root',
})
export class BalladeService {
  private apiUrl = 'http://localhost:8080/api/ballades';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('TOKEN');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Creer une ballade
  createBallade(ballade: Ballade): Observable<Ballade> {
    return this.http.post<Ballade>(`${this.apiUrl}/save`, ballade, {headers: this.getAuthHeaders()});
  }

  // Récupère les ballades que l'utilisateur organise 
  getBalladesOrganisees(): Observable<Ballade[]> {
    return this.http.get<Ballade[]>(`${this.apiUrl}/mes-ballades/organisees`, { headers: this.getAuthHeaders() });
  }

  // Récupère les ballades auxquelles l'utilisateur participe 
  getBalladesParticipees(): Observable<Ballade[]> {
    return this.http.get<Ballade[]>(`${this.apiUrl}/mes-ballades/participees`, { headers: this.getAuthHeaders() });
  }

  // Récupère toute les ballades 
  getAllBallades(): Observable<Ballade[]> {
    return this.http.get<Ballade[]>(`${this.apiUrl}/all`, {headers: this.getAuthHeaders()});
  }

  // Récupère une ballade par son id 
  getById(balladeId: number): Observable<Ballade> {
    return this.http.get<Ballade>(`${this.apiUrl}/${balladeId}`, {headers: this.getAuthHeaders()});
  }

  // Modifie la ballade
  onSubmitModifier(ballade: Ballade): Observable<Ballade> {
    return this.http.post<Ballade>(`${this.apiUrl}/update`, ballade, {headers: this.getAuthHeaders()});
  }

  // Supprime la ballade par son id
  deletedById(balladeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${balladeId}`, {headers: this.getAuthHeaders()});
  }

  // Ajoute un participant a une ballade avec id ballade
  addParticipant(balladeId: number): Observable<Ballade> {
    return this.http.post<Ballade>(`${this.apiUrl}/${balladeId}/participants`, {}, {headers: this.getAuthHeaders()});
  }

  // Supprime un participant a une ballade avec id ballade
  removeParticipant(balladeId: number) {
    return this.http.delete(`${this.apiUrl}/${balladeId}/participants`, { headers: this.getAuthHeaders() });
  }
}
