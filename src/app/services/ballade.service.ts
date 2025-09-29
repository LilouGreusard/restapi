import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ballade } from '../models/ballade.model';

@Injectable({
  providedIn: 'root',
})

export class BalladeService {
  private apiUrl = 'http://localhost:8080/api/ballades';

  constructor(private http: HttpClient) {}

  async getMesBallades(userId: any): Promise<Ballade[]> {
    const [organises, participes]: [Ballade[], Ballade[]] = await Promise.all([
      ApiService.get(`/ballades/mes-ballades/organisateur${userId}`),
      ApiService.get(`/ballades/mes-ballades/participants${userId}`),
    ]);

    const nonOrganises = participes.filter(
      (p: Ballade) => !organises.some((o: Ballade) => o.id === p.id)
    );

    return [...organises, ...nonOrganises];
  }

   async getAllBallades(): Promise<Ballade[]> {
    return ApiService.get('/ballades/all');
  }

  getById(balladeId: number): Observable<Ballade> {
    return this.http.get<Ballade>(`${this.apiUrl}/${balladeId}`);
  }

  onSubmitModifier(ballade: Ballade): Observable<Ballade> {
    return this.http.post<Ballade>(`${this.apiUrl}/update`, ballade);
  }

  deletedById(balladeId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${balladeId}`);
  }
}
