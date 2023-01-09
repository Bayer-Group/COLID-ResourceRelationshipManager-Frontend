import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { IdentityProvider } from './identity-provider.service';
import { ColidAccount } from '../models/colid-account.model';
import { Injectable, Inject } from '@angular/core';
import { IDENT_PROV } from '../../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(@Inject(IDENT_PROV) private identityProvider: IdentityProvider, private router: Router, private route: ActivatedRoute) { }

  get currentIdentity$(): Observable<ColidAccount | null> {
    return this.identityProvider.getAccount();
  }

  get currentEmail$(): Observable<string | null> {
    return this.currentIdentity$.pipe(map(id => id ? id.email : null));
  }

  get currentName$(): Observable<string | null> {
    return this.currentIdentity$.pipe(map(id => id ? id.name : null));
  }

  get currentUserId$(): Observable<string | null> {
    return this.currentIdentity$.pipe(map(id => id ? id.accountIdentifier : null));
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.identityProvider.isLoggedIn$;
  }

  get loginInProgress(): boolean {
    return this.identityProvider.loginInProgress();
  }

  get currentUserRoles$(): Observable<any> {
    return this.currentIdentity$.pipe(map(id => id ? id.roles : []));
  }

  get isLoadingUser(): boolean {
    return false;
  }

  get accessToken(): string | null {
    return localStorage.getItem('msal.idtoken')
  }

  subscribeCheckAccount() {
    return this.isLoggedIn$.subscribe(val => {
      if (!val && !this.loginInProgress) {
        this.login()
      } else {
        this.redirect()
      }
    })
  }

  redirect() {
    const redirectPathString = window.localStorage.getItem('url');
    const queryParamString = window.localStorage.getItem('queryParams');


    if (redirectPathString == null || queryParamString == null) {
      this.router.navigate(['']);
      return;
    }


    const redirectPath = JSON.parse(redirectPathString);
    const queryParams = JSON.parse(queryParamString);
    this.router.navigate(redirectPath, { queryParams: queryParams });
  }

  login() {
    this.identityProvider.login();
  }

  logout() {
    this.identityProvider.logout();
  }
}
