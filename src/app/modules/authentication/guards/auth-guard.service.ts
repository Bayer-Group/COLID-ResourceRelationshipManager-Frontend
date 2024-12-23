import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { RouteExtension } from '../../../shared/extensions/route.extension';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    return this.authService.isLoggedIn$.pipe(
      map((isLoggedIn) => this.processLoggedIn(isLoggedIn, route))
    );
  }

  protected processLoggedIn(
    isLoggedIn: boolean,
    route: ActivatedRouteSnapshot
  ): boolean {
    if (!isLoggedIn) {
      if (!this.authService.loginInProgress) {
        RouteExtension.SetRouteInStorage(route);
      }

      this.router.navigate(['/login-in-progress']);

      return false;
    }

    return true;
  }
}
