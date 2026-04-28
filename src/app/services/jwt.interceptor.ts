import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Get token from AuthService
    let token = this.authService.getToken();
    console.log('[JWT Interceptor] Token from AuthService:', token ? `${token.substring(0, 20)}...` : 'null');

    // Fallback: try direct localStorage read only in browser
    if (!token && isPlatformBrowser(this.platformId)) {
      try {
        token = localStorage.getItem('auth_token');
        console.log('[JWT Interceptor] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      } catch (e) {
        console.error('[JWT Interceptor] Error reading localStorage:', e);
        token = null;
      }
    }

    // Clone request and add Authorization header if token exists
    if (token) {
      console.log(`[JWT Interceptor] Adding token to request: ${req.url}`);
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('[JWT Interceptor] Authorization header set:', req.headers.get('Authorization') ? 'YES' : 'NO');
    } else {
      console.warn('[JWT Interceptor] No token available, request will be unauthenticated');
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('[JWT Interceptor] HTTP Error:', error.status, error.message);
        console.error('[JWT Interceptor] Error details:', error.error);

        // Handle 401 Unauthorized
        if (error.status === 401) {
          console.warn('[JWT Interceptor] Received 401 - clearing token and redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        // Handle 403 Forbidden
        if (error.status === 403) {
          console.warn('[JWT Interceptor] Received 403 - redirecting to unauthorized');
          this.router.navigate(['/unauthorized']);
        }

        return throwError(() => error);
      }),
    );
  }
}
