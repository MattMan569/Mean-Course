import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string;
  private tokenTimer: any;
  private authStatusListener = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) { }

  // Set a timer to automatically log the user out
  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  // Save the auth data to local storage
  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  // Clear auth data from local storage
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  // Get the auth data from local storage
  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');

    if (!token || !expirationDate) {
      return;
    }

    return {
      token,
      expirationDate: new Date(expirationDate),
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
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn);
    }
  }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.http.post('http://localhost:3000/api/user/signup', authData, { observe: 'response' })
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.http.post<{ token: string, expiresIn: number }>('http://localhost:3000/api/user/login', authData, { observe: 'response' })
      .subscribe((response) => {
        this.token = response.body.token;

        if (this.token) {
          const expiresIn = response.body.expiresIn;
          this.setAuthTimer(expiresIn);
          this.authStatusListener.next(true);

          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn);
          this.saveAuthData(this.token, expirationDate);

          this.router.navigate(['/']);
        }
      });
  }

  logout() {
    this.token = null;
    this.authStatusListener.next(false);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.router.navigate(['/login']);
  }
}
