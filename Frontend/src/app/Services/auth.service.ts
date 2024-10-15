import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  //private apiUrl = 'http://localhost:3000/users';
  private apiUrl = 'http://localhost:5086/api/Auth/Login';
  isLoggedIn = new BehaviorSubject<boolean>(false);
  user: Observable<any | null> = this.isLoggedIn.asObservable();
  private currentUser: any;

  constructor(private http: HttpClient) {
    localStorage.getItem('isLoggedIn')
      ? this.isLoggedIn.next(true)
      : this.isLoggedIn.next(false);
  }

  loginUser(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(this.apiUrl, credentials);
  }

  setLogin(email: string, token: any) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('email', email);
    localStorage.setItem('token', token);
    this.isLoggedIn.next(true);
  
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    this.isLoggedIn.next(false);
  }

  getCurrentUserEmail() {
    const userEmail = localStorage.getItem('email');
    return userEmail ? userEmail : null;
  }

  isUserLoggedIn(): boolean {
    return this.isLoggedIn.value;
  }
}