import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  //private apiUrl = 'http://localhost:3000/users';
  private apiUrl = 'http://localhost:5200/api/User';

  constructor(private http: HttpClient) {}

  registerUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  loginUser(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>('http://localhost:5086/api/Auth/Login', credentials); // Your login endpoint
  }
}