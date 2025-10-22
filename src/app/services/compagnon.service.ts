import { Injectable } from '@angular/core';
import { Compagnon } from '../models/compagnon.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompagnonService {
  private apiUrl = 'http://localhost:8080/api/compagnons';

  constructor(private http: HttpClient) {}
  
  private getAuthHeaders() {
    const token = localStorage.getItem('TOKEN');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  getMesCompagnons() {
    return this.http.get<Compagnon[]>(`${this.apiUrl}/me`, this.getAuthHeaders());
  }

  getById(compagnonId: number): Observable<Compagnon> {
    return this.http.get<Compagnon>(`${this.apiUrl}/${compagnonId}`);
  }

  updateCompagnon(compagnon: Compagnon): Observable<Compagnon> {
    return this.http.post<Compagnon>(`${this.apiUrl}/save`, compagnon);
  }

  deletedById(compagnonId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${compagnonId}`);
  }
}
