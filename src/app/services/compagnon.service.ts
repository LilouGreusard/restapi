import { Injectable } from '@angular/core';
import { Compagnon } from '../models/compagnon.model';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CompagnonService {
    private apiUrl = 'http://localhost:8080/api/compagnons';
    constructor(private http: HttpClient) {}

    getMesCompagnons(userId: any): Promise<Compagnon[]> {
        return ApiService.get('/compagnons/mes-compagnons/' + userId);
    }

    getById(compagnonId: number): Observable<Compagnon> {
        return this.http.get<Compagnon>(`${this.apiUrl}/${compagnonId}`);
    }

    updateCompagnon(compagnon: Compagnon) {
        return this.http.post<Compagnon>(`/${this.apiUrl}/save`, compagnon);
    }

    deletedById(compagnonId: number): Observable<string> {
        return this.http.delete<string>(`${this.apiUrl}/delete/${compagnonId}`);
    }

}
