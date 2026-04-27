import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    // If auth state is initialized and authenticated, allow
    console.log('this.authService.isAuthenticated():', this.authService.isAuthenticated())
    if (this.authService.isAuthenticated()) return true;

    // If there's a token in storage, allow (AuthService will hydrate user shortly)
    console.log('this.authService.hasToken():', this.authService.hasToken())
    if (this.authService.hasToken()) return true;

    // Not logged in, redirect to login page
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
