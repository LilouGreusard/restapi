import { Injectable } from '@angular/core';
import { Compagnon } from '../models/compagnon.model';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class CompagnonService {

    getMesCompagnons(userId: any): Promise<Compagnon[]> {
        return ApiService.get('/compagnons/mes-compagnons/' + userId);
    }
}
