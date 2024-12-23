import { Injectable } from '@angular/core';
import { IdentityProvider } from './identity-provider.service';
import { ColidAccount } from '../models/colid-account.model';
import { Observable, of } from 'rxjs';
import { Constants } from '../../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class MockIdentityProvider implements IdentityProvider {
  constructor() {}

  getAccount(): Observable<ColidAccount> {
    const idTokenClaimes: any = [
      Constants.Authentication.Roles.Administration,
      Constants.Authentication.Roles.SuperAdministration
    ];
    // const idTokenClaimes: any = [Constants.Authentication.Roles.Administration];
    return of(
      new ColidAccount(
        'SuperAdmin',
        'superadmin@bayer.com',
        '87654321-4321-4321-4321-210987654321',
        idTokenClaimes
      )
    );
  }

  loginInProgress(): boolean {
    return false;
  }

  get isLoggedIn$(): Observable<boolean> {
    return of(true);
  }

  login(): void {}

  logout(): void {}

  cleanup(): void {}
}
