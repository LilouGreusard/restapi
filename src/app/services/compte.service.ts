import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from "../models/compte.model";

@Injectable({
  providedIn: 'root',
})
export class CompteService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  // version HttpClient
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  getById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password });
  }

  onSubmitModifier(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/update`, user);
  }

  deletedById(userId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${userId}`);
  }
}
