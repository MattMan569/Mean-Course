import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AuthData } from './auth-data.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) { }

  // Set a timer to automatically log the user out
  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  // Save the auth data to local storage
  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  // Clear auth data from local storage
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  // Get the auth data from local storage
  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate || !userId) {
      return;
    }

    return {
      token,
      expirationDate: new Date(expirationDate),
      userId,
    };
  }

  // Automatically authenticate the user, if possible
  autoAuthUser() {
    const authData = this.getAuthData();

    if (!authData) {
      return;
    }

    const now = new Date();
    const expiresIn = authData.expirationDate.getTime() - now.getTime();

    // If the token has not yet exceeded its lifespan, authenticate
    if (expiresIn > 0) {
      this.token = authData.token;
      this.userId = authData.userId;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn);
    }
  }

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.http.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(() => {
        this.router.navigate(['/login']);
      }, () => {
        this.authStatusListener.next(false);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.http.post<{ token: string, expiresIn: number, userId: string }>('http://localhost:3000/api/user/login', authData, { observe: 'response' })
      .subscribe((response) => {
        this.token = response.body.token;
        this.userId = response.body.userId;

        if (this.token) {
          const expiresIn = response.body.expiresIn;
          this.setAuthTimer(expiresIn);
          this.authStatusListener.next(true);

          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn);
          this.saveAuthData(this.token, expirationDate, this.userId);

          this.router.navigate(['/']);
        }
      }, () => {
        this.authStatusListener.next(false);
      });
  }

  logout() {
    this.token = null;
    this.userId = null;
    this.authStatusListener.next(false);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.router.navigate(['/login']);
  }
}
