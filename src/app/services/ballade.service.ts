import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Ballade } from '../models/ballade.model';

@Injectable({
  providedIn: 'root',
})

export class BalladeService {
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
}
