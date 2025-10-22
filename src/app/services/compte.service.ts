import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from "../models/compte.model";
import { LoginResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class CompteService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('TOKEN');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // version HttpClient
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() });
  }

  getById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, { headers: this.getAuthHeaders() });
  }

  onSubmitModifier(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/update`, user, { headers: this.getAuthHeaders() });
  }

  deletedById(userId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${userId}`, { headers: this.getAuthHeaders() });
  }

  updatePassword(newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-password`, 
      { newPassword }, 
      { headers: this.getAuthHeaders() }
    );
  }
}
