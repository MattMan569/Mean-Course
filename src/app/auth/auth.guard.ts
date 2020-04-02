import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot,
  ): boolean | Observable<boolean> | Promise<boolean> {
    const authListener = this.authService.getAuthStatusListener();

    // Determine with the initial value of the
    // BehaviorSubject if the user is authenticated.
    // If no, redirect.
    authListener.pipe(first()).subscribe((authStatus) => {
      if (!authStatus) {
        this.router.navigate(['/login']);
      }
    });

    return authListener;
  }
}
